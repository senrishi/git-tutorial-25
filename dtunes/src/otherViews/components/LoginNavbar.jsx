import LoginNavbarOption from "./LoginNavbarOption";

export default function LoginNavbar({activated}){

    return(
        <ul className="flex justify-evenly md:justify-between bg-slate-50 mt-4 sm:mx-6 py-2 sm:px-4 border border-blue-300 rounded-full ">
            <LoginNavbarOption isActive={activated[0]} href='/users/new?isArtist=false&newUser=true' title='New User'/>
            <LoginNavbarOption isActive={activated[1]} href='/users/new?isArtist=false&newUser=false' title='User Login'/>
            <LoginNavbarOption isActive={activated[2]} href='/users/new?isArtist=true&newUser=true' title='New Artist'/>
            <LoginNavbarOption isActive={activated[3]} href='/users/new?isArtist=true&newUser=false' title='Artist Login'/>
        </ul>
    )
}

