import './App.css';
import Texteditor from './components/Texteditor';
import { BrowserRouter, Routes, Route , Navigate } from 'react-router-dom' 

import { v4  } from 'uuid'

function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate replace to={`/documents/${v4()}`} />} />
          <Route path='/documents/:id' element={ <Texteditor/>} />  
        </Routes>
    </BrowserRouter>
  ); 
}

export default App;
