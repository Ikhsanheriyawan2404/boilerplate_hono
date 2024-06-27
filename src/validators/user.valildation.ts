import { z } from 'zod';

export const UserValidation = {
  CREATE: z.object({
    name: z.string().min(1).max(255),
    email: z.string().email(),
    // Add more fields and validations as needed
  }),
};
