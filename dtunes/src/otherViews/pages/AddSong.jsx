import { useState } from "react";
import { assets } from "../assets/artist/assets";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

export default function AddSong({ }) {
    const [image, setImage] = useState(false);
    const [song, setSong] = useState(false);
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');

    const { auth } = useAuth();
    const { loggedIn, user } = auth;
    //set use files to true
    const axiosPrivateFile = useAxiosPrivate(true);

    async function submitHandler(e) {
        if (e) e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('desc', desc);
            formData.append('image', image);
            formData.append('audio', song);

            const response = await toast.promise(
                axiosPrivateFile.post(`/api/songs`, formData),
                {
                    pending: 'Uploading... Please wait',
                }
            )
            console.log(response);

            if (response.data.success) {
                toast.success('Song added!');

                setName('');
                setDesc('');
                setSong(false);
                setImage(false);

            }
            else if(response.status === 401){
                toast.error('You are not logged in!');
            }
            else if (response.status === 403){
                toast.error('You are not allowed to do this!');
            }
            else {
                toast.warn('Song not Added. Please Retry!')
            }

        } catch (err) {
            console.log(err);
            toast.error('Some Error occured. Please Retry!')
        }
    }

    return (
        <>
        <Navbar pageHeading="Publish New Song"/>
        {loggedIn && user.isArtist && <form onSubmit={submitHandler} className="flex flex-col items-start gap-8 text-gray-600" action="">
            <div className="flex gap-8">
                <div className="flex flex-col gap-4">
                    <p>Upload Song</p>
                    <input onChange={e => setSong(e.target.files[0])} type="file" id="song" name="song" accept="audio/*" hidden />
                    <label htmlFor="song">
                        <img className="w-24 cursor-pointer" src={song ? assets.upload_added : assets.upload_song} alt="Upload song" />
                    </label>

                </div>
                <div className="flex flex-col gap-4">
                    <p>Upload Image</p>
                    <input onChange={e => setImage(e.target.files[0])} type="file" id="image" name="image" accept='image/*' hidden />
                    <label htmlFor="image">
                        <img className="w-24 cursor-pointer" src={image ? URL.createObjectURL(image) : assets.upload_area} alt="Upload Image" />
                    </label>
                </div>
            </div>

            <div className="flex flex-col gap-2.5">
                <p>Song Name:</p>
                <input onChange={(e) => setName(e.target.value)} value={name} className="bg-transparent focus:bg-blue-100 outline-green-600 border-2 border-gray-400 hover:border-green-500 p-2.5 w-[max(40vw,250px)]" placeholder="Song Name" type="text" />
            </div>

            <div className="flex flex-col gap-2.5">
                <p>Song Description:</p>
                <input onChange={(e) => setDesc(e.target.value)} value={desc} className="bg-transparent focus:bg-blue-100 outline-green-600 border-2 border-gray-400 hover:border-green-500 p-2.5 w-[max(40vw,250px)]" placeholder="Song Description" type="text" />
            </div>

            <button className="text-base bg-green-600 hover:bg-green-700 active:bg-green-800 text-white cursor-pointer px-6 py-3 rounded-full" type="submit">Add</button>
        </form>}
        </>
    )
}