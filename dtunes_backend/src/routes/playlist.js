//ROUTES:

import { addPlaylist, addSongToPlaylist, getSongsOfPlaylist, listPlaylist, removePlaylist, removeSongFromPlaylist } from "../controllers/playlist.js";
import express from 'express'
import upload from '../middleware/multer.js'
import { authenticateToken } from "../../auth.js";

const playlistRouter = express.Router();

playlistRouter.post('/', authenticateToken, upload.single('image'), addPlaylist);

playlistRouter.get('/', listPlaylist);

playlistRouter.delete('/:id', removePlaylist);

//returns both songs in the playlist and those not in the playlist
//used only in edit playlist
playlistRouter.get('/:pId/songs', authenticateToken, getSongsOfPlaylist)

//to add song
playlistRouter.post('/:playlistId/:songId', authenticateToken, addSongToPlaylist);

playlistRouter.delete('/:playlistId/:songId', authenticateToken, removeSongFromPlaylist);

// playlistRouter.get('/seed', seedPlaylistSongs);

export default playlistRouter;