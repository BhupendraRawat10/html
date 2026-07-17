import { RowDataPacket } from 'mysql2';
import { pool } from '../config/mysql';
import { User } from '../types';

export const userRepository = {
  async findById(userId: number): Promise<User | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [userId]
    );
    return (rows[0] as User | undefined) ?? null;
  },

  async findAllByIds(userIds: number[]): Promise<User[]> {
    if (userIds.length === 0) return [];
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, email, created_at FROM users WHERE id IN (?)',
      [userIds]
    );
    return rows as User[];
  },

  async exists(userId: number): Promise<boolean> {
    const user = await this.findById(userId);
    return user !== null;
  }
};
