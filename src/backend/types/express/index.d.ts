import { Database } from 'sqlite';

declare global {
  namespace Express {
    interface Request {
      db: Database;
    }
  }
}