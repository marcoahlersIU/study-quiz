import { useUpdateUserMuation } from '@/api/user';
import { DateTime } from 'luxon';
import { useEffect } from 'react';

export function usePingUser() {
  const updateUserMutation = useUpdateUserMuation();

  useEffect(() => {
    const pingUser = () => updateUserMutation.mutate({ lastPing: DateTime.now().toISO() });

    pingUser();
    window.addEventListener('focus', pingUser);

    const interval = setInterval(pingUser, 15000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', pingUser);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
