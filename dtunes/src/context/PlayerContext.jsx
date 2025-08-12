import { createContext, useContext, useEffect, useRef, useState } from "react";
import axios from 'axios';
import { toast } from 'react-toastify'
import { useLocation, useSearchParams } from "react-router-dom";
import { SocketContext } from "./SocketContext";
import axiosBase from "../api/axiosBase";

function shuffleArray(arr) {
    'Shuffles array AND RETURNS'

    arr = [...arr];
    for (let i = arr.length; i > 0; i--) {
        let randIndex = Math.floor(Math.random() * i);

        let temp = arr[i - 1];
        arr[i - 1] = arr[randIndex];
        arr[randIndex] = temp;
    }
    return arr;
}


export const PlayerContext = createContext();

export default function PlayerContextProvider({ children, backendUrl }) {
    const audioRef = useRef();
    const seekBgRef = useRef();
    const seekBarRef = useRef();
    const nextRef = useRef();

    const [track, setTrack] = useState({});
    const [playing, setPlaying] = useState(false);

    const { socket } = useContext(SocketContext);


    //api:
    const [songsData, setSongsData] = useState([]);
    const [playlistsData, setPlaylistsData] = useState([]);
    const [usersData, setUsersData] = useState([]);

    const [searchQuery, setSearchQuery] = useState({
        term: '',
        filter: 'songs',
    });

    const curLocation = useLocation();
    const [withinPlaylist, setWithinPlaylist] = useState(false);

    //See Normal.jsx, this helps to override songsData being empty 
    const [showNoSongs, setShowNoSongs] = useState(false);

    const [searchParams, setSearchParams] = useSearchParams();
    //syncing:

    async function getSongs() {
        let response;
        try {
            response = await axios.get(`${backendUrl}/api/songs`)
            if (response.data.success) {
                let songsAvailable = response.data.songs;
                // shuffleArray(songsAvailable);

                //search:
                if (searchQuery.term && searchQuery.filter === 'songs' && curLocation.pathname.indexOf('parties') === -1) {
                    //if inside a party also, don't search
                    //lowercase both
                    songsAvailable = songsAvailable.filter(song => song.name.toLowerCase().indexOf(searchQuery.term) !== -1)

                    if (!songsAvailable.length) setShowNoSongs(true);
                    else setShowNoSongs(false);
                }

                try {
                    let playlistIndex = curLocation.pathname.indexOf('playlist');
                    let partiesIndex = curLocation.pathname.indexOf('parties');
                    
                    // within a playlist:
                    if (playlistIndex !== -1) {
                        let playlistId = curLocation.pathname.slice(playlistIndex + 'playlist'.length + 1);
                        //remove any unwanted extra stuff
                        let extraSlashIndex = playlistId.indexOf('/');
                        if (extraSlashIndex !== -1) {
                            playlistId = playlistId.slice(0, extraSlashIndex)
                        }

                        let playlistData = playlistsData.find(p => p._id === playlistId);
                        if (playlistData) {
                            songsAvailable = songsAvailable.filter(song => playlistData.songs.find(sId => sId === song._id))
                        }

                    }
                    //within a party && partying
                    else if (partiesIndex!== -1 && searchParams.get('playlist1') && searchParams.get('playlist2')){
                        let pId1 = searchParams.get('playlist1');
                        let pId2 = searchParams.get('playlist2');

                        let playlistsNeeded = playlistsData.filter(p => {
                            return p._id === pId1 || p._id === pId2;
                        })

                        let songIds;
                        //since I'm pre filling the other vote if only one vote, to avoid error 
                        if (playlistsNeeded.length === 1) songIds = [...playlistsNeeded[0].songs];
                        else songIds = [...playlistsNeeded[0].songs, ...playlistsNeeded[1].songs];

                        songsAvailable =  songsAvailable.filter(song => songIds.find(sId => sId === song._id));
                        console.log(songsAvailable);
                    }
                    else {
                        setWithinPlaylist(false);
                    }
                } catch (err) {
                    console.log('Error filtering songs for playlist:', err);
                }

                setSongsData(songsAvailable);

                //Only if track is not set, set it to the first available song
                if (!Object.keys(track).length) {
                    // console.log('changing from here', track);
                    if (songsAvailable){

                        setTrack(t => {
                           return songsAvailable[0];
                       })

                       sendSyncTrack(songsAvailable[0]._id);
                    }
                }
            }
            else {
                toast.warn('Couldn\'t get songs. Please Reload!')
                console.log(response);
            }
        } catch (err) {
            toast.error('Error occured while getting songs. Please Reload!')
            console.log('error', err);
        }
    }

    useEffect(() => {
        getSongs();
    }, [curLocation])

    async function getPlaylists() {
        let response;
        try {
            response = await axios.get(`${backendUrl}/api/playlists`)
            if (response.data.success) {
                setPlaylistsData(response.data.playlists);
            }
            else {
                toast.warn('Couldn\'t get playlists. Please Reload!')
                console.log(response);
            }
        } catch (err) {
            toast.error('Error occured while getting playlists. Please Reload!')
            console.log(err);
        }
    }

    async function getUsers() {
        try {

            const response = await axios.get(`${backendUrl}/api/users`);
            if (response.data.success) {
                const allUsers = response.data.users;
                //if searching for users, filter by both username and name
                if (searchQuery.filter === 'users') {
                    const filteredUsers = allUsers.filter(user => {
                        //search query is already lowercased

                        const name = user.name.toLowerCase();
                        const username = user.username.toLowerCase();

                        return name.indexOf(searchQuery.term) !== -1 ||
                            username.indexOf(searchQuery.term) !== -1
                    })
                    setUsersData(filteredUsers)
                }
                else {
                    setUsersData(allUsers);
                }
            }
            else {
                toast.warn('Some error occured while retrieving users')
                console.log(response);
            }
        } catch (err) {
            toast.error('Some error occured while retrieving users')
            console.log(response);
        }
    }

    useEffect(() => {
        getSongs();
        getUsers();
    }, [searchQuery])

    useEffect(() => {
        getSongs();
        getPlaylists();
        getUsers();
    }, [])

    function handleSearch(term = undefined, filter = undefined) {

        if (term !== undefined) {

            setSearchQuery(sq => {
                return { ...sq, term: term.toLowerCase() }
            })
        }

        if (filter !== undefined) {

            setSearchQuery(sq => {
                return { ...sq, filter };
            })
        }

    }

    // sockets:

    // send playing song to friends:
    function sendFriendTrack(trackId) {
        socket.emit('sendFriendTrack', { trackId })
    }

    // send playing song to sync playback:
    function sendSyncTrack(trackId) {
        if(!trackId) trackId = track?._id;
        if (!trackId) return;

        // console.log('sent trackId from here', trackId);
        socket.emit('sendSyncTrack', { trackId })

    }

    //send duration to sync playback:
    function sendSyncDuration(duration) {

        console.log('sent duration from here');
        socket.emit('sendDuration', { duration });
    }


    //set track to track sent from server:
    useEffect(() => {
        socket.on('getTrack', async ({ trackId }) => {
            try {
                const response = await axiosBase(`/api/songs/${trackId}`);
                if (response.data.success) {
                    //! Remove timeout if better method implemented.
                    //1000 and 1500 were the time durations
                    // setTimeout(() => setTrack(response.data.song), 15);
                    if (trackId !== track?._id) {
                        console.log('changed track to (see yeah)')
                        setTrack(response.data.song);
                    }
                    console.log('earlier track:', track)

                    console.log('yeah', response.data.song);
                }
                else {
                    console.log(response);
                }
            } catch (err) {
                console.log(err);
            }
        })
    }, [])

    // console.log('trackkk', track);
    //set duration to duration sent from server:
    useEffect(() => {
        socket.on('getDuration', async ({ duration }) => {
            try {
                //!same or more setTimeout as above
                console.log('here');
                // setTimeout(() => audioRef.current.currentTime = duration, 15);
                audioRef.current.currentTime = duration;
            } catch (err) {
                console.log(err);
            }
        })
    }, [])

    //send trackId upon its change
    useEffect(() => {
        if (track?._id) {
            sendFriendTrack(track._id)
            // sendSyncTrack(track._id);
        }
    }, [track?._id]);

    async function play() {
        try {

            //if songs data have not yet been filtered, but in playlist: 
            if (curLocation.pathname.indexOf('playlist') !== -1 && !withinPlaylist) getSongs();
            const result = await audioRef.current.play()
            setPlaying(true);

        } catch (err) {
            setPlaying(false);
            // console.log(err);
        }

    }

    function pause() {
        audioRef.current.pause();
        setPlaying(false);
    }

    //Sync playback: handle pause and play:

    useEffect(() => {
        socket.on('getPause', () => {
            pause();
        })
    }, [socket])

    useEffect(() => {
        socket.on('getPlay', () => {
            play();
        })
    }, [socket])

    //user clicks on progress bar:
    function seekAudio(e) {
        try {
            const { x: X, y: Y, width } = seekBgRef.current.getBoundingClientRect()
            const fractionTime = (e.clientX - X) / width;
            audioRef.current.currentTime = fractionTime * audioRef.current.duration;
            sendSyncDuration(audioRef.current.currentTime);
        }
        catch (err) {
            console.log(err);
        }
    }

    const contextValue = {
        audioRef,
        seekBgRef,
        seekBarRef,
        track, setTrack,
        playing, setPlaying,
        // time, setTime,
        play, pause,
        seekAudio,
        playWithId,
        previous, next,
        songsData, setSongsData,
        playlistsData,
        searchQuery, handleSearch,
        showNoSongs, setShowNoSongs,
        usersData, setUsersData,
        nextRef,
        sendSyncTrack,
    }

    async function playWithId(id) {
        await setTrack(songsData.find(song => song._id === id))

        //Because this is called only by user click, we can do sendSyncTrack
        sendSyncTrack(id);
        // play();
    }

    async function previous() {
        songsData.map((song, idx) => {
            if (song._id === track._id && idx > 0) {
                let track_ = songsData[idx - 1];
                setTrack(track_);

                sendSyncTrack(track_._id);
                // play();
            }
        })
    }

    async function next() {
        songsData.map((song, idx) => {
            if (song._id === track._id) {
                let track_;

                if (idx < songsData.length - 1) {
                    // setTrack(songsData[idx + 1]);
                    track_ = songsData[idx + 1];
                }
                //if last song, go to first
                else if (idx === songsData.length - 1) {
                    // setTrack(songsData[0]);
                    track_ = songsData[0];
                }
                else return;

                setTrack(track_);
                sendSyncTrack(track_._id);
            }
        })
    }

    //Play song upon change in track:
    useEffect(() => {
        try {
            if (track) {
                play()
            }
        } catch (err) {
            console.log(err);
        }
    }, [track]);

    //first time pause song:
    useEffect(() => {
        pause();
    }, []);

    //automatically go to next song once one is over.
    useEffect(() => {
        audioRef.current.onended = next;
    }, [track])

    return (
        <PlayerContext.Provider value={contextValue}>
            {children}
        </PlayerContext.Provider>
    )
}
