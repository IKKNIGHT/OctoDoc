import pool from '../db';

export async function cleanupExpiredPastes() {
  try {
    const result = await pool.query(
      'DELETE FROM pastes WHERE expires_at IS NOT NULL AND expires_at < NOW()'
    );
    if (result.rowCount && result.rowCount > 0) {
      console.log(`Cleaned up ${result.rowCount} expired pastes`);
    }
  } catch (error) {
    console.error('Error cleaning up expired pastes:', error);
  }
}

export function startCleanupJob(intervalMs: number = 60000) {
  setInterval(cleanupExpiredPastes, intervalMs);
  console.log(`Cleanup job started (interval: ${intervalMs}ms)`);
}
