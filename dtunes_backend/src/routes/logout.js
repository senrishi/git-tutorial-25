import express from 'express'
import { handleLogout } from '../controllers/logout.js';

const logoutRouter = express();

logoutRouter.get('/', handleLogout);


export default logoutRouter;