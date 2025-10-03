// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './components/Header/Header';
import Login2 from './components/Auth/Login';
import Monitoreo from './components/Monitoreo';


function AppContent() {
    return (
        <div className="App">
            <Header />
            <Routes>
                <Route path="/login" element={<Login2 />} />
                <Route path="/monitoreo" element={<Monitoreo />} />
            </Routes>
        </div>
    );
}

function App() {
    return (
        <Router>
          <AppContent />
        </Router>
    );
}

export default App;