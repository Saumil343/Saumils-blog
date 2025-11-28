# Saumil's Blog

A dark-themed, dev.to-inspired React blog with category navigation and markdown support.

## Features

- Dark theme with blue accents
- Category-based navigation (AWS Backup, Agentic AI, Automation, etc.)
- Markdown blog posts with frontmatter
- Code syntax highlighting
- Image support for architecture diagrams
- Responsive design

## Adding New Blog Posts

Create a new `.md` file in the `src/blogs/` folder:

```markdown
---
title: "Your Blog Post Title"
date: "2024-11-28"
category: "AWS Backup"
excerpt: "A short preview of your post."
---

Your blog content here...

## Headings

Regular paragraphs work great.

### Code Blocks

\`\`\`python
def hello():
    print("Hello, World!")
\`\`\`

### Images

![Architecture Diagram](/images/architecture.png)

- Bullet points
- **Bold text**
```

## Categories

Available categories:
- **Agentic AI**: AI and machine learning posts
- **AWS Backup**: Backup and disaster recovery
- **Automation**: Lambda, automation, and DevOps
- **General**: Other topics

## Adding Images

1. Place images in `public/images/` folder
2. Reference in markdown: `![Alt text](/images/your-image.png)`

## Local Development

```bash
npm install
npm run dev
```

Visit http://localhost:5175/

## Deployment

### GitHub Pages

1. Update `vite.config.js` base path to your repo name
2. Push to GitHub
3. Enable GitHub Actions in Settings > Pages
4. Auto-deploys on push to main

### AWS S3

```bash
npm run build
aws s3 sync dist/ s3://your-bucket-name --delete
```

## Project Structure

```
src/
├── blogs/           # Markdown blog posts
├── components/      # React components
│   ├── BlogList.jsx
│   ├── BlogPost.jsx
│   └── CategoryNav.jsx
├── utils/
│   └── blogLoader.js
└── App.jsx
```

## Customization

- **Colors**: Edit CSS files in `src/components/`
- **Categories**: Update `blogLoader.js`
- **Header**: Modify `src/App.jsx`

Happy blogging! 🚀
