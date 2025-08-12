import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useAuth from "../hooks/useAuth";
import { useContext, useEffect, useState } from "react";
import { SocketContext } from "../context/SocketContext";
import CreatePartyButton from "./CreatePartyItem";
import JoinPartiesHeading from "./JoinPartiesHeading";
import JoinPartyItem from "./JoinPartyItem";
import {v4 as uuid} from 'uuid';

export default function DisplayParties() {
    const { auth } = useAuth();
    const { loggedIn, user } = auth;
    const axiosPrivate = useAxiosPrivate();

    const { socket } = useContext(SocketContext);

    //join room of party pages when you enter this page, leave when you leave this page;
    useEffect(() => {
        socket.emit('joinPartiesPage');
        return () => socket.emit('leavePartiesPage');
    }, [])

    const [parties, setParties] = useState([]);
    useEffect(() => {
        socket.on('getParties', (p) => {
            setParties(p);
            console.log(p, 'parties');
            // console.log(parties);
        })
    }, [socket])

    let hostedParty = parties.find(p => p.hostId === user?._id);
    let joinedParties = parties.filter(p => {
        //joined parties except hosted party
        if (p.members.find(uId => uId === user?._id) && p.hostId !== user?._id) return p;
    })
    let otherParties = parties.filter(p => !p.members.find(uId => uId === user?._id) && !(p.hostId === user?._id));

    function getPartyValues(p, mode='other'){
        
        let timeDisplay = `${Math.round(p.wait.remaining)} s`;
        if (p.wait.ended && p.vote) timeDisplay = `${Math.round(p.vote.remaining)} s`;
        if (p?.vote?.ended) timeDisplay = '--';
        if (p?.partyDetails?.ending) timeDisplay = `${Math.round(p.partyDetails.ending)} s`;
        
        //!action feature removed, now user can always join
        let action;
        if (p.status === 'Waiting' || p.status === 'Voting') action = 'Join';
        else action = 'noJoin';

        if (mode === 'joined') action = 'Join';
        return {timeDisplay, action};
    }

    return (
        <>
            {hostedParty
                ? <>
                    <h2 className="text-center mt-1 text-xl">You have an active party</h2>
                    
                    <JoinPartyItem partyId={hostedParty.partyId} name='Your party' numberMembers={hostedParty.members.length} status={hostedParty.status} timeDisplay={getPartyValues(hostedParty).timeDisplay} action='Join' />
                </>
                : <CreatePartyButton />}

            <JoinPartiesHeading />
            
            {/* Note: no parties will show in joined parties as I remove the member from members list once the user leaves the party */}
            {joinedParties.length>0 &&
                <>
                    <h2 className="my-2 text-xl text-center">Parties you're a part of:</h2>
                    {joinedParties.map(p => {
                        const {timeDisplay, action} = getPartyValues(p, 'joined');

                        return <JoinPartyItem key={uuid()} partyId={p.partyId} name={p.hostName} numberMembers={p.members.length} status = {p.status} timeDisplay={timeDisplay} action = {action}/> 
                    })}
                </>
            }

            {otherParties.length>0 &&
                <>
                    <h2 className="my-2 text-xl text-center">{`${hostedParty || joinedParties?'Other ':'All '}Parties:`}</h2>
                    {otherParties.map(p => {
                        const {timeDisplay, action} = getPartyValues(p, 'other');

                        return <JoinPartyItem key={uuid()} partyId={p.partyId} name={p.hostName} numberMembers={p.members.length} status = {p.status} timeDisplay={timeDisplay} action = {action}/> 
                    })}
                </>
            }

        </>
    )
}