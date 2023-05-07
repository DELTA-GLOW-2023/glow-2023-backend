import { config } from 'dotenv';

config();

export const apiUrl = process.env.API_URL || 'http://localhost:8000';
export const port = process.env.PORT || '8000';
