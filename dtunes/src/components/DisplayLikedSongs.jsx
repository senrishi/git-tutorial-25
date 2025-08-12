import { v4 as uuid } from 'uuid';
import { assets } from "../assets/user/assets"
import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import PlaylistCover from "./PlaylistCover";
import PlaylistSongHeading from "./PlaylistSongHeading";
import PlaylistSong from "./PlaylistSong";
import { PlayerContext } from "../context/PlayerContext";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useAuth from "../hooks/useAuth";

const playlistData = {
    name: 'Liked Songs',
    desc: 'You can find the songs you liked here.',
    //this bgColor is not taken, it's hard-coded in Display.jsx
    bgColor: '#ef476fbb',
    image: assets.like_icon,
    isPublic: false,
}

const backendUrl = 'http://localhost:2006';

export default function DisplayLikedSongs({setBgColor}) {
    const { auth } = useAuth();
    const { loggedIn } = auth;
    const axiosPrivate = useAxiosPrivate();

    const [likedSongs, setLikedSongs] = useState([]);
    const { track, playWithId, setSongsData, setShowNoSongs } = useContext(PlayerContext);

    async function getLikedSongs() {
        try {

            let response = await axiosPrivate.get(`${backendUrl}/api/users/liked-songs`)
            console.log(response);
            if (response.data.success) {
                setLikedSongs(response.data.likedSongs);

                //also update it in the player context so that previous and next work
                setSongsData(response.data.likedSongs);

                setShowNoSongs(true);
            }
            else {
                toast.warn('Some error occured in retrieving liked songs, try later!')
            }
        } catch (err) {
            console.log(err);
            toast.warn('Error occured while searching for liked songs, try again!')
        }
    }

    useEffect(() => {
        if (loggedIn) getLikedSongs();
        else toast.info('Login/Create an account to see your liked songs');

        setBgColor('linear-gradient(#ef476fbb, #121212)');
    }, []);

    

    return (
        <>
            <PlaylistCover playlistData={playlistData} playlistSongs={likedSongs} canEdit={false} />
            <PlaylistSongHeading />

            {likedSongs.map((sd, idx) => {
                return (
                    <PlaylistSong key={uuid()} clickFunc={() => playWithId(sd._id)} track={track} sd={sd} idx={idx} />
                )
            })}
        </>
    )
}