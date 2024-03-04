import { USER_ROLE_ID } from '../../contants/roles.js';

export default {
  async up(knex) {
    await knex('directus_permissions').insert([
      {
        role: USER_ROLE_ID,
        collection: 'directus_files',
        action: 'create',
        permissions: null,
        validation: {
          _and: [{ uploaded_by: { _eq: '$CURRENT_USER.id' } }],
        },
        presets: { uploaded_by: '$CURRENT_USER' },
        fields: '*',
      },
      {
        role: USER_ROLE_ID,
        collection: 'directus_files',
        action: 'update',
        permissions: {
          _and: [{ uploaded_by: { _eq: '$CURRENT_USER' } }],
        },
        validation: {
          _and: [{ uploaded_by: { _eq: '$CURRENT_USER' } }],
        },
        presets: { uploaded_by: '$CURRENT_USER' },
        fields: '*',
      },
      {
        role: USER_ROLE_ID,
        collection: 'directus_files',
        action: 'read',
        permissions: {
          _and: [{ uploaded_by: { _eq: '$CURRENT_USER' } }],
        },
        validation: null,
        presets: null,
        fields: '*',
      },
      {
        role: USER_ROLE_ID,
        collection: 'directus_files',
        action: 'delete',
        permissions: {
          _and: [{ uploaded_by: { _eq: '$CURRENT_USER' } }],
        },
        validation: null,
        presets: null,
        fields: '*',
      },

      {
        role: USER_ROLE_ID,
        collection: 'directus_users',
        action: 'read',
        permissions: {
          _or: [
            { id: { _eq: '$CURRENT_USER' } },
            {
              shared_topics: {
                topic: {
                  id: {
                    _in: '$CURRENT_USER.topics.id',
                  },
                },
              },
            },
            {
              shared_topics: {
                topic: {
                  id: {
                    _in: '$CURRENT_USER.shared_topics.topic.id',
                  },
                },
              },
            },
            {
              topics: {
                id: {
                  _in: '$CURRENT_USER.shared_topics.topic.id',
                },
              },
            },
          ],
        },
        validation: null,
        presets: null,
        fields:
          'id,first_name,last_name,email,language,topics,shared_topics,exercise_participations,last_ping',
      },
      {
        role: USER_ROLE_ID,
        collection: 'directus_users',
        action: 'update',
        permissions: { id: { _eq: '$CURRENT_USER' } },
        validation: null,
        presets: null,
        fields: 'first_name,last_name,language,last_ping',
      },

      {
        role: USER_ROLE_ID,
        collection: 'topics_shares',
        action: 'read',
        permissions: {
          _and: [{ user: { _eq: '$CURRENT_USER' } }],
        },
        validation: null,
        presets: null,
        fields: 'id,date_created,user,topic',
      },

      {
        role: USER_ROLE_ID,
        collection: 'topics',
        action: 'create',
        permissions: null,
        validation: { _and: [{ user_created: { _eq: '$CURRENT_USER' } }] },
        presets: { user_created: '$CURRENT_USER' },
        fields: 'id,sort,date_created,title,icon,user_created',
      },
      {
        role: USER_ROLE_ID,
        collection: 'topics',
        action: 'read',
        permissions: {
          _or: [
            { user_created: { _eq: '$CURRENT_USER' } },
            { id: { _in: '$CURRENT_USER.shared_topics.topic.id' } },
          ],
        },
        validation: null,
        presets: null,
        fields: 'id,sort,date_created,title,icon,user_created',
      },
      {
        role: USER_ROLE_ID,
        collection: 'topics',
        action: 'update',
        permissions: { _and: [{ user_created: { _eq: '$CURRENT_USER' } }] },
        validation: null,
        presets: null,
        fields: 'sort,title,icon',
      },
      {
        role: USER_ROLE_ID,
        collection: 'topics',
        action: 'delete',
        permissions: { _and: [{ user_created: { _eq: '$CURRENT_USER' } }] },
        validation: null,
        presets: null,
        fields: null,
      },

      {
        role: USER_ROLE_ID,
        collection: 'questions',
        action: 'create',
        permissions: null,
        validation: {
          _and: [
            { user_created: { _eq: '$CURRENT_USER' } },
            {
              _or: [
                { topic: { _in: '$CURRENT_USER.topics.id' } },
                { topic: { _in: '$CURRENT_USER.shared_topics.topic.id' } },
              ],
            },
          ],
        },
        presets: {
          user_created: '$CURRENT_USER',
          user_updated: '$CURRENT_USER',
        },
        fields: 'id,sort,date_created,date_updated,user_created,user_updated,topic,content,answers',
      },
      {
        role: USER_ROLE_ID,
        collection: 'questions',
        action: 'read',
        permissions: {
          _or: [
            {
              _and: [
                { user_created: { _eq: '$CURRENT_USER' } },
                { topic: { user_created: { _eq: '$CURRENT_USER' } } },
              ],
            },
            {
              topic: { _in: '$CURRENT_USER.shared_topics.topic.id' },
            },
          ],
        },
        validation: null,
        presets: null,
        fields: 'id,sort,date_created,date_updated,user_created,user_updated,topic,content,answers',
      },
      {
        role: USER_ROLE_ID,
        collection: 'questions',
        action: 'update',
        permissions: {
          _or: [
            {
              _and: [
                { user_created: { _eq: '$CURRENT_USER' } },
                { topic: { user_created: { _eq: '$CURRENT_USER' } } },
              ],
            },
            {
              topic: { _in: '$CURRENT_USER.shared_topics.topic.id' },
            },
          ],
        },
        validation: null,
        presets: null,
        fields: 'id,sort,content,answers',
      },
      {
        role: USER_ROLE_ID,
        collection: 'questions',
        action: 'delete',
        permissions: {
          _or: [
            {
              _and: [
                { user_created: { _eq: '$CURRENT_USER' } },
                { topic: { user_created: { _eq: '$CURRENT_USER' } } },
              ],
            },
            {
              topic: { _in: '$CURRENT_USER.shared_topics.topic.id' },
            },
          ],
        },
        validation: null,
        presets: null,
        fields: null,
      },

      {
        role: USER_ROLE_ID,
        collection: 'answers',
        action: 'create',
        permissions: null,
        validation: {
          _and: [
            { user_created: { _eq: '$CURRENT_USER' } },
            {
              _or: [
                { topic: { _in: '$CURRENT_USER.topics.id' } },
                { topic: { _in: '$CURRENT_USER.shared_topics.topic.id' } },
              ],
            },
          ],
        },
        presets: {
          user_created: '$CURRENT_USER',
          user_updated: '$CURRENT_USER',
        },
        fields:
          'id,sort,date_created,date_updated,user_created,user_updated,topic,question,content,correct_answer,reason',
      },
      {
        role: USER_ROLE_ID,
        collection: 'answers',
        action: 'read',
        permissions: {
          _or: [
            {
              _and: [
                { user_created: { _eq: '$CURRENT_USER' } },
                { topic: { user_created: { _eq: '$CURRENT_USER' } } },
                { question: { user_created: { _eq: '$CURRENT_USER' } } },
              ],
            },
            {
              topic: { _in: '$CURRENT_USER.shared_topics.topic.id' },
            },
          ],
        },
        validation: null,
        presets: null,
        fields:
          'id,sort,date_created,date_updated,user_created,user_updated,topic,question,content,correct_answer,reason',
      },
      {
        role: USER_ROLE_ID,
        collection: 'answers',
        action: 'update',
        permissions: {
          _or: [
            {
              _and: [
                { user_created: { _eq: '$CURRENT_USER' } },
                { topic: { user_created: { _eq: '$CURRENT_USER' } } },
                { question: { user_created: { _eq: '$CURRENT_USER' } } },
              ],
            },
            {
              topic: { _in: '$CURRENT_USER.shared_topics.topic.id' },
            },
          ],
        },
        validation: {
          _or: [
            {
              _and: [
                { topic: { _in: '$CURRENT_USER.topics.id' } },
                { question: { _in: { _eq: '$CURRENT_USER.topics.questions.id' } } },
              ],
            },
            {
              _and: [
                { topic: { _in: '$CURRENT_USER.shared_topics.topic.id' } },
                { question: { _in: '$CURRENT_USER.shared_topics.topic.questions.id' } },
              ],
            },
          ],
        },
        presets: null,
        fields: 'id,content,correct_answer,reason,topic,question',
      },
      {
        role: USER_ROLE_ID,
        collection: 'answers',
        action: 'delete',
        permissions: {
          _or: [
            {
              _and: [
                { user_created: { _eq: '$CURRENT_USER' } },
                { topic: { user_created: { _eq: '$CURRENT_USER' } } },
                { question: { user_created: { _eq: '$CURRENT_USER' } } },
              ],
            },
            {
              topic: { _in: '$CURRENT_USER.shared_topics.topic.id' },
            },
          ],
        },
        validation: null,
        presets: null,
        fields: null,
      },

      {
        role: USER_ROLE_ID,
        collection: 'exercises',
        action: 'create',
        permissions: null,
        validation: {
          _and: [
            { user_created: { _eq: '$CURRENT_USER' } },
            {
              _or: [
                { topic: { _in: '$CURRENT_USER.topics.id' } },
                { topic: { _in: '$CURRENT_USER.shared_topics.topic.id' } },
              ],
            },
            {
              status: { _eq: 'init' },
            },
          ],
        },
        presets: {
          user_created: '$CURRENT_USER',
          user_updated: '$CURRENT_USER',
          status: 'init',
        },
        fields: 'id,sort,date_created,user_created,user_updated,topic,status',
      },
      {
        role: USER_ROLE_ID,
        collection: 'exercises',
        action: 'read',
        permissions: {
          _and: [{ id: { _in: '$CURRENT_USER.exercise_participations.exercise.id' } }],
        },
        validation: null,
        presets: null,
        fields: 'id,user_created,date_crated,topic,status,current_exercise_question,participants',
      },
      {
        role: USER_ROLE_ID,
        collection: 'exercises',
        action: 'update',
        permissions: {
          _and: [{ user_created: { _eq: '$CURRENT_USER' } }],
        },
        validation: null,
        presets: null,
        fields: 'status,current_exercise_question',
      },

      {
        role: USER_ROLE_ID,
        collection: 'exercise_participants',
        action: 'create',
        permissions: null,
        validation: {
          _and: [
            { status: { _eq: 'invited' } },
            {
              _or: [
                { topic: { _in: '$CURRENT_USER.topics.id' } },
                { topic: { _in: '$CURRENT_USER.shared_topics.topic.id' } },
              ],
            },
          ],
        },
        presets: null,
        fields: 'id,topic,exercise,user,status',
      },
      {
        role: USER_ROLE_ID,
        collection: 'exercise_participants',
        action: 'read',
        permissions: {
          _or: [
            { exercise: { user_created: { id: { _eq: '$CURRENT_USER' } } } },
            { exercise: { id: { _in: '$CURRENT_USER.exercise_participations.exercise.id' } } },
            { user: { id: { _eq: '$CURRENT_USER' } } },
          ],
        },
        validation: null,
        presets: null,
        fields: 'id,topic,exercise,user,status',
      },
      {
        role: USER_ROLE_ID,
        collection: 'exercise_participants',
        action: 'update',
        permissions: {
          _or: [{ user: { id: { _eq: '$CURRENT_USER' } } }],
        },
        validation: {
          status: { _id: ['accepted', 'rejected'] },
        },
        presets: null,
        fields: 'status',
      },
      {
        role: USER_ROLE_ID,
        collection: 'exercise_participants',
        action: 'delete',
        permissions: {
          _and: [
            { exercise: { user_created: { _eq: '$CURRENT_USER' } } },
            {
              _or: [
                { topic: { _in: '$CURRENT_USER.topics.id' } },
                { topic: { _in: '$CURRENT_USER.shared_topics.topic.id' } },
              ],
            },
          ],
        },
        validation: null,
        presets: null,
        fields: 'id,topic,exercise,user',
      },

      {
        role: USER_ROLE_ID,
        collection: 'exercise_questions',
        action: 'read',
        permissions: {
          _and: [
            { exercise: { id: { _in: '$CURRENT_USER.exercise_participations.exercise.id' } } },
          ],
        },
        validation: null,
        presets: null,
        fields:
          'id,sort,date_created,user_created,user_updated,date_updated,exercise,topic,question,content,exercise_question_answers,show_result,answer_end_time',
      },
      {
        role: USER_ROLE_ID,
        collection: 'exercise_questions',
        action: 'update',
        permissions: {
          _and: [{ exercise: { user_created: { _eq: '$CURRENT_USER' } } }],
        },
        validation: {
          show_result: { _eq: true },
        },
        presets: null,
        fields: 'show_result',
      },

      {
        role: USER_ROLE_ID,
        collection: 'exercise_answers',
        action: 'read',
        permissions: {
          _and: [
            { exercise: { id: { _in: '$CURRENT_USER.exercise_participations.exercise.id' } } },
          ],
        },
        validation: null,
        presets: null,
        fields:
          'id,sort,date_created,user_created,user_updated,date_updated,exercise,topic,exercise_question,answer,content,correct_answer,reason',
      },

      {
        role: USER_ROLE_ID,
        collection: 'exercise_participants',
        action: 'read',
        permissions: {
          _and: [
            { exercise: { id: { _in: '$CURRENT_USER.exercise_participations.exercise.id' } } },
          ],
        },
        validation: null,
        presets: null,
        fields: 'id,topic,exercise,user',
      },

      {
        role: USER_ROLE_ID,
        collection: 'exercise_participant_answers',
        action: 'read',
        permissions: {
          _and: [
            { exercise: { id: { _in: '$CURRENT_USER.exercise_participations.exercise.id' } } },
          ],
        },
        validation: null,
        presets: null,
        fields: 'id,topic,exercise,exercise_question,participant,selected_exercise_answer',
      },
      {
        role: USER_ROLE_ID,
        collection: 'exercise_participant_answers',
        action: 'update',
        permissions: {
          _and: [
            { participant: { user: { _eq: '$CURRENT_USER' } } },
            { exercise_question: { show_result: { _eq: false } } },
          ],
        },
        validation: null,
        presets: null,
        fields: 'selected_exercise_answer',
      },
    ]);
  },
};
