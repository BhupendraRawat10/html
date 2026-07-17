import { Request, Response } from 'express';
import { chatService } from '../services/chatService';
import { AppError } from '../utils/AppError';
import {
  AddMemberRequestBody,
  CreateChatRequestBody,
  CreateGroupChatRequestBody
} from '../types';

function parseChatId(raw: string): number {
  const chatId = Number(raw);
  if (!Number.isInteger(chatId) || chatId <= 0) {
    throw AppError.badRequest('chatId must be a positive integer');
  }
  return chatId;
}


export const chatController = {
  async createChat(req: Request<unknown, unknown, CreateChatRequestBody>, res: Response): Promise<void> {
    const { userAId, userBId } = req.body;
    if (typeof userAId !== 'number' || typeof userBId !== 'number') {
      throw AppError.badRequest('userAId and userBId are required and must be numbers');
    }

    const chat = await chatService.createOrGetDirectChat(userAId, userBId);
    console.log("chat", chat);
    res.status(200).json({ chatId: chat.id });
  },

  async createGroupChat(
    req: Request<unknown, unknown, CreateGroupChatRequestBody>,
    res: Response
  ): Promise<void> {
    const { name, createdBy, memberIds } = req.body;
    if (typeof name !== 'string' || typeof createdBy !== 'number' || !Array.isArray(memberIds)) {
      throw AppError.badRequest('name (string), createdBy (number), memberIds (number[]) are required');
    }

    const chat = await chatService.createGroupChat(name, createdBy, memberIds);
    console.log("chat", chat);

    res.status(200).json({ chatId: chat.id, name: chat.name, type: chat.type });
  },

  async addGroupMember(
    req: Request<{ chatId: string }, unknown, AddMemberRequestBody>,
    res: Response
  ): Promise<void> {
    const chatId = parseChatId(req.params.chatId);
    const { userId } = req.body;
    if (typeof userId !== 'number') {
      throw AppError.badRequest('userId is required and must be a number');
    }

    await chatService.addMemberToGroup(chatId, userId);
    console.log("chatService", chatService);

    res.status(200).json({ success: true });
  },

  async removeGroupMember(req: Request<{ chatId: string; userId: string }>, res: Response): Promise<void> {
    const chatId = parseChatId(req.params.chatId);
    const userId = Number(req.params.userId);
    if (!Number.isInteger(userId) || userId <= 0) {
      throw AppError.badRequest('userId must be a positive integer');
    }

    await chatService.removeMemberFromGroup(chatId, userId);
    console.log("chatService", chatService);

    res.status(200).json({ success: true });
  },

  async listUserChats(req: Request<{ userId: string }>, res: Response): Promise<void> {
    const userId = Number(req.params.userId);
    if (!Number.isInteger(userId) || userId <= 0) {
      throw AppError.badRequest('userId must be a positive integer');
    }

    const chats = await chatService.getChatsForUser(userId);
    console.log("chats", chats);

    res.status(200).json({
      chats: chats.map((chat) => ({
        chatId: chat.id,
        type: chat.type,
        name: chat.name,
        memberIds: chat.memberIds,
        createdAt: chat.created_at
      }))
    });
  }
};

export { parseChatId };
