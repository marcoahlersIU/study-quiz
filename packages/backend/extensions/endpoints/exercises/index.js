import { celebrate, errors } from 'celebrate';
import { USER_ROLE_ID } from '../../../contants/roles.js';
import { BadRequest, Forbidden, GeneralError } from '../../../lib/exceptions.js';
import asyncHandler from '../../../middleware/async-handler.js';
import { createExercise } from './validations.js';
import { DateTime } from 'luxon';

import cron from 'node-cron';

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export default function registerEndpoint(router, { services, getSchema }) {
  const { UsersService, ItemsService } = services;

  cron.schedule('* * * * * *', async () => {
    try {
      const schema = await getSchema();
      const exerciseQuestionsService = new ItemsService('exercise_questions', {
        schema,
      });

      await exerciseQuestionsService.updateByQuery(
        {
          filter: {
            show_result: { _eq: false },
            answer_end_time: { _lte: DateTime.now().toJSDate() },
          },
        },
        {
          show_result: true,
        },
      );
    } catch (err) {
      console.log(err);
    }
  });

  router.post(
    '/',
    celebrate(createExercise),
    asyncHandler(async (req, res) => {
      if (
        !req.accountability ||
        req.accountability.role !== USER_ROLE_ID ||
        !req.accountability?.permissions.find(
          (permission) => permission.collection === 'exercises' && permission.action === 'create',
        )
      ) {
        throw new Forbidden('Missing create exercise permission');
      }

      const topicService = new ItemsService('topics', {
        schema: req.schema,
        accountability: req.accountability,
      });
      const usersService = new UsersService({
        schema: req.schema,
        accountability: req.accountability,
      });
      const questionsService = new ItemsService('questions', {
        schema: req.schema,
      });
      const exerciseService = new ItemsService('exercises', {
        schema: req.schema,
        accountability: req.accountability,
      });
      const exerciseParticipantsService = new ItemsService('exercise_participants', {
        schema: req.schema,
      });
      const exerciseQuestionsService = new ItemsService('exercise_questions', {
        schema: req.schema,
      });
      const exerciseAnswersService = new ItemsService('exercise_answers', {
        schema: req.schema,
      });

      try {
        await topicService.readOne(req.body.topic);
      } catch (err) {
        throw new BadRequest('Invalid topic id given');
      }

      const participants = await usersService.readByQuery({
        filter: { id: { _in: req.body.participants } },
        limit: -1,
      });
      if (participants.length !== req.body.participants.length) {
        throw new BadRequest('Invalid participants given');
      }

      const topicQuestions = await questionsService.readByQuery({
        filter: { topic: { _eq: req.body.topic } },
        fields: ['*', 'answers.*'],
        limit: -1,
      });

      const exerciseId = await exerciseService.createOne({
        topic: req.body.topic,
      });

      await exerciseParticipantsService.createMany(
        participants.map((participant) => ({
          topic: req.body.topic,
          exercise: exerciseId,
          user: participant.id,
          status: 'accepted',
        })),
      );

      const randomizedTopicQuestions = shuffleArray(topicQuestions);

      const [] = await Promise.all(
        randomizedTopicQuestions.map(async (question, i) => {
          const exerciseQuestionId = await exerciseQuestionsService.createOne({
            sort: i + 1,
            user_created: question.user_created,
            user_updated: question.user_updated,
            date_updated: question.date_updated,
            exercise: exerciseId,
            topic: req.body.topic,
            question: question.id,
            content: question.content,
          });

          const randomizedQuestions = shuffleArray(question.answers);

          await exerciseAnswersService.createMany(
            randomizedQuestions.map((answer, answerIndex) => ({
              sort: answerIndex + 1,
              user_created: answer.user_created,
              user_updated: answer.user_updated,
              date_updated: answer.date_updated,
              exercise: exerciseId,
              topic: req.body.topic,
              exercise_question: exerciseQuestionId,
              answer: answer.id,
              content: answer.content,
              correct_answer: answer.correct_answer,
              reason: answer.reason,
            })),
          );
        }),
      );

      return res.send({ exerciseId });
    }),
  );

  router.post(
    '/:exerciseId/start',
    asyncHandler(async (req, res) => {
      if (
        !req.accountability ||
        req.accountability.role !== USER_ROLE_ID ||
        !req.accountability?.permissions.find(
          (permission) => permission.collection === 'exercises' && permission.action === 'update',
        )
      ) {
        throw new Forbidden('Missing update exercise permission');
      }

      const exerciseService = new ItemsService('exercises', {
        schema: req.schema,
        accountability: req.accountability,
      });
      const exerciseQuestionsService = new ItemsService('exercise_questions', {
        schema: req.schema,
      });
      const exerciseParticipantsService = new ItemsService('exercise_participants', {
        schema: req.schema,
      });
      const exerciseParticipantAnswersService = new ItemsService('exercise_participant_answers', {
        schema: req.schema,
      });

      const exerciseId = req.params.exerciseId;
      if (!exerciseId) throw new BadRequest('Missing exercise id');

      let exercise = await exerciseService.readOne(exerciseId, {
        fields: [
          'id',
          'user_created',
          'topic',
          'status',
          'current_exercise_question',
          'participants',
          'participants.id',
          'participants.user',
          'participants.status',
        ],
      });

      if (exercise.status !== 'init') {
        throw new BadRequest('Exercise was already started');
      }

      await exerciseParticipantsService.deleteByQuery({
        filter: {
          exercise: { _eq: exerciseId },
          status: { _neq: 'accepted' },
        },
      });

      const exerciseParticipants = await exerciseParticipantsService.readByQuery({
        filter: {
          exercise: { _eq: exerciseId },
          status: { _eq: 'accepted' },
        },
        limit: -1,
      });
      const exerciseQuestions = await exerciseQuestionsService.readByQuery({
        filter: {
          exercise: { _eq: exerciseId },
        },
        sort: ['sort'],
        limit: -1,
      });

      let exerciseParticipantAnswers = [];
      exerciseParticipants.forEach((participant) => {
        exerciseParticipantAnswers = [
          ...exerciseParticipantAnswers,
          ...exerciseQuestions.map((question) => ({
            topic: exercise.topic,
            exercise: exerciseId,
            exercise_question: question.id,
            participant: participant.id,
          })),
        ];
      });
      await exerciseParticipantAnswersService.createMany(exerciseParticipantAnswers);

      const [firstQuestion] = await exerciseQuestionsService.readByQuery({
        filter: {
          exercise: { _eq: exerciseId },
        },
        sort: ['sort'],
        limit: 1,
      });
      if (!firstQuestion) {
        throw new GeneralError('Failed to get first question');
      }

      const data = {
        status: 'started',
        current_exercise_question: exerciseQuestions[0].id,
      };
      await exerciseService.updateOne(exerciseId, data);

      await exerciseQuestionsService.updateOne(firstQuestion.id, {
        answer_end_time: DateTime.now().plus({ seconds: 30 }).toJSDate(),
      });

      return res.send({
        ...exercise,
        ...data,
      });
    }),
  );

  router.post(
    '/:exerciseId/next',
    asyncHandler(async (req, res) => {
      if (
        !req.accountability ||
        req.accountability.role !== USER_ROLE_ID ||
        !req.accountability?.permissions.find(
          (permission) => permission.collection === 'exercises' && permission.action === 'update',
        )
      ) {
        throw new Forbidden('Missing update exercise permission');
      }

      const exerciseService = new ItemsService('exercises', {
        schema: req.schema,
        accountability: req.accountability,
      });
      const exerciseQuestionsService = new ItemsService('exercise_questions', {
        schema: req.schema,
      });

      const exerciseId = req.params.exerciseId;
      if (!exerciseId) throw new BadRequest('Missing exercise id');

      let exercise = await exerciseService.readOne(exerciseId);

      if (exercise.current_exercise_question === null || exercise.status !== 'started') {
        throw new BadRequest('Exercise musted be started or not finished');
      }

      const exerciseQuestions = await exerciseQuestionsService.readByQuery({
        filter: {
          exercise: { _eq: exerciseId },
        },
        sort: ['sort'],
      });

      const currentQuestionIndex = exerciseQuestions.findIndex(
        (question) => question.id === exercise.current_exercise_question,
      );
      if (currentQuestionIndex === -1) {
        throw new GeneralError('Could not find current question');
      }

      const nextQuestionId = exerciseQuestions[currentQuestionIndex + 1]?.id;

      const data = {
        current_exercise_question: nextQuestionId || null,
      };

      if (!data.current_exercise_question) {
        data.status = 'finished';
      }
      await exerciseService.updateOne(exerciseId, data);
      exercise = await exerciseService.readOne(exerciseId);

      if (nextQuestionId) {
        await exerciseQuestionsService.updateOne(nextQuestionId, {
          answer_end_time: DateTime.now().plus({ seconds: 30 }).toJSDate(),
        });
      }

      return res.send(exercise);
    }),
  );

  router.get(
    '/:exerciseId/evaluation',
    asyncHandler(async (req, res) => {
      if (
        !req.accountability ||
        req.accountability.role !== USER_ROLE_ID ||
        !req.accountability?.permissions.find(
          (permission) => permission.collection === 'exercises' && permission.action === 'read',
        )
      ) {
        throw new Forbidden('Missing update exercise permission');
      }

      const exerciseService = new ItemsService('exercises', {
        schema: req.schema,
        accountability: req.accountability,
      });
      const exerciseParticipantAnswersService = new ItemsService('exercise_participant_answers', {
        schema: req.schema,
      });

      const exerciseId = req.params.exerciseId;
      if (!exerciseId) throw new BadRequest('Missing exercise id');

      let exercise = await exerciseService.readOne(exerciseId);

      if (exercise.status !== 'finished') {
        throw new BadRequest('Exercise must be finished to get the result');
      }

      const participantAnswers = await exerciseParticipantAnswersService.readByQuery({
        filter: {
          exercise: { _eq: exercise.id },
        },
        fields: [
          'id',
          'participant.user.id',
          'participant.user.first_name',
          'participant.user.last_name',
          'selected_exercise_answer',
          'selected_exercise_answer.correct_answer',
        ],
        limit: -1,
      });

      const participantAnswersByUser = {};

      participantAnswers.forEach((participantAnswer) => {
        if (!participantAnswersByUser[participantAnswer.participant.user.id]) {
          participantAnswersByUser[participantAnswer.participant.user.id] = {
            user: participantAnswer.participant.user,
            answers: [participantAnswer],
          };
        } else {
          participantAnswersByUser[participantAnswer.participant.user.id] = {
            ...participantAnswersByUser[participantAnswer.participant.user.id],
            answers: [
              ...participantAnswersByUser[participantAnswer.participant.user.id].answers,
              participantAnswer,
            ],
          };
        }
      });

      let result = [];
      Object.keys(participantAnswersByUser).forEach((userId) => {
        result.push({
          ...participantAnswersByUser[userId].user,
          total: participantAnswersByUser[userId].answers.length,
          answeredCorrectlyCount: participantAnswersByUser[userId].answers.filter(
            (answer) => answer.selected_exercise_answer?.correct_answer,
          ).length,
        });
      });
      result = result.sort((a, b) => b.answeredCorrectlyCount - a.answeredCorrectlyCount);

      return res.send(result);
    }),
  );

  router.use(errors());
}
