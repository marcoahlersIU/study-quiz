import { SettingsNavigation } from '@/components/SettingsNavigation';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';

export function SettingsLayout() {
  const { t } = useTranslation();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="font-bold text-2xl">{t('settings')}</div>
      <SettingsNavigation />
      <Outlet />
    </div>
  );
}
