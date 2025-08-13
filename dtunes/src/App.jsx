import { Route, Routes } from 'react-router-dom'

import './App.css'
import NormalWithContext from './components/NormalWithContext'
import OtherViewsMain from './otherViews/OtherViewsMain'

function App() {
    
    return (
        <>
            <Routes>
                <Route path='/playlists/new/*' element={<OtherViewsMain  requestedPath='/playlists/new' />}/>
                <Route path='/songs/new/*' element={<OtherViewsMain requestedPath='/songs/new' />}/>
                <Route path='/playlists/:id/add-song' element={<OtherViewsMain requestedPath='/playlists/:id/add-song'/>}/>
                <Route path='/playlists/*' element={<OtherViewsMain requestedPath='/playlists' />}/>
                <Route path='/songs/*' element={<OtherViewsMain requestedPath='/songs' />}/>
                <Route path='/users/new' element={<OtherViewsMain requestedPath='/users/new'/>}/>
                <Route path='*' element={<NormalWithContext/>} />

            </Routes>
        </>
    )
}

export default App

