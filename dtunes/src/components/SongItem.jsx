import { useContext } from "react"
import { PlayerContext } from "../context/PlayerContext"
import LikesDislikes from "./LikesDislikes";

export default function SongItem({id, name, image, desc, likes, dislikes, currentlyPlaying}){
    const {playWithId} = useContext(PlayerContext);
//min-w-[180px] max-w-[200px]
    
    return(
        <div onClick={() => playWithId(id)} className={`w-[140px] md:w-[160px] lg:w-[190px] py-2 px-1 sm:px-3 mb-2 rounded cursor-pointer ${currentlyPlaying && 'bg-[#ffffff19]'} hover:bg-[#ffffff30]`}>
            <img className="rounded" src={image} alt={name} />
            <p className="font-bold mt-2 mb-1">{name}</p>
            <p className="text-slate-200 text-sm">{desc}</p>
            <LikesDislikes songId={id} likes={likes} dislikes={dislikes}/>
        </div>
    )
}