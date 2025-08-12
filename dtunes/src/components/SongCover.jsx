import { assets } from "../assets/user/assets";

export default function SongCover({ songData}) {
    
    return (
        <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-end">
            <img className="w-48 rounded" src={songData.image} alt="Song Image" />
            <div className="flex flex-col">
                <p>Song</p>
                <div className="flex justify-between"> 

                    <h2 className="text-5xl font-bold mb-4 md:text-7xl">{songData.name}</h2>

                </div>
                <h3>{songData.desc}</h3>
                <p className="mt-1">
                    <img className="inline-block w-5" src={assets.logo} alt="dTunes" />
                    <b className="mr-2 ml-2">{songData.duration}</b>
                </p>
            </div>
        </div>
    )
}