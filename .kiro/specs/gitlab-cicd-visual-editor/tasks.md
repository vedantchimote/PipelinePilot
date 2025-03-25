# Implementation Plan: GitLab CI/CD Pipeline Visual Editor

## Overview

This implementation plan breaks down the GitLab CI/CD Pipeline Visual Editor into discrete coding tasks. The application is a React-based web application with TypeScript that provides a visual node-based interface for composing GitLab CI/CD pipelines with bidirectional YAML synchronization.

The implementation follows a bottom-up approach: core data models and state management first, then the YAML engine, followed by UI components (canvas, property panel, preview), and finally integration features (GitLab API, templates, persistence).

## Tasks

- [x] 1. Project setup and core infrastructure
  - Initialize React + TypeScript project with Vite
  - Install dependencies: React Flow, Redux Toolkit, js-yaml, Monaco Editor, Tailwind CSS, Axios
  - Configure Tailwind CSS with dark mode and custom GitLab color palette
  - Set up ESLint and Prettier for code quality
  - Configure Jest and React Testing Library for unit tests
  - Configure fast-check for property-based testing
  - Set up Playwright for E2E tests
  - Create basic project structure (src/components, src/store, src/engine, src/types, src/utils)
  - _Requirements: All (foundational)_

- [x] 2. Define TypeScript interfaces and data models
  - [x] 2.1 Create core type definitions
    - Define Pipeline_State, Job_Node_Config, Variable, CacheConfig, ArtifactsConfig, Rule, TriggerConfig, RetryConfig, NodePosition interfaces
    - Define ValidationResult, AnchorMap, LintResult, Template interfaces
    - Create types file (src/types/pipeline.ts)
    - _Requirements: 1.1, 2.1, 4.1_

  - [x] 2.2 Create Redux store structure
    - Define RootState interface with pipeline, ui, templates, and persistence slices
    - Set up Redux store with Redux Toolkit configureStore
    - Configure redux-undo for pipeline slice (50 state history limit)
    - _Requirements: 10.4, 10.5_

  - [x] 2.3 Create Redux action creators and reducers
    - Implement pipeline actions: addJob, updateJob, deleteJob, moveJob, addDependency, removeDependency, importYAML, exportYAML, clearPipeline
    - Implement UI actions: selectNode, setValidationStatus, setValidationErrors, setTheme
    - Implement reducers for all actions with immutable updates
    - _Requirements: 1.2, 2.3, 8.3, 10.1_

- [x] 3. Implement YAML_Engine for bidirectional conversion
  - [x] 3.1 Implement YAML to Pipeline_State parser
    - Parse YAML string using js-yaml library
    - Extract jobs, stages, and global configuration
    - Build dependency graph from "needs" and stage ordering
    - Generate UI metadata with auto-layout algorithm
    - Handle YAML parsing errors with detailed error messages
    - _Requirements: 4.7, 7.2, 7.3, 7.6_

  - [ ]* 3.2 Write property test for YAML round-trip semantic preservation
    - **Property 6: YAML Round-Trip Semantic Preservation**
    - **Validates: Requirements 4.6, 4.7, 7.2**

  - [ ]* 3.3 Write property test for comment preservation
    - **Property 7: Comment Preservation in Round-Trip**
    - **Validates: Requirements 7.5**

  - [x] 3.4 Implement Pipeline_State to YAML converter
    - Remove UI-specific metadata from Pipeline_State
    - Detect repeated configuration blocks for anchor generation
    - Generate YAML anchors and aliases for optimization
    - Order jobs by stage and dependencies
    - Serialize to YAML string with js-yaml
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ]* 3.5 Write property test for YAML generation validity
    - **Property 3: YAML Generation Validity**
    - **Validates: Requirements 4.1, 4.2, 8.5, 11.7, 12.5, 13.4**

  - [ ]* 3.6 Write property test for anchor/alias optimization
    - **Property 4: YAML Anchor/Alias Optimization**
    - **Validates: Requirements 4.3, 4.4**

  - [ ]* 3.7 Write property test for job ordering by stage
    - **Property 5: Job Ordering by Stage**
    - **Validates: Requirements 4.5**

  - [x] 3.8 Implement auto-layout algorithm
    - Position jobs within stage swim lanes
    - Calculate horizontal spacing based on jobs per stage
    - Calculate vertical spacing based on stage index
    - Return node positions as Record<string, NodePosition>
    - _Requirements: 1.1, 7.3_

  - [x] 3.9 Implement anchor detection algorithm
    - Collect cache, variables, before_script, after_script configurations
    - Identify blocks used by 2+ jobs using JSON stringification
    - Generate anchor names (cache_0, variables_0, etc.)
    - Return AnchorMap with config and usedBy job IDs
    - _Requirements: 4.3, 4.4_

