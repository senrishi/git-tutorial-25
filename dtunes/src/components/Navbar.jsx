import { useNavigate } from "react-router-dom";
import { assets } from "../assets/user/assets";
import { useContext, useState } from "react";
import { PlayerContext } from "../context/PlayerContext";
import SearchFilter from "./SearchFilter";
import ProfileIcon from "./ProfileIcon";
import useAuth from "../hooks/useAuth";

export default function Navbar({setCollapsedSidebar}){
    const {handleSearch, searchQuery} = useContext(PlayerContext);

    const navigate = useNavigate();
    const [forceUpdate, setForceUpdate] = useState([]);

    // Maybe try using setState if loggedin doesn't work
    const {auth, logout:authLogout} = useAuth();
    const {loggedIn, user} = auth;
        
    function logout(){
        // localStorage.setItem('dtunesStorage', JSON.stringify({}));
        authLogout();
        setForceUpdate(f => [...f]);
    }

    return(
        <>
        <div className="w-full flex justify-between items-center font-semibold">
            {/* Back and forward Buttons */}
            <div className="flex items-center gap-2">
                <img onClick={() => navigate(-1)} className="w-8 bg-black hover:bg-gray-800 active:bg-gray-700 p-2 rounded-2xl cursor-pointer" src={assets.arrow_left} alt="" />
                <img onClick={() => navigate(1)} className="w-8 bg-black hover:bg-gray-800 active:bg-gray-700 p-2 rounded-2xl cursor-pointer" src={assets.arrow_right} alt="" />
            </div>
            
            {/* {SEARCH BAR:} */}

            <div className="flex items-center">
                <input onChange={e => handleSearch(e.target.value)} className="w-[20vw] sm:w-[36vw] bg-[#121212] border border-slate-500 rounded-xl px-2 " type="text" 
                placeholder={searchQuery.filter ? searchQuery.filter === 'songs'?'Search and listen to songs!':'Search either by name or username' : "Search"}/>
            </div>

            {/* {DJ Mode, Login, Logout, User Icon} */}
            <div className="flex items-center gap-4">
                {/* <p className="bg-white hover:bg-gray-200 active:bg-gray-300 text-black text-[15px] px-4 py-1 rounded-2xl hidden md:block cursor-pointer">DJ Mode</p>
                <p className="bg-white hover:bg-gray-200 active:bg-gray-300 text-black text-[15px] px-4 py-1 rounded-2xl block md:hidden cursor-pointer">DJ</p> */}

                {!loggedIn && <a href="/users/new?isArtist=false&newUser=true"><p className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white py-1 px-3 rounded-2xl text-[15px] cursor-pointer hidden md:block">Login/Register</p></a>}
                {!loggedIn && <a href="/users/new?isArtist=false&newUser=true"><p className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white py-1 px-3 rounded-2xl text-[15px] cursor-pointer block md:hidden">Login</p></a>}
                
                {loggedIn && <p onClick={() => logout()} className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white py-1 px-3 rounded-2xl text-[15px] cursor-pointer block">Logout</p>}
                {/* PROFILE ICON */}
                {/* {loggedIn && <p onClick={() => setCollapsedSidebar(s => !s)} style={{backgroundColor:  user.profileColor}} className={`border border-green-700 text-black w-8 h-8 rounded-full flex items-center justify-center cursor-pointer lg:cursor-auto `}>{user?user.name[0].toUpperCase():'A'}</p>} */}
                {loggedIn && <ProfileIcon clickFunc={() => setCollapsedSidebar(s => !s)} profileColor={user.profileColor} letter={user?user.name[0].toUpperCase():'A'} isArtist={user.isArtist}/>}
                {!loggedIn && <img onClick={() => setCollapsedSidebar(s => !s)} className="w-8 h-8 lg:hidden" src={assets.threeLines}></img>}

            </div>

        </div>
        {/* Search Bar Options: */}
        <div className="flex items-center gap-2 mt-4">
            <p className="mr-1">Searching for:</p>
            <SearchFilter clickFunc={() => handleSearch(undefined, 'songs')} selected={searchQuery.filter === 'songs'} text='Music'/>
            <SearchFilter clickFunc={() => handleSearch(undefined, 'users')} selected={searchQuery.filter === 'users'} text='Users'/>
        </div>
        </>
    )
}