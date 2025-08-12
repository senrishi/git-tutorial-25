export default function SidebarItem({heading, paragraph, buttonText, clickFunc}) {
    return (
        <div className='p-4 bg-[#242424] m-2 rounded font-semibold flex flex-col items-start justify-start gap-1 pl-4 mt-4'>
            <h2>{heading}</h2>
            <p className='font-light'>{paragraph}</p>
            <button onClick={clickFunc} className='px-4 py-1.5 bg-white hover:bg-slate-200 active:bg-slate-300 text-[15px] text-black rounded-full mt-4'>{buttonText}</button>
        </div>
    )
}