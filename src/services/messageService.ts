import { firestore } from '../config/firebase';
import { AppError } from '../utils/AppError';
import { FirestoreLastSeen, FirestoreMessage, FirestoreReadReceipt } from '../types';

/**
 * Firestore layout:
 *
 * chats/{chatId}/messages/{messageId}
 *   { senderId, text, timestamp, edited, editedAt, deleted, deletedAt }
 *
 * chats/{chatId}/messages/{messageId}/reads/{userId}
 *   { userId, readAt }
 *
 * chats/{chatId}/lastSeen/{userId}
 *   { userId, messageId, timestamp }
 *
 * Note: we store `timestamp` as an epoch-millis number (not serverTimestamp())
 * so that a message sent and immediately read back in the same request has a
 * concrete, orderable value with no read-after-write ambiguity.
 */

function chatMessagesCollection(chatId: string) {
  return firestore.collection('chats').doc(chatId).collection('messages');
}

function messageReadsCollection(chatId: string, messageId: string) {
  return chatMessagesCollection(chatId).doc(messageId).collection('reads');
}

function chatLastSeenCollection(chatId: string) {
  return firestore.collection('chats').doc(chatId).collection('lastSeen');
}

export const messageService = {
  async sendMessage(chatId: string, senderId: number, text: string): Promise<FirestoreMessage> {
    if (!text || !text.trim()) {
      throw AppError.badRequest('Message text must not be empty');
    }

    const docRef = chatMessagesCollection(chatId).doc();
    const timestamp = Date.now();

    const message: FirestoreMessage = {
      id: docRef.id,
      chatId,
      senderId,
      text: text.trim(),
      timestamp,
      edited: false,
      editedAt: null,
      deleted: false,
      deletedAt: null
    };

    await docRef.set(message);
    return message;
  },

  async getMessages(chatId: string, limit: number, before?: number): Promise<FirestoreMessage[]> {
    let query = chatMessagesCollection(chatId)
      .orderBy('timestamp', 'desc')
      .limit(limit);

    if (before !== undefined) {
      query = query.startAfter(before);
    }

    const snapshot = await query.get();
    const messages = snapshot.docs.map((doc) => doc.data() as FirestoreMessage);

    // Return in ascending (chronological) order for easy client rendering.
    return messages.reverse();
  },

  async getMessageOrThrow(chatId: string, messageId: string): Promise<FirestoreMessage> {
    const doc = await chatMessagesCollection(chatId).doc(messageId).get();
    if (!doc.exists) {
      throw AppError.notFound(`Message ${messageId} not found in chat ${chatId}`);
    }
    return doc.data() as FirestoreMessage;
  },

  async markMessageRead(chatId: string, messageId: string, userId: number): Promise<FirestoreReadReceipt> {
    await this.getMessageOrThrow(chatId, messageId);

    const receipt: FirestoreReadReceipt = { userId, readAt: Date.now() };
    await messageReadsCollection(chatId, messageId).doc(String(userId)).set(receipt);
    return receipt;
  },

  async getReadReceipts(chatId: string, messageId: string): Promise<FirestoreReadReceipt[]> {
    const snapshot = await messageReadsCollection(chatId, messageId).get();
    return snapshot.docs.map((doc) => doc.data() as FirestoreReadReceipt);
  },

  async updateLastSeen(chatId: string, userId: number, messageId: string): Promise<FirestoreLastSeen> {
    // Validate the message exists in this chat before recording it as "seen".
    await this.getMessageOrThrow(chatId, messageId);

    const lastSeen: FirestoreLastSeen = { userId, messageId, timestamp: Date.now() };
    await chatLastSeenCollection(chatId).doc(String(userId)).set(lastSeen);
    return lastSeen;
  },

  async getLastSeen(chatId: string, userId: number): Promise<FirestoreLastSeen | null> {
    const doc = await chatLastSeenCollection(chatId).doc(String(userId)).get();
    return doc.exists ? (doc.data() as FirestoreLastSeen) : null;
  },

  async editMessage(chatId: string, messageId: string, userId: number, text: string): Promise<FirestoreMessage> {
    const message = await this.getMessageOrThrow(chatId, messageId);

    if (message.senderId !== userId) {
      throw AppError.forbidden('Only the sender can edit this message');
    }
    if (message.deleted) {
      throw AppError.badRequest('Cannot edit a deleted message');
    }
    if (!text || !text.trim()) {
      throw AppError.badRequest('Message text must not be empty');
    }

    const editedAt = Date.now();
    const docRef = chatMessagesCollection(chatId).doc(messageId);
    await docRef.update({ text: text.trim(), edited: true, editedAt });

    return { ...message, text: text.trim(), edited: true, editedAt };
  },

  async deleteMessage(chatId: string, messageId: string, userId: number): Promise<FirestoreMessage> {
    const message = await this.getMessageOrThrow(chatId, messageId);

    if (message.senderId !== userId) {
      throw AppError.forbidden('Only the sender can delete this message');
    }
    if (message.deleted) {
      return message;
    }

    const deletedAt = Date.now();
    const docRef = chatMessagesCollection(chatId).doc(messageId);
    // Soft delete: keep the doc (preserves ordering/history) but blank the text.
    await docRef.update({ deleted: true, deletedAt, text: '' });

    return { ...message, deleted: true, deletedAt, text: '' };
  }
};
