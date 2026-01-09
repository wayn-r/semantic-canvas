import { Block } from '../models/Block.js';
import { Connection } from '../models/Connection.js';
import { generateEmbedding } from '../services/embeddingService.js';
import {
  findSimilarBlocks,
  findAllSemanticRelationships,
  searchByEmbedding,
} from '../services/semanticService.js';
import logger from '../utils/logger.js';

/**
 * Full canvas analysis
 * Combines semantic similarity with AI insights
 */
export const analyzeCanvas = async (req, res, next) => {
  try {
    logger.info('Starting full canvas analysis');

    // Get all blocks and connections
    const blocks = await Block.findAll();
    const connections = await Connection.findAll();

    // Find semantic relationships across all blocks
    const semanticRelationships = await findAllSemanticRelationships(0.5);

    // Generate suggestions based on semantic relationships
    const suggestions = [];

    // Find missing connections (blocks that are semantically similar but not connected)
    const existingConnections = new Set(
      connections.map((c) => `${c.from_block}-${c.to_block}`)
    );

    for (const relationship of semanticRelationships.slice(0, 10)) {
      const connectionKey1 = `${relationship.block1Id}-${relationship.block2Id}`;
      const connectionKey2 = `${relationship.block2Id}-${relationship.block1Id}`;

      if (!existingConnections.has(connectionKey1) && !existingConnections.has(connectionKey2)) {
        suggestions.push({
          id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'connect',
          blockId: relationship.block1Id,
          targetId: relationship.block2Id,
          reasoning: `These blocks have ${Math.round(relationship.similarity * 100)}% semantic similarity but are not connected. Consider linking them.`,
          confidence: relationship.similarity,
        });
      }
    }

    // Find blocks that are distant but semantically similar (relocate suggestions)
    for (const relationship of semanticRelationships.slice(0, 5)) {
      const block1 = blocks.find((b) => b.id === relationship.block1Id);
      const block2 = blocks.find((b) => b.id === relationship.block2Id);

      if (block1 && block2) {
        const distance = Math.sqrt(
          Math.pow(block1.x - block2.x, 2) + Math.pow(block1.y - block2.y, 2)
        );

        if (distance > 500 && relationship.similarity > 0.6) {
          suggestions.push({
            id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'relocate',
            blockId: block1.id,
            targetNear: block2.id,
            reasoning: `This block is semantically similar to another block but positioned far away. Moving them closer would improve canvas organization.`,
            confidence: relationship.similarity * 0.9,
          });
        }
      }
    }

    // Sort by confidence
    suggestions.sort((a, b) => b.confidence - a.confidence);

    logger.info('Canvas analysis complete', {
      totalBlocks: blocks.length,
      totalConnections: connections.length,
      suggestionsGenerated: suggestions.length,
    });

    res.json({
      suggestions: suggestions.slice(0, 5), // Return top 5 suggestions
      thoughts: [
        `Analyzed ${blocks.length} blocks and found ${semanticRelationships.length} semantic relationships. ${suggestions.length} improvement suggestions generated based on content similarity and spatial organization.`,
      ],
    });
  } catch (error) {
    logger.error('Canvas analysis failed', { error: error.message });
    next(error);
  }
};

/**
 * Find similar blocks for a given block ID
 */
export const findSimilar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 5;
    const threshold = parseFloat(req.query.threshold) || 0.7;

    const block = await Block.findById(id);
    if (!block) {
      return res.status(404).json({
        error: {
          message: 'Block not found',
          code: 'BLOCK_NOT_FOUND',
        },
      });
    }

    if (!block.embedding) {
      return res.status(400).json({
        error: {
          message: 'Block has no embedding',
          code: 'NO_EMBEDDING',
        },
      });
    }

    // Parse embedding from JSON string
    const embedding = JSON.parse(block.embedding);

    const similarBlocks = await findSimilarBlocks(embedding, id, limit, threshold);

    res.json({ similar: similarBlocks });
  } catch (error) {
    next(error);
  }
};

/**
 * Search blocks by text query
 */
export const searchByText = async (req, res, next) => {
  try {
    const { query: searchQuery } = req.body;
    const limit = parseInt(req.body.limit) || 10;

    if (!searchQuery || searchQuery.trim().length === 0) {
      return res.status(400).json({
        error: {
          message: 'Query text is required',
          code: 'INVALID_QUERY',
        },
      });
    }

    // Generate embedding for the search query
    const queryEmbedding = await generateEmbedding(searchQuery);

    // Search for similar blocks
    const results = await searchByEmbedding(queryEmbedding, limit);

    res.json({ results });
  } catch (error) {
    next(error);
  }
};

/**
 * Auto-suggest for a specific block
 */
export const autoSuggest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const block = await Block.findById(id);
    if (!block) {
      return res.status(404).json({
        error: {
          message: 'Block not found',
          code: 'BLOCK_NOT_FOUND',
        },
      });
    }

    if (!block.embedding) {
      return res.json({ suggestions: [] });
    }

    // Parse embedding
    const embedding = JSON.parse(block.embedding);

    // Find similar blocks
    const similarBlocks = await findSimilarBlocks(embedding, id, 3, 0.7);

    // Generate suggestions
    const suggestions = similarBlocks.map((item) => ({
      id: `auto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'connect',
      blockId: id,
      targetId: item.block.id,
      reasoning: `This ${item.block.type} block has ${Math.round(item.similarity * 100)}% semantic similarity. Consider connecting them.`,
      confidence: item.similarity,
    }));

    res.json({ suggestions });
  } catch (error) {
    next(error);
  }
};
