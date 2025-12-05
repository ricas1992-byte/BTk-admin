# Design Guidelines: Beyond the Keys Management System

## Design Philosophy - C2 Craft High-End Premium Pastel UI
A sophisticated, craft-style premium productivity platform with soft pastel colors, refined typography, and iOS-optimized touch interactions. The design emphasizes elegance, clarity, and a calming user experience.

## Brand Identity
**Logo Integration**: Beyond the Keys logo (dark blue and gold, featuring keyboard with rising graph motif)
- Display in sidebar header (64px height, centered)
- Include in main header at 40px height
- Logo path: `/public/logo.png`

## C2 Craft Color System

### Light Mode (Primary)
```css
/* Core Backgrounds */
--bg: #FFFFFF
--bg-soft: #FAF8F6 (Sidebar)
--bg-card: #FFFFFF

/* Primary Accent - Teal/Craft Green */
--accent: #5AB1A7
--accent-dark: #3E857C
--accent-light: #E0F4F2

/* Premium Pastel Palette */
--pastel-rose: #FAD4D4
--pastel-blue: #D7E9FF
--pastel-beige: #F4EBD0
--pastel-green: #DFF5E1
--pastel-teal: #E0F4F2

/* Text Colors */
--text-main: #273043
--text-soft: #69707D (Secondary text)
--text-muted: 60% opacity of main

/* Borders */
--border-soft: #E8E6E3
```

### Dark Mode
```css
--background: #1A1D24
--card: #1E2128
--sidebar: #14161A
--pastel colors: Darker variants at 30% saturation
```

## Typography System

### Font Stack
```css
font-family: "SF Pro Display", "SF Pro Text", system-ui, -apple-system, "Segoe UI", sans-serif;
```

### Type Scale
- **H1**: 28px (1.75rem), weight 600, line-height 1.2, letter-spacing -0.02em
- **H2**: 20px (1.25rem), weight 500, line-height 1.3, letter-spacing -0.01em
- **Body**: 15-16px, weight 400, line-height 1.6
- **Small**: 13-14px for metadata

## Component Specifications

### Cards (Craft Style)
```css
border-radius: 18px (1.125rem)
box-shadow: 0 6px 20px rgba(0,0,0,0.04)
padding: 20px
hover-shadow: 0 8px 28px rgba(0,0,0,0.06)
transition: all 150ms ease
```

### Pastel Card Variants
- **Documents Card**: bg-pastel-teal, border-pastel-teal
- **Courses Card**: bg-pastel-blue, border-pastel-blue
- **Tasks Card**: bg-pastel-rose, border-pastel-rose
- **Progress Card**: bg-pastel-green, border-pastel-green
- **Notes Card**: bg-pastel-beige, border-pastel-beige

### Buttons (Craft Style)
```css
/* Primary */
background: var(--accent)
border-radius: 14px (0.875rem)
padding: 10px 20px
hover: transform scale(1.02), shadow

/* Icon Buttons */
width: 42px
height: 42px
border-radius: 50%
```

### Sidebar (Craft Style)
```css
background: var(--bg-soft)
border-radius: 0
width: 256px

/* Selected Item */
background: var(--accent-light)
border-right: 4px solid var(--accent) /* LTR */
border-left: 4px solid var(--accent) /* RTL */
```

### Header
```css
background: #FFFFFF
border-bottom: 1px solid var(--border-soft)
box-shadow: 0 4px 12px rgba(0,0,0,0.03)
padding: 12px 24px
```

## BTK Unified Animation System

### System Overview
The BTK system uses a clean, modern, unified animation system with consistent easing and brand-aligned colors (navy for primary, gold for accents). All animations are CSS-based and defined in `/client/src/animations.css`.

### Global Easing
```css
--btk-easing: cubic-bezier(0.25, 0.1, 0.25, 1);
```

### 1. Loading Screen
**Usage:** App loading screen with white background, navy/gold progress bar
```css
.btk-loading-fadeout  /* 500ms fade-out when app is ready */
.btk-progress-bar     /* Smooth progress bar transition */
.btk-spinner          /* Navy/gold spinning loader */
```

