# Deploy to GitHub Pages - Step by Step

## Prerequisites
- GitHub account
- Git installed on your computer

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `saumils-blog` (or any name you prefer)
3. Make it **Public** (required for free GitHub Pages)
4. **Don't** initialize with README (we already have files)
5. Click "Create repository"

## Step 2: Update Base Path (if needed)

If your repo name is different from `saumils-blog`, update `vite.config.js`:

```javascript
base: process.env.NODE_ENV === 'production' ? '/YOUR-REPO-NAME/' : '/',
```

## Step 3: Initialize Git and Push

Open terminal in the `saumils-blog` folder and run:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Saumil's Blog"

# Add your GitHub repo as remote (replace USERNAME and REPO-NAME)
git remote add origin https://github.com/USERNAME/REPO-NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top right)
3. Click **Pages** (left sidebar)
4. Under "Source", select **GitHub Actions**
5. That's it! The workflow will auto-deploy

## Step 5: Wait for Deployment

1. Go to **Actions** tab in your repo
2. You'll see a workflow running
3. Wait 2-3 minutes for it to complete
4. Your site will be live at: `https://USERNAME.github.io/REPO-NAME/`

## Updating Your Blog

Whenever you want to add new posts or make changes:

```bash
# Make your changes (add new .md files, edit content, etc.)

# Stage changes
git add .

# Commit
git commit -m "Add new blog post"

# Push to GitHub
git push

# GitHub Actions will automatically rebuild and deploy!
```

## Troubleshooting

### Site shows 404
- Check that GitHub Pages is enabled in Settings > Pages
- Verify the base path in `vite.config.js` matches your repo name
- Wait a few minutes after pushing

### Images not loading
- Make sure images are in `public/images/` folder
- Reference them as `/images/filename.png` in markdown
- Rebuild and push again

### Build fails
- Check the Actions tab for error messages
- Ensure all dependencies are in package.json
- Try building locally first: `npm run build`

## Custom Domain (Optional)

To use your own domain like `blog.yourdomain.com`:

1. Add a `CNAME` file to `public/` folder with your domain
2. Update DNS settings with your domain provider
3. In GitHub Settings > Pages, add your custom domain
4. Update `vite.config.js` base to `/`

## Cost

**100% FREE!** GitHub Pages is free for public repositories.

Limits:
- 1 GB storage
- 100 GB bandwidth/month
- 10 builds per hour

More than enough for a blog!
