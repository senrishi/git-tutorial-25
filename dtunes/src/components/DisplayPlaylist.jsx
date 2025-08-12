import { useLocation, useNavigate, useParams } from "react-router-dom";
import { v4 as uuid } from 'uuid'
import { useContext } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { useState } from "react";
import { useEffect } from "react";
import PlaylistSong from "./PlaylistSong";
import PlaylistSongHeading from './PlaylistSongHeading'
import PlaylistCover from "./PlaylistCover";
import useAuth from "../hooks/useAuth";

export default function DisplayPlaylist({ setBgColor}) {
    const { auth } = useAuth();
    const { loggedIn, user } = auth;
    
    const { id } = useParams();
    const { playWithId, playlistsData, songsData, track, setShowNoSongs } = useContext(PlayerContext);
    const navigate = useNavigate();
    const location = useLocation();

    const [playlistData, setPlaylistData] = useState('');

    // let playlistSongs;
    const [playlistSongs, setPlaylistSongs] = useState([]);

    useEffect(() => {
        setPlaylistData(playlistsData.find(playlist => playlist._id === id))
    }, [])

    useEffect(() =>  {
        if (playlistData){
            setBgColor(`linear-gradient(${playlistData.bgColor}, #121212)`);
            // setBgColor(`#3a4bc1`);
        }
    }, [playlistData])

    useEffect(() => {
        try {
            let ps = songsData.filter(song => {
                // console.log(song._id === playlistData.songs[0], song._id, playlistData.songs[0], playlistData.songs.find(sId => sId === song._id))
                return playlistData.songs.find(sId => sId === song._id)
            })

            setPlaylistSongs(ps);
            // console.log('ps', playlistSongs);

        } catch (err) {
        }
    }, [playlistData])

    // if (!playlistSongs.length) setShowNoSongs(true);

    useEffect(() => {
        setShowNoSongs(true);
    }, [playlistSongs])
    
    const canEdit = (loggedIn && playlistData && user.playlists.find(pId => pId === playlistData._id))?true:false;

    return playlistData && playlistSongs ? (
        <>
            <PlaylistCover playlistData={playlistData} playlistSongs={playlistSongs} canEdit={canEdit}/>
            <PlaylistSongHeading />

            {playlistSongs.map((sd, idx) => {
                return (
                    <PlaylistSong key={uuid()} clickFunc={() => playWithId(sd._id)} track={track} sd={sd} idx={idx} />
                )
            })}
        </>
    ) : null
}