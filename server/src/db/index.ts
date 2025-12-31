import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/secure_pastebin',
});

export async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS pastes (
        id VARCHAR(16) PRIMARY KEY,
        encrypted_content TEXT NOT NULL,
        iv VARCHAR(32) NOT NULL,
        burn_after_reading BOOLEAN DEFAULT FALSE,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_pastes_expires_at ON pastes(expires_at)
    `);
    console.log('Database initialized');
  } finally {
    client.release();
  }
}

export default pool;
