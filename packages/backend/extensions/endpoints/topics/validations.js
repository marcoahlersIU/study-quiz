import { Joi, Segments } from 'celebrate';

const acceptTopicInvite = {
  [Segments.BODY]: Joi.object().keys({
    shareToken: Joi.string().uuid().required(),
  }),
};

export { acceptTopicInvite };
