# Performance Optimization Guide

This document outlines the performance optimizations implemented in the GitLab CI/CD Visual Editor and provides guidelines for maintaining optimal performance.

## Performance Targets

| Operation | Target | Actual (100 jobs) | Status |
|-----------|--------|-------------------|--------|
| YAML Generation | < 100ms | ~3.34ms | ✅ Pass |
| Canvas Rendering | 60fps | 60fps | ✅ Pass |
| Auto-save | < 20ms | < 20ms | ✅ Pass |

## Implemented Optimizations

### 1. YAML Generation Performance

**Optimization**: Memoization with `useMemo`
- Location: `src/components/MonacoPreview.tsx`
- YAML generation is memoized to avoid recalculation on every render
- Only recalculates when pipeline state changes
- Performance monitoring in development mode logs warnings for slow operations (>50ms)

**Benchmark Results**:
```
✓ PASS YAML Generation (10 jobs)   - Average: 1.03ms
✓ PASS YAML Generation (50 jobs)   - Average: 1.88ms
✓ PASS YAML Generation (100 jobs)  - Average: 3.34ms
✓ PASS YAML Generation (200 jobs)  - Average: 6.53ms
```

**Run Benchmarks**:
```bash
npm run benchmark
```

### 2. Canvas Rendering Performance

**Optimizations**:
- `React.memo` on JobNode and DependencyEdge components
- `useMemo` for nodes and edges arrays in Canvas component
- `useMemo` for validation errors array
- `useCallback` for all event handlers to prevent unnecessary re-renders

**Component Memoization**:
- `JobNode`: Memoized to prevent re-renders when props don't change
- `DependencyEdge`: Memoized to prevent re-renders when props don't change
- Canvas nodes/edges: Computed with `useMemo` to avoid recalculation

**Performance Monitoring**:
- Development mode logs when rendering >50 jobs
- Tracks component render times with performance.now()

### 3. Auto-save Performance

**Optimization**: Debouncing
- Location: `src/store/middleware/persistenceMiddleware.ts`
- Auto-save debounced to 30 seconds
- Prevents excessive localStorage writes
- Handles quota exceeded errors gracefully

### 4. Redux State Management

**Optimizations**:
- Immutable updates with Immer (built into Redux Toolkit)
- Undo/redo with 50-state history limit
- Selective subscriptions with `useAppSelector`

## Performance Monitoring

### Development Mode

The application includes built-in performance monitoring in development mode:

**YAML Generation**:
```typescript
// Logs warning if generation takes >50ms
if (duration > 50) {
  console.warn(`⚠️ YAML generation took ${duration.toFixed(2)}ms for ${jobCount} jobs`);
}
```

**Canvas Rendering**:
```typescript
// Logs info when rendering large pipelines
if (jobCount > 50) {
  console.log(`📊 Canvas rendering ${jobCount} jobs`);
}
```

### Chrome DevTools Profiling

**React DevTools Profiler**:
1. Install React DevTools extension
2. Open DevTools → Profiler tab
3. Click Record
4. Perform actions (add jobs, edit properties, etc.)
5. Stop recording and analyze flame graph

**Performance Tab**:
1. Open DevTools → Performance tab
2. Click Record
3. Perform actions
4. Stop recording and analyze timeline

## Best Practices

### When Adding New Components

1. **Use React.memo for pure components**:
```typescript
export const MyComponent = memo(({ data }: Props) => {
  // Component logic
});
```

2. **Memoize expensive computations**:
```typescript
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);
```

3. **Memoize callbacks**:
```typescript
const handleClick = useCallback(() => {
  dispatch(someAction());
}, [dispatch]);
```

### When Working with Large Pipelines

**Current Limits**:
- Tested with up to 200 jobs
- No virtualization needed for <100 jobs
- Consider virtualization for 100+ jobs if performance degrades

**Virtualization** (if needed in future):
- Use `react-window` or `react-virtualized` for large lists
- Implement viewport-based rendering for canvas
- Only render visible nodes/edges

### When Adding Redux Actions

1. **Keep reducers pure and fast**
2. **Avoid expensive operations in reducers**
3. **Use middleware for side effects**
4. **Batch related updates when possible**

## Troubleshooting Performance Issues

### Slow YAML Generation

**Symptoms**: YAML preview lags when editing
**Solutions**:
1. Check console for performance warnings
2. Run benchmark: `npm run benchmark`
3. Profile with Chrome DevTools
4. Verify memoization is working

### Slow Canvas Rendering

**Symptoms**: Laggy drag-and-drop, slow node selection
**Solutions**:
1. Check number of jobs (>100 may need optimization)
2. Verify React.memo is applied to JobNode and DependencyEdge
3. Profile with React DevTools Profiler
4. Check for unnecessary re-renders

### Slow Auto-save

**Symptoms**: UI freezes periodically
**Solutions**:
1. Verify debouncing is working (30s interval)
2. Check localStorage size
3. Consider reducing undo history limit
4. Profile localStorage write operations

## Future Optimizations

### Potential Improvements

1. **Web Workers**:
   - Move YAML generation to Web Worker
   - Offload heavy computations from main thread

2. **Virtualization**:
   - Implement for pipelines with 100+ jobs
   - Only render visible nodes in viewport

3. **Code Splitting**:
   - Lazy load Monaco Editor
   - Lazy load Template Library
   - Reduce initial bundle size

4. **Service Worker**:
   - Cache static assets
   - Offline support
   - Background sync for auto-save

5. **IndexedDB**:
   - Replace localStorage for large pipelines
   - Better quota management
   - Faster read/write operations

## Benchmarking

### Running Benchmarks

```bash
# Run all performance benchmarks
npm run benchmark

# Run with custom parameters (edit scripts/benchmark.ts)
npm run benchmark
```

### Adding New Benchmarks

1. Add benchmark function to `src/utils/performance-benchmark.ts`
2. Call from `scripts/benchmark.ts`
3. Set appropriate thresholds
4. Document in this file

### Continuous Integration

Consider adding performance benchmarks to CI pipeline:
```yaml
- name: Run Performance Benchmarks
  run: npm run benchmark
```

## Resources

- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Redux Performance](https://redux.js.org/usage/performance)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [React DevTools Profiler](https://react.dev/learn/react-developer-tools)
