import './BlogPost.css';

function BlogPost({ post, onBack }) {
  const renderContent = (markdown) => {
    const lines = markdown.split('\n');
    const elements = [];
    let currentParagraph = [];
    let inCodeBlock = false;
    let codeLines = [];
    let listItems = [];
    
    lines.forEach((line, index) => {
      // Handle code blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          // End code block
          elements.push(
            <pre key={`code-${index}`}>
              <code>{codeLines.join('\n')}</code>
            </pre>
          );
          codeLines = [];
          inCodeBlock = false;
        } else {
          // Start code block
          if (currentParagraph.length > 0) {
            elements.push(<p key={`p-${index}`} dangerouslySetInnerHTML={{ __html: currentParagraph.join(' ') }} />);
            currentParagraph = [];
          }
          if (listItems.length > 0) {
            elements.push(<ul key={`ul-${index}`}>{listItems}</ul>);
            listItems = [];
          }
          inCodeBlock = true;
        }
        return;
      }
      
      if (inCodeBlock) {
        codeLines.push(line);
        return;
      }
      
      // Handle headings
      if (line.startsWith('## ')) {
        if (currentParagraph.length > 0) {
          elements.push(<p key={`p-${index}`} dangerouslySetInnerHTML={{ __html: currentParagraph.join(' ') }} />);
          currentParagraph = [];
        }
        if (listItems.length > 0) {
          elements.push(<ul key={`ul-${index}`}>{listItems}</ul>);
          listItems = [];
        }
        elements.push(<h2 key={`h2-${index}`}>{line.replace('## ', '')}</h2>);
      } else if (line.startsWith('### ')) {
        if (currentParagraph.length > 0) {
          elements.push(<p key={`p-${index}`} dangerouslySetInnerHTML={{ __html: currentParagraph.join(' ') }} />);
          currentParagraph = [];
        }
        if (listItems.length > 0) {
          elements.push(<ul key={`ul-${index}`}>{listItems}</ul>);
          listItems = [];
        }
        elements.push(<h3 key={`h3-${index}`}>{line.replace('### ', '')}</h3>);
      } 
      // Handle numbered lists
      else if (line.match(/^\d+\.\s/)) {
        if (currentParagraph.length > 0) {
          elements.push(<p key={`p-${index}`} dangerouslySetInnerHTML={{ __html: currentParagraph.join(' ') }} />);
          currentParagraph = [];
        }
        const text = line.replace(/^\d+\.\s/, '');
        const formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        listItems.push(<li key={`li-${index}`} dangerouslySetInnerHTML={{ __html: formatted }} />);
      }
      // Handle bullet lists
      else if (line.startsWith('- ') || line.startsWith('* ')) {
        if (currentParagraph.length > 0) {
          elements.push(<p key={`p-${index}`} dangerouslySetInnerHTML={{ __html: currentParagraph.join(' ') }} />);
          currentParagraph = [];
        }
        const text = line.replace(/^[*-]\s/, '');
        const formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        listItems.push(<li key={`li-${index}`} dangerouslySetInnerHTML={{ __html: formatted }} />);
      } 
      // Handle empty lines
      else if (line.trim() === '') {
        if (currentParagraph.length > 0) {
          elements.push(<p key={`p-${index}`} dangerouslySetInnerHTML={{ __html: currentParagraph.join(' ') }} />);
          currentParagraph = [];
        }
        if (listItems.length > 0) {
          elements.push(<ul key={`ul-${index}`}>{listItems}</ul>);
          listItems = [];
        }
      } 
      // Handle images
      else if (line.match(/!\[.*?\]\(.*?\)/)) {
        if (currentParagraph.length > 0) {
          elements.push(<p key={`p-${index}`} dangerouslySetInnerHTML={{ __html: currentParagraph.join(' ') }} />);
          currentParagraph = [];
        }
        if (listItems.length > 0) {
          elements.push(<ul key={`ul-${index}`}>{listItems}</ul>);
          listItems = [];
        }
        const match = line.match(/!\[(.*?)\]\((.*?)\)/);
        if (match) {
          elements.push(<img key={`img-${index}`} src={match[2]} alt={match[1]} />);
        }
      }
      // Regular text
      else {
        const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        currentParagraph.push(formatted);
      }
    });
    
    // Flush remaining content
    if (currentParagraph.length > 0) {
      elements.push(<p key="final-p" dangerouslySetInnerHTML={{ __html: currentParagraph.join(' ') }} />);
    }
    if (listItems.length > 0) {
      elements.push(<ul key="final-ul">{listItems}</ul>);
    }
    
    return elements;
  };

  return (
    <div className="blog-post">
      <button className="back-button" onClick={onBack}>
        ← Back to all posts
      </button>
      
      <article className="post-content">
        <header className="post-header">
          <h1 className="post-title">{post.title}</h1>
          <time className="post-date">
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
        </header>
        
        <div className="post-body">
          {renderContent(post.content)}
        </div>
      </article>
    </div>
  );
}

export default BlogPost;
