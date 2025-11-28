import { useState } from 'react';
import './App.css';
import BlogList from './components/BlogList';
import BlogPost from './components/BlogPost';
import CategoryNav from './components/CategoryNav';

function App() {
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSelectedPost(null);
  };

  return (
    <div className="app">
      <header className="header">
        <h1 onClick={() => { setSelectedPost(null); setSelectedCategory('All'); }} style={{ cursor: 'pointer' }}>
          Saumil's Blog
        </h1>
        <p className="tagline">Cloud Architecture, AI, and DevOps</p>
      </header>

      <CategoryNav 
        selectedCategory={selectedCategory} 
        onCategoryChange={handleCategoryChange}
      />

      <main className="main-content">
        {selectedPost ? (
          <BlogPost post={selectedPost} onBack={() => setSelectedPost(null)} />
        ) : (
          <BlogList 
            onSelectPost={setSelectedPost} 
            category={selectedCategory === 'All' ? null : selectedCategory}
          />
        )}
      </main>

      <footer className="footer">
        <p>© {new Date().getFullYear()} Saumil's Blog. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
