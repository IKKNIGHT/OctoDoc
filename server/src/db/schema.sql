CREATE TABLE IF NOT EXISTS pastes (
    id VARCHAR(16) PRIMARY KEY,
    encrypted_content TEXT NOT NULL,
    iv VARCHAR(32) NOT NULL,
    burn_after_reading BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pastes_expires_at ON pastes(expires_at);
