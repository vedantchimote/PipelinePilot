# Manual Testing Guide

This guide will help you test the GitLab CI/CD Visual Editor to ensure everything works correctly.

## Prerequisites

- Development server running: `npm run dev`
- Browser: Chrome, Firefox, or Edge
- Access to: http://localhost:5173/

## Test Scenarios

### 1. First Launch Experience

**Steps:**
1. Open http://localhost:5173/ in a fresh browser (or clear localStorage)
2. Verify welcome overlay appears
3. Click "Start from Scratch"
4. Verify welcome overlay closes and canvas is empty

**Expected Result:**
- Welcome overlay displays with 4 options
- Canvas is empty after clicking "Start from Scratch"
- No console errors

---

### 2. Add Job to Canvas

**Steps:**
1. Click "Add Job" button in toolbar
2. Verify new job appears on canvas
3. Click the job to select it
4. Verify Property Panel opens on the right

**Expected Result:**
- Job appears with default name "job_1"
- Job is in "test" stage
- Property Panel shows job configuration
- No console errors

---

### 3. Edit Job Configuration

**Steps:**
1. With Property Panel open, change job name to "build-app"
2. Change stage to "build"
3. Change script to:
   ```
   npm install
   npm run build
   ```
4. Click "Save"
5. Verify changes appear on canvas

**Expected Result:**
- Job name updates to "build-app"
- Stage badge shows "build"
- Script shows "2 line(s)"
- YAML preview updates in real-time
- No console errors

---

### 4. Create Job Dependency

**Steps:**
1. Add another job (should be "job_2")
2. Rename it to "test-app" in stage "test"
3. Drag from bottom handle of "build-app" to top handle of "test-app"
4. Verify edge is created

**Expected Result:**
- Arrow connects build-app → test-app
- YAML preview shows "needs: [build-app]" in test-app
- No console errors

---

### 5. Test Circular Dependency Prevention

**Steps:**
1. Try to create edge from "test-app" back to "build-app"
2. Verify circular dependency modal appears
3. Click "Got it" to close modal

**Expected Result:**
- Modal shows cycle path: build-app → test-app → build-app
- Edge is NOT created
- Modal explains circular dependencies
- No console errors

---

### 6. YAML Preview Real-Time Update

**Steps:**
1. Select "build-app" job
2. Add a variable: `NODE_ENV = production`
3. Watch YAML preview on right side
4. Verify it updates immediately

**Expected Result:**
- YAML shows variables section under build-app
- Update happens within 200ms
- Syntax highlighting works
- No console errors

---

### 7. Export YAML

**Steps:**
1. Click "Export" button in toolbar
2. Verify file downloads as ".gitlab-ci.yml"
3. Open file in text editor
4. Verify it contains valid YAML with your jobs

**Expected Result:**
- File downloads successfully
- YAML is properly formatted
- Contains stages, jobs, and configuration
- No console errors

---

### 8. Import YAML

**Steps:**
1. Click "Import" button
2. Select a valid .gitlab-ci.yml file
3. Verify jobs appear on canvas
4. Verify YAML preview matches imported file

**Expected Result:**
- Jobs render on canvas with auto-layout
- Dependencies are created correctly
- YAML preview matches imported content
- No console errors

---

### 9. Import Invalid YAML

**Steps:**
1. Create a file with invalid YAML (e.g., missing colon)
2. Click "Import" and select the invalid file
3. Verify error modal appears

**Expected Result:**
- Error modal shows with line/column number
- Error message is descriptive
- Code snippet highlights the error
- Suggestions are provided
- No console errors (error is handled)

---

### 10. Template Library

**Steps:**
1. Click template library icon in toolbar
2. Verify library opens from left
3. Search for "node"
4. Verify example templates appear
5. Click a template card
6. Verify job is added to canvas

**Expected Result:**
- Library slides in from left
- Search filters templates
- Templates show name, description, category
- Clicking adds job to canvas
- No console errors

---

### 11. Undo/Redo

**Steps:**
1. Add a job
2. Press Ctrl+Z (undo)
3. Verify job disappears
4. Press Ctrl+Y (redo)
5. Verify job reappears

**Expected Result:**
- Undo removes the job
- Redo brings it back
- Undo/Redo buttons update state
- No console errors

---

### 12. Auto-Save and Restore

**Steps:**
1. Create a pipeline with 2-3 jobs
2. Wait 30 seconds (auto-save triggers)
3. Check browser console for "💾 Auto-save completed"
4. Refresh the page
5. Verify pipeline is restored

**Expected Result:**
- Console shows auto-save message
- After refresh, pipeline is restored
- All jobs and dependencies are intact
- No console errors

