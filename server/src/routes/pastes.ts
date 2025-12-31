import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import pool from '../db';

const router = Router();

function generateId(): string {
  return crypto.randomBytes(8).toString('hex');
}

// Create a new paste
router.post('/', async (req: Request, res: Response) => {
  try {
    const { encryptedContent, iv, burnAfterReading, expiresIn } = req.body;

    if (!encryptedContent || !iv) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const id = generateId();
    let expiresAt: Date | null = null;

    if (expiresIn) {
      expiresAt = new Date();
      switch (expiresIn) {
        case '5m':
          expiresAt.setMinutes(expiresAt.getMinutes() + 5);
          break;
        case '10m':
          expiresAt.setMinutes(expiresAt.getMinutes() + 10);
          break;
        case '30m':
          expiresAt.setMinutes(expiresAt.getMinutes() + 30);
          break;
        case '1h':
          expiresAt.setHours(expiresAt.getHours() + 1);
          break;
        case '6h':
          expiresAt.setHours(expiresAt.getHours() + 6);
          break;
        case '12h':
          expiresAt.setHours(expiresAt.getHours() + 12);
          break;
        case '1d':
          expiresAt.setDate(expiresAt.getDate() + 1);
          break;
        case '3d':
          expiresAt.setDate(expiresAt.getDate() + 3);
          break;
        case '1w':
          expiresAt.setDate(expiresAt.getDate() + 7);
          break;
        case '1M':
          expiresAt.setMonth(expiresAt.getMonth() + 1);
          break;
        default:
          expiresAt = null;
      }
    }

    await pool.query(
      `INSERT INTO pastes (id, encrypted_content, iv, burn_after_reading, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, encryptedContent, iv, burnAfterReading || false, expiresAt]
    );

    res.status(201).json({ id });
  } catch (error) {
    console.error('Error creating paste:', error);
    res.status(500).json({ error: 'Failed to create paste' });
  }
});

// Get a paste by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT encrypted_content, iv, burn_after_reading, expires_at
       FROM pastes WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Paste not found' });
      return;
    }

    const paste = result.rows[0];

    // Check if expired
    if (paste.expires_at && new Date(paste.expires_at) < new Date()) {
      await pool.query('DELETE FROM pastes WHERE id = $1', [id]);
      res.status(404).json({ error: 'Paste has expired' });
      return;
    }

    // If burn after reading, delete after fetching
    if (paste.burn_after_reading) {
      await pool.query('DELETE FROM pastes WHERE id = $1', [id]);
    }

    res.json({
      encryptedContent: paste.encrypted_content,
      iv: paste.iv,
      burnAfterReading: paste.burn_after_reading,
    });
  } catch (error) {
    console.error('Error fetching paste:', error);
    res.status(500).json({ error: 'Failed to fetch paste' });
  }
});

// Delete a paste
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM pastes WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Paste not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting paste:', error);
    res.status(500).json({ error: 'Failed to delete paste' });
  }
});

export default router;
