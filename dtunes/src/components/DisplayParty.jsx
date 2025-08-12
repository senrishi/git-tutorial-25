import { useContext, useEffect, useState } from "react";
import { useLoaderData, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom"
import useAuth from "../hooks/useAuth";
import { SocketContext } from "../context/SocketContext";
import axiosBase from "../api/axiosBase";
import PlaylistItem from "./PlaylistItem";
import { v4 as uuid } from 'uuid';
import VotesHeading from "./VotesHeading";
import VoteItem from "./VoteItem";
import { PlayerContext } from "../context/PlayerContext";
import PlaylistCover from "./PlaylistCover";
import PlaylistSongHeading from "./PlaylistSongHeading";
import PlaylistSong from "./PlaylistSong";
import { assets } from "../assets/user/assets";

export default function DisplayParty() {
    const { id: urlPartyId } = useParams();
    let partyId = urlPartyId.slice(0, 5) + ':' + urlPartyId.slice(5);

    const { auth } = useAuth();
    const { user, loggedIn } = auth;

    // const [partyStatus, setPartyStatus] = useState('inactive');
    const { socket } = useContext(SocketContext);
    const navigate = useNavigate();
    const location = useLocation();
    // async function getPartyStatus() {
    //     try {
    //         if (!loggedIn && partyStatus==='Waiting' || partyStatus==='Voting') {
    //             toast.info('Login to access parties!');
    //             return setPartyStatus('inactive');
    //         }

    //         const response = await socket.timeout(5000).emitWithAck('getPartyStatus', { partyId });
    //         if (response.success) return setPartyStatus(response.status)
    //         else {
    //             console.log(response);
    //             setPartyStatus('inactive');
    //         }

    //     } catch (err) {
    //         console.log(err);
    //         setPartyStatus('inactive');
    //     }
    // }

    // useEffect(() => {
    //     getPartyStatus();
    // }, [socket])

    const [partyDetails, setPartyDetails] = useState({ status: 'inactive' });

    //handle join and leave parties:
    useEffect(() => {
        try {
            if (loggedIn) socket.emit('joinParty', { partyId, userId: user._id });
            // else console.log(partyDetails.status, loggedIn);
            return () => socket.emit('leaveParty', { partyId, userId: user._id });
        } catch (err) {
            console.log(err);
        }
    }, [partyDetails?.status, loggedIn])


    useEffect(() => {
        socket.on('getPartyDetails', (pD) => {
            if (!pD?.status) pD = { ...pD, status: 'inactive' }
            setPartyDetails(pD);
        })
    }, [socket])

    //Status: Waiting Voting Partying inactive

    // -------------- wait ----------------
    function skipWait() {
        socket.emit('skipPartyWait', { partyId });
    }

    const [playlists, setPlaylists] = useState([]);

    async function getPlaylists() {
        try {
            const response = await axiosBase.get('/api/playlists/');
            if (response.data.success) {
                setPlaylists(response.data.playlists);
            }
            else {
                console.log(response);
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        if (partyDetails.status === 'Voting') {
            getPlaylists();
        }
    }, [partyDetails])

    function handleVote(pId) {
        socket.emit('partyVote', { pId, partyId });
    }

    let partyVotes = [], userVoted = false, votedPlaylists = [];
    if (partyDetails.status === 'Voting') {
        partyVotes = partyDetails.votes;
        userVoted = Object.keys(partyDetails.votes).find(uId => uId === user?._id);

        votedPlaylists = playlists.filter(p => Object.values(partyVotes).find(pId => pId === p._id));
        votedPlaylists = votedPlaylists.map(p => {
            let votes = Object.values(partyVotes).filter(pId => pId === p._id).length;
            let userVoted = partyDetails.votes[user._id] === p._id;
            return { ...p, votes, userVoted }
        })
        votedPlaylists.sort((a, b) => b.votes - a.votes); //descending order

    }

    // if (partyDetails.status === 'Partying'){
    //     console.log(partyDetails);
    // }

    const [searchParams, setSearchParams] = useSearchParams();
    useEffect(() => {
        if (partyDetails.status === 'Partying') {
            if ((searchParams.get('playlist1') !== partyDetails.playlists[0]) || (searchParams.get('playlist2') !== partyDetails.playlists[1])) {
                // navigate(`/parties/${urlPartyId}?playlist1=${partyDetails.playlists[0]}&playlist2=${partyDetails.playlists[1]}`)
                setSearchParams({
                    playlist1: partyDetails.playlists[0],
                    playlist2: partyDetails.playlists[1],
                })
            }
        }
    }, [partyDetails.status]);
    const { songsData, track, playWithId } = useContext(PlayerContext);

    let partyPlaylistData = [];
    if (partyDetails.status === 'Partying') {
        partyPlaylistData = {
            name: 'Party',
            desc: 'Temporary playlist created from top 2 votes',
            //this bgColor is not taken, it's hard-coded in Display.jsx
            bgColor: '#ef476fbb',
            image: assets.party_image,
            isPublic: true,
        }
    }
    return (
        <>
            {partyDetails.status === 'Waiting' && loggedIn &&
                <>
                    <h1 className="text-center text-3xl mt-4 mb-4">Party Mode:</h1>
                    <h2>Waiting for users to join... {`${Math.round(partyDetails.waitTime)} s`}</h2>
                    <p className="text-center text-lg md:text-2xl text-green-400">{partyDetails.members} joined</p>

                    {partyDetails.hostId === user?._id && <button onClick={skipWait} className='px-4 py-1.5 mt-4 bg-green-500 hover:bg-green-600 active:bg-green-700 text-[15px] text-black font-semibold rounded-full'>Start now</button>}

                </>}

            {partyDetails.status === 'Voting' && loggedIn &&
                <>
                    <h1 className="text-center text-3xl mt-4 mb-4">Party Mode:</h1>
                    {!userVoted ?
                        <>

                            {/* List of Public Playlists */}
                            <h2 className="text-lg md:text-2xl text-center mb-4">Vote for your favourite playlist</h2>
                            <h2 className="text-center">Showing all public playlists</h2>

                            <div className="flex flex-wrap justify-evenly overflow-auto">{
                                playlists.map((p) => {
                                    if (p.isPublic) {
                                        return <PlaylistItem key={uuid()} name={p.name} desc={p.desc} image={p.image} id={p._id} clickFunc={() => handleVote(p._id)} />
                                    }
                                })
                            }
                            </div>
                        </>
                        :
                        <>
                            <h2 className="text-lg md:text-xl text-center mb-4 text-green-400">{partyDetails.voting} Voting</h2>
                            <h2 className="mb-4">{Math.floor(partyDetails.voteTime)} s left to begin...</h2>
                            <VotesHeading />
                            {votedPlaylists.map(p => {
                                return <VoteItem key={uuid()} pD={p} />
                            })}
                        </>
                    }


                    {/* When user has clicked: */}
                    {/* Show table (in ascending order maybe) to display all voted for playlists */}

                    {/* Playlist Icon, PlyalistName, No. of songs, duraiton, no. of votes */}
                    {/* Highlight the voted playlist; remove no. of songs, duration on phone screen */}

                </>}
            {partyDetails.status === 'Partying' && searchParams.get('playlist1') &&
                <>
                    <h1 className="text-center text-3xl mt-4 mb-4">Party Mode:</h1>

                    <PlaylistCover playlistData={partyPlaylistData} playlistSongs={songsData} canEdit={false} />
                    <PlaylistSongHeading />

                    {songsData.map((sd, idx) => {
                        return (
                            <PlaylistSong key={uuid()} clickFunc={() => playWithId(sd._id)} track={track} sd={sd} idx={idx} />
                        )
                    })}

                </>}

            {partyDetails.status === 'inactive' &&
                <>
                    <h1 className="text-center mt-5">This party has either ended or never happened.</h1>
                    {<button onClick={() => navigate('/parties', {replace: true})} className='px-4 py-1.5 mt-4 bg-green-500 hover:bg-green-600 active:bg-green-700 text-[15px] text-black font-semibold rounded-full'>Parties Page</button>}
                </>
            }

            {partyDetails.status === 'Waiting' || partyDetails.status === 'Voting' && !loggedIn && <h2>Login to vote in party or wait for it to begin</h2>}
        </>
    )
}