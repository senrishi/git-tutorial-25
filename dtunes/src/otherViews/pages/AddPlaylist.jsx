import { useState } from "react";
import { assets } from "../assets/artist/assets";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

function randomColor() {
    const colors = ['#744210', '#234e52', '#44337a', '#742a2a', '#22543d', '#2a4365'];
    return colors[Math.floor(Math.random() * colors.length)]
}

export default function AddPlaylist({ }) {
    const [image, setImage] = useState(false);
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [bgColor, setBgColor] = useState(randomColor);

    const { auth } = useAuth();
    const { loggedIn, user } = auth;
    //add file to true
    const axiosPrivateFile = useAxiosPrivate(true);
    
    async function submitHandler(e) {
        e.preventDefault();
        if(!loggedIn) return;

        try {
            const formData = new FormData();
            formData.append('image', image);
            formData.append('name', name);
            formData.append('desc', desc);
            formData.append('bgColor', bgColor);
            //set playlist to public if user is artist only
            formData.append('isPublic', user.isArtist);
            //userId is passed so that only this user will be able to modify this playlist
            formData.append('userId', user._id);

            const response = await toast.promise(
                axiosPrivateFile.post(`/api/playlists`, formData),
                {
                    pending: 'Uploading... Please wait',
                }
            )

            console.log(response);

            if (response.data.success) {
                toast.success('Playlist Added Successfully!');

                setImage(false);
                setName('');
                setDesc('');
                setBgColor(randomColor());
            }
            //response status codes from auth.js
            else if (response.status === 401){
                toast.error('You are not logged in, log in to upload')
            }
            else if (response.status === 403){
                toast.error('You are not authorized to upload')
            }
            else {
                toast.warn('Playlist was not added. Please Retry!')
            }

        } catch (err) {
            toast.error('Some Error occured, Please Retry!');
            console.log(err);
        }
    }

    return (
        <>
        <Navbar pageHeading="Create new Playlist"/>
        {loggedIn && <form onSubmit={submitHandler} className="flex flex-col items-start gap-8 text-gray-600">
            <div className="flex flex-col gap-4">
                <p>Upload Image</p>
                <input onChange={e => setImage(e.target.files[0])} type="file" id="image" name="image" accept='image/*' hidden />
                <label htmlFor="image">
                    <img className="w-24 cursor-pointer" src={image ? URL.createObjectURL(image) : assets.upload_area} alt="Upload Image" />
                </label>
            </div>

            <div className="flex flex-col gap-2.5">
                <p>Playlist Name:</p>
                <input onChange={(e) => setName(e.target.value)} value={name} className="bg-transparent focus:bg-blue-100 outline-green-600 border-2 border-gray-400 hover:border-green-500 p-2.5 w-[max(40vw,250px)]" placeholder="Playlist Name" type="text" />
            </div>

            <div className="flex flex-col gap-2.5">
                <p>Playlist Description:</p>
                <input onChange={(e) => setDesc(e.target.value)} value={desc} className="bg-transparent focus:bg-blue-100 outline-green-600 border-2 border-gray-400 hover:border-green-500 p-2.5 w-[max(40vw,250px)]" placeholder="Song Description" type="text" />
            </div>

            <div className="flex flex-col gap-3">
                <p>Background Color:</p>
                <input onChange={(e) => setBgColor(e.target.value)} value={bgColor} type="color" />
                <p className="mt-2">Note: This playlist will be {user.isArtist?'public because you\'re an artist':'private because you\'re not an artist'}</p>
            </div>

            <button className="text-base bg-green-600 hover:bg-green-700 active:bg-green-800 text-white cursor-pointer px-6 py-3 rounded-full" type="submit">Add</button>
        </form>}
        </>
    )
}