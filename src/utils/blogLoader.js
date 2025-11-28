import matter from 'gray-matter';
import { Buffer } from 'buffer';

// Polyfill Buffer for browser
window.Buffer = Buffer;

// Import all markdown files
import welcome from '../blogs/welcome.md?raw';
import webDev from '../blogs/web-development-journey.md?raw';
import awsBlog from '../blogs/gen-ai-healthcare-aws.md?raw';
import awsBackup from '../blogs/aws-backup-cornerstone.md?raw';
import awsBackupMastery from '../blogs/aws-backup-mastery.md?raw';
import serverlessNotify from '../blogs/serverless-notify.md?raw';
import s3Security from '../blogs/automated-s3-security.md?raw';

const blogContents = {
  'welcome.md': welcome,
  'web-development-journey.md': webDev,
  'gen-ai-healthcare-aws.md': awsBlog,
  'aws-backup-cornerstone.md': awsBackup,
  'aws-backup-mastery.md': awsBackupMastery,
  'serverless-notify.md': serverlessNotify,
  'automated-s3-security.md': s3Security
};

export function loadBlogPosts(category = null) {
  const posts = [];
  let id = 1;

  try {
    for (const [filename, content] of Object.entries(blogContents)) {
      const { data, content: markdown } = matter(content);
      
      const post = {
        id: id++,
        slug: filename.replace('.md', ''),
        title: data.title,
        date: data.date,
        excerpt: data.excerpt,
        content: markdown,
        category: data.category || 'General',
        tags: data.tags || []
      };

      // Filter by category if specified
      if (!category || post.category === category) {
        posts.push(post);
      }
    }
  } catch (error) {
    console.error('Error loading blog posts:', error);
  }

  return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getCategories() {
  const posts = loadBlogPosts();
  const categories = [...new Set(posts.map(post => post.category))];
  return ['All', ...categories.sort()];
}
