# Beyond the Keys - Management System

## Overview
A comprehensive multilingual management platform for documents, writing, learning, and task management. Features a High-End C2 Craft-Style Premium Pastel UI design, optimized for iOS/iPad/iPhone with full offline support via LocalStorage.

## Current State
- **Status**: MVP Complete with C2 Craft Premium Design
- **Languages**: 6 languages supported - Hebrew (default, RTL), Arabic (RTL), English, Russian, Spanish, French (all LTR)
- **Storage**: LocalStorage primary (Firebase-ready for cloud sync)
- **Design**: C2 Craft High-End Premium Pastel UI

## Features
1. **Dashboard** - Overview of tasks, documents, and learning progress with pastel-colored stat cards
2. **Documents** - Create, edit, filter, and manage documents by type/language/tags with responsive grid
3. **Writing Studio** - Full-featured TipTap rich text editor with Focus Mode for distraction-free writing
4. **Learning Hub** - Course management with unit tracking, text-to-speech, and visual analytics
5. **Settings** - Data backup system (export/import/clear) with validation
6. **Global Search** - Search across documents and courses from header
7. **Breadcrumb Navigation** - Easy navigation context on all pages

## Design System - C2 Craft High-End Premium Pastel

### Color Palette
```css
/* Primary Accent */
--accent: #5AB1A7 (Craft Teal)
--accent-light: #E0F4F2

/* Pastel Cards */
--pastel-rose: #FAD4D4
--pastel-blue: #D7E9FF
--pastel-beige: #F4EBD0
--pastel-green: #DFF5E1

/* Backgrounds */
--bg: #FFFFFF
--bg-soft: #FAF8F6 (Sidebar)

/* Text */
--text-main: #273043
--text-soft: #69707D
```

### Typography
- Font: SF Pro / system-ui / Segoe UI
- H1: 28px, weight 600
- H2: 20px, weight 500
- Body: 15-16px

### Components
- Cards: 18px radius, soft shadow
- Buttons: 14px radius, hover scale(1.02)
- Icon buttons: 42px round
- Touch targets: 44px minimum

## Tech Stack
- React + Vite + TypeScript
- Tailwind CSS with C2 Craft theming
- Shadcn/UI components (customized)
- LocalStorage for data persistence
- Firebase Firestore (optional cloud sync)
- Web Speech API for text-to-speech

## Document Types
- BOOK, COURSE, DRAFT, STUDY, FOUNDATION, PROMPT, NOTE

## Task Types
- WRITING, TRANSLATION, LEARNING, TECH

## Task Statuses
- OPEN, IN_PROGRESS, DONE

## LocalStorage Keys
- `btk_documents` - Document storage
- `btk_courses` - Course storage
- `btk_tasks` - Task storage
- `btk_learning` - Learning progress
- `btk_language` - UI language preference

## Project Structure
```
client/src/
├── context/
│   └── AppContext.tsx      # Global state, i18n, Firebase sync
├── components/
│   ├── layout/
│   │   └── Layout.tsx      # Main layout with sidebar, header, search, breadcrumbs
│   └── ui/
│       └── loading-spinner.tsx  # Pastel loading components
├── pages/
│   ├── Dashboard.tsx       # Main dashboard with pastel stat cards
│   ├── Documents.tsx       # Document list with responsive grid
│   ├── WritingStudio.tsx   # Document editor with Focus Mode
│   ├── LearningHub.tsx     # Course and unit management
│   └── Settings.tsx        # Data backup and statistics
└── App.tsx                 # Main app with routing
```

## Special Features

### Focus Mode (Writing Studio)
- Fullscreen distraction-free writing
- Centered content (max 680px width)
- Larger font for comfortable reading
- Quick save button access

### Global Search
- Search documents and courses
- Pill-shaped search bar in header
- Mobile-friendly with icon button

### Breadcrumb Navigation
- Shows current location in app
- Clickable path segments
- RTL-aware chevron direction

### iOS Optimizations
- 44px minimum touch targets
- Rounded button corners (14px)
- Large icon buttons (42px)
- Responsive grid layouts

## Running the Project
```bash
npm run dev
```

## Firebase Setup (Optional)
Add these environment variables for cloud sync:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## Recent Changes
- Implemented C2 Craft High-End Premium Pastel UI design
- Added Focus Mode to Writing Studio
- Added Global Search in header
- Added Breadcrumb navigation
- Updated all pages with pastel card colors
- Enhanced iOS touch targets and button sizes
- Added micro-animations and transitions
- Created loading spinner component
- Full 6-language support with RTL/LTR handling
- Firebase-ready architecture for cross-device sync
