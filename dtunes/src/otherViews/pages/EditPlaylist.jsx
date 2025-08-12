import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import ListOfSongs from "../components/ListOfSongs";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

export default function EditPlaylist({ }) {

    const { auth } = useAuth();
    const { loggedIn } = auth;
    const axiosPrivate = useAxiosPrivate();

    const location = useLocation();
    const navigate = useNavigate();

    function getPlaylistId() {
        let pIdx = location.pathname.indexOf('playlists/');
        if (pIdx === -1) navigate('/');

        pIdx += 'playlists/'.length;

        let playlistId = location.pathname.slice(pIdx);
        pIdx = playlistId.indexOf('/add-song');
        if (pIdx === -1) navigate('/');

        playlistId = playlistId.slice(0, pIdx);

        return playlistId;
    }

    const playlistId = getPlaylistId();

    const [includedSongs, setIncludedSongs] = useState([]);
    const [excludedSongs, setExcludedSongs] = useState([]);

    async function fetchSongs() {
        try {
            const response = await axiosPrivate.get(`/api/playlists/${playlistId}/songs`)
            if (response.data.success) {
                setIncludedSongs(response.data.songs);
                setExcludedSongs(response.data.excludedSongs);
            }
            else {
                toast.warn('Unable to retrieve songs. Please reload page');
            }
        } catch (e) {
            toast.error('Error occured. Please reload page');

        }
    }

    useEffect(() => {
        fetchSongs();
    }, [])

    async function removeSong(id) {
        try {
            const response = await axiosPrivate.delete(`/api/playlists/${playlistId}/${id}`)

            if (response.data.success) {
                toast.success('Removed Song Successfully!');
                fetchSongs();
                navigate(0);
            }
            else if (response.data.errorCode === 'userNotAllowed') {
                toast.error('You are not allowed to edit this playlist!');
            }
            else if (response.data.errorCode === 'userNotExists') {
                toast.warn('Couldn\'t remove song. Are you logged in?')
            }
            else {
                toast.warn('Couldn\'t remove song. Try again!')
            }
        } catch (e) {
            toast.error('Error removing song. Try again!')
        }
    }

    async function addSong(id) {
        try {
            const response = await axiosPrivate.post(`/api/playlists/${playlistId}/${id}`)

            if (response.data.success) {
                toast.success('Added Song Successfully!');
                fetchSongs();
                navigate(0);
            }
            else if (response.data.errorCode === 'userNotAllowed') {
                toast.error('You are not allowed to edit this playlist!');
            }
            else if (response.data.errorCode === 'userNotExists') {
                toast.warn('Couldn\'t remove song. Are you logged in?')
            }
            else if (response.data.errorCode === 'alreadyAdded') {
                toast.info('Already added. Reload page to reflect!')
            }
            else {
                console.log(response);
                toast.warn('Couldn\'t add song. Try again!')
            }
        } catch (e) {
            toast.error('Error adding song. Try again!')
        }
    }

    return (
        <>
            <Navbar pageHeading="Add song to playlist" />
            {/* <a href={`/playlist/${playlistId}`}><button className="text-base bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white cursor-pointer px-4 py-3 rounded-full">Back to Playlist</button></a> */}
            <button onClick={() => navigate(`/playlist/${playlistId}`, {replace: true})} className="text-base bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white cursor-pointer px-4 py-3 rounded-full">Back to Playlist</button>
            {loggedIn &&
                <>
                    <ListOfSongs heading='Songs in Playlist' lastOption='Remove' color='red' data={includedSongs} clickFunc={removeSong} />
                    <ListOfSongs heading='Other Songs' lastOption='Add' color='green' data={excludedSongs} clickFunc={addSong} />
                </>
            }
        </>
    )
}