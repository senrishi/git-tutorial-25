import { useParams } from "react-router-dom";
import { useContext } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { useState } from "react";
import { useEffect } from "react";
import SongCover from "./SongCover";
import SongLyrics from "./SongLyrics";

export default function DisplaySong({setBgColor}) {
    
    const { songsData } = useContext(PlayerContext);
    const { id } = useParams();

    const [songData, setSongData] = useState('');
    useEffect(() => {
        setSongData(songsData.find(song => song._id === id))
        setBgColor('#0077b6ce');
    }, [id])

    // useEffect(() => {
    //     setShowNoSongs(true);
    // }, [playlistSongs])
    

    return songData ? (
        <>
            <SongCover songData={songData}/>
            <SongLyrics id={id}/>
        </>
    ) : null
}