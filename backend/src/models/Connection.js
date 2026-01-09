import { query } from '../config/database.js';

export class Connection {
  // Get all connections
  static async findAll() {
    const result = await query('SELECT * FROM connections ORDER BY created_at DESC');
    return result.rows;
  }

  // Get connection by ID
  static async findById(id) {
    const result = await query('SELECT * FROM connections WHERE id = $1', [id]);
    return result.rows[0];
  }

  // Get connections for a specific block
  static async findByBlockId(blockId) {
    const result = await query(
      'SELECT * FROM connections WHERE from_block = $1 OR to_block = $1',
      [blockId]
    );
    return result.rows;
  }

  // Create new connection
  static async create(connectionData) {
    const { id, from_block, to_block } = connectionData;

    const result = await query(
      `INSERT INTO connections (id, from_block, to_block)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id, from_block, to_block]
    );

    return result.rows[0];
  }

  // Delete connection
  static async delete(id) {
    const result = await query('DELETE FROM connections WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  }

  // Check if connection already exists
  static async exists(fromBlock, toBlock) {
    const result = await query(
      'SELECT id FROM connections WHERE from_block = $1 AND to_block = $2',
      [fromBlock, toBlock]
    );
    return result.rows.length > 0;
  }
}
