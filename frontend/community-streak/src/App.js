import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import BrowseEvents from './pages/BrowseEvents';
import MyStreaks from './pages/MyStreaks';
import Register from './pages/Register';
import Login from './pages/Login';
import Header from './components/Header';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<BrowseEvents />} />
        <Route path="/mystreaks" element={<MyStreaks />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
