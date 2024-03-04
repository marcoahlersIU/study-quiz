import { getClient } from './client';

const directus = getClient(import.meta.env.VITE_BACKEND_URL || 'http://localhost:8055');

export default directus;
