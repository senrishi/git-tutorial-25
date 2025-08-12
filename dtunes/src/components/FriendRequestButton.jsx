import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { toast } from "react-toastify";

export default function FriendRequestButton({ id, name }) {
    //finds out what action and text to show by itself

    const navigate = useNavigate();
    let text = 'Login for friends', clickFunc = () => navigate('/users/new?isArtist=false&newUser=true');
    let classes = "text-[12px] lg:text-[15px] rounded-lg px-1";
    //jwt:
    const { auth } = useAuth();
    const { user, loggedIn } = auth;
    const axiosPrivate = useAxiosPrivate();

    let processRequest;

    if (loggedIn) {
        processRequest = async (mode, evt) => {
            evt.stopPropagation();
            try {
                let response;
                if (mode === 'accept') response = await axiosPrivate.put(`/api/users/${id}/friend-request`);
                else if (mode === 'undo') response = await axiosPrivate.delete(`/api/users/${id}/friend-request`);
                else if (mode === 'send') response = await axiosPrivate.post(`/api/users/${id}/friend-request`);
                else if (mode === 'remove') response = await axiosPrivate.delete(`/api/users/friends/${id}`);
                else return;

                if (response.data.success) {
                    if (mode === 'send') return toast.success(`Friend Request sent to ${name}!`);
                    if (mode === 'accept') return toast.success(`${name} is now your friend!`);
                    if (mode === 'undo') return toast.success(`Friend Request to/from ${name} is removed`);
                    if (mode === 'remove') return toast.success(`${name} is no longer your friend.`);
                }
                else {
                    toast.error('Something wrong happened. try later');
                    console.log(response);
                }
            } catch (err) {
                toast.error('Something wrong happened. try later');
                console.log(response);
            }
        }

        if (user.friends.incoming.find(fId => fId === id)) {
            text = 'Accept';
            clickFunc = (e) => processRequest('accept', e);
            classes += ' text-green-500 bg-[#ffb70330] hover:bg-[#ffb70325]';
        }
        else if (user.friends.outgoing.find(fId => fId === id)) {
            text = 'Undo Request';
            clickFunc = (e) => processRequest('undo', e);
            classes += ' text-red-500 bg-[#FF000015] hover:bg-[#FF000025]';

        }
        else if (user.friends.accepted.find(fId => fId === id)) {
            text = 'Friend'
            clickFunc = (e) => { };
            classes += ' text-blue-500 bg-[#0000FF15]';

        }
        else {
            text = 'Send Request';
            clickFunc = (e) => processRequest('send', e);
            classes += ' text-green-500 bg-[#00FF0015] hover:bg-[#00FF0025]';

        }
    }
    else {
        classes += 'text-green-500 bg-[#00FF0015] hover:bg-[#00FF0025]';
    }

    return (
        <>
            <button onClick={clickFunc} className={classes}>{text}</button>
            {text === 'Accept' && <button onClick={(e) => processRequest('undo', e)} className='text-[12px] lg:text-[15px] rounded-lg px-1 text-red-500 bg-[#FF000015] hover:bg-[#FF000025]'>Reject</button>}
            {text === 'Friend' && <button onClick={(e) => processRequest('remove', e)} className='text-[12px] lg:text-[15px] rounded-lg px-1 text-red-500 bg-[#FF000015] hover:bg-[#FF000025]'>Remove</button>}
        </>
    )
}