
export default function ProfileIcon({clickFunc = () => {}, profileColor, letter, isArtist=false}){
    let borderColor = 'border-green-500';
    if (isArtist) borderColor = 'border-red-500';

    return(
        <p onClick={clickFunc} style={{backgroundColor:  profileColor}} className={`border ${borderColor} text-black w-8 h-8 rounded-full flex items-center justify-center cursor-pointer lg:cursor-auto `}>{letter.toUpperCase()}</p>
    )
}