- [x] 4. Implement dependency graph management
  - [x] 4.1 Create dependency graph utilities
    - Implement cycle detection using depth-first search
    - Implement referential integrity validation
    - Implement cascade deletion for edges when job is deleted
    - Create utility functions: detectCycle, validateDependencies, removeJobDependencies
    - _Requirements: 1.5, 8.1, 8.2, 8.3_

  - [ ]* 4.2 Write property test for DAG acyclicity invariant
    - **Property 1: DAG Acyclicity Invariant**
    - **Validates: Requirements 1.5, 8.1**

  - [ ]* 4.3 Write property test for dependency referential integrity
    - **Property 9: Dependency Referential Integrity**
    - **Validates: Requirements 8.2**

  - [ ]* 4.4 Write property test for cascade deletion of edges
    - **Property 10: Cascade Deletion of Edges**
    - **Validates: Requirements 8.3**

  - [ ]* 4.5 Write property test for edge creation state update
    - **Property 14: Edge Creation State Update**
    - **Validates: Requirements 1.4**

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement Canvas component with React Flow
  - [x] 6.1 Create JobNode component
    - Render job name, stage, and key properties
    - Apply styling based on state (selected, error, trigger job)
    - Display error indicator when hasErrors is true
    - Use Tailwind CSS with dark mode classes
    - _Requirements: 1.1, 14.1, 14.3_

  - [x] 6.2 Create DependencyEdge component
    - Render directed arrows with bezier curves
    - Apply color based on validity (gray for normal, red for invalid)
    - Add optional labels for dependency type
    - _Requirements: 1.3, 1.4_

  - [x] 6.3 Create Canvas container component
    - Integrate React Flow with custom node and edge types
    - Handle node position changes and dispatch to Redux
    - Handle node clicks and dispatch selectNode action
    - Handle edge creation with cycle detection
    - Handle edge deletion and dispatch removeDependency action
    - Handle node deletion with confirmation
    - Implement zoom and pan controls
    - Display stage swim lanes as background
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 8.1_

  - [x] 6.4 Implement drag-and-drop for job creation
    - Add "Add Job" button that creates new job at center of viewport
    - Support dragging templates from Template Library onto canvas
    - Generate unique job IDs and names on creation
    - _Requirements: 1.1, 6.3_

  - [ ]* 6.5 Write unit tests for Canvas components
    - Test JobNode rendering with various props
    - Test edge creation and deletion
    - Test node selection and position updates
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 7. Implement Property Panel for job configuration
  - [x] 7.1 Create PropertyPanel container component
    - Display panel when job is selected
    - Close panel when user clicks close button or outside panel
    - Organize form fields into sections (Basic, Scripts, Artifacts, Cache, Variables, Rules, Advanced)
    - Use Tailwind CSS for dark mode styling
    - _Requirements: 2.1, 2.7_

  - [x] 7.2 Create form field components
    - TextInput for job name, image, timeout
    - TextArea for script lines
    - Dropdown for stage selection
    - KeyValueList for variables
    - PathList for artifact and cache paths
    - RuleBuilder for job rules
    - Checkbox for allow_failure, protected, masked
    - _Requirements: 2.2, 11.1, 11.2, 12.1, 12.2_

  - [x] 7.3 Implement form validation
    - Validate required fields (name, stage, script)
    - Validate job name uniqueness
    - Validate Docker image format
    - Validate artifact path glob patterns
    - Validate cache key variable syntax
    - Display inline error messages below fields
    - Disable save until all errors resolved
    - _Requirements: 2.3, 2.4, 11.4, 12.4_

  - [ ]* 7.4 Write property test for job configuration validation
    - **Property 2: Job Configuration Validation**
    - **Validates: Requirements 2.4**

  - [ ]* 7.5 Write property test for artifact path pattern validation
    - **Property 12: Artifact Path Pattern Validation**
    - **Validates: Requirements 12.4**

  - [x] 7.6 Implement trigger job configuration
    - Add trigger section to Property Panel
    - Provide fields for project path, branch, strategy
    - Visually distinguish trigger jobs on canvas with purple accent
    - _Requirements: 13.1, 13.2, 13.3, 13.5_

  - [x] 7.7 Implement rules configuration interface
    - Provide UI for adding/removing rules
    - Support common rule patterns (only main branch, only MRs)
    - Validate rule syntax
    - Display inherited variables from global config
    - _Requirements: 11.2, 11.3, 11.4, 11.5_

  - [ ]* 7.8 Write unit tests for Property Panel
    - Test form field rendering and updates
    - Test validation error display
    - Test save and close actions
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 8. Integrate Monaco Editor for YAML preview
  - [x] 8.1 Create MonacoPreview component
    - Initialize Monaco Editor with YAML language support
    - Configure dark theme matching GitLab color palette
    - Set editor to read-only mode
    - Enable line numbers, syntax highlighting, and code folding
    - Disable minimap for cleaner interface
    - _Requirements: 3.1, 3.3, 3.4, 3.5, 3.6_

  - [x] 8.2 Implement real-time YAML update
    - Subscribe to Redux pipeline state changes
    - Memoize YAML generation to avoid unnecessary recalculation
    - Update editor value when YAML changes (within 200ms)
    - _Requirements: 3.2_

  - [ ]* 8.3 Write unit tests for Monaco integration
    - Test editor initialization
    - Test YAML update on state change
    - Test theme application
    - _Requirements: 3.1, 3.2_

