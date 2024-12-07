import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import MyStreaks from './pages/MyStreaks';
import Register from './pages/Register';
import Login from './pages/Login';
import Header from './components/Header';
import EventDetails from './pages/EventDetails';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/mystreaks" element={<MyStreaks />} />
        <Route path="/login" element={<Login />} />
        <Route path="/events/:eventId" element={<EventDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
