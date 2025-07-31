#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up GitHub repository for Prodify AI Coach...\n');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m'
};

function log(message, color = 'blue') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  try {
    log(`📋 ${description}...`, 'yellow');
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} completed!`, 'green');
    return true;
  } catch (error) {
    log(`❌ Error: ${description} failed!`, 'red');
    console.error(error.message);
    return false;
  }
}

function checkGitStatus() {
  try {
    execSync('git --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function checkGitInitialized() {
  return fs.existsSync('.git');
}

function main() {
  // Check if git is installed
  if (!checkGitStatus()) {
    log('❌ Git is not installed. Please install Git first.', 'red');
    log('Download from: https://git-scm.com/downloads', 'blue');
    process.exit(1);
  }

  // Initialize git if not already initialized
  if (!checkGitInitialized()) {
    if (!runCommand('git init', 'Initializing Git repository')) {
      process.exit(1);
    }
  }

  // Add all files
  if (!runCommand('git add .', 'Adding all files to Git')) {
    process.exit(1);
  }

  // Create initial commit
  if (!runCommand('git commit -m "Initial commit: Prodify AI Coach - AI-powered DSA learning platform"', 'Creating initial commit')) {
    process.exit(1);
  }

  log('\n🎉 Local Git repository setup completed!', 'green');
  
  log('\n📝 Next steps to connect with GitHub:', 'blue');
  log('1. Go to https://github.com/new', 'yellow');
  log('2. Create a new repository named "prodify-ai-coach"', 'yellow');
  log('3. DO NOT initialize with README, .gitignore, or license (we already have these)', 'yellow');
  log('4. Copy the repository URL', 'yellow');
  log('5. Run the following commands:', 'yellow');
  log('   git remote add origin https://github.com/YOUR_USERNAME/prodify-ai-coach.git', 'green');
  log('   git branch -M main', 'green');
  log('   git push -u origin main', 'green');
  
  log('\n🔧 For automatic commits on file changes:', 'blue');
  log('1. The GitHub Actions workflow is already configured', 'yellow');
  log('2. Make sure to enable GitHub Actions in your repository settings', 'yellow');
  log('3. Any push to main/develop branch will trigger automatic commits', 'yellow');
  
  log('\n📚 Additional setup:', 'blue');
  log('- Update the repository URL in README.md', 'yellow');
  log('- Set up environment variables in your deployment platform', 'yellow');
  log('- Configure MongoDB connection for production', 'yellow');
  
  log('\n✨ Happy coding!', 'green');
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🚀 Prodify AI Coach - GitHub Setup Script

Usage: node setup-github.cjs [options]

Options:
  --help, -h    Show this help message
  --remote      Add remote repository (requires repository URL)

Examples:
  node setup-github.cjs
  node setup-github.cjs --remote https://github.com/username/prodify-ai-coach.git

This script will:
1. Initialize Git repository (if not already done)
2. Add all files to Git
3. Create initial commit
4. Provide instructions for GitHub setup
`);
  process.exit(0);
}

if (args.includes('--remote')) {
  const remoteIndex = args.indexOf('--remote');
  const remoteUrl = args[remoteIndex + 1];
  
  if (!remoteUrl) {
    log('❌ Please provide a repository URL with --remote option', 'red');
    process.exit(1);
  }
  
  main();
  
  // Add remote and push
  log('\n🔗 Adding remote repository...', 'blue');
  if (runCommand(`git remote add origin ${remoteUrl}`, 'Adding remote repository')) {
    if (runCommand('git branch -M main', 'Setting main branch')) {
      if (runCommand('git push -u origin main', 'Pushing to GitHub')) {
        log('\n🎉 Repository successfully pushed to GitHub!', 'green');
      }
    }
  }
} else {
  main();
} 