- [x] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement GitLab API integration
  - [x] 10.1 Create GitLabAPIClient class
    - Implement constructor with baseURL and token from localStorage
    - Create Axios instance with authorization headers
    - Implement validateYAML method (POST /ci/lint)
    - Implement fetchTemplates method (GET /templates/gitlab_ci_ymls)
    - Implement fetchTemplate method (GET /templates/gitlab_ci_ymls/:key)
    - Handle network errors and timeouts gracefully
    - _Requirements: 5.1, 6.4_

  - [x] 10.2 Implement validation middleware
    - Create Redux middleware that triggers validation on pipeline changes
    - Debounce validation requests by 500ms
    - Dispatch setValidationStatus and setValidationErrors actions
    - Parse validation errors and map to job IDs
    - Handle offline mode when API is unreachable
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [x] 10.3 Display validation status in UI
    - Add validation status indicator to toolbar (idle, validating, valid, invalid, offline)
    - Highlight invalid jobs on canvas with red border and error icon
    - Display error messages in tooltips on hover
    - Show offline banner when GitLab API is unavailable
    - _Requirements: 5.2, 5.3, 5.4, 5.6_

  - [ ]* 10.4 Write integration tests for GitLab API
    - Mock GitLab API responses with MSW
    - Test successful validation
    - Test validation errors
    - Test network errors and offline handling
    - Test template fetching
    - _Requirements: 5.1, 5.2, 5.6, 6.4_

- [x] 11. Implement Template Library system
  - [x] 11.1 Create TemplateLibrary component
    - Display searchable list of templates
    - Organize templates by category (build, test, deploy, security)
    - Support filtering by source (official, custom)
    - Implement text search in name and description
    - Use Tailwind CSS for dark mode styling
    - _Requirements: 6.1, 6.2_

  - [x] 11.2 Create TemplateCard component
    - Display template name, description, and category
    - Support drag-and-drop onto canvas
    - Show template preview on hover
    - _Requirements: 6.2, 6.6_

  - [x] 11.3 Implement template application logic
    - Parse template YAML to extract job configuration
    - Generate unique job ID and name (append number if conflict)
    - Create Job_Node_Config from template
    - Add to Pipeline_State at drop position
    - Open Property Panel for customization
    - _Requirements: 6.3, 6.7_

  - [x] 11.4 Implement custom template saving
    - Add "Save as Template" button in Property Panel
    - Prompt for template name and description
    - Save to localStorage in custom_templates array
    - Display custom templates in Template Library
    - _Requirements: 6.5_

  - [x] 11.5 Fetch official GitLab templates
    - Call fetchTemplates on app initialization
    - Cache templates in Redux store
    - Display loading state while fetching
    - Handle fetch errors gracefully
    - _Requirements: 6.4_

  - [ ]* 11.6 Write property test for template persistence round-trip
    - **Property 13: Template Persistence Round-Trip**
    - **Validates: Requirements 6.5**

  - [ ]* 11.7 Write unit tests for Template Library
    - Test template search and filtering
    - Test template card rendering
    - Test drag-and-drop application
    - Test custom template saving
    - _Requirements: 6.1, 6.2, 6.3, 6.5_

