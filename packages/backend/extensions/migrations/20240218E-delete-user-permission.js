import { USER_ROLE_ID } from '../../contants/roles.js';

export default {
  async up(knex) {
    await knex('directus_permissions').insert({
      role: USER_ROLE_ID,
      collection: 'directus_users',
      action: 'delete',
      permissions: { id: { _eq: '$CURRENT_USER' } },
      validation: null,
      presets: null,
      fields: null,
    });
  },
};
