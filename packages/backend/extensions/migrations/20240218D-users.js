import { SUPER_APP_ADMIN_ROLE_ID } from '../../contants/roles.js';
import { SUPER_ADMIN_USER_ID } from '../../contants/users.js';
import argon2 from 'argon2';
import dotenv from 'dotenv';

dotenv.config();

export default {
  async up(knex) {
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      throw new Error('Missing ADMIN env variables');
    }

    const adminPassword = await argon2.hash(process.env.ADMIN_PASSWORD);

    await knex('directus_users').insert({
      id: SUPER_ADMIN_USER_ID,
      first_name: 'Admin',
      last_name: 'User',
      email: process.env.ADMIN_EMAIL,
      password: adminPassword,
      location: null,
      title: null,
      description: null,
      tags: null,
      avatar: null,
      language: 'en-US',
      tfa_secret: null,
      status: 'active',
      role: SUPER_APP_ADMIN_ROLE_ID,
      token: null,
      last_page: null,
      provider: 'default',
      external_identifier: null,
      auth_data: null,
    });
  },
};
