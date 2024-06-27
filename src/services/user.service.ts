import { PrismaClient } from '@prisma/client';
import { User } from '../models/User';
import { HTTPException } from 'hono/http-exception';

const prisma = new PrismaClient();

export class UserService {
  async create(data: User): Promise<User> {
    return await prisma.user.create({ data });
  }

  async getAll(): Promise<User[]> {
    return await prisma.user.findMany();
  }

  async getById(id: number): Promise<User | null> {
    return await this.checkDataMustExist(id);
  }

  async update(id: number, data: User): Promise<User> {
    await await this.checkDataMustExist(id);
    
    return await prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<void> {
    await this.checkDataMustExist(id);
    await prisma.user.delete({ where: { id } });
  }

  private async checkDataMustExist(id: number): Promise<User | null> {
    const user = prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new HTTPException(404, { message: 'Data not found' });
    }
    return user
  }
}
