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

## Design System - BTK Navy/Gold/White Premium UI

### Color Palette
```css
/* Navy Primary (Sidebar, dark accents) */
--sidebar: hsl(220, 60%, 20%)
--navy-medium: hsl(220, 55%, 65%)
--navy-light: hsl(220, 50%, 92%)

/* Gold Primary (Buttons, highlights) */
--primary: hsl(45, 95%, 55%)
--gold-light: hsl(45, 85%, 88%)
--gold-accent: hsl(45, 90%, 70%)

/* White Backgrounds */
--background: #FFFFFF
--card: #FFFFFF
--white-soft: hsl(0, 0%, 98%)

/* Pastel Cards */
--pastel-teal: Light gold accent
--pastel-blue: Navy light
--pastel-rose: Gold light
--pastel-green: White soft

/* Text */
--foreground: hsl(220, 60%, 15%)
--muted-foreground: hsl(220, 30%, 45%)
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

## BTK Unified Animation System

### Animation Files
- `animations.css` - Primary unified animation system
- `btk-animations.css` - Legacy support and additional utilities

### Animation Classes
```css
/* Loading Screen */
.btk-loading-fadeout  /* 500ms fade-out when app ready */
.btk-progress-bar     /* Smooth progress bar transition */
.btk-spinner          /* Navy/gold spinning loader */

/* Page Transitions */
.btk-page-enter       /* Fade-in (300ms) */
.btk-slide-up         /* Slide-up + fade (450ms) */
.btk-slide-up-stagger /* Staggered children animation */

/* Card Animations */
.btk-card             /* Hover: lift 2px + soft shadow */
.btk-card-enter       /* Entry animation (slide-up) */

/* Button Animations */
.btk-button           /* Hover: scale(1.02), Active: scale(0.98) */
.btk-icon-button      /* Icon button with scale effects */

/* Modal/Dropdown */
.btk-dropdown-enter   /* Scale + fade (180ms) */
.btk-backdrop-enter   /* Backdrop fade-in */
.btk-modal-enter      /* Modal slide-down entry */
```

### Global Easing
```css
--btk-easing: cubic-bezier(0.25, 0.1, 0.25, 1);
```

## Recent Changes
- **BTK V1 UI + Animation System**:
  - Implemented unified BTK Animation System in animations.css
  - Added legacy support in btk-animations.css for backward compatibility
  - Navy/Gold/White premium color scheme
  - Loading screen with navy-gold gradient progress bar
  - Smooth page transitions and card hover effects
  - Reduced motion support for accessibility
- **Performance Optimizations**:
  - Implemented Code Splitting with React.lazy for all page components
  - Added Suspense with loading fallback for smooth page transitions
  - Applied React.memo and useCallback optimizations
- **Loading Screen**:
  - Professional LoadingScreen with logo, progress bar, and percentage
  - Preloads fonts, images, and localStorage data
  - Smooth 500ms fade-out transition
- Full 6-language support with RTL/LTR handling
- Firebase-ready architecture for cross-device sync
