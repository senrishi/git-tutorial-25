import {v4 as uuid} from 'uuid'

export default function ListOfSongs({heading, lastOption, color, data, clickFunc}){
    //passes song._id to clickFunc
    let classes;
    if (color === 'red'){
        classes = "text-red-500 hover:bg-red-200 active:bg-red-300 w-fit cursor-pointer"
    }
    else{
        classes = "text-green-500 hover:bg-green-200 active:bg-green-300 w-fit cursor-pointer"
    }
    return(
        <div>
        <p className='text-2xl text-center text-blue-800'>{heading}</p>
        <br />
        <div>
            <div className="grid grid-cols-[1fr_1fr_1fr_1fr] items-center gap-2.5 p-3 border border-gray-300 text-sm mr-5 bg-gray-100">
                <b>Image</b>
                <b>Name</b>
                <b>Duration</b>
                <b>{lastOption}</b>

            </div>
            <div>
                {data.map((song, idx) => {
                    return (
                        <div key={uuid()} className="grid grid-cols-[1fr_1fr_1fr_1fr] items-center gap-2.5 p-3 border border-gray-300 text-sm mr-5">
                            <img className="w-12" src={song.image} alt={song.name} />
                            <p>{song.name}</p>
                            <p>{song.duration}</p>
                            <p onClick={() => clickFunc(song._id)} className={classes}>{lastOption}</p>
                        </div>

                    )
                })}
            </div>
        </div>
    </div>
    )
}