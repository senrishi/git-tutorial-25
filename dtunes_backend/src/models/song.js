import mongoose from "mongoose";

const songSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    desc: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    file: {
        type: String,
        required: true,
    },
    duration: {
        type: String,
        required: true,
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    dislikes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    lyrics: {
        type: String,
    }

})

// const songModel = mongoose.models.Song || mongoose.model('Song', songSchema);
const songModel = mongoose.model('Song', songSchema, 'songs');

export default songModel;