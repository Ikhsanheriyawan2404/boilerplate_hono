import { Context } from 'hono';
import { UserValidation } from '../validators/user.valildation';
import { UserService } from '../services/user.service';

const userService = new UserService();

export const createUserHandler = async (c: Context) => {
  const data = await c.req.json();
  const validatedData = UserValidation.CREATE.parse(data);

  const newUser = await userService.create(validatedData);
  return c.json({ message: 'User created successfully', data: newUser });
};

export const getAllUserHandler = async (c: Context) => {
  const users = await userService.getAll()

  return c.json({ data: users });
};

export const getUserHandler = async (c: Context) => {
  const id = c.req.param('id');
  const user = await userService.getById(Number(id));
  return c.json({ data: user });
};

export const updateUserHandler = async (c: Context) => {
  const id = c.req.param('id');
  const data = await c.req.json();
  const validatedData = UserValidation.CREATE.parse(data);

  const updatedUser = await userService.update(Number(id), validatedData);

  return c.json({ message: 'User updated successfully', data: updatedUser });
};

export const deleteUserHandler = async (c: Context) => {
  const id = c.req.param('id');

  // await prisma.user.delete({ where: { id: Number(id) } });
  await userService.delete(Number(id));
  return c.json({ message: 'User deleted successfully' });
};
