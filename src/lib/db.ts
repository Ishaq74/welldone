import { Pool } from 'pg';

export const db = new Pool({
  host: String(import.meta.env.POSTGRES_HOST),
  port: Number(import.meta.env.POSTGRES_PORT),
  database: String(import.meta.env.POSTGRES_DB),
  user: String(import.meta.env.POSTGRES_USER),
  password: String(import.meta.env.POSTGRES_PASSWORD),
});