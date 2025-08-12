
function secondsFromString(str){
    let [minutes, seconds] = str.split(':');
    minutes = Number(minutes);
    seconds = Number(seconds);
    return minutes*60 + seconds;
}

function stringFromSeconds(sec){
    let minutes = Math.floor(sec/60);
    let seconds = Math.floor(sec%60);
    return `${minutes}:${seconds<10?'0':''}${seconds}`
}

function totalPlaylistTime(playlistSongs){
    //returns false if empty OR a STRING representing total time of playlist songs
    if (!playlistSongs) return false;
    let seconds = playlistSongs.reduce((acc, data) => {
        return acc + secondsFromString(data.duration);
    }, 0)

    return stringFromSeconds(seconds);
}



export {totalPlaylistTime};