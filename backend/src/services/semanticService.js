import { query } from '../config/database.js';
import logger from '../utils/logger.js';

/**
 * Find similar blocks using pgvector cosine similarity
 * @param {number[]} embedding - Query embedding vector
 * @param {string} excludeBlockId - Block ID to exclude from results
 * @param {number} limit - Maximum number of results
 * @param {number} threshold - Minimum similarity threshold (0-1)
 * @returns {Promise<Array>} - Array of similar blocks with similarity scores
 */
export async function findSimilarBlocks(embedding, excludeBlockId = null, limit = 5, threshold = 0.7) {
  try {
    // Convert embedding to pgvector format (JSON array string)
    const embeddingStr = JSON.stringify(embedding);

    const queryText = `
      SELECT
        id, type, content, language, tags, x, y, width, height,
        1 - (embedding <=> $1::vector) AS similarity
      FROM blocks
      WHERE embedding IS NOT NULL
        ${excludeBlockId ? 'AND id != $2' : ''}
      ORDER BY embedding <=> $1::vector
      LIMIT $${excludeBlockId ? '3' : '2'}
    `;

    const params = excludeBlockId
      ? [embeddingStr, excludeBlockId, limit]
      : [embeddingStr, limit];

    const result = await query(queryText, params);

    // Filter by threshold
    const similarBlocks = result.rows
      .filter((row) => row.similarity >= threshold)
      .map((row) => ({
        block: {
          id: row.id,
          type: row.type,
          content: row.content,
          language: row.language,
          tags: row.tags,
          x: row.x,
          y: row.y,
          width: row.width,
          height: row.height,
        },
        similarity: parseFloat(row.similarity.toFixed(3)),
      }));

    logger.info('Found similar blocks', {
      count: similarBlocks.length,
      threshold,
      excludeBlockId,
    });

    return similarBlocks;
  } catch (error) {
    logger.error('Failed to find similar blocks', { error: error.message });
    throw error;
  }
}

/**
 * Generate connection suggestions based on semantic similarity
 * @param {number[]} embedding - Query embedding vector
 * @param {string} sourceBlockId - Source block ID
 * @param {number} threshold - Minimum similarity threshold
 * @returns {Promise<Array>} - Array of suggestion objects
 */
export async function generateConnectionSuggestions(embedding, sourceBlockId, threshold = 0.7) {
  const similarBlocks = await findSimilarBlocks(embedding, sourceBlockId, 3, threshold);

  const suggestions = similarBlocks.map((item) => ({
    type: 'connect',
    blockId: sourceBlockId,
    targetId: item.block.id,
    reasoning: generateReasoningText(item.block, item.similarity),
    confidence: item.similarity,
  }));

  return suggestions;
}

/**
 * Generate reasoning text for suggestion
 */
function generateReasoningText(targetBlock, similarity) {
  const simPercent = Math.round(similarity * 100);
  const typeText = targetBlock.type === 'code' ? 'code block' : 'note';
  const langText = targetBlock.language ? ` in ${targetBlock.language}` : '';

  return `This ${typeText}${langText} has ${simPercent}% semantic similarity with your content. Consider connecting them.`;
}

/**
 * Find all semantic relationships in the canvas
 * @param {number} threshold - Minimum similarity threshold
 * @returns {Promise<Array>} - Array of block pairs with similarity scores
 */
export async function findAllSemanticRelationships(threshold = 0.5) {
  try {
    // Get all blocks with embeddings
    const blocksResult = await query(
      'SELECT id, type, content, language, tags, embedding FROM blocks WHERE embedding IS NOT NULL'
    );

    const blocks = blocksResult.rows;
    const relationships = [];

    // Compare each pair of blocks
    for (let i = 0; i < blocks.length; i++) {
      for (let j = i + 1; j < blocks.length; j++) {
        const block1 = blocks[i];
        const block2 = blocks[j];

        // Parse embedding if it's a string, otherwise use as-is
        const embedding1 = typeof block1.embedding === 'string'
          ? block1.embedding
          : JSON.stringify(block1.embedding);

        // Calculate cosine similarity using pgvector
        const similarityResult = await query(
          'SELECT 1 - (embedding <=> $1::vector) AS similarity FROM blocks WHERE id = $2',
          [embedding1, block2.id]
        );

        const similarity = parseFloat(similarityResult.rows[0].similarity);

        if (similarity >= threshold) {
          relationships.push({
            block1Id: block1.id,
            block2Id: block2.id,
            similarity: parseFloat(similarity.toFixed(3)),
            block1Type: block1.type,
            block2Type: block2.type,
          });
        }
      }
    }

    // Sort by similarity (descending)
    relationships.sort((a, b) => b.similarity - a.similarity);

    logger.info('Found semantic relationships', {
      count: relationships.length,
      threshold,
    });

    return relationships;
  } catch (error) {
    logger.error('Failed to find semantic relationships', { error: error.message });
    throw error;
  }
}

/**
 * Search blocks by text query using embeddings
 * @param {number[]} queryEmbedding - Query embedding vector
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Array>} - Array of matching blocks
 */
export async function searchByEmbedding(queryEmbedding, limit = 10) {
  return await findSimilarBlocks(queryEmbedding, null, limit, 0.3);
}
