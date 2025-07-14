# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kids Keyboard is a lightweight, educational virtual keyboard designed specifically for children's typing education (ages 3-8+). It follows a progressive learning approach starting with pre-school children who have no knowledge of numbers or alphabet.

**Current Version**: 1.0.0 - Complete functional architecture refactor with production-ready features

## ⚠️ IMPORTANT: New Architecture Available

**Primary Development**: Use `src_new/` directory - complete functional rewrite
**Legacy Code**: `src/` directory maintained for reference only

The project has been completely refactored into a clean, functional architecture in `src_new/` that replaces the monolithic `src/` implementation.

## Essential Commands

### Development (src_new/)
- Open `src_new/example.html` in browser for complete feature testing
- No build step required - works directly with modern bundlers
- All features integrated in single demo

### Testing Examples  
- **Primary**: `src_new/example.html` - Complete functional system demo
- **Legacy**: `examples/` directory - Original implementation (reference only)

## Architecture (src_new/)

### Functional Architecture Structure
```
src_new/
├── core/                    # Essential keyboard functionality  
│   ├── keyboard-data.js     # Static layouts, key mappings, constants
│   ├── keyboard-state.js    # Pure state management functions
│   ├── keyboard-dom.js      # DOM creation & manipulation  
│   └── keyboard-events.js   # Event handling logic
├── features/                # Educational enhancements
│   ├── audio-system.js      # Web Speech API integration
│   ├── visual-display.js    # Smart visual feedback system
│   ├── associations.js      # Letter/animal memory aids
│   ├── lessons.js           # Interactive typing lessons
│   └── statistics.js        # Learning progress tracking
├── styles/                  # Modular CSS architecture
│   ├── keyboard-core.css    # Base keyboard styles (BEM)
│   └── layout.css           # Responsive layout & theming
├── kids-keyboard.js         # Main functional web component
├── index.js                 # Entry point & exports
├── example.html             # Live demo
└── README.md               # Complete documentation
```

### Design Philosophy
- **Functional Programming**: Pure functions with immutable state
- **Modular Design**: Small, focused files with single responsibilities  
- **No Build Step**: Works directly with modern bundlers
- **Zero Dependencies**: Complete system with no external libraries
- **Educational First**: Every feature designed for children's learning

### Web Component Usage
```html
<!-- Simple integration -->
<kids-keyboard 
    learning-mode="associations"
    enable-audio="true"
    auto-tutor="false">
</kids-keyboard>

<script type="module" src="./src_new/index.js"></script>
```

## Smart Interaction System ✅ COMPLETE

### Dual-Mode Audio Feedback
- **Physical Keyboard**: Fast letter names at 2x speed ("a", "b", "c") for rapid typing
- **Virtual Clicks**: Full educational content ("A is for Apple") for learning exploration
- **Kid-Friendly Voices**: Auto-selects appropriate Web Speech API voices
- **Persistent Settings**: Audio preferences saved in localStorage

### Adaptive Visual Display  
- **Physical Keyboard**: Simple "A a" display with smart case highlighting
  - Active case (uppercase/lowercase) highlighted in blue based on Shift/CapsLock state
  - Inactive case shown in grey
  - Teaches modifier key effects in real-time
- **Virtual Clicks**: Compact educational content ("D" + "is for Dog" + 🐶)

### Manual Tutor Mode Control
- **Toggle Button**: 🎯 ON / ⚫ OFF manual control (replaces automatic hover)
- **Normal Typing**: When OFF, allows typing in other page elements
- **Educational Mode**: When ON, captures physical keyboard for learning features

## Educational Features ✅ ALL COMPLETE

### Letter Associations (Phase 1C)
- A-Z mapped to memorable animals/objects with emojis (A=Apple🍎, B=Bear🐻, etc.)
- Visual and auditory reinforcement for memory formation
- Located in: `src_new/features/associations.js`

### Interactive Lessons (Phase 3A)  
- Word-building exercises with real-time validation
- Multiple difficulty levels (beginner, intermediate, advanced)
- Progress tracking with celebrations and encouragement
- Located in: `src_new/features/lessons.js`

### Learning Analytics
- Session statistics (keys typed, accuracy, typing speed)
- Historical progress tracking with local storage
- Achievement system with unlockable badges
- Privacy-focused (all data stored locally)
- Located in: `src_new/features/statistics.js`

## Key Implementation Details (src_new/)

### Functional State Management
- **Pure Functions**: All state changes use immutable functions in `core/keyboard-state.js`
- **Race Condition Free**: Centralized setState function prevents conflicts
- **Smart Case Logic**: `isShiftPressed XOR isCapsLockOn` determines letter case
- **Validation**: Input length limits and caret position validation

### Performance Optimizations
- **Differential DOM Updates**: Only changes necessary elements via `core/keyboard-dom.js`
- **Event Delegation**: Single event listener handles all virtual key presses
- **CSS Transitions**: Smooth animations without JavaScript overhead
- **Memory Management**: Proper cleanup of event listeners and state references

### Web Component Pattern
- **Functional Architecture**: Class serves only as browser interface
- **Pure Business Logic**: All functionality in pure functions outside the class
- **No Shadow DOM**: Simple CSS with full tooling support
- **Attribute-Driven**: Configuration via HTML attributes

### CSS Architecture (styles/)
- **BEM Methodology**: `.kids-keyboard__element--modifier` naming
- **Modular Files**: Separate core keyboard and layout concerns
- **Responsive Design**: Desktop (45px) → Tablet (40px) → Mobile (35px)
- **Accessibility**: High contrast, reduced motion, print styles

## Important Files for Development

### Core System (src_new/)
- `kids-keyboard.js` - Main web component (functional pattern)
- `core/keyboard-state.js` - Pure state management functions
- `core/keyboard-dom.js` - DOM creation and manipulation
- `features/audio-system.js` - Smart dual-mode audio system
- `features/visual-display.js` - Adaptive visual feedback
- `README.md` - Complete documentation for users and developers

### Legacy Reference (src/)
- Maintained for comparison and migration reference only
- **Do not use for new development**

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