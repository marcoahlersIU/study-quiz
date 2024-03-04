import { createBrowserRouter, redirect, RouterProvider } from 'react-router-dom';

import { Icons } from '@/components';

import { useUser } from '@/api/user';
import { ApplicationLayout } from './routes/app';
import { SettingsLayout } from './routes/app/settings';
import { QuestionsLayout } from './routes/app/topic/questions';
import { Questions } from './routes/app/topic/questions/Questions';
import { NoTopic } from './routes/app/topic/NoTopic';
import { AuthLayout } from './routes/auth';
import { Login } from './routes/auth/Login';
import { PasswordReset } from './routes/auth/PasswordReset';
import { Register } from './routes/auth/Register';
import { RequestResetPassword } from './routes/auth/RequestPasswordReset';
import { VerifyEmail } from './routes/auth/VerifyEmail';
import { UserSettings } from './routes/app/settings/User';
import { AcceptTopicInvite } from './routes/app/accept-topic-invite/AcceptTopicInvite';
import { StartExercise } from './routes/app/topic/exercises/StartExercise';
import { AnswerQuestions } from './routes/app/topic/exercises/AnswerQuestions';
import { Evaluation } from './routes/app/topic/exercises/Evaluation';
import { QuizLayout } from './routes/app/topic/exercises';
import { TopicLayout } from './routes/app/topic';
import { AccountSettings } from './routes/app/settings/Account';

export function AppRouter() {
  const userQuery = useUser();

  if (userQuery.status !== 'pending') {
    const publicRoute = () => {
      if (userQuery.data) {
        return redirect('/app/topics');
      }
      return null;
    };

    const unkownRoute = () => {
      if (userQuery.data) {
        return redirect('/app/topics');
      }

      return redirect('/auth');
    };

    const privateRoute = () => {
      if (!userQuery.data) {
        return redirect('/auth/login');
      }

      return null;
    };

    const router = createBrowserRouter([
      {
        path: '*',
        loader: unkownRoute,
        element: <div>Unkown</div>,
      },
      {
        path: '/auth',
        element: <AuthLayout />,
        loader: publicRoute,
        children: [
          {
            path: '',
            element: <Login />,
          },
          {
            path: 'register',
            element: <Register />,
          },
          {
            path: 'request-reset-password',
            element: <RequestResetPassword />,
          },
          {
            path: 'reset-password',
            element: <PasswordReset />,
          },
          {
            path: 'verify-email',
            element: <VerifyEmail />,
          },
        ],
      },
      {
        path: '/app',
        loader: privateRoute,
        element: <ApplicationLayout />,
        children: [
          {
            path: 'settings',
            element: <SettingsLayout />,
            children: [
              {
                path: '',
                loader: () => redirect('user'),
              },
              {
                path: 'user',
                element: <UserSettings />,
              },
              {
                path: 'account',
                element: <AccountSettings />,
              },
            ],
          },
          {
            path: 'topics',
            element: <NoTopic />,
          },
          {
            path: 'topics/:topicId',
            element: <TopicLayout />,
            children: [
              {
                path: '',
                loader: () => redirect('questions'),
              },
              {
                path: 'questions',
                element: <QuestionsLayout />,
                children: [
                  {
                    path: '',
                    element: <Questions />,
                  },
                ],
              },
              {
                path: 'exercises/:exerciseId',
                element: <QuizLayout />,
                children: [
                  {
                    path: '',
                    element: <StartExercise />,
                  },
                  {
                    path: 'answer-questions',
                    element: <AnswerQuestions />,
                  },
                  {
                    path: 'evaluation',
                    element: <Evaluation />,
                  },
                ],
              },
            ],
          },
          {
            path: 'topic-invite',
            element: <AcceptTopicInvite />,
          },
        ],
      },
    ]);

    return <RouterProvider router={router} />;
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Icons.loading className="h-4 w-4 animate-spin" />
    </div>
  );
}
