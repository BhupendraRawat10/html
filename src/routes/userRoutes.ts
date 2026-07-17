import { Router } from 'express';
import { chatController } from '../controllers/chatController';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.get('/user/:userId/chats', asyncHandler(chatController.listUserChats));

export { router as userRoutes };
