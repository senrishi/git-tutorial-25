import { toast } from "react-toastify";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useAuth from "../hooks/useAuth";

export default function LikesDislikes({ likes, dislikes, songId }) {

    const { auth } = useAuth();
    const { loggedIn, user } = auth;
    const axiosPrivate = useAxiosPrivate();

    async function handleLike(e) {
        e.stopPropagation();
        if (!loggedIn) return toast.info('You have to login to like')

        const response = await axiosPrivate.post(`/api/songs/like`, { songId })

        if (response.data.wasLiked) toast.info('Like removed, reload page to see');
        else toast.info('Like added, reload page to see');
    }

    async function handleDislike(e) {
        e.stopPropagation();
        if (!loggedIn) return toast.info('You have to login to dislike')

        const response = await axiosPrivate.post(`/api/songs/dislike`, { songId })

        if (response.data.wasDisliked) toast.info('Dislike removed, reload page to see')
        else toast.info('Dislike added, reload page to see');
    }

    let likedClasses = `bg-green-950 rounded-xl px-1 text-sm lg:text-base`;
    let dislikedClasses = `bg-red-950 rounded-xl px-1 text-sm lg:text-base`;

    function checkLiked() {
        if (user && user.likedSongs.find(sId => sId === songId)) {
            likedClasses += ' text-green-400';

        }
        if (user && user.dislikedSongs.find(sId => sId === songId)) {
            dislikedClasses += ' text-red-400';

        }
    }
    checkLiked();

    return (
        <div className="flex gap-2 mt-1">
            <button onClick={(e) => handleLike(e)} className={likedClasses}>{likes.length} Like{likes.length !== 1 && 's'}</button>
            <button onClick={(e) => handleDislike(e)} className={dislikedClasses}>{dislikes.length} Dislike{dislikes.length !== 1 && 's'}</button>
        </div>
    )
}