---

### 13. Validation Status

**Steps:**
1. Create a job with missing script
2. Observe validation status in toolbar
3. Add script to job
4. Observe validation status change

**Expected Result:**
- Status shows "Invalid" with error count
- Invalid job has red border
- After fixing, status shows "Valid"
- Status transitions smoothly
- No console errors

---

### 14. Keyboard Shortcuts

**Steps:**
1. Press Ctrl+/ to open shortcuts panel
2. Verify all shortcuts are listed
3. Press Escape to close
4. Test each shortcut:
   - Ctrl+Z (undo)
   - Ctrl+Y (redo)
   - Ctrl+S (save)
   - Ctrl+E (export)
   - Delete (remove selected job)

**Expected Result:**
- Shortcuts panel opens/closes
- All shortcuts work as expected
- Visual feedback for each action
- No console errors

---

### 15. Accessibility - Keyboard Navigation

**Steps:**
1. Press Tab repeatedly
2. Verify focus moves through all interactive elements
3. Verify focus indicators are visible
4. Press Enter on focused button
5. Verify action executes

**Expected Result:**
- Tab order is logical
- Focus indicators are clearly visible (blue outline)
- All buttons are keyboard accessible
- No console errors

---

### 16. Error Boundary

**Steps:**
1. Open browser DevTools Console
2. Type: `throw new Error("Test error")`
3. Verify error boundary catches it

**Expected Result:**
- Error boundary shows friendly message
- "Reset Application" button appears
- Error details shown in dev mode
- Application doesn't crash completely

---

### 17. Offline Mode

**Steps:**
1. Open DevTools → Network tab
2. Set to "Offline"
3. Observe offline banner appears
4. Try to open Template Library
5. Verify offline message shows

**Expected Result:**
- Yellow offline banner appears at top
- Template Library shows offline message
- Can still edit and export
- No console errors (handled gracefully)

---

### 18. Performance - Large Pipeline

**Steps:**
1. Open browser DevTools Console
2. Run benchmark: `npm run benchmark` in terminal
3. Verify all benchmarks pass
4. In app, add 20+ jobs
5. Observe canvas performance

**Expected Result:**
- Benchmark shows <100ms for 100 jobs
- Canvas remains smooth (60fps)
- No lag when dragging jobs
- Console may show performance logs in dev mode

---

### 19. Animations

**Steps:**
1. Open Property Panel (select a job)
2. Observe slide-in animation from right
3. Open Template Library
4. Observe slide-in animation from left
5. Open any modal
6. Observe fade-in and scale-in animations

**Expected Result:**
- Property Panel slides in smoothly (0.3s)
- Template Library slides in smoothly (0.3s)
- Modals fade and scale in (0.2s)
- Animations are smooth, not janky
- No console errors

---

### 20. Mobile/Responsive (Optional)

**Steps:**
1. Open DevTools → Toggle device toolbar
2. Select mobile device (e.g., iPhone 12)
3. Verify layout adapts
4. Test basic interactions

**Expected Result:**
- Layout doesn't break
- Text is readable
- Buttons are tappable
- May not be fully optimized (desktop-first design)

---

## Common Issues to Check

### Console Errors
- Open DevTools Console (F12)
- Look for red error messages
- All errors should be handled gracefully

### Memory Leaks
- Open DevTools → Performance → Memory
- Record while using app
- Check for increasing memory usage
- Should be stable after initial load

### Network Requests
- Open DevTools → Network tab
- Verify no failed requests (except when testing offline)
- GitLab API calls should be debounced (500ms)

### LocalStorage
- Open DevTools → Application → Local Storage
- Verify `pipeline_autosave` key exists after 30s
- Verify `pipeline_autosave_timestamp` is updated

---

## Bug Reporting Template

If you find a bug, report it with:

```
**Bug Description:**
[What happened]

**Steps to Reproduce:**
1. [First step]
2. [Second step]
3. [etc.]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happened]

**Console Errors:**
[Any errors from DevTools Console]

**Browser:**
[Chrome/Firefox/Safari + version]

**Screenshots:**
[If applicable]
```

---

## Success Criteria

✅ All 20 test scenarios pass
✅ No console errors during normal usage
✅ Performance benchmarks pass
✅ Animations are smooth
✅ Keyboard navigation works
✅ Error handling is graceful
✅ Auto-save and restore work
✅ Import/Export work correctly

---

## Next Steps After Testing

1. **If bugs found:** Report them using the template above
2. **If all tests pass:** Application is ready for deployment
3. **Optional:** Run automated tests with `npm run test`
4. **Optional:** Run E2E tests with `npm run test:e2e`

---

**Happy Testing! 🚀**
