import { NavLink } from "react-router-dom";

//#00ff5b neon green color

export default function SidebarButtons({toLink, imageSrc, alt, title}) {
    return (
        <NavLink to={toLink} className="flex items-center gap-2.5 bg-white hover:bg-slate-200 active:bg-slate-300 text-gray-800 border-black p-2 pr-[max(8vw,10px)] mr-2 drop-shadow-[-4px_4px_#04D9FF] text-sm font-medium">
            <img className="w-5" src={imageSrc} alt={alt} />
            <p className="hidden sm:block">{alt}</p>
        </NavLink>
    )
}