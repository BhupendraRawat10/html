// ---------- Relational (MySQL) domain types ----------

export type ChatType = 'direct' | 'group';
export type ChatMemberRole = 'member' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: Date;
}

export interface Chat {
  id: number;
  type: ChatType;
  name: string | null;
  created_by: number | null;
  created_at: Date;
}

export interface ChatMember {
  chat_id: number;
  user_id: number;
  role: ChatMemberRole;
  joined_at: Date;
}

export interface ChatWithMembers {
  id: number;
  type: ChatType;
  name: string | null;
  created_at: Date;
  memberIds: number[];
}

// ---------- Firestore domain types ----------

export interface FirestoreMessage {
  id: string;
  chatId: string;
  senderId: number;
  text: string;
  timestamp: number; // epoch millis, used for ordering
  edited: boolean;
  editedAt: number | null;
  deleted: boolean;
  deletedAt: number | null;
}

export interface FirestoreReadReceipt {
  userId: number;
  readAt: number; // epoch millis
}

export interface FirestoreLastSeen {
  userId: number;
  messageId: string;
  timestamp: number; // epoch millis
}

// ---------- API request bodies ----------

export interface CreateChatRequestBody {
  userAId: number;
  userBId: number;
}

export interface CreateGroupChatRequestBody {
  name: string;
  createdBy: number;
  memberIds: number[];
}

export interface SendMessageRequestBody {
  senderId: number;
  text: string;
}

export interface MarkReadRequestBody {
  userId: number;
}

export interface UpdateLastSeenRequestBody {
  userId: number;
  messageId: string;
}

export interface EditMessageRequestBody {
  userId: number;
  text: string;
}

export interface DeleteMessageRequestBody {
  userId: number;
}

export interface AddMemberRequestBody {
  userId: number;
}
