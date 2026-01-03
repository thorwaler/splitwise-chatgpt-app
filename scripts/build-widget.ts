/**
 * Widget Build Script
 * 
 * Bundles the React widget into a single JavaScript file
 * for embedding in the ChatGPT interface.
 */

import * as esbuild from 'esbuild';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

async function buildWidget() {
  console.log('🏗️  Building Splitwise widget...');

  try {
    // Bundle the widget
    const result = await esbuild.build({
      entryPoints: ['src/web/index.tsx'],
      bundle: true,
      minify: true,
      sourcemap: false,
      target: 'es2020',
      format: 'iife',
      globalName: 'SplitwiseWidget',
      outfile: 'public/widget.js',
      loader: {
        '.tsx': 'tsx',
        '.ts': 'ts',
        '.css': 'text',
      },
      define: {
        'process.env.NODE_ENV': '"production"',
      },
      external: [],
    });

    console.log('✅ Widget JavaScript bundled successfully');

    // Read the CSS
    const css = readFileSync('src/web/styles.css', 'utf-8');

    // Create the widget HTML template
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Splitwise ChatGPT Widget</title>
  <style>
    ${css}
    
    /* Additional widget-specific styles */
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    #splitwise-widget-root {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <div id="splitwise-widget-root"></div>
  <script src="/widget.js"></script>
</body>
</html>`;

    // Write HTML file
    writeFileSync('public/widget.html', html);
    console.log('✅ Widget HTML created successfully');

    // Create standalone bundle with inline styles
    const js = readFileSync('public/widget.js', 'utf-8');
    const standalone = `
(function() {
  // Inject styles
  const style = document.createElement('style');
  style.textContent = \`${css}\`;
  document.head.appendChild(style);
  
  // Run widget code
  ${js}
})();
`;

    writeFileSync('public/widget-standalone.js', standalone);
    console.log('✅ Standalone widget bundle created');

    console.log('\n📦 Build complete!');
    console.log('   - public/widget.html (HTML template)');
    console.log('   - public/widget.js (JavaScript bundle)');
    console.log('   - public/widget-standalone.js (Self-contained bundle)');
    
    if (result.errors.length > 0) {
      console.error('❌ Build errors:', result.errors);
      process.exit(1);
    }

    if (result.warnings.length > 0) {
      console.warn('⚠️  Build warnings:', result.warnings);
    }

  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildWidget();