- [x] 12. Implement import and export functionality
  - [x] 12.1 Create import YAML function
    - Add "Import YAML" button to toolbar
    - Open file picker for .gitlab-ci.yml files
    - Read file content and parse with YAML_Engine
    - Handle parsing errors with detailed error messages
    - Update Redux store with imported Pipeline_State
    - Render jobs on canvas with auto-layout
    - _Requirements: 7.1, 7.2, 7.3, 7.6_

  - [x] 12.2 Create export YAML function
    - Add "Export YAML" button to toolbar
    - Generate YAML from current Pipeline_State
    - Trigger browser download as .gitlab-ci.yml
    - _Requirements: 7.4_

  - [x] 12.3 Create export JSON function
    - Add "Export JSON" option to toolbar menu
    - Serialize Pipeline_State to JSON
    - Trigger browser download as pipeline-state.json
    - _Requirements: 7.7_

  - [ ]* 12.4 Write property test for JSON persistence round-trip
    - **Property 8: JSON Persistence Round-Trip**
    - **Validates: Requirements 7.7, 10.2**

  - [ ]* 12.5 Write integration tests for import/export
    - Test YAML import with valid file
    - Test YAML import with syntax errors
    - Test YAML export
    - Test JSON export and import
    - _Requirements: 7.1, 7.2, 7.4, 7.6, 7.7_

- [x] 13. Implement state persistence and undo/redo
  - [x] 13.1 Create auto-save middleware
    - Save Pipeline_State to localStorage every 30 seconds
    - Save on every pipeline state change (debounced)
    - Store last saved timestamp
    - Handle localStorage quota exceeded errors
    - _Requirements: 10.1, 10.3_

  - [x] 13.2 Implement state restoration on app load
    - Check localStorage for saved Pipeline_State on initialization
    - Restore state if available and valid
    - Handle corrupted data with error recovery options
    - Display "Restored from auto-save" notification
    - _Requirements: 10.2_

  - [x] 13.3 Implement undo/redo functionality
    - Wire up undo/redo actions to Redux store (already configured with redux-undo)
    - Add undo/redo buttons to toolbar
    - Display keyboard shortcuts (Ctrl+Z, Ctrl+Y) in tooltips
    - Disable buttons when history is empty
    - _Requirements: 10.4, 10.5, 15.1_

  - [ ]* 13.4 Write property test for undo/redo state correctness
    - **Property 11: Undo/Redo State Correctness**
    - **Validates: Requirements 10.4**

  - [ ]* 13.5 Write integration tests for persistence
    - Test auto-save to localStorage
    - Test state restoration on load
    - Test undo/redo operations
    - Test quota exceeded handling
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 14. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Implement toolbar and app layout
  - [x] 15.1 Create Toolbar component
    - Add buttons: New Pipeline, Import YAML, Export YAML, Undo, Redo, Save, Add Job
    - Display validation status indicator
    - Add keyboard shortcuts reference button (Ctrl+/)
    - Add theme toggle button
    - Use Tailwind CSS for dark mode styling
    - _Requirements: 5.4, 10.3, 14.4, 15.1, 15.2, 15.6_

  - [x] 15.2 Create App layout component
    - Implement split-view layout: Canvas (left 60%) and Monaco Preview (right 40%)
    - Make split resizable with drag handle
    - Position Property Panel as overlay on right side
    - Position Template Library as overlay on left side
    - Ensure responsive layout for different screen sizes
    - _Requirements: 3.5_

  - [x] 15.3 Implement keyboard shortcuts
    - Ctrl+Z: Undo
    - Ctrl+Y: Redo
    - Ctrl+S: Manual save
    - Delete: Remove selected job
    - Ctrl+C / Ctrl+V: Copy and paste job
    - Ctrl+E: Export YAML
    - Ctrl+/: Show keyboard shortcuts reference
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_

  - [x] 15.4 Create keyboard shortcuts reference panel
    - Display modal with all keyboard shortcuts
    - Organize by category (Editing, Navigation, File Operations)
    - Open with Ctrl+/ or toolbar button
    - _Requirements: 15.6_

  - [ ]* 15.5 Write unit tests for Toolbar and layout
    - Test button clicks and actions
    - Test keyboard shortcut handling
    - Test split-view resizing
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [-] 16. Implement first-time user experience
  - [x] 16.1 Create welcome overlay and integrate into app
    - Display on first app load (check localStorage flag)
    - Show quick-start options: Start from Scratch, Use Template, Import YAML
    - Provide "Hello World" template button
    - Add "Don't show again" checkbox
    - Initialize UI state from localStorage on app load
    - _Requirements: 9.1, 9.2_

  - [ ] 16.2 Create interactive tutorial
    - Highlight Canvas, Property Panel, and Monaco Preview in sequence
    - Provide step-by-step instructions for creating first job
    - Allow skipping tutorial
    - Mark tutorial as completed in localStorage
    - _Requirements: 9.3_

  - [x] 16.3 Add tooltips to UI elements
    - Add tooltips to all toolbar buttons
    - Add tooltips to form fields in Property Panel
    - Add tooltips to canvas controls
    - Use ARIA labels for accessibility
    - _Requirements: 9.4, 15.7_

  - [x] 16.4 Create example pipeline templates
    - Node.js pipeline (install, lint, test, build, deploy)
    - Python pipeline (setup, test, coverage, deploy)
    - Docker pipeline (build, scan, push)
    - Display in Template Library with "Example" tag
    - _Requirements: 9.6_

  - [ ]* 16.5 Write E2E tests for first-time user flow
    - Test welcome overlay display and dismissal
    - Test tutorial completion
    - Test creating first pipeline from template
    - _Requirements: 9.1, 9.2, 9.3, 9.5_

