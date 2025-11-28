import { loadBlogPosts } from '../utils/blogLoader';
import './BlogList.css';

function BlogList({ onSelectPost, category }) {
  const posts = loadBlogPosts(category);

  if (!posts || posts.length === 0) {
    return (
      <div className="blog-list">
        <h2 className="blog-list-title">Recent Posts</h2>
        <p style={{ color: '#8b949e', textAlign: 'center' }}>No blog posts found in this category.</p>
      </div>
    );
  }

  return (
    <div className="blog-list">
      <h2 className="blog-list-title">Recent Posts</h2>
      {posts.map((post) => (
        <article key={post.id} className="blog-card" onClick={() => onSelectPost(post)}>
          <div className="blog-card-header">
            <div className="blog-card-title-row">
              <h3 className="blog-card-title">{post.title}</h3>
              <span className="blog-card-category">{post.category}</span>
            </div>
            <time className="blog-card-date">
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
          </div>
          <p className="blog-card-excerpt">{post.excerpt}</p>
          <span className="read-more">Read more →</span>
        </article>
      ))}
    </div>
  );
}

export default BlogList;
