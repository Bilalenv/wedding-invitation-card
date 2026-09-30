import { useState } from 'react'
import './css/style.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import WeddingCard from './components/WeddingCard'
import WeddingCard1 from './components/WeddingCard1'
function App() {
  return (
    <BrowserRouter>
    <div className='min-h-screen bg-[#CFCECA]'>
        <Routes>
            <Route path='/' element={<WeddingCard/>}></Route>
        </Routes>
         <Routes>
            <Route path='/wedding' element={<WeddingCard1/>}></Route>
        </Routes>
    </div>
    </BrowserRouter>
  )
}

export default App
