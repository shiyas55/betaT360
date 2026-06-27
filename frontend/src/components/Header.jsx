import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, User, Search } from 'lucide-react';

const Header = () => {
  return (
    <header style={{ 
      backgroundColor: 'white', 
      borderBottom: '1px solid #e2e8f0', 
      position: 'sticky', 
      top: 0, 
      zIndex: 50 
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '32px', height: '32px', backgroundColor: '#2563eb', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold' }}>T</div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>TechnoStore360</h2>
          </Link>
          
          <div style={{ position: 'relative', width: '300px', display: 'none', '@media (min-width: 768px)': { display: 'block' } }}>
            <input 
              type="text" 
              placeholder="Search products..." 
              style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: '20px', border: '1px solid #cbd5e1', outline: 'none' }}
            />
            <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/products" style={{ textDecoration: 'none', color: '#475569', fontWeight: '600' }}>Catalog</Link>
          <Link to="#" style={{ textDecoration: 'none', color: '#475569', fontWeight: '600' }}>Solutions</Link>
          <Link to="#" style={{ textDecoration: 'none', color: '#475569', fontWeight: '600' }}>Pricing</Link>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '1px solid #e2e8f0', paddingLeft: '1rem' }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', position: 'relative' }}>
              <ShoppingCart size={20} />
              <span style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#ef4444', color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>0</span>
            </button>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}>
              <User size={20} />
            </button>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'block', '@media (min-width: 768px)': { display: 'none' } }}>
              <Menu size={20} />
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
