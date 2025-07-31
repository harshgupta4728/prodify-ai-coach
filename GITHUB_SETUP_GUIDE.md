# 🚀 GitHub Setup Guide for Prodify AI Coach

This guide will help you set up your project on GitHub with automatic commits when you make changes.

## 📋 Prerequisites

- Git installed on your system
- GitHub account
- Node.js and npm installed

## 🔧 Step-by-Step Setup

### 1. Initialize Local Git Repository

Run the automated setup script:

```bash
npm run setup-github
```

This script will:
- ✅ Check if Git is installed
- ✅ Initialize Git repository (if not already done)
- ✅ Add all files to Git
- ✅ Create initial commit
- ✅ Provide next steps

### 2. Create GitHub Repository

1. Go to [GitHub New Repository](https://github.com/new)
2. Repository name: `prodify-ai-coach`
3. Description: `AI-powered study companion for mastering Data Structures and Algorithms`
4. **Important**: DO NOT initialize with README, .gitignore, or license (we already have these)
5. Click "Create repository"

### 3. Connect Local Repository to GitHub

After creating the repository, GitHub will show you the commands. Use these:

```bash
# Add the remote repository
git remote add origin https://github.com/YOUR_USERNAME/prodify-ai-coach.git

# Set the main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

### 4. Enable GitHub Actions

1. Go to your repository on GitHub
2. Click on "Actions" tab
3. Click "Enable Actions"
4. The workflow file `.github/workflows/auto-commit.yml` will be automatically detected

## 🔄 Automatic Commits Setup

### Option 1: GitHub Actions (Recommended)

The project includes a GitHub Actions workflow that automatically commits changes:

1. **Workflow File**: `.github/workflows/auto-commit.yml`
2. **Triggers**: 
   - Push to main/develop branches
   - Pull requests
   - Manual trigger

3. **What it does**:
   - Installs dependencies
   - Runs linting
   - Builds the project
   - Commits any changes automatically

### Option 2: Local Git Hooks

For local automatic commits, you can set up Git hooks:

```bash
# Create pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
npm run lint
npm run build
git add .
EOF

# Make it executable
chmod +x .git/hooks/pre-commit
```

### Option 3: VS Code Extensions

Install these VS Code extensions for automatic commits:

1. **GitLens** - Enhanced Git capabilities
2. **Auto Commit** - Automatic commits on save
3. **Git History** - View Git history

## 🛠️ Development Workflow

### Daily Development

1. **Start development**:
   ```bash
   npm run dev
   ```

2. **Make changes** to your code

3. **Commit changes**:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push
   ```

4. **Automatic commits** will be triggered by GitHub Actions

### Branch Strategy

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: implement new feature"

# Push to GitHub
git push -u origin feature/new-feature

# Create pull request on GitHub
# Merge to main branch
```

## 📝 Commit Message Convention

Use conventional commit messages:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test changes
- `chore:` - Build/tooling changes

Examples:
```bash
git commit -m "feat: add user authentication system"
git commit -m "fix: resolve login form validation issue"
git commit -m "docs: update README with setup instructions"
```

## 🔍 Monitoring Automatic Commits

### GitHub Actions Dashboard

1. Go to your repository
2. Click "Actions" tab
3. View workflow runs
4. Check logs for any issues

### Email Notifications

1. Go to repository Settings
2. Click "Notifications"
3. Configure email preferences for:
   - Workflow runs
   - Pull requests
   - Issues

## 🚨 Troubleshooting

### Common Issues

1. **GitHub Actions not running**:
   - Check if Actions are enabled in repository settings
   - Verify workflow file is in `.github/workflows/` directory

2. **Permission denied**:
   - Ensure you have write access to the repository
   - Check GitHub token permissions

3. **Build failures**:
   - Check the Actions logs for specific errors
   - Verify all dependencies are properly installed

### Reset Setup

If you need to reset the setup:

```bash
# Remove Git repository
rm -rf .git

# Run setup again
npm run setup-github
```

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Best Practices](https://git-scm.com/book/en/v2)

## 🎉 Success!

Once setup is complete, your project will:
- ✅ Be hosted on GitHub
- ✅ Have automatic commits on changes
- ✅ Include proper documentation
- ✅ Follow best practices

Happy coding! 🚀 