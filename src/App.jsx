import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import ViewPaste from './pages/ViewPaste'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/paste/:keyID" element={<ViewPaste />} />
      </Routes>
    </BrowserRouter>
  )
}
