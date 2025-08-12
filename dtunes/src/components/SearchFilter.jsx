
export default function SearchFilter({selected=false, text, clickFunc}){
    let classes;
    if (selected){
        classes = "bg-white hover:bg-slate-200 active:bg-slate-300 text-black px-4 py-1 rounded-2xl cursor-pointer";
    }
    else{
        classes = "bg-black hover:bg-slate-900 active:bg-slate-800 text-white px-4 py-1 rounded-2xl cursor-pointer"
    }

    return <p onClick={clickFunc} className={classes}>{text}</p>
}