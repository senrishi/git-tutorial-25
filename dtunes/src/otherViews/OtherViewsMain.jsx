import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import { useSearchParams } from 'react-router-dom'

import AddPlaylist from './pages/AddPlaylist'
import AddSong from './pages/AddSong'

import Sidebar from './components/Sidebar'
import LoginRegisterForm from './pages/LoginRegisterForm';
import HomeButton from './components/HomeButton'
import LoginNavbar from './components/LoginNavbar';
import EditPlaylist from './pages/EditPlaylist';


export default function OtherViewsMain({ requestedPath }) {
    
    function loginPageOption(){
        const [searchParams, setSearchParams] = useSearchParams();

        let isArtist = searchParams.get('isArtist');
        let newUser = searchParams.get('newUser');
    
        if (isArtist === 'true') isArtist = true;
        if (isArtist === 'false') isArtist = false;
        if (newUser === 'true') newUser = true;
        if (newUser === 'false') newUser = false;
        
        let activated = new Array(4).fill(false);
    
        if (!isArtist && !newUser) activated[1] = true;
        else if (isArtist && newUser) activated[2] = true;
        else if (isArtist && !newUser) activated[3] = true;
        else activated[0] = true;

        return [...activated, isArtist, newUser];
    }
    
    return (
        <div className='flex items-start min-h-screen'>
            <ToastContainer />
            {requestedPath !== '/users/new' && <Sidebar />}
            <div className='flex-1 h-screen overflow-y-scroll bg-[#F3FFF7]'>
                
                {requestedPath === '/users/new' && <LoginNavbar activated={loginPageOption()}/>}
                <div className='pl-5 sm:pl-12'>

                    {/* the below ':id' is passed as string, and can not be matched */}
                    {requestedPath === '/playlists/:id/add-song' && <EditPlaylist/>}
                    {requestedPath === '/playlists/new' && <AddPlaylist/>}
                    {requestedPath === '/songs/new' && <AddSong/>}
                    {requestedPath === '/users/new' && <LoginRegisterForm activated={loginPageOption()}/>}

                </div>

                <HomeButton/>
            </div>
        </div>
    )
}