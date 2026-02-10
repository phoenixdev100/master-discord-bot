#!/usr/bin/env node

/**
 * Fix Ephemeral Deprecation Script
 * 
 * Replaces all instances of `ephemeral: true` with `flags: MessageFlags.Ephemeral`
 * and adds the MessageFlags import where needed.
 */

const fs = require('fs');
const path = require('path');

const commandsDir = path.join(__dirname, '..', 'apps', 'bot', 'src', 'commands');

function getAllTsFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            files.push(...getAllTsFiles(fullPath));
        } else if (item.endsWith('.ts')) {
            files.push(fullPath);
        }
    }

    return files;
}

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Check if file uses ephemeral: true
    if (!content.includes('ephemeral: true')) {
        return false;
    }

    // Check if MessageFlags is already imported
    const hasMessageFlags = content.includes('MessageFlags');

    // Add MessageFlags to import if needed
    if (!hasMessageFlags) {
        // Find the discord.js import line
        const importRegex = /import\s+{([^}]+)}\s+from\s+['"]discord\.js['"]/;
        const match = content.match(importRegex);

        if (match) {
            const imports = match[1];
            const newImports = imports.trim() + ', MessageFlags';
            content = content.replace(importRegex, `import { ${newImports} } from 'discord.js'`);
        }
    }

    // Replace ephemeral: true with flags: MessageFlags.Ephemeral
    content = content.replace(/ephemeral:\s*true/g, 'flags: MessageFlags.Ephemeral');

    // Only write if content changed
    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    }

    return false;
}

// Main execution
console.log('🔧 Fixing ephemeral deprecation warnings...\n');

const files = getAllTsFiles(commandsDir);
let fixedCount = 0;

for (const file of files) {
    if (fixFile(file)) {
        fixedCount++;
        console.log(`✅ Fixed: ${path.relative(process.cwd(), file)}`);
    }
}

console.log(`\n✨ Done! Fixed ${fixedCount} file(s).`);