- [ ] 17. Implement accessibility features
  - [ ] 17.1 Add ARIA labels and roles
    - Add aria-label to all interactive elements
    - Add role attributes to custom components
    - Add aria-describedby for form field help text
    - Add aria-live regions for validation status updates
    - _Requirements: 15.7, 15.8_

  - [ ] 17.2 Implement keyboard navigation
    - Ensure all interactive elements are keyboard accessible
    - Add visible focus indicators
    - Support Tab navigation through Property Panel fields
    - Support arrow key navigation in lists
    - _Requirements: 15.7_

  - [ ] 17.3 Verify WCAG AA contrast requirements
    - Test all color combinations with contrast checker
    - Ensure minimum 4.5:1 ratio for normal text
    - Ensure minimum 3:1 ratio for large text and UI components
    - Document contrast ratios in design system
    - _Requirements: 14.5_

  - [ ]* 17.4 Write accessibility tests
    - Test keyboard navigation
    - Test screen reader compatibility with axe-core
    - Test focus management
    - _Requirements: 15.7, 15.8_

- [ ] 18. Implement error handling and edge cases
  - [ ] 18.1 Add error boundaries
    - Create React error boundary component
    - Display user-friendly error message on crash
    - Provide "Reset Application" button
    - Log errors to console for debugging
    - _Requirements: All (robustness)_

  - [ ] 18.2 Implement circular dependency detection UI
    - Highlight cycle path on canvas with red edges
    - Display modal with cycle description (Job A → Job B → Job C → Job A)
    - Prevent edge creation when cycle detected
    - _Requirements: 1.5, 8.1_

  - [ ] 18.3 Implement YAML parsing error UI
    - Display error modal with line/column information
    - Highlight problematic line in preview pane
    - Provide suggestions for common syntax errors
    - Allow in-place editing or cancel import
    - _Requirements: 7.6_

  - [ ] 18.4 Implement offline mode handling
    - Display "Offline Mode" banner when GitLab API unreachable
    - Disable validation and template fetching
    - Allow continued editing and export
    - _Requirements: 5.6_

  - [ ] 18.5 Implement localStorage error handling
    - Handle quota exceeded with warning and export offer
    - Handle corrupted data with recovery options
    - Handle version mismatch with migration or manual import
    - _Requirements: 10.1, 10.2_

  - [ ]* 18.6 Write unit tests for error handling
    - Test error boundary rendering
    - Test circular dependency detection
    - Test YAML parsing error display
    - Test offline mode behavior
    - _Requirements: 1.5, 5.6, 7.6, 8.1_

