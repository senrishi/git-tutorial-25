import { v2 as cloudinary } from 'cloudinary';
import playlistModel from '../models/playlist.js'
import userModel from '../models/user.js';
import songModel from '../models/song.js';

async function addPlaylist(req, res) {
    //!debug:
    // console.log(Object.keys(req));
    // console.log(req.file, req.body);

    let { name, desc, bgColor, isPublic, userId } = req.body;

    //Using DiskStorage:
    const image = req.file

    //using memory:
    // const b64 = Buffer.from(req.file.buffer).toString('base64');
    // let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    try {

        //validate isPublic:
        if (isPublic === 'true' || isPublic === true) {
            isPublic = true;
        }
        else if (isPublic === 'false' || isPublic === false) {
            isPublic = false;
        }
        else {
            return res.json({ success: false, message: 'isPublic should be either true or false!', errorCode: 'isArtistNotValid' })
        }

        //Using diskStorage:
        const imageUpload = await cloudinary.uploader.upload(image.path, { resource_type: 'image'})
        //Using MemoryStorage:
        // const imageUpload = await cloudinary.uploader.upload(dataURI, {resource_type: 'auto'} );
        
        const playlistData = {
            name,
            desc,
            bgColor,
            isPublic,
            image: imageUpload.secure_url,
        }

        const playlist = playlistModel(playlistData);
        await playlist.save();

        const user = await userModel.findById(userId);
        user.playlists.push(playlist._id);
        user.save();

        res.json({ success: true, message: 'playlist added' })

    } catch (e) {
        console.log('Error adding playlist:', e);
        res.json({ success: false, message: e });
    }
}

async function listPlaylist(req, res) {
    try {
        const allPlaylists = await playlistModel.find({});
        res.json({ success: true, message: 'Successful', playlists: allPlaylists })
    } catch (e) {
        res.json({ success: false, message: e })
    }
}

async function removePlaylist(req, res) {
    try {
        const { id } = req.params;
        await playlistModel.findByIdAndDelete(id);
        res.json({ success: true, message: 'Deleted Successfully' })
    } catch (e) {
        res.json({ success: false, message: e });
    }
}

async function addSongToPlaylist(req, res) {
    //Needs userId as json
    try {

        const { playlistId, songId } = req.params;
        const { _id: userId } = req.authenticatedUser;

        const user = await userModel.findById(userId);
        if (!user) return res.json({ success: false, errorCode: 'userNotExists' });

        if (!user.playlists.find(pId => pId.equals(playlistId))) return res.json({ success: false, errorCode: 'userNotAllowed' })

        const playlist = await playlistModel.findById(playlistId);
        if (!playlist) return res.json({ success: false, errorCode: 'playlistNotExists' })

        if (playlist.songs.find(sId => sId.equals(songId))) return res.json({ success: false, errorCode: 'alreadyAdded' })

        const song = await songModel.findById(songId);
        if (!song) return res.json({ success: false, errorCode: 'songNotExists' });

        playlist.songs.push(songId);
        playlist.save();

        res.json({ success: true })

    } catch (err) {
        console.log(err);
        res.json({ success: false, errorCode: 'unknownError', error: err })
    }

}

async function getSongsOfPlaylist(req, res) {
    try {
        const { playlists: userPlaylists } = req.authenticatedUser;

        const { pId } = req.params;
        const playlist = await playlistModel.findById(pId).populate('songs');

        if (!playlist) return res.json({ success: false, errorCode: 'playlistNotExists' });

        if (!userPlaylists.find(playlistId => playlistId === pId)) {
            return res.status(403).json({ success: false, message: 'from controllers>playlist>getSongsOfPlaylist' })
        }

        let otherSongs = await songModel.find({});

        otherSongs = otherSongs.filter(song => {
            return !playlist.songs.find(s => s._id.equals(song._id));
        })

        res.json({ success: true, songs: playlist.songs, excludedSongs: otherSongs });


    } catch (err) {
        console.log(err);
        res.json({ success: false, error: err })
    }

}

async function removeSongFromPlaylist(req, res) {
    try {

        const { playlistId, songId } = req.params;
        const {_id: userId} = req.authenticatedUser;

        const user = await userModel.findById(userId);
        if (!user) return res.json({ success: false, errorCode: 'userNotExists' });
        if (!user.playlists.find(pId => pId.equals(playlistId))) return res.json({ success: false, errorCode: 'userNotAllowed' })

        const playlist = await playlistModel.findById(playlistId);

        playlist.songs = playlist.songs.filter(sId => !sId.equals(songId));
        playlist.save();

        res.json({ success: true });
    } catch (err) {
        console.log(err);
        res.json({ success: false, error: err })

    }


}
// async function seedPlaylistSongs(req, res){
//     const response = await playlistModel.updateMany({}, {$set: {songs: []}});
//     console.log(response);
//     res.send('done');
// }

export { addPlaylist, listPlaylist, removePlaylist, addSongToPlaylist, getSongsOfPlaylist, removeSongFromPlaylist };

// export {seedPlaylistSongs};