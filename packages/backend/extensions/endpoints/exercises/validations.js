import { Joi, Segments } from 'celebrate';

const createExercise = {
  [Segments.BODY]: Joi.object().keys({
    topic: Joi.string().uuid().required(),
    participants: Joi.array().items(Joi.string().uuid()).min(1),
  }),
};

export { createExercise };
