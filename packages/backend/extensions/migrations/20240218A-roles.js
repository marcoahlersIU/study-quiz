import { SUPER_APP_ADMIN_ROLE_ID, USER_ROLE_ID } from '../../contants/roles.js';

export default {
  async up(knex) {
    await knex('directus_roles').insert([
      {
        id: SUPER_APP_ADMIN_ROLE_ID,
        name: 'Super Admin',
        icon: 'verified',
        description: 'Initial administrative role with unrestricted App/API access',
        ip_access: null,
        enforce_tfa: 0,
        admin_access: 1,
        app_access: 1,
      },

      {
        id: USER_ROLE_ID,
        name: 'User',
        icon: 'supervised_user_circle',
        description: null,
        ip_access: null,
        enforce_tfa: false,
        admin_access: false,
        app_access: false,
      },
    ]);
  },
};
