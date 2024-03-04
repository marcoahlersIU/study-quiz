import { QuestionQueryItem, useQuestionDeleteMutation } from '@/api/questions';
import { Avatar } from '@radix-ui/react-avatar';
import { useTranslation } from 'react-i18next';
import {
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icons,
  Separator,
} from '../ui';
import { useParams } from 'react-router-dom';
import { useState } from 'react';

export function QuestionItem({
  question,
  onEdit,
}: {
  question: QuestionQueryItem;
  onEdit: () => void;
}) {
  const { t } = useTranslation();
  const { topicId } = useParams();

  const questionsDeleteMutation = useQuestionDeleteMutation(topicId || '');

  const [showAnswer, setShowAnswer] = useState(false);
  const answer = question.answers.find((answer) => answer.correct_answer);

  return (
    <Card className="w-full">
      <div
        className="min-h-[160px] flex items-center text-center justify-center text-xs font-medium p-3"
        onMouseOver={() => setShowAnswer(true)}
        onMouseLeave={() => setShowAnswer(false)}
      >
        {!showAnswer && answer ? question.content : answer?.content}
      </div>
      <Separator />
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 font-medium pl-2">
          <Avatar>
            <AvatarImage src="" />
            <AvatarFallback className="text-[0.65rem] p-1">
              {question.user_created.first_name.charAt(0).toUpperCase()}
              {question.user_created.last_name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">
            {question.user_created.first_name} {question.user_created.last_name}
          </span>
        </div>

        <div className="py-1 pr-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Icons.moreHorizontal className="w-4 h-4 stroke-[1.6px]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="" side="bottom" align="start">
              <DropdownMenuItem className="flex gap-2 items-center" onClick={() => onEdit()}>
                <Icons.pencil className="w-4 h-4 storke-[1.5px]"></Icons.pencil>
                {t('edit')}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex gap-2 items-center"
                onClick={() => questionsDeleteMutation.mutate(question.id)}
              >
                <Icons.trash className="w-4 h-4 storke-[1.5px]"></Icons.trash>
                {t('delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}
