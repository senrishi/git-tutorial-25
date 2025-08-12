import { useEffect, useState } from "react"
import axiosBase from "../api/axiosBase";

export default function SongLyrics({id}) {
    const [lyrics, setLyrics] = useState('Fetching Lyrics...');

    async function getLyrics(){
        try{
            const response = await axiosBase.get(`api/songs/${id}/lyrics`);
            if (response.data.success){
                setLyrics(response.data.lyrics);
            }
            else{
                console.log(response);
                setLyrics('Unable to find lyrics or song doesn\'t have lyrics');
            }
        }catch(err){
            console.log('error', err);
            setLyrics('Some error occured while fetching lyrics...')
        }
    }

    useEffect(() => {
        getLyrics();
    }, [id]);

    return (
        <>
            <h2 className="text-lg md:text-2xl lg:text-3xl text-center mt-4 mb-4">Lyrics</h2>
            {/* whitespace: pre-wrap is a css property which means preserve spaces and convert \n or br tag to newline */}
            <p className="whitespace-pre-wrap mb-5">{lyrics}</p>
        </>
    )
}