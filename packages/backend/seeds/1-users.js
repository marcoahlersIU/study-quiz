import { faker } from '@faker-js/faker';

import { USER_ROLE_ID } from '../contants/roles.js';
import { v4 as uuidv4 } from 'uuid';

import dotenv from 'dotenv';
dotenv.config();

export const seed = async (knex) => {
  const email = process.env.SEEDS_EMAIL;
  if (!email) throw new Error('Missing seeds email in env');

  const users = await Promise.all(
    Array.from({ length: 7 }, async (_, i) => {
      const userEmail = email.replace('{{userNumber}}', i + 1);

      return {
        id: uuidv4(),
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: userEmail,
        password:
          '$argon2i$v=19$m=4096,t=3,p=1$iB+TjN+k+++oj7mRdorjoQ$i9VtlT8IaVg7NQv3k26ouH0svagDEpHe7Yg3HWPRzZE', // Test123$
        status: 'active',
        role: USER_ROLE_ID,
      };
    }),
  );

  await knex('directus_users').insert(users);
};
