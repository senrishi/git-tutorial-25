import { io } from 'socket.io-client'
const URL = 'http://localhost:2006';

export const socket = io(URL);