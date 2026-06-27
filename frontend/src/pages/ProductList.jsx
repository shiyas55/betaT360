import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Star } from 'lucide-react';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch products from the new Django API
    axios.get('http://127.0.0.1:8001/api/products/')
      .then(response => {
        // DRF generic list API views return paginated data by default if configured
        setProducts(response.data.results || response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching products:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading products...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>B2B Catalog</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
        {products.map(product => (
          <div key={product.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', backgroundColor: 'white' }}>
            {product.image && (
              <img 
                src={`http://127.0.0.1:8001${product.image}`} 
                alt={product.name} 
                style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }} 
              />
            )}
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{product.name}</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem', minHeight: '40px' }}>
              {product.short_desc}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>${product.current_price}</span>
              </div>
              <button style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <ShoppingCart size={16} /> Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
