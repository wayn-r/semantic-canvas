import { Connection } from '../models/Connection.js';
import logger from '../utils/logger.js';

/**
 * Get all connections
 */
export const getAllConnections = async (req, res, next) => {
  try {
    const connections = await Connection.findAll();
    res.json({ connections });
  } catch (error) {
    next(error);
  }
};

/**
 * Get connection by ID
 */
export const getConnectionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const connection = await Connection.findById(id);

    if (!connection) {
      return res.status(404).json({
        error: {
          message: 'Connection not found',
          code: 'CONNECTION_NOT_FOUND',
        },
      });
    }

    res.json({ connection });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new connection
 */
export const createConnection = async (req, res, next) => {
  try {
    const connectionData = req.body;

    // Generate unique ID if not provided
    if (!connectionData.id) {
      connectionData.id = `c-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Check if connection already exists
    const exists = await Connection.exists(
      connectionData.from_block,
      connectionData.to_block
    );

    if (exists) {
      return res.status(409).json({
        error: {
          message: 'Connection already exists',
          code: 'CONNECTION_EXISTS',
        },
      });
    }

    logger.info('Creating connection', {
      id: connectionData.id,
      from: connectionData.from_block,
      to: connectionData.to_block,
    });

    const connection = await Connection.create(connectionData);

    res.status(201).json({ connection });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete connection
 */
export const deleteConnection = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await Connection.delete(id);

    if (!deleted) {
      return res.status(404).json({
        error: {
          message: 'Connection not found',
          code: 'CONNECTION_NOT_FOUND',
        },
      });
    }

    logger.info('Connection deleted', { id });

    res.json({ success: true, id: deleted.id });
  } catch (error) {
    next(error);
  }
};
