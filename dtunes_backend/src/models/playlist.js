import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    desc: {
        type: String,
        required: true,
    },
    bgColor: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    isPublic: {
        type: Boolean,
        required: true,
    },
    songs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song',
    }],
})

const playlistModel = mongoose.model('Playlist', playlistSchema, 'playlists');

export default playlistModel;