# Design Guidelines: Beyond the Keys Management System

## Design Philosophy
A professional, minimalist productivity platform optimized for iOS/iPad/iPhone with bilingual RTL/LTR support. The design emphasizes clarity, efficiency, and accessibility with a clean light theme and gold accents.

## Brand Identity
**Logo Integration**: Beyond the Keys logo (dark blue and gold, featuring keyboard with rising graph motif)
- Display prominently in sidebar header (140px width, centered)
- Include in main header at 40px height
- Logo path: `/public/logo.png`

## Color System (Light Mode)
```
Primary Background: #FFFFFF (White)
Sidebar Background: #FAFAFA (Light Gray)
Header Background: #FFFFFF (White)
Card Background: #FFFFFF (White)
Primary Accent: #D4AF37 (Gold)
Accent Hover: #b9972f (Deep Gold)
Text Primary: #1e293b (Dark Slate)
Text Muted: #6B7280 (Medium Gray)
Border Color: #E5E7EB (Light Border)
```

## Layout Architecture

**Sidebar Navigation** (260px fixed width):
- Light gray background (#FAFAFA)
- Logo at top, centered
- Navigation links with subtle dividers (1px border)
- Full viewport height
- Dark text on light background
- Right border (LTR) or left border (RTL) for visual separation

**Main Content Area**:
- White background (#FFFFFF)
- Content cards on white background with 10px border-radius
- 16px padding within cards, 20px margin between

**Header**:
- Full width, white background (#FFFFFF)
- 12px vertical, 20px horizontal padding
- Logo (40px height) + language selector flexbox layout
- Dark text with bottom border

## Typography
- System fonts: system-ui, -apple-system, Segoe UI, Arial
- RTL mode: text-align right, direction rtl
- LTR mode: text-align left, direction ltr

## Spacing Scale
Use Tailwind spacing: 2, 4, 8, 12, 16, 20, 24 (in px equivalents)
- Card padding: 16px
- Section gaps: 24px
- Button padding: 8px vertical, 18px horizontal

## Component Specifications

**Primary Buttons**:
- Gold background (#D4AF37)
- 6px border-radius
- Bold black text
- Hover: Deep gold (#b9972f)
- Large touch targets for iOS (minimum 44px height)

**Cards**:
- White background
- 10px border-radius
- 16px internal padding
- 20px bottom margin
- Clean, minimal shadows

**Navigation Links**:
- Dark text on light backgrounds
- 10px vertical padding
- Hover state with subtle gray background
- No text decoration

## Screen Layouts

**Dashboard**:
- Grid of status cards: Today's Tasks, Writing Status, Work Journal
- Card-based information display

**Documents Page**:
- List view with filters (type/language/tags)
- Action buttons: Create, Edit, Delete
- Document type badges

**Writing Studio**:
- Full-width textarea editor
- Metadata fields above: Title, Type, Language, Tags
- Auto-save + manual save buttons
- Export to JSON option

**Learning Hub**:
- Course list with progress indicators
- Unit navigation within courses
- "Read Aloud" button (SpeechSynthesis integration)

## Responsive Behavior
- iOS-optimized: Large touch targets (44px minimum)
- Flexbox layouts throughout
- Single-column mobile, multi-column desktop where appropriate
- No heavy external libraries

## Accessibility & Internationalization
- Full RTL support for Hebrew (default) and Arabic
- LTR support for English, Russian, Spanish, French
- Language toggle in header and sidebar
- Apply `dir` and `class` attributes to `<html>` element based on language
- High contrast text (dark text on light backgrounds)

## Interactive States
- Button hover: Darken gold accent
- No complex animations (lightweight for iOS)
- Focus states for keyboard navigation
- Clear visual feedback for all actions
- Subtle elevation on hover for interactive elements

## Key UX Principles
1. **Offline-First**: All data in LocalStorage, no server dependency
2. **Multilingual**: 6-language support with proper RTL/LTR handling
3. **Touch-Optimized**: Large buttons, generous spacing for mobile interactions
4. **Minimalist**: Clean, distraction-free interface focused on productivity
5. **Professional**: Clean light theme with gold accents reflecting brand identity