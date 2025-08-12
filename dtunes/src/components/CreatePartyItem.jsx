import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useContext } from "react";
import { SocketContext } from "../context/SocketContext";

export default function CreatePartyItem({}) {
    const navigate = useNavigate();

    const {auth} = useAuth();
    const {loggedIn, user} = auth;
    const {socket} = useContext(SocketContext);

    async function createParty(){
        if(loggedIn){
            const response = await socket.timeout(5000).emitWithAck('createParty', {userId: user._id, name: user.name, username: user.username});
            if(response.success){
                let partyId = response.partyId.replace(':', '');
                navigate(`/parties/${partyId}`);
            }
        }
    }

    return (
        <div className='bg-[#242424] rounded-full font-semibold flex items-start justify-between gap-1 py-2 px-4 mt-4'>
            <h2 className="text-lg">{'Create your own Party'}</h2>
            <button onClick={createParty} className='px-4 py-1.5 bg-green-500 hover:bg-green-600 active:bg-green-700 text-[15px] text-black rounded-full'>{"Create"}</button>
        </div>
    )
}