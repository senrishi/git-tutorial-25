import { useNavigate } from "react-router-dom"

export default function PlaylistItem({ id, image, name, desc, likedSongs=false, clickFunc=null }) {
    const navigate = useNavigate();

    if(!clickFunc) clickFunc = () => {
        if(!likedSongs) navigate(`/playlist/${id}`);
        else navigate('/liked-songs');
            
    }

    return (
        //flex-none to prevent them from growing/shrinking, so that x-scroll works
        
        <div onClick={clickFunc} className="w-[160px] lg:w-[190px] flex-none py-2 px-3 rounded cursor-pointer hover:bg-[#ffffff30] ">
            <img className="rounded" src={image} alt={name} />
            <p className="font-bold mt-2 mb-1">{name}</p>
            <p className="text-slate-200 text-sm">{desc}</p>
        </div>
    )
}