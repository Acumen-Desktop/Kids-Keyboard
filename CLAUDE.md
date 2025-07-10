# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kids Keyboard is a lightweight, educational virtual keyboard designed specifically for children's typing education (ages 3-8+). It follows a progressive learning approach starting with pre-school children who have no knowledge of numbers or alphabet.

**Current Version**: 0.9.0 (with audio features from v0.10.0 in development)

## Essential Commands

### Development
- `npm test` - Currently placeholder, tests planned for v1.0.0
- Open `examples/index.html`, `examples/audio.html`, or `examples/stats.html` in browser for testing
- No build step required - files work directly with modern bundlers

### Testing Examples
- **Basic**: `examples/index.html` - Main examples and feature showcase
- **Audio**: `examples/audio.html` - Audio system testing (Phase 1A features)
- **Statistics**: `examples/stats.html` - Working example with statistics tracking

## Architecture

### Core Structure
```
src/
├── kids-keyboard.js         # Main UMD module (no build step needed)
├── kids-keyboard.css        # BEM-namespaced styles
├── kids-keyboard.d.ts       # TypeScript definitions
├── kids-keyboard-core.css   # Core keyboard styles
├── kids-keyboard-layout.css # Layout-specific styles
└── features/
    └── kids-keyboard-audio-webAPI.js  # Phase 1A audio system
```

### Key Design Principles
- **No Build Step**: Works directly with Vite, Webpack, Rollup
- **BEM CSS**: All classes namespaced with `kids-keyboard__` to prevent conflicts
- **Progressive Enhancement**: Each phase builds on previous functionality
- **Educational Focus**: Designed for pre-school through elementary children

### HTML Structure (Post v0.9.0 Refactoring)
```html
<div id="kids-keyboard-tutor">           <!-- Main container -->
  <div id="kids-keyboard-output">        <!-- Upper section (flex) -->
    <textarea id="kids-keyboard-text"></textarea>  <!-- Left: typing output -->
    <div id="kids-keyboard-display"></div>         <!-- Right: educational content -->
  </div>
  <div id="kids-keyboard-input"></div>    <!-- Lower section: virtual keyboard -->
</div>
```

## Educational Development Phases

### Phase 1A: Audio System ✅ COMPLETE
- Web Speech API integration
- Audio toggle with persistent settings
- Phonetic sounds for letters ("A says 'ah'")
- Located in: `src/features/kids-keyboard-audio-webAPI.js`

### Phase 1B: Key Information Display ⏳ NEXT PRIORITY
- Large letter display when keys are clicked
- Visual feedback with animations
- Educational content in `#kids-keyboard-display` area

### Phase 1C: Animal/Object Associations ⏳ PLANNED
- Memory aids (A=Apple🍎, B=Bear🐻)
- Enhanced audio with associations
- Visual learning cards

### Future Phases
- Phase 2: Finger positioning guides (ages 5-6)
- Phase 3: Simple word building (ages 6-8)  
- Phase 4: AI-powered personalized learning (ages 8+)

## Key Implementation Details

### State Management
- Located in `src/kids-keyboard.js` lines 56-63
- Race condition fixes implemented
- Proper Shift/CapsLock handling for letters vs symbols

### Key Rendering
- Main key creation logic: `src/kids-keyboard.js` lines 233-271
- Differential DOM updates for performance
- Clean HTML output without unnecessary attributes

### CSS Architecture
- BEM methodology: `.kids-keyboard__element--modifier`
- Responsive design: Desktop (45px keys) → Tablet (40px) → Mobile (35px)
- Layout styles in `src/kids-keyboard-layout.css` lines 315-357

### Mouse-Based Tutor Mode
- Hover activation over `tutorContainer` element
- Visual feedback when active
- Captures physical keyboard input during tutor mode

## Breaking Changes in v0.9.0

### API Changes
- `targetInput` → `targetOutput` (for semantic clarity)
- `getTargetInput()` → `getTargetOutput()`
- HTML element IDs simplified (removed `-container` suffixes)

### New Structure
- Split output into separate text and display areas
- Ready for educational content in display panel

## TypeScript Support

Comprehensive type definitions in `src/kids-keyboard.d.ts`:
- `KidsKeyboardOptions` - Constructor configuration
- `KidsKeyboardState` - Current keyboard state
- `KidsKeyboard` - Main instance interface

## Important Files for Understanding

### Core Implementation
- `src/kids-keyboard.js` - Main library (review state management and key rendering)
- `src/kids-keyboard.css` - BEM styles with alphabetized properties
- `src/kids-keyboard.d.ts` - Complete TypeScript definitions

### Educational Development
- `_notes/development-plan.md` - Complete roadmap and educational philosophy
- `src/features/kids-keyboard-audio-webAPI.js` - Audio system implementation
- `examples/audio.html` - Working audio feature demonstration

### Current Examples
- `examples/stats.html` - Best working example with new v0.9.0 structure
- `examples/index.html` - Main feature showcase
- `examples/audio.html` - Audio system testing

## Development Guidelines

### Code Style
- Follow existing BEM naming conventions
- Use functional/modular approach (see audio feature)
- Target pre-school children first (ages 3-5) for new features
- No external dependencies - vanilla JavaScript only

### Educational Focus
- Always consider child development stages
- Multi-sensory learning (audio + visual + tactile)
- Progressive difficulty increase
- Accessibility-first design

### Performance
- Maintain differential rendering approach
- Cache constants and layouts
- Minimize DOM manipulations
- Keep memory usage low for extended sessions