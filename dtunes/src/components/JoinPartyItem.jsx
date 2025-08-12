// import { useContext } from "react"
// import { SocketContext } from "../context/SocketContext"
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function JoinPartyItem({partyId, name, numberMembers, status, timeDisplay, action}) {
    // const {socket} = useContext(SocketContext);

    const {auth} = useAuth();
    const {loggedIn} = auth;
    const navigate = useNavigate();

    function joinParty(){
        //!remove the below:
        // if (action === 'noJoin') toast.info('Party already started! Can\'t Join');

        //if voting or waiting, only allow loggedIn users
        if(loggedIn || status!=='Waiting' && status!=='Voting'){
            // socket.emit('joinParty', {partyId});
            navigate(`/parties/${partyId.replace(':', '')}`);
        }
    }

    //Different color if party has started/ended
    return (
        <div className={`bg-[#242424] m-2 my-5 rounded-full grid grid-cols-4 gap-2 p-2 items-center text-[#a7a7a7] cursor-pointer`}>
            <p className="text-white">
                {name}
                {/* profile photo of host */}
            </p>

            {/* Currently how many members */}

            <p className="text-[15px] text-center">
                {`${numberMembers} user${numberMembers===1?'':'s'} ${status}`}
            </p>

            <p className="text-[15px] text-center">
                {timeDisplay}
            </p>
            <button onClick={joinParty} className='px-4 py-1.5 bg-green-500 hover:bg-green-600 active:bg-green-700 text-[15px] text-black font-semibold rounded-full'>Join</button>


        </div>
    )
}