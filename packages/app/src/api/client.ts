import type { Schema } from './types';
import type { AuthenticationStorage } from '@directus/sdk';

import { authentication, createDirectus, rest, realtime } from '@directus/sdk';

const authenticationStorage = (authStorageKey = 'authenticationData'): AuthenticationStorage => ({
  get: () => {
    const data = localStorage.getItem(authStorageKey);
    return data ? JSON.parse(data) : null;
  },
  set: (value) => {
    if (value) {
      localStorage.setItem(authStorageKey, JSON.stringify(value));
    } else {
      localStorage.removeItem(authStorageKey);
    }
  },
});

const getClient = (url: string, authStorageKey?: string) =>
  createDirectus<Schema>(url)
    .with(rest())
    .with(realtime())
    .with(authentication('json', { storage: authenticationStorage(authStorageKey) }));

export { getClient };
