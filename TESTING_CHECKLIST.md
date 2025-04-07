# Manual Testing Checklist

This checklist covers all critical functionality that should be manually tested before release.

## Browser Compatibility

Test in the following browsers:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest, macOS only)
- [ ] Edge (latest)

## Core Functionality

### Canvas Operations

- [ ] Add new job to canvas
- [ ] Select job by clicking
- [ ] Move job by dragging
- [ ] Delete job with Delete key
- [ ] Delete job with confirmation dialog
- [ ] Create dependency by connecting nodes
- [ ] Delete dependency by selecting edge and pressing Delete
- [ ] Zoom in/out with mouse wheel
- [ ] Pan canvas by dragging background
- [ ] Reset viewport with fit view button

### Job Configuration

- [ ] Open Property Panel by selecting job
- [ ] Edit job name
- [ ] Change job stage
- [ ] Add/edit script lines
- [ ] Configure Docker image
- [ ] Add/edit variables
- [ ] Configure cache settings
- [ ] Configure artifacts
- [ ] Add/edit rules
- [ ] Configure trigger job
- [ ] Toggle allow_failure
- [ ] Save changes
- [ ] Close Property Panel

### YAML Preview

- [ ] YAML updates in real-time when editing
- [ ] YAML syntax highlighting works
- [ ] YAML is properly formatted
- [ ] Anchors/aliases are generated for repeated config
- [ ] Jobs are ordered by stage

### Import/Export

- [ ] Import valid YAML file
- [ ] Import shows error for invalid YAML
- [ ] Export YAML file downloads correctly
- [ ] Export JSON file downloads correctly
- [ ] Imported pipeline renders correctly on canvas

### Template Library

- [ ] Open Template Library
- [ ] Search templates by name
- [ ] Filter by category
- [ ] Filter by source (official, custom, example)
- [ ] Drag template onto canvas
- [ ] Template creates job with correct configuration
- [ ] Save custom template
- [ ] Custom template appears in library
- [ ] Close Template Library

### Validation

- [ ] Validation status shows "Validating..." during check
- [ ] Validation status shows "Valid" for correct pipeline
- [ ] Validation status shows errors for invalid pipeline
- [ ] Invalid jobs highlighted on canvas
- [ ] Error messages displayed in tooltips
- [ ] Validation status shows "Offline" when API unreachable

### Undo/Redo

- [ ] Undo with Ctrl+Z
- [ ] Redo with Ctrl+Y
- [ ] Undo button disabled when no history
- [ ] Redo button disabled when no future
- [ ] Undo/redo works for all operations

### Persistence

- [ ] Pipeline auto-saves to localStorage
- [ ] Pipeline restored on page reload
- [ ] "Restored from auto-save" notification shown
- [ ] Manual save with Ctrl+S
- [ ] Save notification appears

### Error Handling

- [ ] Circular dependency prevented
- [ ] Circular dependency modal shows cycle path
- [ ] YAML parse error modal shows line/column
- [ ] YAML parse error modal shows suggestions
- [ ] Offline banner appears when API unreachable
- [ ] localStorage quota exceeded handled gracefully
- [ ] Error boundary catches React errors

## Keyboard Shortcuts

Test all keyboard shortcuts:

- [ ] Ctrl+Z - Undo
- [ ] Ctrl+Y - Redo
- [ ] Ctrl+S - Save
- [ ] Delete - Remove selected job
- [ ] Ctrl+E - Export YAML
- [ ] Ctrl+/ - Show keyboard shortcuts
- [ ] Escape - Close panels/modals

## First-Time User Experience

- [ ] Welcome overlay appears on first visit
- [ ] "Start from Scratch" creates empty pipeline
- [ ] "Use Template" opens Template Library
- [ ] "Import YAML" opens file picker
- [ ] "Hello World" creates example pipeline
- [ ] "Don't show again" checkbox works
- [ ] Tooltips appear on hover

## Accessibility

### Keyboard Navigation

- [ ] All buttons accessible with Tab
- [ ] Focus indicators visible
- [ ] Tab order is logical
- [ ] Escape closes modals
- [ ] Enter activates buttons

### Screen Reader

- [ ] ARIA labels present on interactive elements
- [ ] Validation status announced
- [ ] Error messages announced
- [ ] Modal dialogs announced
- [ ] Canvas operations announced

### Color Contrast

- [ ] All text meets WCAG AA contrast (4.5:1)
- [ ] UI components meet WCAG AA contrast (3:1)
- [ ] Error states clearly visible
- [ ] Focus indicators clearly visible

## Performance

### Large Pipelines

Test with 50+ jobs:

- [ ] Canvas renders smoothly (60fps)
- [ ] YAML generation < 100ms
- [ ] Auto-save < 20ms
- [ ] No lag when dragging jobs
- [ ] No lag when selecting jobs

### Benchmarks

- [ ] Run `npm run benchmark`
- [ ] All benchmarks pass
- [ ] YAML generation (100 jobs) < 100ms

## Edge Cases

### Empty States

- [ ] Empty canvas shows helpful message
- [ ] Empty Template Library shows message
- [ ] No validation errors shows "Valid"

### Invalid Data

- [ ] Invalid job name rejected
- [ ] Duplicate job name rejected
- [ ] Invalid Docker image format rejected
- [ ] Invalid artifact path rejected
- [ ] Invalid cache key rejected

### Network Issues

- [ ] Offline mode works correctly
- [ ] Template fetching fails gracefully
- [ ] Validation fails gracefully
- [ ] Can continue editing offline

### localStorage Issues

- [ ] Quota exceeded handled
- [ ] Corrupted data handled
- [ ] Version mismatch handled
- [ ] Recovery options work

## Visual Polish

### Animations

- [ ] Property Panel slides in from right
- [ ] Template Library slides in from left
- [ ] Modals fade in
- [ ] Validation status transitions smoothly
- [ ] Loading spinners animate

### Loading States

- [ ] Validation shows spinner
- [ ] Template Library shows skeleton loaders
- [ ] Import shows loading state

### Responsive Design

- [ ] Layout works on 1920x1080
- [ ] Layout works on 1366x768
- [ ] Layout works on 1280x720
- [ ] Panels don't overflow
- [ ] Text doesn't truncate unexpectedly

## Integration

### GitLab API

- [ ] Validation request sent correctly
- [ ] Validation response parsed correctly
- [ ] Template fetching works
- [ ] API errors handled gracefully

### localStorage

- [ ] Pipeline saved correctly
- [ ] Pipeline loaded correctly
- [ ] Custom templates saved
- [ ] Custom templates loaded

## Final Checks

- [ ] No console errors
- [ ] No console warnings (except expected)
- [ ] No TypeScript errors
- [ ] Production build succeeds
- [ ] All tests pass
- [ ] Documentation is accurate
- [ ] README is up to date

## Notes

Use this section to document any issues found during testing:

---

## Sign-off

- [ ] All critical functionality tested
- [ ] All browsers tested
- [ ] All accessibility features tested
- [ ] All performance targets met
- [ ] Ready for release

Tested by: _______________
Date: _______________