- [ ] 19. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 20. Write comprehensive E2E tests
  - [ ]* 20.1 Write E2E test for complete pipeline creation workflow
    - Create new pipeline from scratch
    - Add multiple jobs with different configurations
    - Create dependencies between jobs
    - Configure artifacts and cache
    - Export YAML and verify content
    - _Requirements: 1.1, 2.1, 7.4, 8.1, 12.1_

  - [ ]* 20.2 Write E2E test for import and edit workflow
    - Import existing .gitlab-ci.yml file
    - Modify job configuration in Property Panel
    - Add new job and create dependency
    - Export and verify changes
    - _Requirements: 7.1, 7.2, 2.1, 7.4_

  - [ ]* 20.3 Write E2E test for template usage workflow
    - Open Template Library
    - Search for template
    - Drag template onto canvas
    - Customize template in Property Panel
    - Export YAML
    - _Requirements: 6.1, 6.2, 6.3, 6.7, 7.4_

  - [ ]* 20.4 Write E2E test for undo/redo workflow
    - Create job
    - Delete job
    - Undo deletion
    - Redo deletion
    - Verify state consistency
    - _Requirements: 10.4, 10.5_

  - [ ]* 20.5 Write E2E test for keyboard shortcuts
    - Test all keyboard shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+S, Delete, Ctrl+E, Ctrl+/)
    - Verify actions are performed correctly
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_

  - [ ]* 20.6 Write E2E test for validation workflow
    - Create invalid pipeline (missing required fields)
    - Verify validation errors displayed
    - Fix errors
    - Verify validation success
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 21. Performance optimization and polish
  - [ ] 21.1 Optimize YAML generation performance
    - Memoize YAML generation with useMemo
    - Benchmark with 100-job pipeline (target < 100ms)
    - Profile with Chrome DevTools
    - _Requirements: 3.2, 4.1_

  - [ ] 21.2 Optimize canvas rendering performance
    - Use React.memo for JobNode and DependencyEdge components
    - Implement virtualization for large pipelines (50+ jobs)
    - Benchmark rendering with 100 nodes (target 60fps)
    - Profile with React DevTools Profiler
    - _Requirements: 1.1, 1.2_

  - [ ] 21.3 Optimize auto-save performance
    - Debounce auto-save to avoid excessive writes
    - Benchmark save operation (target < 20ms)
    - _Requirements: 10.1_

  - [ ] 21.4 Add loading states and spinners
    - Show spinner during GitLab API validation
    - Show spinner during template fetching
    - Show skeleton loaders for Template Library
    - _Requirements: 5.1, 6.4_

  - [ ] 21.5 Add animations and transitions
    - Animate Property Panel open/close
    - Animate Template Library open/close
    - Animate validation status changes
    - Use CSS transitions for smooth UX
    - _Requirements: 2.1, 6.1_

  - [ ]* 21.6 Run Lighthouse performance audit
    - Achieve score of 90+ for Performance
    - Achieve score of 90+ for Accessibility
    - Achieve score of 90+ for Best Practices
    - _Requirements: All (quality)_

- [ ] 22. Final integration and documentation
  - [ ] 22.1 Create README with setup instructions
    - Document installation steps
    - Document development commands (dev, build, test)
    - Document project structure
    - Document technology stack
    - _Requirements: All (documentation)_

  - [ ] 22.2 Create user guide
    - Document how to create a pipeline
    - Document how to import/export YAML
    - Document how to use templates
    - Document keyboard shortcuts
    - Add screenshots and GIFs
    - _Requirements: All (documentation)_

  - [ ] 22.3 Set up CI/CD pipeline
    - Create GitHub Actions workflow
    - Run unit tests, property tests, integration tests, E2E tests
    - Generate coverage report
    - Deploy to GitHub Pages or Netlify
    - _Requirements: All (CI/CD)_

  - [ ] 22.4 Final manual testing
    - Test in Chrome, Firefox, and Safari
    - Test with large pipelines (50+ jobs)
    - Test all keyboard shortcuts
    - Test all error scenarios
    - Test accessibility with screen reader
    - _Requirements: All (quality assurance)_

- [ ] 23. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Integration tests validate external integrations (GitLab API, localStorage)
- E2E tests validate complete user workflows
- Checkpoints ensure incremental validation and provide opportunities for user feedback
- The implementation uses TypeScript throughout for type safety
- All UI components use Tailwind CSS with dark mode as default
- The application is designed to work offline with graceful degradation when GitLab API is unavailable
