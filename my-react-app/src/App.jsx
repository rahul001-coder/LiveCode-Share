import { useState } from 'react'
import { Route,Routes} from 'react-router-dom';
import { Home } from './pages/Home';
import { Editor } from './pages/Editor';
import {ToastContainer} from 'react-toastify';
function App() {

  return (
    <> <ToastContainer />
       <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/editor/:roomId" element={<Editor/>}/>
     </Routes>  
    </>
  )
}

export default App
