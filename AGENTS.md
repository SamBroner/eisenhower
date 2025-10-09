# Eisenhower Matrix - AI Agent Documentation

## Project Overview
A React-based task prioritization web application implementing the Eisenhower Matrix methodology. Built with TypeScript and Create React App, featuring local browser storage for data persistence.

## Core Purpose
Helps users organize tasks based on urgency and importance into four quadrants:
- **Do**: Urgent & Important
- **Schedule**: Important but Not Urgent  
- **Delegate**: Urgent but Not Important
- **Delete**: Neither Urgent nor Important

## Technology Stack
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Create React App (react-scripts 5.0.1)
- **Type System**: TypeScript 4.9.5
- **Testing**: Jest with React Testing Library
- **State Management**: React hooks (useState, useEffect)
- **Data Persistence**: Browser localStorage

## Project Structure
```
eisenhower/
├── public/               # Static assets and HTML template
│   ├── index.html       # Main HTML file
│   └── manifest.json    # PWA manifest
├── src/
│   ├── App.tsx          # Main application component
│   ├── App.css          # Application styles
│   ├── components/      # React components
│   │   ├── EisenhowerMatrix.tsx  # 4-quadrant matrix view
│   │   ├── TodoList.tsx          # Uncategorized tasks list
│   │   ├── TaskInput.tsx         # Task entry interface
│   │   └── DeletedTasks.tsx      # Removed tasks management
│   └── index.tsx        # Application entry point
└── tsconfig.json        # TypeScript configuration
```

## Key Components

### App.tsx (Main Component)
- **Location**: src/App.tsx:1-234
- **Responsibilities**:
  - Central state management for all tasks
  - LocalStorage persistence
  - Task CRUD operations
  - Export functionality to markdown format
  - Routing task updates to child components

### EisenhowerMatrix.tsx
- **Location**: src/components/EisenhowerMatrix.tsx:1-137
- **Features**:
  - 4-quadrant visual layout
  - Drag-and-drop task management
  - Task completion tracking (Do quadrant)
  - Task delegation input (Delegate quadrant)
  - Visual task state indicators

### TodoList.tsx  
- **Location**: src/components/TodoList.tsx:1-55
- **Purpose**: Displays uncategorized tasks awaiting prioritization
- **Features**: Drag-and-drop reordering, task deletion

### TaskInput.tsx
- **Location**: src/components/TaskInput.tsx:1-60
- **Capabilities**:
  - Multi-line task input
  - Batch task parsing from various formats (bullets, checkboxes, numbered lists)
  - Keyboard shortcuts (Enter to submit)

### DeletedTasks.tsx
- **Location**: src/components/DeletedTasks.tsx:1-40  
- **Features**: Shows removed tasks with restore capability

## Data Model

### Task Interface
```typescript
interface Task {
  id: string;                    // Unique identifier
  text: string;                   // Task content
  quadrant: 'todoList' | 'urgentImportant' | 'importantNotUrgent' | 
            'urgentNotImportant' | 'notUrgentNotImportant' | 'deleted';
  order: number;                  // Display order
  originalQuadrant?: Task['quadrant'];  // For restoration
  completed?: boolean;            // Completion status
  delegatedTo?: string;          // Delegation target
}
```

## Core Functionality

### Task Management
- **Add Tasks**: Batch input with automatic parsing of list formats
- **Move Tasks**: Drag-and-drop between quadrants and within lists
- **Delete Tasks**: Soft delete with recovery option
- **Complete Tasks**: Checkbox completion for "Do" quadrant items
- **Delegate Tasks**: Text input for delegation in "Delegate" quadrant

### Data Persistence
- All task data stored in browser localStorage
- Automatic save on every state change
- Data survives page refreshes but is browser-specific

### Export Feature
- Exports all tasks to clipboard in markdown format
- Organized by quadrant with checkbox format
- Located at src/App.tsx:133-171

## Available Scripts
```bash
npm start    # Development server on port 3000
npm build    # Production build
npm test     # Run test suite
```

## Key Implementation Details

### Drag and Drop System
- HTML5 drag events used throughout
- Smart insertion logic preserves order when moving within same quadrant
- Target detection for precise task placement

### Task Parsing (TaskInput)
- Handles multiple input formats: src/components/TaskInput.tsx:10-28
- Strips list markers, checkboxes, numbers
- Filters empty lines automatically

### State Updates
- All state updates are immutable
- Order recalculated on every structural change
- Optimistic UI updates with localStorage backup

## Testing
- Basic test setup exists: src/App.test.tsx
- Uses React Testing Library
- Current test coverage is minimal

## Security & Privacy
- No backend or external API calls
- All data stored locally in browser
- No analytics or tracking implemented
- Data never leaves the user's browser

## Development Notes
- Strict TypeScript configuration enabled
- No external UI libraries used (pure CSS)
- Responsive design considerations in CSS
- Tooltips provide user guidance

## Common Modification Points
- **Add new quadrant**: Modify quadrants array in EisenhowerMatrix.tsx:13-21
- **Change task fields**: Update Task interface in App.tsx:8-16
- **Modify storage**: localStorage logic in App.tsx:19-26
- **Style changes**: App.css contains all styling
- **Add features**: Extend App.tsx state management and pass props to components