import { celebrate, errors } from 'celebrate';
import jsonwebtoken from 'jsonwebtoken';
import { USER_ROLE_ID } from '../../../contants/roles.js';
import { BadRequest, Forbidden } from '../../../lib/exceptions.js';
import asyncHandler from '../../../middleware/async-handler.js';
import { createAccountValidaiton, emailValidaiton, verifyEmailValidation } from './validations.js';

export default function registerEndpoint(router, { services, env }) {
  const { UsersService, MailService } = services;

  async function sendVerificationEmail(req) {
    const mailService = new MailService({
      schema: req.schema,
      accountability: req.accountability,
    });

    const payload = { email: req.body.email, scope: 'email-verification' };
    const token = jsonwebtoken.sign(payload, env.SECRET, { expiresIn: '2h', issuer: 'directus' });

    await mailService.send({
      to: req.body.email,
      subject: 'Activate Your Study-Quiz Account',
      template: {
        name: 'verify-email',
        data: {
          url: `${env.WEBSITE_URL}/auth/verify-email?token=${token}&email=${encodeURIComponent(
            req.body.email,
          )}`,
          email: req.body.email,
        },
      },
    });
  }

  router.post(
    '/',
    celebrate(createAccountValidaiton),
    asyncHandler(async (req, res, next) => {
      const userService = new UsersService({
        schema: req.schema,
      });

      try {
        req.body.status = 'unverified';
        req.body.role = USER_ROLE_ID;
        req.body.first_name = req.body.firstName;
        req.body.last_name = req.body.lastName;

        await userService.createOne(req.body);
      } catch (err) {
        return next(err);
      }

      await sendVerificationEmail(req);
      return res.sendStatus(201);
    }),
  );

  router.post(
    '/resend-verification-email',
    celebrate(emailValidaiton),
    asyncHandler(async (req, res, next) => {
      const userService = new UsersService({
        schema: req.schema,
      });

      let user;
      try {
        const users = await userService.readByQuery({
          filter: {
            email: {
              _eq: req.body.email,
            },
          },
          limit: 1,
        });
        [user] = users;
      } catch (err) {
        return next(err);
      }

      if (user && user.status !== 'active') {
        await sendVerificationEmail(req);
      }

      return res.sendStatus(200);
    }),
  );

  router.post(
    '/verify-email',
    celebrate(verifyEmailValidation),
    asyncHandler(async (req, res, next) => {
      const userService = new UsersService({
        schema: req.schema,
      });

      let email;
      let scope;
      try {
        const body = jsonwebtoken.verify(req.body.token, env.SECRET, { issuer: 'directus' });
        email = body.email;
        scope = body.scope;
      } catch (err) {
        throw new BadRequest('Invalid token');
      }

      if (scope !== 'email-verification') throw new Forbidden();

      let user;
      try {
        const users = await userService.readByQuery({
          filter: {
            email: {
              _eq: email,
            },
          },
          limit: 1,
        });
        [user] = users;

        if (user) {
          await userService.updateOne(user.id, { status: 'active' });
        }
      } catch (err) {
        return next(err);
      }

      return res.sendStatus(200);
    }),
  );

  router.use(errors());
}
