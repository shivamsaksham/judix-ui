#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const https = require('https');

const GITHUB_REPO = 'shivamsaksham/ui-comp-test';
const BASE_URL = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/components`;
const DEST_DIR = path.resolve(process.cwd(), 'components/ui');

async function fetchComponent(componentName) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}/${componentName}.tsx`;
    
    https.get(url, (res) => {
      if (res.statusCode === 404) {
        return reject(new Error(`Component ${componentName} not found in library`));
      }
      
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function installComponent(componentName) {
  try {
    // Create destination directory if it doesn't exist
    if (!fs.existsSync(DEST_DIR)) {
      fs.mkdirSync(DEST_DIR, { recursive: true });
    }

    const componentContent = await fetchComponent(componentName);
    const destPath = path.join(DEST_DIR, `${componentName}.tsx`);
    
    fs.writeFileSync(destPath, componentContent);
    console.log(`Successfully installed ${componentName} to ${destPath}`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

const componentName = process.argv[2];
if (!componentName) {
  console.log('Usage: ui-cli <component-name>');
  process.exit(1);
}

installComponent(componentName);
