import { useExerciseEvaluation } from '@/api/exercises';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Icons,
} from '@/components';

import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

export function Evaluation() {
  const { exerciseId, topicId } = useParams();

  const { t } = useTranslation();

  const navigate = useNavigate();
  const exerciseEvalucationQuery = useExerciseEvaluation(exerciseId);

  return (
    <div className="p-4 h-[calc(100vh-53px)] flex items-center justify-center">
      <Card className="w-[412px]">
        <CardHeader className="min-h-[72px]">
          <CardTitle className="text-base text-center">{t('quizEvaluation')}</CardTitle>
        </CardHeader>

        <CardContent className="min-h-[427px] mx-auto flex flex-col space-y-4 mt-2">
          {exerciseEvalucationQuery.status === 'success' &&
            !exerciseEvalucationQuery.data?.length && (
              <div className="text-sm text-center">{t('quizWasEndedPrematurely')}</div>
            )}
          {exerciseEvalucationQuery.data?.map((userEvaluation, i) => (
            <div key={userEvaluation.id} className="flex justify-between items-center space-x-4">
              <div className="flex items-center space-x-4">
                <div className="font-medium text-sm text-muted-foreground">{i + 1}.</div>
                <Avatar className="w-8 h-8">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-[0.65rem] p-1">
                    {userEvaluation.first_name.charAt(0).toUpperCase()}
                    {userEvaluation.last_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-medium leading-none">
                    {userEvaluation.first_name} {userEvaluation.last_name}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {t('correctlyAsweredQuestionsCount', {
                      answeredCorrectlyCount: userEvaluation.answeredCorrectlyCount,
                      total: userEvaluation.total,
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>

        <CardFooter className="flex justify-center">
          <Button size="sm" onClick={() => navigate(`/app/topics/${topicId}`)}>
            <Icons.x className="mr-2 stroke-[1.75px] w-4 h-4" /> {t('leaveQuiz')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
