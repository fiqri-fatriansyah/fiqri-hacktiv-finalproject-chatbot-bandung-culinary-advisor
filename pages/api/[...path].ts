import type { NextApiRequest, NextApiResponse } from 'next';
import { getNestServer } from '@/server/create-app';

export const config = {
  api: {
    // multer and Nest parse the body themselves.
    bodyParser: false,
    responseLimit: false,
    externalResolver: true,
  },
  maxDuration: 60,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const server = await getNestServer();
  server(req, res);
}
