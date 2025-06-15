import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const App = () => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser] = useState({ id: 'user123', name: 'Gamer' }); // Mock user

  useEffect(() => {
    initializeDatabase();
    loadProducts();
  }, []);

  const initializeDatabase = async () => {
    try {
      await axios.post(`${API}/init-data`);
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const [allProducts, featured, onSale] = await Promise.all([
        axios.get(`${API}/products`),
        axios.get(`${API}/products?featured=true`),
        axios.get(`${API}/products?on_sale=true`)
      ]);
      
      setProducts(allProducts.data);
      setFeaturedProducts(featured.data);
      setSaleProducts(onSale.data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
    setLoading(false);
  };

  const searchProducts = async (term) => {
    if (!term.trim()) {
      loadProducts();
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.get(`${API}/products?search=${term}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error searching products:', error);
    }
    setLoading(false);
  };

  const addToCart = async (productId) => {
    try {
      await axios.post(`${API}/cart`, {
        user_id: currentUser.id,
        product_id: productId,
        quantity: 1
      });
      alert('Produto adicionado ao carrinho!');
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const Header = () => (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <h1>🎮 TechStore</h1>
            <span>Gaming & Tech</span>
          </div>
          
          <div className="search-bar">
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchProducts(searchTerm)}
            />
            <button onClick={() => searchProducts(searchTerm)}>🔍</button>
          </div>
          
          <div className="header-actions">
            <button className="nav-btn" onClick={() => setCurrentPage('home')}>
              🏠 Início
            </button>
            <button className="nav-btn" onClick={() => setCurrentPage('products')}>
              📱 Produtos
            </button>
            <button className="cart-btn">
              🛒 Carrinho ({cart.length})
            </button>
          </div>
        </div>
      </div>
    </header>
  );

  const Hero = () => (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-text">
          <h1>Domine o Jogo</h1>
          <p>Os melhores equipamentos gamer para levar sua performance ao próximo nível</p>
          <button className="cta-button" onClick={() => setCurrentPage('products')}>
            Explorar Produtos
          </button>
        </div>
        <div className="hero-image">
          <img src="https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg" alt="Gaming Setup" />
        </div>
      </div>
    </section>
  );

  const ProductCard = ({ product, featured = false }) => (
    <div className={`product-card ${featured ? 'featured' : ''}`}>
      <div className="product-image">
        <img src={product.image_url} alt={product.name} />
        {product.on_sale && <span className="sale-badge">OFERTA</span>}
        {product.featured && <span className="featured-badge">DESTAQUE</span>}
      </div>
      
      <div className="product-info">
        <div className="product-brand">{product.brand}</div>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        
        <div className="product-rating">
          <span className="stars">{'⭐'.repeat(Math.floor(product.rating))}</span>
          <span className="rating-text">({product.review_count} avaliações)</span>
        </div>
        
        <div className="product-price">
          {product.original_price && (
            <span className="original-price">{formatPrice(product.original_price)}</span>
          )}
          <span className="current-price">{formatPrice(product.price)}</span>
          {product.original_price && (
            <span className="discount">
              {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
            </span>
          )}
        </div>
        
        <div className="product-installments">
          <span>12x de {formatPrice(product.price / 12)} sem juros</span>
        </div>
        
        <div className="product-actions">
          <button 
            className="btn-primary"
            onClick={() => addToCart(product.id)}
          >
            Adicionar ao Carrinho
          </button>
          <button 
            className="btn-secondary"
            onClick={() => {
              setSelectedProduct(product);
              setCurrentPage('product-detail');
            }}
          >
            Ver Detalhes
          </button>
        </div>
      </div>
    </div>
  );

  const ProductGrid = ({ products, title }) => (
    <section className="product-section">
      <div className="container">
        <h2 className="section-title">{title}</h2>
        <div className="product-grid">
          {products.slice(0, 6).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );

  const Categories = () => (
    <section className="categories">
      <div className="container">
        <h2 className="section-title">Categorias</h2>
        <div className="category-grid">
          <div className="category-card">
            <img src="https://images.unsplash.com/photo-1555618568-bdf0a992c512?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1NzZ8MHwxfHNlYXJjaHwyfHxncmFwaGljcyUyMGNhcmR8ZW58MHx8fHwxNzQ5OTQwNzk0fDA&ixlib=rb-4.1.0&q=85" alt="Componentes" />
            <h3>Componentes</h3>
            <p>Placas de Vídeo, Processadores</p>
          </div>
          <div className="category-card">
            <img src="https://images.unsplash.com/photo-1622013378145-e8d89cfbd990?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwzfHxnYW1pbmclMjBQQ3xlbnwwfHx8fDE3NDk5NDA3OTh8MA&ixlib=rb-4.1.0&q=85" alt="PCs Gamer" />
            <h3>PCs Gamer</h3>
            <p>Computadores Prontos</p>
          </div>
          <div className="category-card">
            <img src="https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg" alt="Periféricos" />
            <h3>Periféricos</h3>
            <p>Mouses, Teclados, Headsets</p>
          </div>
          <div className="category-card">
            <img src="https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg" alt="Monitores" />
            <h3>Monitores</h3>
            <p>Gaming, 4K, Ultrawide</p>
          </div>
        </div>
      </div>
    </section>
  );

  const ProductDetail = ({ product }) => (
    <div className="product-detail">
      <div className="container">
        <button className="back-btn" onClick={() => setCurrentPage('home')}>
          ← Voltar
        </button>
        
        <div className="product-detail-content">
          <div className="product-detail-image">
            <img src={product.image_url} alt={product.name} />
          </div>
          
          <div className="product-detail-info">
            <div className="product-brand">{product.brand}</div>
            <h1>{product.name}</h1>
            <p className="product-description">{product.description}</p>
            
            <div className="product-rating">
              <span className="stars">{'⭐'.repeat(Math.floor(product.rating))}</span>
              <span className="rating-text">({product.review_count} avaliações)</span>
            </div>
            
            <div className="product-price">
              {product.original_price && (
                <span className="original-price">{formatPrice(product.original_price)}</span>
              )}
              <span className="current-price">{formatPrice(product.price)}</span>
            </div>
            
            <div className="product-installments">
              <span>12x de {formatPrice(product.price / 12)} sem juros</span>
            </div>
            
            <div className="specifications">
              <h3>Especificações</h3>
              <ul>
                {Object.entries(product.specifications).map(([key, value]) => (
                  <li key={key}><strong>{key}:</strong> {value}</li>
                ))}
              </ul>
            </div>
            
            <div className="product-actions">
              <button 
                className="btn-primary large"
                onClick={() => addToCart(product.id)}
              >
                Adicionar ao Carrinho
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const HomePage = () => (
    <div className="home-page">
      <Hero />
      <Categories />
      <ProductGrid products={featuredProducts} title="⭐ Produtos em Destaque" />
      <ProductGrid products={saleProducts} title="🔥 Ofertas Especiais" />
    </div>
  );

  const ProductsPage = () => (
    <div className="products-page">
      <div className="container">
        <h1>Todos os Produtos</h1>
        {loading ? (
          <div className="loading">Carregando produtos...</div>
        ) : (
          <div className="product-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'products':
        return <ProductsPage />;
      case 'product-detail':
        return <ProductDetail product={selectedProduct} />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="App">
      <Header />
      <main className="main-content">
        {renderCurrentPage()}
      </main>
    </div>
  );
};

export default App;