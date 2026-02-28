# Quick Optimization Guide - TravelSphere

## 🚀 Immediate Performance Improvements

### 1. Clean Build (Run This First!)
```bash
npm run optimize
```
This command:
- Cleans old build artifacts
- Reinstalls dependencies
- Creates optimized production build

### 2. Start Optimized Development Server
```bash
npm run dev
```
Now runs on port 5173 with:
- Fast Hot Module Replacement (HMR)
- Optimized file watching
- Better caching

### 3. Test Performance
```bash
npm run perf
```
This builds and previews the production version locally.

## ✅ What's Already Optimized

### Code Splitting
- ✅ All pages lazy-loaded
- ✅ Vendor chunks separated
- ✅ Feature-based chunking
- ✅ CSS code splitting

### Build Optimization
- ✅ Terser minification
- ✅ Tree shaking enabled
- ✅ Console.log removal in production
- ✅ Source maps for debugging

### Runtime Performance
- ✅ React Query caching (5min stale, 10min GC)
- ✅ Image lazy loading
- ✅ Network status monitoring
- ✅ Error boundaries
- ✅ Loading states

### Responsive Design
- ✅ Mobile-first CSS
- ✅ Breakpoints: 320px, 768px, 1024px
- ✅ Touch-friendly (44px minimum)
- ✅ Flexible Grid/Flexbox layouts

## 📊 Performance Monitoring

### Development Mode
A performance monitor widget appears in the bottom-right corner showing:
- **CLS** (Cumulative Layout Shift)
- **FID** (First Input Delay)
- **FCP** (First Contentful Paint)
- **LCP** (Largest Contentful Paint)
- **TTFB** (Time to First Byte)

Color coding:
- 🟢 Green = Good
- 🟡 Yellow = Needs Improvement
- 🔴 Red = Poor

### Production Testing
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Open Chrome DevTools > Lighthouse
# Run performance audit
```

## 🎯 Performance Targets

| Metric | Target | Current Status |
|--------|--------|----------------|
| FCP | < 1.8s | ✅ Optimized |
| LCP | < 2.5s | ✅ Optimized |
| FID | < 100ms | ✅ Optimized |
| CLS | < 0.1 | ✅ Optimized |
| TTI | < 3.5s | ✅ Optimized |

## 🔧 Additional Optimizations

### 1. Enable Compression (Server-side)
If deploying to your own server, add:

**Nginx:**
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

**Apache (.htaccess):**
```apache
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/css application/json application/javascript
</IfModule>
```

### 2. Add Cache Headers
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. Use CDN (Optional)
- Upload static assets to CDN
- Update asset URLs in build
- Enable HTTP/2

## 📱 Mobile Optimization

### Already Implemented
- ✅ Mobile-first CSS approach
- ✅ Touch-friendly buttons (44px minimum)
- ✅ Responsive images
- ✅ Optimized font loading
- ✅ Reduced motion support

### Test on Mobile
```bash
# Start dev server
npm run dev

# Access from mobile device on same network
# Use your computer's IP address
http://YOUR_IP:5173
```

## 🐛 Troubleshooting

### Slow Initial Load
```bash
# Clear cache and rebuild
npm run clean
npm run build
```

### Large Bundle Size
```bash
# Analyze bundle
npm run build:analyze

# Check for:
# - Duplicate dependencies
# - Unused imports
# - Heavy libraries
```

### Poor Performance in Dev
```bash
# Restart dev server
# Ctrl+C to stop
npm run dev
```

### Memory Issues
```bash
# Clear node modules and reinstall
rm -rf node_modules
npm install
```

## 📈 Monitoring in Production

### Web Vitals
Metrics are automatically logged to console in development.

### Custom Analytics
Add to your analytics platform:
```typescript
// Already implemented in src/hooks/usePerformance.ts
import { usePerformance } from '@/hooks/usePerformance';

// In your component
const { metrics } = usePerformance();
```

## 🎨 CSS Optimization

### Already Optimized
- ✅ CSS code splitting
- ✅ Minification
- ✅ Unused CSS removal
- ✅ Critical CSS inlined

### Best Practices
```css
/* Use CSS variables for theming */
:root {
  --primary-color: #2563eb;
  --secondary-color: #0891b2;
}

/* Avoid expensive properties */
/* ❌ Avoid */
box-shadow: 0 0 10px rgba(0,0,0,0.5);

/* ✅ Better */
box-shadow: 0 2px 4px rgba(0,0,0,0.1);
```

## 🚦 Quick Performance Checklist

Before deploying:
- [ ] Run `npm run build` successfully
- [ ] Test with `npm run preview`
- [ ] Run Lighthouse audit (score > 90)
- [ ] Test on mobile device
- [ ] Check bundle size (< 200KB initial)
- [ ] Verify all images are optimized
- [ ] Test with slow 3G network
- [ ] Check console for errors

## 📚 Resources

- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Vite Performance](https://vitejs.dev/guide/performance.html)

## 🆘 Need Help?

1. Check `PERFORMANCE_OPTIMIZATION.md` for detailed guide
2. Review `API_CREDENTIALS.md` for API setup
3. See `README.md` for general documentation

---

**Quick Commands:**
```bash
npm run dev          # Start development
npm run build        # Build for production
npm run preview      # Preview production build
npm run optimize     # Clean and rebuild
npm run perf         # Build and preview
npm test             # Run tests
npm run lint         # Check code quality
```

**Last Updated:** February 28, 2026
