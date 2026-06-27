import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProductList from './pages/ProductList';
import Header from './components/Header';

function App() {
  return (
    <Router>
      <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <Header />

        <main>
          <Routes>
            <Route path="/products" element={<ProductList />} />
            <Route path="*" element={<Navigate to="/products" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
