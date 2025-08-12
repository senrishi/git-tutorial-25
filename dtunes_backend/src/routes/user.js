//ROUTES:

import { acceptRequest, addUser, authenticateUser, getLikedSongs, getUserDetails, listUser, privateTest, removeFriend, removeRequest, sendFriendRequest } from "../controllers/user.js";
import express from 'express'
import { authenticateToken } from "../../auth.js";

const userRouter = express.Router();

userRouter.use(express.urlencoded({extended: true}))

userRouter.post('/', addUser);

userRouter.get('/', listUser);

userRouter.post('/login', authenticateUser);

userRouter.get('/liked-songs', authenticateToken, getLikedSongs)


//old method, without jwt, required id:
// userRouter.get('/liked-songs/:id', getLikedSongs)

userRouter.get('/testing/privatetest', authenticateToken, privateTest);

// userRouter.get('/reset-likes', resetLikes);

// userRouter.get('/:id', authenticateToken, getUserDetails);
userRouter.get('/:id', getUserDetails);

//friends:
userRouter.post('/:id/friend-request', authenticateToken, sendFriendRequest);
userRouter.put('/:id/friend-request', authenticateToken, acceptRequest);
userRouter.delete('/:id/friend-request', authenticateToken, removeRequest);
userRouter.delete('/friends/:id', authenticateToken, removeFriend)
export default userRouter;