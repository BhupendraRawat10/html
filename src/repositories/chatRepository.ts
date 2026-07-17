import { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool } from '../config/mysql';
import { Chat, ChatMember, ChatType, ChatWithMembers } from '../types';

export const chatRepository = {
  /**
   * Finds an existing direct (1:1) chat that contains exactly these two users.
   * Uses a self-join on chat_members so it only matches direct chats, not
   * groups that happen to contain both users.
   */
  async findDirectChatBetweenUsers(userAId: number, userBId: number): Promise<Chat | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT c.id, c.type, c.name, c.created_by, c.created_at
       FROM chats c
       JOIN chat_members m1 ON m1.chat_id = c.id AND m1.user_id = ?
       JOIN chat_members m2 ON m2.chat_id = c.id AND m2.user_id = ?
       WHERE c.type = 'direct'
       LIMIT 1`,
      [userAId, userBId]
    );
    return (rows[0] as Chat | undefined) ?? null;
  },

  async findById(chatId: number): Promise<Chat | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, type, name, created_by, created_at FROM chats WHERE id = ?',
      [chatId]
    );
    return (rows[0] as Chat | undefined) ?? null;
  },

  async createChatWithMembers(
    type: ChatType,
    memberIds: number[],
    options: { name?: string | null; createdBy?: number | null } = {}
  ): Promise<Chat> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.query<ResultSetHeader>(
        'INSERT INTO chats (type, name, created_by) VALUES (?, ?, ?)',
        [type, options.name ?? null, options.createdBy ?? null]
      );
      const chatId = result.insertId;

      await this.addMembers(connection, chatId, memberIds);

      await connection.commit();

      const chat = await this.findById(chatId);
      if (!chat) {
        throw new Error('Failed to load chat immediately after creation');
      }
      return chat;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  },

  async addMembers(connection: PoolConnection, chatId: number, userIds: number[]): Promise<void> {
    if (userIds.length === 0) return;
    const values = userIds.map((userId) => [chatId, userId, 'member']);
    await connection.query('INSERT IGNORE INTO chat_members (chat_id, user_id, role) VALUES ?', [
      values
    ]);
  },

  async addMember(chatId: number, userId: number, role: ChatMember['role'] = 'member'): Promise<void> {
    await pool.query('INSERT IGNORE INTO chat_members (chat_id, user_id, role) VALUES (?, ?, ?)', [
      chatId,
      userId,
      role
    ]);
  },

  async removeMember(chatId: number, userId: number): Promise<void> {
    await pool.query('DELETE FROM chat_members WHERE chat_id = ? AND user_id = ?', [chatId, userId]);
  },

  async isMember(chatId: number, userId: number): Promise<boolean> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT 1 FROM chat_members WHERE chat_id = ? AND user_id = ? LIMIT 1',
      [chatId, userId]
    );
    return rows.length > 0;
  },

  async getMemberIds(chatId: number): Promise<number[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT user_id FROM chat_members WHERE chat_id = ?',
      [chatId]
    );
    return rows.map((row) => row.user_id as number);
  },

  async getChatsForUser(userId: number): Promise<ChatWithMembers[]> {
    const [chatRows] = await pool.query<RowDataPacket[]>(
      `SELECT c.id, c.type, c.name, c.created_at
       FROM chats c
       JOIN chat_members m ON m.chat_id = c.id
       WHERE m.user_id = ?
       ORDER BY c.created_at DESC`,
      [userId]
    );

    const chats = chatRows as Array<Pick<Chat, 'id' | 'type' | 'name' | 'created_at'>>;
    if (chats.length === 0) return [];

    const chatIds = chats.map((c) => c.id);
    const [memberRows] = await pool.query<RowDataPacket[]>(
      'SELECT chat_id, user_id FROM chat_members WHERE chat_id IN (?)',
      [chatIds]
    );

    const membersByChat = new Map<number, number[]>();
    for (const row of memberRows) {
      const chatId = row.chat_id as number;
      const list = membersByChat.get(chatId) ?? [];
      list.push(row.user_id as number);
      membersByChat.set(chatId, list);
    }

    return chats.map((chat) => ({
      id: chat.id,
      type: chat.type,
      name: chat.name,
      created_at: chat.created_at,
      memberIds: membersByChat.get(chat.id) ?? []
    }));
  }
};
