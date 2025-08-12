import LikesDislikes from './LikesDislikes'

export default function PlaylistSong({clickFunc, track, sd, idx}) {
    return (
        <div onClick={clickFunc} className={`grid grid-cols-3 gap-2 p-2 items-center text-[#a7a7a7] ${track && track._id === sd._id && 'bg-[#ffffff30]'} hover:bg-[#ffffff20] cursor-pointer`}>
            <p className="text-white">
                <b className="mr-4 text-[#a7a7a7]">{idx + 1}</b>
                <img className="inline w-10 mr-5" src={sd.image} alt={sd.name} />
                {sd.name}
            </p>

            <LikesDislikes songId={sd._id} likes={sd.likes} dislikes={sd.dislikes} />

            <p className="text-[15px] text-center">
                {sd.duration}
            </p>

        </div>
    )
}