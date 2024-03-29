import { config } from 'dotenv';
import * as process from 'process';

config();

export const apiUrl = process.env.API_URL ?? 'http://localhost:8000';
export const port = process.env.PORT ?? '8000';
export const dbUrl = process.env.DATABASE_URL ?? 'mongodb://localhost:27017';

export const minioEndpoint = process.env.MINIO_ENDPOINT ?? 'localhost';
export const minioPort = parseInt(process.env.MINIO_PORT ?? '4001');
export const minioAccessKey = process.env.MINIO_ACCESS_KEY ?? 'minioadmin';
export const minioAccessSecret =
  process.env.MINIO_ACCESS_SECRET ?? 'minioadmin';

export const minioPublicEndpoint =
  process.env.MINIO_PUBLIC_ENDPOINT ?? 'localhost';
export const minioPublicPort = parseInt(
  process.env.MINIO_PUBLIC_PORT ?? '4001'
);

export const apiKey = process.env.ADMIN_API_KEY ?? '';

// The URL for prompt filtering endpoint,
// which throws an error upon finding an inappropriate prompt
export const filterServerUrl =
  process.env.FILTER_SERVICE_URL ?? 'http://localhost:8080/filter';

export const websocketUrl =
  process.env.WEBSOCKET_URL ?? 'http://localhost:3000';
