import { useExercise, useExerciseEndMutation } from '@/api/exercises';
import { useUser } from '@/api/user';
import { Button, Icons } from '@/components';
import { HeaderContext } from '@/components/Header/HeaderContext';
import { useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useParams } from 'react-router-dom';

export function QuizLayout() {
  const { t } = useTranslation();

  const { exerciseId } = useParams();

  const rightHeaderMenuRef = useContext(HeaderContext);
  const [rightHeaderMenu, setRightHeaderMenu] = useState<HTMLDivElement | undefined>(undefined);

  useEffect(() => {
    if (rightHeaderMenuRef?.current) {
      setRightHeaderMenu(rightHeaderMenuRef.current);
    }
  }, [rightHeaderMenuRef]);

  const user = useUser();
  const exercise = useExercise(exerciseId);
  const endExerciseMutation = useExerciseEndMutation(exerciseId || '');

  const { pathname } = useLocation();

  return (
    <div>
      <Outlet />
      {rightHeaderMenu &&
        exercise.data?.user_created === user.data?.id &&
        !pathname.includes('evaluation') &&
        createPortal(
          <div className="flex gap-3">
            <Button
              type="button"
              size="sm"
              className="h-7 px-2.5 text-xs shadow-sm"
              onClick={() => endExerciseMutation.mutate()}
              variant="outline"
            >
              <Icons.trash className="w-3.5 h-3.5 mr-1.5 stroke-[1.75px]" />
              {t('endQuiz')}
            </Button>
          </div>,
          rightHeaderMenu,
        )}
    </div>
  );
}
