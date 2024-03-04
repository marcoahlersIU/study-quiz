import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';
import { USER_ROLE_ID } from '../contants/roles.js';

/**
 * Seed data was generated with GPT-4
 */
import topics from './files/topics.json' assert { type: 'json' };

function evenlyAssignTopicsToUsers(users) {
  const topicsPerUser = Math.floor(topics.length / users.length);
  const topicsIndex = Array(topics.length).fill(0);

  users.forEach((user) => {
    user.topics = [];
    for (let i = 0; i < topicsPerUser; i++) {
      const topicIndex = topicsIndex.findIndex((topic) => topic === 0);
      topicsIndex[topicIndex] = user.id;
      user.topics = [...user.topics, topics[topicIndex]];
    }
  });

  return users;
}

export const seed = async (knex) => {
  let users = await knex('directus_users').where('role', USER_ROLE_ID).select('id');

  users = evenlyAssignTopicsToUsers(users);

  const userTopics = [];
  const topicQuestions = [];
  const questionAnswers = [];

  users.forEach((user) => {
    user.topics.forEach((topic) => {
      const newTopic = {
        id: uuidv4(),
        sort: topic.sort,
        user_created: user.id,
        date_created: DateTime.now().toJSDate(),
        title: topic.title,
        icon: topic.icon,
        share_token: uuidv4(),
      };
      userTopics.push(newTopic);

      topic.questions.forEach((question, i) => {
        const newQuestion = {
          id: uuidv4(),
          sort: i,
          user_created: user.id,
          date_created: DateTime.now().toJSDate(),
          date_updated: DateTime.now().toJSDate(),
          user_updated: user.id,
          topic: newTopic.id,
          content: question.content,
        };
        topicQuestions.push(newQuestion);

        question.answers.forEach((answer, i) => {
          const newAnswer = {
            id: uuidv4(),
            sort: i,
            user_created: user.id,
            date_created: DateTime.now().toJSDate(),
            date_updated: DateTime.now().toJSDate(),
            user_updated: user.id,
            topic: newTopic.id,
            question: newQuestion.id,
            content: answer.content,
            correct_answer: answer.correctAnswer,
            reason: answer.reason,
          };
          questionAnswers.push(newAnswer);
        });
      });
    });
  });

  let topicShares = [];
  const topicsToShare = userTopics.slice(0, 5);

  topicsToShare.forEach((topic) => {
    const userIds = users.map((user) => user.id).filter((userId) => userId !== topic.user_created);

    topicShares = [
      ...topicShares,
      ...userIds.map((userId) => ({
        id: uuidv4(),
        date_created: DateTime.now().toJSDate(),
        topic: topic.id,
        user: userId,
      })),
    ];
  });

  await knex('topics').insert(userTopics);
  await knex('topics_shares').insert(topicShares);
  await knex('questions').insert(topicQuestions);
  await knex('answers').insert(questionAnswers);
};
