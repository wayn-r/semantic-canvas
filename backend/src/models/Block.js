import { query } from '../config/database.js';

export class Block {
  // Get all blocks
  static async findAll() {
    const result = await query('SELECT * FROM blocks ORDER BY created_at DESC');
    return result.rows;
  }

  // Get block by ID
  static async findById(id) {
    const result = await query('SELECT * FROM blocks WHERE id = $1', [id]);
    return result.rows[0];
  }

  // Create new block
  static async create(blockData) {
    const {
      id,
      type,
      content,
      language,
      tags,
      x,
      y,
      width,
      height,
      embedding,
    } = blockData;

    const result = await query(
      `INSERT INTO blocks (id, type, content, language, tags, x, y, width, height, embedding)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [id, type, content, language, tags, x, y, width, height, embedding]
    );

    return result.rows[0];
  }

  // Update block
  static async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Build dynamic update query
    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return await this.findById(id);
    }

    values.push(id);
    const result = await query(
      `UPDATE blocks
       SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    return result.rows[0];
  }

  // Delete block
  static async delete(id) {
    const result = await query('DELETE FROM blocks WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  }

  // Check if content has changed (for determining if embedding needs regeneration)
  static async hasContentChanged(id, newContent, newLanguage, newTags) {
    const block = await this.findById(id);
    if (!block) return true;

    const contentChanged = block.content !== newContent;
    const languageChanged = block.language !== newLanguage;
    const tagsChanged = JSON.stringify(block.tags) !== JSON.stringify(newTags);

    return contentChanged || languageChanged || tagsChanged;
  }
}
