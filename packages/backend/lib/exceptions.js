import { createError } from '@directus/errors';

export const InvalidPayload = createError(
  'INVALID_PAYLOAD',
  (reason) => `Invalid payload. ${reason}.`,
  400,
);

export const BadRequest = createError(
  'BAD_REQEUST',
  (reason) => `Bad Request. ${reason}.`,
  400,
);

export const Forbidden = createError(
  'FORBIDDEN',
  (reason) => `Forbidden. ${reason}.`,
  403,
);

export const Unverified = createError(
  'UNVERIFIED',
  () => `User is unverified`,
  403,
);

export const GeneralError = createError(
  'GENERAL_ERROR',
  () => `Unexpcted internal error.`,
  403,
);

export const AlreadyInQuiz = createError(
  'ALREADY_IN_QUIZ',
  () => `User is already in quiz.`,
  409,
);
