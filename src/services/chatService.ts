import { chatRepository } from '../repositories/chatRepository';
import { userRepository } from '../repositories/userRepository';
import { AppError } from '../utils/AppError';
import { Chat, ChatWithMembers } from '../types';

export const chatService = {

  async createOrGetDirectChat(userAId: number, userBId: number): Promise<Chat> {
    if (userAId === userBId) {
      throw AppError.badRequest('userAId and userBId must be different users');
    }

    const [userA, userB] = await Promise.all([
      userRepository.findById(userAId),
      userRepository.findById(userBId)
    ]);
    if (!userA) throw AppError.notFound(`User ${userAId} does not exist`);
    if (!userB) throw AppError.notFound(`User ${userBId} does not exist`);

    const existing = await chatRepository.findDirectChatBetweenUsers(userAId, userBId);
    if (existing) return existing;

    return chatRepository.createChatWithMembers('direct', [userAId, userBId], {
      createdBy: userAId
    });
  },

  async createGroupChat(name: string, createdBy: number, memberIds: number[]): Promise<Chat> {
    if (!name.trim()) throw AppError.badRequest('Group name is required');

    const uniqueMemberIds = Array.from(new Set([createdBy, ...memberIds]));
    if (uniqueMemberIds.length < 2) {
      throw AppError.badRequest('A group chat needs at least 2 distinct members');
    }

    const users = await userRepository.findAllByIds(uniqueMemberIds);
    if (users.length !== uniqueMemberIds.length) {
      throw AppError.badRequest('One or more memberIds do not correspond to existing users');
    }

    return chatRepository.createChatWithMembers('group', uniqueMemberIds, {
      name: name.trim(),
      createdBy
    });
  },

  async addMemberToGroup(chatId: number, userId: number): Promise<void> {
    const chat = await this.getChatOrThrow(chatId);
    if (chat.type !== 'group') {
      throw AppError.badRequest('Cannot add members to a direct chat');
    }
    const user = await userRepository.findById(userId);
    if (!user) throw AppError.notFound(`User ${userId} does not exist`);

    await chatRepository.addMember(chatId, userId);
  },

  async removeMemberFromGroup(chatId: number, userId: number): Promise<void> {
    const chat = await this.getChatOrThrow(chatId);
    if (chat.type !== 'group') {
      throw AppError.badRequest('Cannot remove members from a direct chat');
    }
    await chatRepository.removeMember(chatId, userId);
  },

  async getChatOrThrow(chatId: number): Promise<Chat> {
    const chat = await chatRepository.findById(chatId);
    if (!chat) throw AppError.notFound(`Chat ${chatId} does not exist`);
    return chat;
  },

  async assertIsMember(chatId: number, userId: number): Promise<void> {
    const isMember = await chatRepository.isMember(chatId, userId);
    if (!isMember) {
      throw AppError.forbidden(`User ${userId} is not a member of chat ${chatId}`);
    }
  },

  async getChatsForUser(userId: number): Promise<ChatWithMembers[]> {
    const user = await userRepository.findById(userId);
    if (!user) throw AppError.notFound(`User ${userId} does not exist`);
    return chatRepository.getChatsForUser(userId);
  }
};
