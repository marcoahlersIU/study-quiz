import { Joi, Segments } from 'celebrate';

const createAccountValidaiton = {
  [Segments.BODY]: Joi.object().keys({
    email: Joi.string().email({ tlds: false }).max(256).required(),
    firstName: Joi.string().min(1).max(256).required(),
    lastName: Joi.string().min(1).max(256).required(),
    password: Joi.string().min(8).max(256).required(),
  }),
};

const emailValidaiton = {
  [Segments.BODY]: Joi.object().keys({
    email: Joi.string().email({ tlds: false }).max(256).required(),
  }),
};

const verifyEmailValidation = {
  [Segments.BODY]: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

export { createAccountValidaiton, emailValidaiton, verifyEmailValidation };
