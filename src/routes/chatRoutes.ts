import { Router } from 'express';
import { chatController } from '../controllers/chatController';
import { messageController } from '../controllers/messageController';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.post('/chat/create', asyncHandler(chatController.createChat));
router.post('/chat/:chatId/message/send', asyncHandler(messageController.sendMessage));
router.get('/chat/:chatId/messages', asyncHandler(messageController.getMessages));
router.post('/chat/:chatId/message/:messageId/read', asyncHandler(messageController.markRead));
router.post('/chat/:chatId/lastseen', asyncHandler(messageController.updateLastSeen));

router.post('/chat/group/create', asyncHandler(chatController.createGroupChat));
router.post('/chat/:chatId/members/add', asyncHandler(chatController.addGroupMember));
router.delete('/chat/:chatId/members/:userId', asyncHandler(chatController.removeGroupMember));

router.patch('/chat/:chatId/message/:messageId', asyncHandler(messageController.editMessage));
router.delete('/chat/:chatId/message/:messageId', asyncHandler(messageController.deleteMessage));

export { router as chatRoutes };
