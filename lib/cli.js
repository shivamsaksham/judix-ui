#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const GITHUB_REPO = 'shivamsaksham/judix-ui';
const BASE_URL = `https://raw.githubusercontent.com/${GITHUB_REPO}/main`;
const DEST_DIR = path.resolve(process.cwd(), 'src/components/ui');

// Component dependencies mapping
const COMPONENT_DEPS = {
  button: ['judix-icon@^1.0.4', 'class-variance-authority@^0.7.1' , 'tailwind-merge@^3.0.2']
};

async function installDependencies(componentName) {
  const deps = COMPONENT_DEPS[componentName] || [];
  if (deps.length > 0) {
    console.log('Installing dependencies...');
    execSync(`npm install ${deps.join(' ')}`, { stdio: 'inherit' });
  }
}

async function fetchComponent(componentName) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}/components/ui/${componentName}.tsx`;
    
    https.get(url, (res) => {
      // Handle GitHub rate limits
      if (res.statusCode === 403 && res.headers['x-ratelimit-remaining'] === '0') {
        const resetTime = new Date(res.headers['x-ratelimit-reset'] * 1000);
        return reject(new Error(
          `GitHub API rate limit exceeded. Please try again after ${resetTime.toLocaleTimeString()}`
        ));
      }

      if (res.statusCode === 404) {
        return reject(new Error(`Component ${componentName} not found in library`));
      }
      
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        // Check for version compatibility
        const versionMatch = data.match(/\/\/ @version (\d+\.\d+\.\d+)/);
        if (versionMatch) {
          const [_, version] = versionMatch;
          console.log(`Installing ${componentName} version ${version}`);
        }
        resolve(data);
      });
    }).on('error', reject);
  });
}

async function fetchComponentStyles(componentName) {
  try {
    const url = `${BASE_URL}/styles/${componentName}.css`;
    const res = await https.get(url);
    if (res.statusCode === 200) {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const stylePath = path.join(DEST_DIR, `${componentName}.css`);
        fs.writeFileSync(stylePath, data);
        console.log(`Installed ${componentName} styles`);
      });
    }
  } catch (error) {
    // Silently fail if styles don't exist
  }
}

async function installComponent(componentName) {
  try {
    // Create destination directory if it doesn't exist
    if (!fs.existsSync(DEST_DIR)) {
      fs.mkdirSync(DEST_DIR, { recursive: true });
    }


    // Fetch and install component
    const componentContent = await fetchComponent(componentName);
    const destPath = path.join(DEST_DIR, `${componentName}.tsx`);
    
    fs.writeFileSync(destPath, componentContent);
    console.log(`Successfully installed ${componentName} to ${destPath}`);

    // Install component styles if they exist
    await fetchComponentStyles(componentName);

    // Update Tailwind config
    updateTailwindConfig(componentName);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

function updateTailwindConfig(componentName) {
  const configPath = path.resolve(process.cwd(), 'tailwind.config.js');
  if (!fs.existsSync(configPath)) {
    console.warn('No tailwind.config.js found - skipping config update');
    return;
  }

  const config = require(configPath);
  if (!config.content) {
    config.content = [];
  }

  // Add component path to Tailwind content
  const componentPath = `./components/ui/${componentName}.tsx`;
  if (!config.content.includes(componentPath)) {
    config.content.push(componentPath);
    fs.writeFileSync(configPath, `module.exports = ${JSON.stringify(config, null, 2)}`);
    console.log('Updated Tailwind config to include component');
  }
}

function getAllDependencies() {
  const allDeps = new Set();
  for (const deps of Object.values(COMPONENT_DEPS)) {
    deps.forEach(dep => allDeps.add(dep));
  }
  return Array.from(allDeps);
}

async function initProject() {
  try {
    // Install all component dependencies
    const allDeps = getAllDependencies();
    if (allDeps.length > 0) {
      console.log('Installing all component dependencies...');
      execSync(`npm install ${allDeps.join(' ')}`, { stdio: 'inherit' });
    }

    // Create utils directory if it doesn't exist
    const utilsDir = path.resolve(process.cwd(), 'src/utils');
    if (!fs.existsSync(utilsDir)) {
      fs.mkdirSync(utilsDir, { recursive: true });
    }

    // Copy cn_tw_merger utility
    const mergerUrl = `${BASE_URL}/utils/cn_tw_merger.ts`;
    const mergerContent = await fetchFromUrl(mergerUrl);
    fs.writeFileSync(path.join(utilsDir, 'cn_tw_merger.ts'), mergerContent);
    console.log('Installed cn_tw_merger utility');

    // Copy global styles
    const stylesDir = path.resolve(process.cwd(), 'src/app');
    if (!fs.existsSync(stylesDir)) {
      fs.mkdirSync(stylesDir, { recursive: true });
    }

    const globalStylesUrl = `${BASE_URL}/src/style.css`;
    const globalStylesContent = await fetchFromUrl(globalStylesUrl);
    fs.writeFileSync(path.join(stylesDir, 'globals.css'), globalStylesContent);
    console.log('Installed global styles');

    // Update Tailwind config to include global styles
    updateTailwindConfig('globals');
  } catch (error) {
    console.error('Error during initialization:', error.message);
    process.exit(1);
  }
}

async function fetchFromUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 404) {
        return reject(new Error(`Resource not found at ${url}`));
      }
      
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

const command = process.argv[2];
if (!command) {
  console.log('Usage: ui-cli <command>');
  console.log('Commands:');
  console.log('  init       Initialize project with global styles and utilities');
  console.log('  <component> Install specific component');
  process.exit(1);
}

if (command === 'init') {
  initProject();
} else {
  installComponent(command);
}
