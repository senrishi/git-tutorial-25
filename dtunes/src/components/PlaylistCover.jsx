import { useLocation } from "react-router-dom";
import { assets } from "../assets/user/assets";
import { totalPlaylistTime } from "../utils";

export default function PlaylistCover({ playlistData, playlistSongs, canEdit=true }) {
    

    const location = useLocation();
    const editLink = location.pathname.replace('playlist', 'playlists')+'/add-song'
    return (
        <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-end">
            <img className="w-48 rounded" src={playlistData.image} alt="Playlist Image" />
            <div className="flex flex-col">
                <p>Playlist</p>
                <div className="flex justify-between"> 

                    <h2 className="text-5xl font-bold mb-4 md:text-7xl">{playlistData.name}</h2>
                    {canEdit && <a href={editLink}><p className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white py-1 px-1 md:px-6 rounded-2xl text-sm md:text-lg cursor-pointer">Edit Playlist</p></a>}

                </div>
                <h3>{playlistData.desc}</h3>
                <p className="mt-1">
                    <img className="inline-block w-5" src={assets.logo} alt="dTunes" />
                    <b className="mr-2 ml-2">{playlistSongs.length} songs</b>
                    <b className="mr-2 text-rose-500">{playlistData.isPublic?'Public':'Private'}</b>
                    <b className="mr-2 text-blue-700">{totalPlaylistTime(playlistSongs)}</b>
                </p>
            </div>
        </div>
    )
}