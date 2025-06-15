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
    loadCart();
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

  const loadCart = async () => {
    try {
      const response = await axios.get(`${API}/cart/${currentUser.id}`);
      setCartItems(response.data);
      
      // Load full product details for cart items
      const cartWithProducts = await Promise.all(
        response.data.map(async (item) => {
          try {
            const productResponse = await axios.get(`${API}/products/${item.product_id}`);
            return { ...item, product: productResponse.data };
          } catch (error) {
            console.error('Error loading product for cart item:', error);
            return item;
          }
        })
      );
      setCart(cartWithProducts);
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const searchProducts = async (term) => {
    if (!term.trim()) {
      loadProducts();
      setCurrentPage('home');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.get(`${API}/products?search=${encodeURIComponent(term)}`);
      setProducts(response.data);
      setCurrentPage('search-results');
    } catch (error) {
      console.error('Error searching products:', error);
    }
    setLoading(false);
  };

  const loadProductsByCategory = async (category) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/products?category=${encodeURIComponent(category)}`);
      setProducts(response.data);
      setSelectedCategory(category);
      setCurrentPage('category-products');
    } catch (error) {
      console.error('Error loading products by category:', error);
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
      loadCart(); // Reload cart to update count
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      await axios.delete(`${API}/cart/${cartItemId}`);
      loadCart(); // Reload cart
    } catch (error) {
      console.error('Error removing from cart:', error);
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
          <div className="logo" onClick={() => setCurrentPage('home')}>
            <h1>⚡ DMSTECH</h1>
            <span>Gaming & Tech</span>
          </div>
          
          <div className="search-bar">
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  searchProducts(searchTerm);
                }
              }}
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
            <button className="cart-btn" onClick={() => setCurrentPage('cart')}>
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
          <div className="category-card" onClick={() => loadProductsByCategory('Componentes')}>
            <img src="https://images.unsplash.com/photo-1555618568-bdf0a992c512?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1NzZ8MHwxfHNlYXJjaHwyfHxncmFwaGljcyUyMGNhcmR8ZW58MHx8fHwxNzQ5OTQwNzk0fDA&ixlib=rb-4.1.0&q=85" alt="Componentes" />
            <h3>Componentes</h3>
            <p>Placas de Vídeo, Processadores</p>
          </div>
          <div className="category-card" onClick={() => loadProductsByCategory('Computadores')}>
            <img src="https://images.unsplash.com/photo-1622013378145-e8d89cfbd990?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwzfHxnYW1pbmclMjBQQ3xlbnwwfHx8fDE3NDk5NDA3OTh8MA&ixlib=rb-4.1.0&q=85" alt="PCs Gamer" />
            <h3>Computadores</h3>
            <p>PCs Gamer Completos</p>
          </div>
          <div className="category-card" onClick={() => loadProductsByCategory('Periféricos')}>
            <img src="https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg" alt="Periféricos" />
            <h3>Periféricos</h3>
            <p>Mouses, Teclados, Headsets</p>
          </div>
          <div className="category-card" onClick={() => loadProductsByCategory('Monitores')}>
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

  const CartPage = () => (
    <div className="cart-page">
      <div className="container">
        <h1>🛒 Meu Carrinho</h1>
        {cart.length === 0 ? (
          <div className="empty-cart">
            <h2>Seu carrinho está vazio</h2>
            <p>Adicione alguns produtos incríveis para começar!</p>
            <button className="btn-primary" onClick={() => setCurrentPage('home')}>
              Continuar Comprando
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-image">
                    <img src={item.product?.image_url} alt={item.product?.name} />
                  </div>
                  <div className="cart-item-info">
                    <h3>{item.product?.name}</h3>
                    <p className="cart-item-brand">{item.product?.brand}</p>
                    <div className="cart-item-price">
                      <span>{formatPrice(item.product?.price || 0)}</span>
                    </div>
                  </div>
                  <div className="cart-item-quantity">
                    <span>Qtd: {item.quantity}</span>
                  </div>
                  <div className="cart-item-total">
                    <span>{formatPrice((item.product?.price || 0) * item.quantity)}</span>
                  </div>
                  <div className="cart-item-actions">
                    <button 
                      className="remove-btn"
                      onClick={() => removeFromCart(item.id)}
                    >
                      🗑️ Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-summary">
              <div className="cart-total">
                <h3>Total: {formatPrice(cart.reduce((total, item) => total + ((item.product?.price || 0) * item.quantity), 0))}</h3>
              </div>
              <div className="cart-actions">
                <button className="btn-secondary" onClick={() => setCurrentPage('home')}>
                  Continuar Comprando
                </button>
                <button className="btn-primary large">
                  Finalizar Compra
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const SearchResultsPage = () => (
    <div className="search-results-page">
      <div className="container">
        <h1>🔍 Resultados da Busca: "{searchTerm}"</h1>
        {loading ? (
          <div className="loading">Buscando produtos...</div>
        ) : products.length === 0 ? (
          <div className="no-results">
            <h2>Nenhum produto encontrado</h2>
            <p>Tente buscar por outros termos ou explore nossas categorias.</p>
            <button className="btn-primary" onClick={() => setCurrentPage('home')}>
              Voltar ao Início
            </button>
          </div>
        ) : (
          <>
            <p className="results-count">Encontrados {products.length} produtos</p>
            <div className="product-grid">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );

  const CategoryProductsPage = () => (
    <div className="category-products-page">
      <div className="container">
        <h1>📱 {selectedCategory}</h1>
        {loading ? (
          <div className="loading">Carregando produtos...</div>
        ) : products.length === 0 ? (
          <div className="no-results">
            <h2>Nenhum produto encontrado nesta categoria</h2>
            <button className="btn-primary" onClick={() => setCurrentPage('home')}>
              Voltar ao Início
            </button>
          </div>
        ) : (
          <>
            <p className="results-count">{products.length} produtos encontrados</p>
            <div className="product-grid">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
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
      case 'cart':
        return <CartPage />;
      case 'search-results':
        return <SearchResultsPage />;
      case 'category-products':
        return <CategoryProductsPage />;
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