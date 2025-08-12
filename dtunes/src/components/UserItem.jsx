import FriendRequestButton from "./FriendRequestButton";
import ProfileIcon from "./ProfileIcon";

export default function UserItem({ id, username, name, profileColor, isArtist }) {
    //min-w-[180px] max-w-[200px]
    return (
        <div className={`w-[140px] md:w-[160px] lg:w-[190px] py-2 px-1 sm:px-3 mb-2 rounded cursor-pointer hover:bg-[#ffffff30]`}>
            <div className="flex gap-3">
                <ProfileIcon profileColor={profileColor} letter={name[0]} isArtist={isArtist} />
                <FriendRequestButton id={id} name={name}/>
            </div>
            <p className="font-bold mt-2 mb-1">{name}</p>
            <p className="text-slate-200 text-sm">Username: {username}</p>
        </div>
    )
}