import { Request, Response } from 'express';
import { chatService } from '../services/chatService';
import { messageService } from '../services/messageService';
import { AppError } from '../utils/AppError';
import { parseChatId } from './chatController';
import {
  DeleteMessageRequestBody,
  EditMessageRequestBody,
  MarkReadRequestBody,
  SendMessageRequestBody,
  UpdateLastSeenRequestBody
} from '../types';

export const messageController = {
  async sendMessage(
    req: Request<{ chatId: string }, unknown, SendMessageRequestBody>,
    res: Response
  ): Promise<void> {
    const chatId = parseChatId(req.params.chatId);
    const { senderId, text } = req.body;
    if (typeof senderId !== 'number' || typeof text !== 'string') {
      throw AppError.badRequest('senderId (number) and text (string) are required');
    }

    await chatService.getChatOrThrow(chatId);
    await chatService.assertIsMember(chatId, senderId);

    const message = await messageService.sendMessage(String(chatId), senderId, text);
    res.status(201).json({ message });
  },

  async getMessages(req: Request<{ chatId: string }>, res: Response): Promise<void> {
    const chatId = parseChatId(req.params.chatId);
    await chatService.getChatOrThrow(chatId);

    const limitRaw = req.query.limit;
    const limit = limitRaw !== undefined ? Number(limitRaw) : 50;
    if (!Number.isInteger(limit) || limit <= 0 || limit > 200) {
      throw AppError.badRequest('limit must be an integer between 1 and 200');
    }

    const beforeRaw = req.query.before;
    const before = beforeRaw !== undefined ? Number(beforeRaw) : undefined;
    if (before !== undefined && !Number.isFinite(before)) {
      throw AppError.badRequest('before must be a valid epoch-millis timestamp');
    }

    const messages = await messageService.getMessages(String(chatId), limit, before);
    res.status(200).json({ messages });
  },

  async markRead(
    req: Request<{ chatId: string; messageId: string }, unknown, MarkReadRequestBody>,
    res: Response
  ): Promise<void> {
    const chatId = parseChatId(req.params.chatId);
    const { messageId } = req.params;
    const { userId } = req.body;
    if (typeof userId !== 'number') {
      throw AppError.badRequest('userId is required and must be a number');
    }

    await chatService.getChatOrThrow(chatId);
    await chatService.assertIsMember(chatId, userId);

    const receipt = await messageService.markMessageRead(String(chatId), messageId, userId);
    res.status(200).json({ receipt });
  },

  async updateLastSeen(
    req: Request<{ chatId: string }, unknown, UpdateLastSeenRequestBody>,
    res: Response
  ): Promise<void> {
    const chatId = parseChatId(req.params.chatId);
    const { userId, messageId } = req.body;
    if (typeof userId !== 'number' || typeof messageId !== 'string') {
      throw AppError.badRequest('userId (number) and messageId (string) are required');
    }

    await chatService.getChatOrThrow(chatId);
    await chatService.assertIsMember(chatId, userId);

    const lastSeen = await messageService.updateLastSeen(String(chatId), userId, messageId);
    res.status(200).json({ lastSeen });
  },

  async editMessage(
    req: Request<{ chatId: string; messageId: string }, unknown, EditMessageRequestBody>,
    res: Response
  ): Promise<void> {
    const chatId = parseChatId(req.params.chatId);
    const { messageId } = req.params;
    const { userId, text } = req.body;
    if (typeof userId !== 'number' || typeof text !== 'string') {
      throw AppError.badRequest('userId (number) and text (string) are required');
    }

    await chatService.getChatOrThrow(chatId);
    await chatService.assertIsMember(chatId, userId);

    const message = await messageService.editMessage(String(chatId), messageId, userId, text);
    res.status(200).json({ message });
  },

  async deleteMessage(
    req: Request<{ chatId: string; messageId: string }, unknown, DeleteMessageRequestBody>,
    res: Response
  ): Promise<void> {
    const chatId = parseChatId(req.params.chatId);
    const { messageId } = req.params;
    const { userId } = req.body;
    if (typeof userId !== 'number') {
      throw AppError.badRequest('userId is required and must be a number');
    }

    await chatService.getChatOrThrow(chatId);
    await chatService.assertIsMember(chatId, userId);

    const message = await messageService.deleteMessage(String(chatId), messageId, userId);
    res.status(200).json({ message });
  }
};
