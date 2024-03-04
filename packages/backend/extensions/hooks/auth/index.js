import { Unverified } from '../../../lib/exceptions.js';
import argon2 from 'argon2';

export default ({ filter }, { database }) => {
  filter('authenticate', async (_, { req }) => {
    if (req.body.email && req.body.password) {
      const user = await database
        .select('*')
        .from('directus_users')
        .whereRaw('LOWER(??) = ?', ['email', req.body.email.toLowerCase()])
        .first();
      if (user) {
        const validPassword = await argon2.verify(user.password, req.body.password);

        if (validPassword && user.status === 'unverified') {
          throw new Unverified();
        }
      }
    }
  });
};
