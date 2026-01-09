import { Block } from '../models/Block.js';
import { generateBlockEmbedding } from '../services/embeddingService.js';
import { generateConnectionSuggestions } from '../services/semanticService.js';
import logger from '../utils/logger.js';

/**
 * Get all blocks
 */
export const getAllBlocks = async (req, res, next) => {
  try {
    const blocks = await Block.findAll();
    res.json({ blocks });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single block by ID
 */
export const getBlockById = async (req, res, next) => {
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

    res.json({ block });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new block
 * Generates embedding and returns auto-suggestions
 */
export const createBlock = async (req, res, next) => {
  try {
    const blockData = req.body;

    // Generate unique ID if not provided
    if (!blockData.id) {
      blockData.id = `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    logger.info('Creating block', { id: blockData.id, type: blockData.type });

    // Generate embedding
    let embedding = null;
    let suggestions = [];

    try {
      embedding = await generateBlockEmbedding(blockData);

      // Convert embedding array to pgvector format (JSON string)
      blockData.embedding = JSON.stringify(embedding);

      // Generate auto-suggestions based on similarity
      suggestions = await generateConnectionSuggestions(embedding, blockData.id, 0.7);

      logger.info('Generated embedding and suggestions', {
        blockId: blockData.id,
        suggestionsCount: suggestions.length,
      });
    } catch (embeddingError) {
      logger.warn('Failed to generate embedding for block', {
        error: embeddingError.message,
        blockId: blockData.id,
      });
      // Continue without embedding - block will be saved but won't have semantic search
      blockData.embedding = null;
    }

    // Create block in database
    const block = await Block.create(blockData);

    // Remove embedding from response (too large)
    delete block.embedding;

    res.status(201).json({
      block,
      suggestions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update existing block
 * Regenerates embedding if content changed
 */
export const updateBlock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    logger.info('Updating block', { id, updates: Object.keys(updates) });

    // Check if block exists
    const existingBlock = await Block.findById(id);
    if (!existingBlock) {
      return res.status(404).json({
        error: {
          message: 'Block not found',
          code: 'BLOCK_NOT_FOUND',
        },
      });
    }

    // Check if content has changed (requires embedding regeneration)
    const contentChanged = await Block.hasContentChanged(
      id,
      updates.content || existingBlock.content,
      updates.language || existingBlock.language,
      updates.tags || existingBlock.tags
    );

    let suggestions = [];

    if (contentChanged && updates.content) {
      logger.info('Content changed, regenerating embedding', { id });

      try {
        // Merge updates with existing block for embedding generation
        const updatedBlockData = { ...existingBlock, ...updates };
        const embedding = await generateBlockEmbedding(updatedBlockData);

        // Add embedding to updates
        updates.embedding = JSON.stringify(embedding);

        // Generate new suggestions
        suggestions = await generateConnectionSuggestions(embedding, id, 0.7);
      } catch (embeddingError) {
        logger.warn('Failed to regenerate embedding', {
          error: embeddingError.message,
          blockId: id,
        });
      }
    }

    // Update block
    const block = await Block.update(id, updates);

    // Remove embedding from response
    if (block.embedding) {
      delete block.embedding;
    }

    res.json({
      block,
      suggestions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete block
 */
export const deleteBlock = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await Block.delete(id);

    if (!deleted) {
      return res.status(404).json({
        error: {
          message: 'Block not found',
          code: 'BLOCK_NOT_FOUND',
        },
      });
    }

    logger.info('Block deleted', { id });

    res.json({ success: true, id: deleted.id });
  } catch (error) {
    next(error);
  }
};
