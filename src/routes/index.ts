import { Router } from 'express';
import { chatRoutes } from './chatRoutes';
import { userRoutes } from './userRoutes';

const router = Router();

router.get('/', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

router.use(chatRoutes);
router.use(userRoutes);

export { router as apiRoutes };
