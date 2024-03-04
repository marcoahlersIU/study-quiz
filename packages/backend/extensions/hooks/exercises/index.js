import { AlreadyInQuiz, BadRequest } from '../../../lib/exceptions.js';

export default ({ filter }, { services }) => {
  const { ItemsService } = services;

  filter(
    'exercise_participant_answers.items.update',
    async (payload, { keys }, { schema, accountability }) => {
      if (accountability.user && payload.selected_exercise_answer) {
        if (keys.length > 1) {
          throw new BadRequest('Multi update requests not supported');
        }

        const exerciseService = new ItemsService('exercises', {
          schema,
          accountability,
        });
        const exerciseAnswersService = new ItemsService('exercise_answers', {
          schema,
          accountability,
        });
        const exerciseParticipantAnswersService = new ItemsService('exercise_participant_answers', {
          schema,
          accountability,
        });

        const exerciseParticipantAnswer = await exerciseParticipantAnswersService.readOne(keys[0]);
        const exercise = await exerciseService.readOne(exerciseParticipantAnswer.exercise);
        const exerciseAnswer = await exerciseAnswersService.readOne(
          payload.selected_exercise_answer,
        );

        if (exercise.current_exercise_question !== exerciseParticipantAnswer.exercise_question) {
          throw new BadRequest('Only a answer for current question can be set');
        }

        if (exerciseAnswer.exercise_question !== exerciseParticipantAnswer.exercise_question) {
          throw new BadRequest('Given exercise answer does not belong to the exercise question');
        }
      }

      return payload;
    },
  );

  filter('exercise_participants.items.create', async (payload, _, { schema, accountability }) => {
    if (accountability?.user) {
      if (Array.isArray(payload)) {
        throw new BadRequest('Multi update requests not supported');
      }

      if (!payload.user) {
        throw new BadRequest('Missing user in payload');
      }

      const exerciseParticipantsService = new ItemsService('exercise_participants', {
        schema,
      });

      const [activeQuiz] = await exerciseParticipantsService.readByQuery({
        filter: {
          user: { _eq: payload.user },
          exercise: { status: { _neq: 'finished' } },
        },
        limit: 1,
      });

      if (activeQuiz) {
        throw new AlreadyInQuiz();
      }
    }

    return payload;
  });
};
