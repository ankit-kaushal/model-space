import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import ModelSpace from './components/ModelSpace';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/model/:id" element={<ModelSpace />} />
      </Routes>
    </Router>
  );
}

export default App;
