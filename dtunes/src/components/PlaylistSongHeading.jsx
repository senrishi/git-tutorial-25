import { assets } from "../assets/user/assets";

export default function PlaylistSongHeading() {
    return (
        <>
            <div className="grid grid-cols-3 mt-10 mb-4 pl-2 text-[#a7a7a7]">
                <p><b className="mr-4">#</b>Title</p>
                <p>Likes & Dislikes:</p>
                <img className="m-auto w-4" src={assets.clock_icon} alt="Time" />
            </div>
            <hr />
        </>

    )
}