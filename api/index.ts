import app from '../server/apiApp';

/**
 * Vercel Serverless Function entry point for all /api/* routes.
 * Passes incoming HTTP requests directly into the Express forensic engine.
 */
export default function handler(req: any, res: any) {
  return (app as any)(req, res);
}
