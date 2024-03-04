import { USER_ROLE_ID } from '../../contants/roles.js';

export default {
  async up(knex) {
    await knex('directus_permissions')
      .update({
        permissions: {
          _or: [
            {
              topic: { user_created: { _eq: '$CURRENT_USER' } },
            },
            {
              topic: { _in: '$CURRENT_USER.shared_topics.topic.id' },
            },
          ],
        },
      })
      .where('role', USER_ROLE_ID)
      .andWhere('collection', 'questions')
      .andWhere('action', 'read');

    await knex('directus_permissions')
      .update({
        permissions: {
          _or: [
            {
              topic: { user_created: { _eq: '$CURRENT_USER' } },
            },
            {
              topic: { _in: '$CURRENT_USER.shared_topics.topic.id' },
            },
          ],
        },
      })
      .where('role', USER_ROLE_ID)
      .andWhere('collection', 'questions')
      .andWhere('action', 'update');

    await knex('directus_permissions')
      .update({
        permissions: {
          _or: [
            {
              topic: { user_created: { _eq: '$CURRENT_USER' } },
            },
            {
              topic: { _in: '$CURRENT_USER.shared_topics.topic.id' },
            },
          ],
        },
      })
      .where('role', USER_ROLE_ID)
      .andWhere('collection', 'questions')
      .andWhere('action', 'delete');

    await knex('directus_permissions')
      .update({
        permissions: {
          _or: [
            {
              topic: { user_created: { _eq: '$CURRENT_USER' } },
            },
            {
              topic: { _in: '$CURRENT_USER.shared_topics.topic.id' },
            },
          ],
        },
      })
      .where('role', USER_ROLE_ID)
      .andWhere('collection', 'answers')
      .andWhere('action', 'read');

    await knex('directus_permissions')
      .update({
        permissions: {
          _or: [
            {
              topic: { user_created: { _eq: '$CURRENT_USER' } },
            },
            {
              topic: { _in: '$CURRENT_USER.shared_topics.topic.id' },
            },
          ],
        },
      })
      .where('role', USER_ROLE_ID)
      .andWhere('collection', 'answers')
      .andWhere('action', 'update');

    await knex('directus_permissions')
      .update({
        permissions: {
          _or: [
            {
              topic: { user_created: { _eq: '$CURRENT_USER' } },
            },
            {
              topic: { _in: '$CURRENT_USER.shared_topics.topic.id' },
            },
          ],
        },
      })
      .where('role', USER_ROLE_ID)
      .andWhere('collection', 'answers')
      .andWhere('action', 'update');
  },
};
