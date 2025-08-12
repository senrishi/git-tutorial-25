import useAuth from "../../hooks/useAuth";
import { assets } from "../assets/artist/assets"
import SidebarButtons from "./SidebarButtons"

export default function Sidebar() {

    const { auth } = useAuth();
    const { loggedIn, user } = auth;

    return (
        <div className="bg-[#00013a] min-h-screen pl-[4vw]">
            <a href="/"><img className="mt-5 w-[max(7.5vw,60px)] sm:w-[max(100px,10vw)] sm:block" src={assets.logo} alt="logo" /></a>
            <div className="flex flex-col gap-5 mt-10">
                {loggedIn && user.isArtist && <SidebarButtons title='Add Song' toLink='/songs/new' imageSrc={assets.add_song} alt='add songs'/>}
                <SidebarButtons title='Add Playlist' toLink='/playlists/new' imageSrc={assets.add_playlist} alt='add playlists'/>
            </div>
        </div>
    )
}