import express from 'express'
import { handleRefreshToken } from '../controllers/refreshToken.js';

const refreshRouter = express();

refreshRouter.get('/', handleRefreshToken);


export default refreshRouter;