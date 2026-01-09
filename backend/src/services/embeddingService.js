import OpenAI from 'openai';
import { LRUCache } from 'lru-cache';
import crypto from 'crypto';
import logger from '../utils/logger.js';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// LRU cache for embeddings (1000 entries, 1 hour TTL)
const embeddingCache = new LRUCache({
  max: 1000,
  ttl: 1000 * 60 * 60, // 1 hour
});

/**
 * Generate content hash for caching
 */
function generateContentHash(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * Extract text from block for embedding
 */
export function extractBlockText(block) {
  const parts = [
    block.content || '',
    block.language || '',
    ...(block.tags || []),
    block.type || '',
  ];
  return parts.filter(Boolean).join(' ').trim();
}

/**
 * Generate embedding using OpenAI API
 * @param {string} text - Text to generate embedding for
 * @returns {Promise<number[]>} - 1536-dimensional embedding vector
 */
export async function generateEmbedding(text) {
  if (!text || text.trim().length === 0) {
    throw new Error('Text cannot be empty');
  }

  // Check cache first
  const contentHash = generateContentHash(text);
  const cachedEmbedding = embeddingCache.get(contentHash);
  if (cachedEmbedding) {
    logger.info('Embedding cache hit', { hash: contentHash.substring(0, 8) });
    return cachedEmbedding;
  }

  try {
    logger.info('Generating embedding via OpenAI API');

    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float',
    });

    const embedding = response.data[0].embedding;

    // Cache the embedding
    embeddingCache.set(contentHash, embedding);

    logger.info('Embedding generated successfully', {
      dimensions: embedding.length,
      hash: contentHash.substring(0, 8),
    });

    return embedding;
  } catch (error) {
    logger.error('Failed to generate embedding', {
      error: error.message,
      text: text.substring(0, 100),
    });

    // Check for specific error types
    if (error.status === 429) {
      throw new Error('OpenAI API rate limit exceeded. Please try again later.');
    } else if (error.status === 401) {
      throw new Error('Invalid OpenAI API key');
    }

    throw new Error(`Embedding generation failed: ${error.message}`);
  }
}

/**
 * Generate embedding for a block
 * @param {Object} block - Block object
 * @returns {Promise<number[]>} - Embedding vector
 */
export async function generateBlockEmbedding(block) {
  const text = extractBlockText(block);
  return await generateEmbedding(text);
}

/**
 * Batch generate embeddings (for future optimization)
 * @param {string[]} texts - Array of texts
 * @returns {Promise<number[][]>} - Array of embedding vectors
 */
export async function batchGenerateEmbeddings(texts) {
  const embeddings = [];

  for (const text of texts) {
    try {
      const embedding = await generateEmbedding(text);
      embeddings.push(embedding);
    } catch (error) {
      logger.error('Failed to generate embedding in batch', { error: error.message });
      embeddings.push(null);
    }
  }

  return embeddings;
}

/**
 * Clear embedding cache
 */
export function clearEmbeddingCache() {
  embeddingCache.clear();
  logger.info('Embedding cache cleared');
}
