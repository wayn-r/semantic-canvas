-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create blocks table with vector embeddings
CREATE TABLE IF NOT EXISTS blocks (
    id VARCHAR(255) PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    language VARCHAR(50),
    tags TEXT[],
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    embedding vector(1536), -- OpenAI-style embedding dimension
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create connections table
CREATE TABLE IF NOT EXISTS connections (
    id VARCHAR(255) PRIMARY KEY,
    from_block VARCHAR(255) REFERENCES blocks(id) ON DELETE CASCADE,
    to_block VARCHAR(255) REFERENCES blocks(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS blocks_embedding_idx ON blocks
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create index for tag searches
CREATE INDEX IF NOT EXISTS blocks_tags_idx ON blocks USING GIN(tags);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_blocks_updated_at BEFORE UPDATE ON blocks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
