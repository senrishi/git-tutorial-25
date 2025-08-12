import { Route, Routes } from 'react-router-dom'
import Home from './Home'
import DisplayPlaylist from './DisplayPlaylist'
import { useState } from 'react'
import Navbar from './Navbar'
import { ToastContainer } from 'react-toastify'
import DisplayLikedSongs from './DisplayLikedSongs'
import DisplaySong from './DisplaySong'
import DisplayParties from './DisplayParties'
import DisplayParty from './DisplayParty'


export default function Display({setCollapsedSidebar}) {

    const [bgColor, setBgColor] = useState('#121212');

    return (
        <div style={{background: bgColor}} className="w-[100%]  lg:w-[75%] lg:ml-0 m-2 px-6 pt-4 rounded bg-[#121212] text-white overflow-auto">
            <ToastContainer/>
            <Navbar setCollapsedSidebar={setCollapsedSidebar}/>
            <Routes>
                <Route path='/liked-songs' element={<DisplayLikedSongs setBgColor={setBgColor}/>}/>
                <Route path='/playlist/:id' element={<DisplayPlaylist setBgColor={setBgColor} />} />
                <Route path='/song/:id' element={<DisplaySong setBgColor={setBgColor} />} />
                <Route path='/parties' element={<DisplayParties/>} />
                <Route path='/parties/:id' element={<DisplayParty/>} />
                <Route path='*' element={<Home setBgColor={setBgColor} />} />
            </Routes>
        </div>
    )
}