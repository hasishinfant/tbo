import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/tbo/' : '/', // Use /tbo/ for production, / for dev
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    // Enable HTTP/2 for better performance
    https: false,
    // Improve HMR performance
    hmr: {
      overlay: true,
    },
    // Faster file watching
    watch: {
      usePolling: false,
    },
  },
  build: {
    // Performance optimizations
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          query: ['@tanstack/react-query'],
          axios: ['axios'],
          // Separate feature chunks for lazy loading
          'destination-features': [
            './src/components/destination/DestinationCard.tsx',
            './src/components/destination/DestinationGrid.tsx',
            './src/components/destination/VRModal.tsx'
          ],
          'trip-planner-features': [
            './src/components/trip-planner/TripPlannerForm.tsx',
            './src/components/trip-planner/DestinationDropdown.tsx',
            './src/components/trip-planner/BudgetSelector.tsx',
            './src/components/trip-planner/DateRangePicker.tsx',
            './src/components/trip-planner/InterestSelector.tsx'
          ],
          'chat-features': [
            './src/components/chat/ChatContainer.tsx',
            './src/components/chat/ChatInput.tsx',
            './src/components/chat/QuickSuggestions.tsx'
          ],
          'itinerary-features': [
            './src/components/itinerary/ItineraryTimeline.tsx',
            './src/components/itinerary/DayCard.tsx'
          ]
        },
      },
    },
    // Enable source maps for debugging
    sourcemap: true,
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
    // Enable CSS code splitting
    cssCodeSplit: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'axios',
    ],
    // Exclude heavy dependencies from pre-bundling
    exclude: ['web-vitals'],
  },
  // Enable experimental features for better performance
  esbuild: {
    // Remove unused imports
    treeShaking: true,
    // Drop console and debugger in production
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
  // Performance hints
  preview: {
    port: 4173,
    open: true,
  },
}))