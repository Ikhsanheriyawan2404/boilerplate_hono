import { Hono } from 'hono';
import { createUserHandler, deleteUserHandler, getAllUserHandler, getUserHandler, updateUserHandler } from '../handlers/user.handler';

const router = new Hono()

router.get('/users', getAllUserHandler);
router.get('/users/:id', getUserHandler);
router.post('/users', createUserHandler);
router.put('/users/:id', updateUserHandler);
router.delete('/users/:id', deleteUserHandler);

export default router;