import { Routes, Route, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import './App.css';
import BlogList from './components/BlogList';
import BlogPost from './components/BlogPost';
import CategoryNav from './components/CategoryNav';
import { loadBlogPosts } from './utils/blogLoader';

function HomePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') || 'All';

  const handleCategoryChange = (newCategory) => {
    if (newCategory === 'All') {
      navigate('/');
    } else {
      navigate(`/?category=${newCategory}`);
    }
  };

  const handleSelectPost = (post) => {
    navigate(`/post/${post.slug}`);
  };

  return (
    <>
      <CategoryNav 
        selectedCategory={category} 
        onCategoryChange={handleCategoryChange}
      />
      <main className="main-content">
        <BlogList 
          onSelectPost={handleSelectPost} 
          category={category === 'All' ? null : category}
        />
      </main>
    </>
  );
}

function BlogPostPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const posts = loadBlogPosts();
  const post = posts.find(p => p.slug === slug);

  if (!post) {
    return (
      <main className="main-content">
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <h2 style={{ color: '#e6edf3' }}>Blog post not found</h2>
          <button 
            onClick={() => navigate('/')}
            style={{ 
              marginTop: '2rem',
              padding: '0.75rem 1.5rem',
              background: '#58a6ff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <BlogPost post={post} onBack={() => navigate('/')} />
    </main>
  );
}

function App() {
  const navigate = useNavigate();

  return (
    <div className="app">
      <header className="header">
        <h1 onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          Saumil's Blog
        </h1>
        <p className="tagline">Cloud Architecture, AI, and DevOps</p>
      </header>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/post/:slug" element={<BlogPostPage />} />
      </Routes>

      <footer className="footer">
        <p>© {new Date().getFullYear()} Saumil's Blog. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
