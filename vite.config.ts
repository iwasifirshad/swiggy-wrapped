import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false, // Force all CSS into a single file
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, 'index.tsx'),
      },
      output: {
        entryFileNames: '[name].js',
        // CRITICAL FIX: Force the CSS file to be named 'swiggy.css'
        assetFileNames: 'swiggy.css',
        format: 'iife', 
        name: 'SwiggyWrapped',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});