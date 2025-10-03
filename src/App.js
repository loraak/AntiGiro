import { BrowserRouter as Router, Routes, Route, BrowserRouter } from 'react-router-dom';
import Header from './components/Home/Header';
import Home from './components/Home/Home';
import Register from './components/Interfaces/Admin/Register';
import Configuration from './components/Interfaces/Configuration';
import Analysis from './components/Interfaces/Analysis'
import Reports from './components/Interfaces/Reports';

function App() { 
  return ( 
    <BrowserRouter>
    <div className="App">
      <Header /> 
      <Routes> 
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/configuration" element={<Configuration />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/reports" element={<Reports />} />Z
      </Routes>
      </div> 
    </BrowserRouter>
  )
}

export default App;