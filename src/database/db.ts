import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient({
        log: ['error', 'warn'], 
    });
} else {
    prisma = new PrismaClient({
        log: ['query', 'info', 'warn'],
    });
}

export default prisma;
