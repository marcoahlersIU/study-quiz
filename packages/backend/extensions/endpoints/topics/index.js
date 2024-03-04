import { Joi, celebrate, errors } from 'celebrate';
import { BadRequest, Forbidden } from '../../../lib/exceptions.js';
import asyncHandler from '../../../middleware/async-handler.js';
import { USER_ROLE_ID } from '../../../contants/roles.js';
import { acceptTopicInvite } from './validations.js';

export default function registerEndpoint(router, { services }) {
  const { ItemsService } = services;

  router.get(
    '/:topicId/share-token',
    asyncHandler(async (req, res) => {
      if (
        !req.accountability ||
        req.accountability.role !== USER_ROLE_ID ||
        !req.accountability?.permissions.find(
          (permission) => permission.collection === 'topics' && permission.action === 'read',
        )
      ) {
        throw new Forbidden('Missing read topic permission');
      }

      const topicId = req.params.topicId;
      if (!topicId) throw new BadRequest('Missing topic id');

      const topicService = new ItemsService('topics', {
        schema: req.schema,
      });

      let topic;
      try {
        topic = await topicService.readOne(topicId);
      } catch (err) {
        throw new BadRequest('Invalid topic id given');
      }

      if (topic.user_created !== req.accountability.user) {
        throw new Forbidden('Only the creator of the topic can receive the share token');
      }

      return res.send({
        shareToken: topic.share_token,
      });
    }),
  );

  router.get(
    '/:shareToken',
    asyncHandler(async (req, res) => {
      if (!req.params.shareToken) {
        throw new BadRequest('Missing share token');
      }

      const uuidTest = Joi.string().uuid();
      const result = uuidTest.validate(req.params.shareToken);
      if (result.error) {
        throw new BadRequest('Invalid share token');
      }

      const topicService = new ItemsService('topics', {
        schema: req.schema,
      });

      let [topic] = await topicService.readByQuery({
        filter: { share_token: { _eq: req.params.shareToken } },
        limit: 1,
        fields: [
          'id',
          'title',
          'user_created.id',
          'user_created.first_name',
          'user_created.last_name',
        ],
      });

      if (!topic) {
        throw new BadRequest('Invaild share token');
      }

      return res.send(topic);
    }),
  );

  router.post(
    '/accept-invite',
    celebrate(acceptTopicInvite),
    asyncHandler(async (req, res) => {
      if (!req.accountability || req.accountability.role !== USER_ROLE_ID) {
        throw new Forbidden('Missing permissions');
      }

      const topicService = new ItemsService('topics', {
        schema: req.schema,
      });
      let [topic] = await topicService.readByQuery({
        filter: { share_token: { _eq: req.body.shareToken } },
        fields: ['id', 'date_created', 'icon', 'sort', 'title', 'user_created'],
        limit: 1,
      });

      if (!topic) {
        throw new BadRequest('Invalid share token');
      }

      if (topic.user_created === req.accountability.user) {
        throw new BadRequest('Creator of topic can not use share token');
      }

      const topicSharesService = new ItemsService('topics_shares', {
        schema: req.schema,
      });

      let [topicShare] = await topicSharesService.readByQuery({
        filter: { user: req.accountability.user, topic: topic.id },
        limit: 1,
      });
      if (topicShare) {
        throw new BadRequest('Already accepeted invite');
      }

      await topicSharesService.createOne({
        user: req.accountability.user,
        topic: topic.id,
      });

      return res.send(topic);
    }),
  );

  router.use(errors());
}
