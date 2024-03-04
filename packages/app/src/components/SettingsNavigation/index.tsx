import { useTranslation } from 'react-i18next';
import { Button } from '../ui';
import { cn } from '@/lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';

export function SettingsNavigation() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const links = [
    { to: '/app/settings/user', title: t('user') },
    { to: '/app/settings/account', title: t('account') },
  ];

  return (
    <div className="py-8 flex space-x-2">
      {links.map((link) => (
        <Button
          variant="ghost"
          key={link.to}
          size="sm"
          className={cn(
            'hover:bg-muted/90 text-muted-foreground h-8 px-2',
            pathname.endsWith(link.to) && 'bg-muted text-foreground',
          )}
          onClick={() => {
            navigate(link.to);
          }}
        >
          {link.title}
        </Button>
      ))}
    </div>
  );
}