### 2. Page Enter Animations
**Usage:** Page and content entry animations
```css
.btk-page-enter       /* Fade-in (300ms) */
.btk-slide-up         /* Slide-up + fade (450ms, translateY 20px to 0) */
.btk-slide-up-stagger /* Staggered children animation */
```

### 3. Card Animations
**Usage:** Card hover effects and entry
```css
.btk-card       /* Hover: lift 2px + soft shadow (200ms transition) */
.btk-card-enter /* Entry animation (slide-up) */
```

### 4. Button Animations
**Usage:** Button interactions
```css
.btk-button      /* Hover: scale(1.02), Active: scale(0.98) for 80ms */
.btk-icon-button /* Icon button with scale effects */
```

### 5. Icon Animations
**Usage:** Icon entry
```css
.btk-icon-enter /* Scale-in on load (250ms) */
```

### 6. Notification Animations
**Usage:** Toast/notification entry and exit
```css
.btk-notification-enter /* Slide-in from bottom (300ms) */
.btk-notification-exit  /* Fade-out on disappear (300ms) */
```

### 7. Dropdown/Modal Animations
**Usage:** Dropdown menus and modals
```css
.btk-dropdown-enter /* Scale + fade (180ms) */
.btk-dropdown-exit
.btk-backdrop-enter /* Backdrop fade-in */
.btk-modal-enter    /* Modal slide-down entry */
.btk-modal-exit
```

### Animation Rules
1. ✅ All animations are CSS-based
2. ✅ Consistent easing: cubic-bezier(0.25, 0.1, 0.25, 1)
3. ✅ Brand colors: navy for primary, gold for accents
4. ✅ Animations defined in `/client/src/animations.css`
5. ✅ No layout shifts or flicker
6. ✅ Reduced motion support for accessibility

### Legacy Support
Old animation classes are mapped to new ones for backward compatibility:
- `.btk-app-intro` → `.btk-loading-fadeout`
- `.btk-fade-in-up` → `.btk-slide-up`
- `.btk-tap-scale` → Built into `.btk-button`

## iOS/Touch Optimization

### Touch Targets
```css
min-height: 44px
min-width: 44px
/* Large targets for iPad */
.touch-target-lg { min-height: 48px; min-width: 48px; }
```

### Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px (iPad optimized)
- Desktop: > 1024px

### Grid System
```css
/* Document Grid */
grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
gap: 16px;
```

## Spacing System
Using Tailwind's default spacing scale:
- **xs**: 4px (gap-1)
- **sm**: 8px (gap-2)
- **md**: 16px (gap-4)
- **lg**: 24px (gap-6)
- **xl**: 32px (gap-8)

## Special Features

### Focus Mode (Writing Studio)
```css
position: fixed;
inset: 0;
background: var(--bg);
max-width: 680px (content);
font-size: 1.125rem;
line-height: 1.8;
```

### Global Search
```css
border-radius: 9999px (pill shape);
background: var(--muted)/50;
padding: 10px 16px;
:focus-within {
  border-color: var(--accent)/30;
  ring: 2px var(--accent)/10;
}
```

### Breadcrumb Navigation
```css
font-size: 14px;
color: var(--text-muted);
separator: ChevronRight icon;
current-page: font-weight 500, color var(--text-main);
```

### Loading Spinner
```css
border: 2px solid var(--muted);
border-top-color: var(--accent);
animation: spin 1.5s linear infinite;
```

## RTL/LTR Support
- Full RTL support for Hebrew and Arabic
- LTR support for English, Russian, Spanish, French
- Sidebar border flips (right border LTR, left border RTL)
- Navigation icons rotate 180° in RTL mode
- Language toggle in header and sidebar

## Accessibility
- High contrast text (dark text on light backgrounds)
- Focus states for keyboard navigation
- Large touch targets (44px minimum)
- Semantic HTML structure
- Clear visual feedback for all interactions

## Key UX Principles
1. **Craft Premium Feel**: Soft colors, subtle shadows, refined typography
2. **Touch-First**: Generous touch targets, swipe-friendly layouts
3. **Minimal Distraction**: Clean interface, focus mode for writing
4. **Cross-Device Sync**: Firebase-ready architecture (optional)
5. **Multilingual**: 6-language support with proper RTL/LTR handling
6. **Offline-First**: LocalStorage for data persistence
