import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/user/assets'
import SidebarItem from './SidebarItem';
import useAuth from '../hooks/useAuth';
import { useContext, useEffect, useState } from 'react';
import { SocketContext } from '../context/SocketContext';
import {v4 as uuid} from 'uuid'
import SidebarFriend from './SidebarFriend';

export default function Sidebar({ collapsed = true }) {
    const {socket} = useContext(SocketContext);

    const navigate = useNavigate();

    const { auth } = useAuth();
    const { loggedIn, user } = auth;

    function clickCreatePlaylist() {

        if (loggedIn) {
            return navigate('/playlists/new');
        }

        navigate('/users/new?isArtist=false&newUser=true')
    }

    function clickAddSong() {
        if (loggedIn) {
            if (user.isArtist) return navigate('/songs/new')
            return navigate('/users/new?isArtist=true&newUser=true')

        }
        navigate('/users/new?isArtist=true&newUser=true')

    }

    //friends playing songs:
    const [friendSongs, setFriendSongs] = useState([]);

    useEffect(() => {
        socket.on('getFriendSong', ({username, name, trackId, trackName, profileColor, isArtist}) => {
            console.log('get')
            setFriendSongs(fs => {
                let wasThere = false;
                let l1 = fs.map(data => {
                    if (data.username === username){
                        data.trackId = trackId;
                        data.trackName = trackName;
                        wasThere = true;
                    }
                    return data;
                })
                if (!wasThere){
                    return [...l1, {username, name, trackId, trackName, profileColor, isArtist}];
                }
                return l1;

            })
        })
    }, []);
    
    useEffect(() => {
        socket.on('getFriendSongRemove', ({username}) => {
            console.log('remove');

            setFriendSongs(fs => {
                return fs.filter(data => data.username!==username);
            })
        })
    });

    useEffect(() => {
        if(!loggedIn) setFriendSongs([]);
    }, [loggedIn]);

    function showDisplayParties(){
        if(loggedIn){
            navigate('/parties');
        }
        else{
            navigate('/users/new?isArtist=false&newUser=true');
        }
    }

    return (
        <div className={`overflow-auto w-[75%] sm:w-[50%] lg:w-[25%] h-full p-2 ${collapsed && 'hidden'} absolute lg:static lg:flex flex-col gap-2 text-white`}>
            <div className="bg-[#121212] h-[10%] rounded flex flex-col justify-around">

                <div onClick={() => navigate('/')} className="hover:bg-[#434343] flex items-center gap-3 pl-8 py-2 cursor-pointer">
                    <img className='w-6' src={assets.home_icon} alt="home" />
                    <p className='font-bold'>Home</p>
                </div>
            </div>

            <div className="bg-[#121212] h-[90%] rounded">
                <div className='p-4 flex items-center justify-between '>
                    <div className='flex items-center gap-3'>
                        <img className='w-8' src={assets.stack_icon} alt="stack" />
                        <p className='font-semibold'>Library</p>
                    </div>
                </div>

                <SidebarItem clickFunc={clickCreatePlaylist} heading='Create Playlist' paragraph='Add your favourite songs to a playlist and listen to them anytime!' buttonText='Create Playlist' />
                {!loggedIn && <SidebarItem clickFunc={clickAddSong} heading='Publish Song' paragraph='Register with an artist account to publish your own songs!' buttonText='Create Artist Account' />}
                {loggedIn && user.isArtist && <SidebarItem clickFunc={clickAddSong} heading='Publish Songs' paragraph='As an artist, you can share your songs with the world to see!' buttonText='Publish song' />}

                <SidebarItem clickFunc={showDisplayParties} heading='Party Mode' paragraph='Create or join a live party with other users!' buttonText='Parties Page'/>

                {friendSongs.map(fs => {
                    // return <SidebarItem key={uuid()} clickFunc={() => {}} heading={fs.name} paragraph={`Listening to ${fs.trackName}`} buttonText={`Listen to ${fs.trackName}`}/>
                    return <SidebarFriend key={uuid()} name={fs.name} username = {fs.username} profileColor={fs.profileColor} isArtist={fs.isArtist} trackName={fs.trackName}/>                    
                })}


            </div>

        </div>
    )
}