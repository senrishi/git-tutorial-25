import { useContext, useEffect, useState } from 'react'
import { assets } from '../assets/user/assets'
import { PlayerContext } from '../context/PlayerContext'
import { useNavigate } from 'react-router-dom';
import { SocketContext } from '../context/SocketContext';


export default function Player() {
    const navigate = useNavigate();

    const { seekBgRef, seekBarRef, playing, play, pause, track, seekAudio, previous, next, nextRef, audioRef } = useContext(PlayerContext);

    const [time, setTime] = useState({
        current: {
            second: 0,
            minute: 0,
        },
        total: {
            second: 0,
            minute: 0,
        }

    });

    const zeroFormat = { current: time.current.second < 10, total: time.total.second < 10 }

    function displaySong() {
        navigate(`/song/${track._id}`);
    }

    useEffect(() => {
        const audio = audioRef?.current;
        if (!audio || !seekBarRef?.current) return;

        audio.ontimeupdate = () => {
            try {
                seekBarRef.current.style.width = `${audio.currentTime / audio.duration * 100}%`
                setTime({
                    current: {
                        second: Math.floor(audio.currentTime % 60),
                        minute: Math.floor(audio.currentTime / 60),
                    },
                    total: {
                        second: Math.floor(audio.duration % 60),
                        minute: Math.floor(audio.duration / 60),
                    }
                })

            } catch (err) {
            }
        }
    }, [audioRef])

    const {socket} = useContext(SocketContext);
    useEffect(() => {
        socket.on('durationRequest', cb => {
            cb(audioRef.current.currentTime)
        })
    })

    function handlePause(){
        pause();
        socket.emit('sendPause');
    }

    function handlePlay(){
        play();
        socket.emit('sendPlay');
    }

    return track ? (
        <div className="h-[10%] bg-black flex justify-between items-center text-white px-4">

            {/* Display of song name, image */}
            <div onClick={displaySong} title='Click for song lyrics' className="hidden md:flex w-[20%] items-center gap-4 px-3 py-2 hover:bg-[#ffffff30] active:bg-[#ffffff40] cursor-pointer">
                <img className="w-12" src={track.image} alt="Song Image" />
                <div>
                    <p>{track.name}</p>
                    <p>{track.desc.slice(0, 12)}...</p>
                </div>
            </div>
            {/* On small screen */}
            <div onClick={displaySong} title='Click for song lyrics' className='flex items-center md:hidden hover:bg-[#ffffff30] active:bg-[#ffffff40] cursor-pointer'>
                <img className="w-10" src={track.image} alt="Song Image" />
            </div>

            <div className='flex flex-col items-center gap-1 m-auto lg:pr-[10%]'>
                <div className='flex gap-4'>
                    <img onClick={previous} className='w-4 cursor-pointer' src={assets.prev_icon} alt="previous" />
                    {playing
                        ? <img onClick={handlePause} className='w-4 cursor-pointer' src={assets.pause_icon} alt="pause" />
                        : <img onClick={handlePlay} className='w-4 cursor-pointer' src={assets.play_icon} alt="play" />
                    }
                    <img ref={nextRef} onClick={next} className='w-4 cursor-pointer' src={assets.next_icon} alt="next" />
                </div>
                <div className='flex items-center gap-4'>
                    <p>{time.current.minute}:{zeroFormat.current && '0'}{time.current.second}</p>
                    <div onClick={seekAudio} ref={seekBgRef} className='w-[60vw] max-w-[500px] bg-gray-300 rounded-full cursor-pointer'>
                        <hr ref={seekBarRef} className='h-2 border-none w-0 bg-blue-600 rounded-full' />

                    </div>
                    <p>{time.total.minute}:{zeroFormat.total && '0'}{time.total.second}</p>
                </div>
            </div>

        </div>
    ) : null
}