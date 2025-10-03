import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Home/Header';
import Home from './components/Home/Home';
import Register from './components/Interfaces/Admin/Register';
import Configuration from './components/Interfaces/Configuration';
import Analysis from './components/Interfaces/Analysis'
import Reports from './components/Interfaces/Reports';
import Login from './components/Auth/Login'; 

function AppContent() {
  const location = useLocation();
  const showHeader = location.pathname !== '/login';

  return (
    <div className="App">
      {showHeader && <Header />}
      <Routes> 
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/configuration" element={<Configuration />} />
        <Route path="/login" element={<Login />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </div>
  );
}

function App() { 
  return ( 
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App;