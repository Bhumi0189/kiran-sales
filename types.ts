import { JwtPayload } from 'jsonwebtoken';
import { NextApiRequest } from 'next';

declare module 'next' {
  interface NextApiRequest {
    user?: string | JwtPayload;
  }
}