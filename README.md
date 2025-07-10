# Kids Keyboard 🎯

A progressive educational typing tutor designed for early childhood learning. Starting with pre-school children (ages 3-5) who have no knowledge of numbers or alphabet, and advancing through elementary grades with planned AI-powered personalized instruction.

[![npm version](https://badge.fury.io/js/kids-keyboard.svg)](https://badge.fury.io/js/kids-keyboard)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 Educational Philosophy

Kids Keyboard follows a **progressive learning approach** based on early childhood development:

### Target Progression
1. **Pre-School (3-5)**: Letter recognition, phonetic sounds, cause-and-effect learning
2. **Kindergarten (5-6)**: Letter-sound association, basic finger positioning
3. **Elementary (6-8)**: Touch typing fundamentals, simple word building
4. **Advanced (8+)**: AI-assisted personalized learning with verbal conversation

### Learning Principles
- **Multi-sensory**: Audio + Visual + Tactile feedback
- **Inclusive**: Sign language integration, accessibility-first design
- **Progressive**: Each phase builds on previous knowledge
- **Engaging**: Gamification, animations, and positive reinforcement
- **Evidence-based**: Following early childhood education research

## Current Features (v0.9.0)

### Core Functionality
- 🎯 **Virtual Keyboard**: Clean, responsive keyboard with BEM CSS architecture
- 🖱️ **Mouse-Based Tutor Mode**: Hover activation for guided learning
- 📱 **Responsive Design**: Works on desktop, laptop, and tablet devices
- ⚡ **High Performance**: Minimal HTML, optimized rendering
- 🔧 **Easy Integration**: Simple API with comprehensive TypeScript support

### Educational Features (In Development)
- 🔊 **Audio Feedback**: Phonetic pronunciation using Web Speech API
- 📚 **Letter Associations**: Animal/object connections (A=Apple🍎, B=Bear🐻)
- 👆 **Finger Positioning**: Visual guides for proper typing technique
- 🤟 **Sign Language**: ASL alphabet integration for inclusive learning
- 🎮 **Progressive Learning**: Age-appropriate content and difficulty

### Technical Features
- ♿ **Accessibility First**: Full ARIA support and keyboard navigation
- 🎨 **BEM CSS Architecture**: Namespaced classes prevent styling conflicts
- 📦 **No Build Required**: Works directly with modern bundlers like Vite
- 🎨 **Visual Feedback**: Clear indicators for physical keyboard synchronization

## Quick Start

### Installation

```bash
npm install kids-keyboard
```

### Basic Usage

**ES Modules (Recommended):**
```javascript
import createKidsKeyboard from 'kids-keyboard';
import 'kids-keyboard/src/kids-keyboard.css';

const keyboard = createKidsKeyboard({
  container: '#kids-keyboard-input',
  targetOutput: '#kids-keyboard-text',
  onChange: (input) => {
    console.log('Input changed:', input);
  }
});
```

**Browser Script Tag:**
```html
<link rel="stylesheet" href="node_modules/kids-keyboard/src/kids-keyboard.css">
<script src="node_modules/kids-keyboard/src/kids-keyboard.js"></script>
<script>
  const keyboard = createKidsKeyboard({
    container: '#kids-keyboard-input'
  });
</script>
```

### HTML Structure

```html
<div id="kids-keyboard-tutor">
  <div id="kids-keyboard-output">
    <textarea id="kids-keyboard-text"
              placeholder="Hover over this area to activate tutor mode, then start typing!"></textarea>
    <div id="kids-keyboard-display">
      <!-- Key press details and educational content will appear here -->
    </div>
  </div>
  <div id="kids-keyboard-input"></div>
</div>
```

## API Reference

### Constructor Options

```typescript
interface KidsKeyboardOptions {
  container: string | HTMLElement;          // Required: Where to render the keyboard
  targetOutput?: string | HTMLElement;      // Optional: Output element for tutor mode
  tutorContainer?: string | HTMLElement;    // Optional: Container for mouse activation
  debug?: boolean;                          // Optional: Enable debug logging
  onChange?: (input: string) => void;       // Optional: Input change callback
  onKeyPress?: (key: string, event: Event) => void;  // Optional: Key press callback
  onStateChange?: (state: KidsKeyboardState) => void; // Optional: State change callback
  onTutorModeChange?: (isActive: boolean) => void;    // Optional: Tutor mode callback
}
```

### Methods

```typescript
// Input Management
keyboard.getInput(): string
keyboard.setInput(input: string): void
keyboard.clearInput(): void

// Caret Management
keyboard.getCaretPosition(): number
keyboard.setCaretPosition(position: number): void

// State Management
keyboard.getState(): KidsKeyboardState
keyboard.isTutorModeActive(): boolean
keyboard.getTargetOutput(): HTMLElement | null

// Lifecycle
keyboard.destroy(): void
```

## Tutor Mode

Kids Keyboard features a unique **mouse-based tutor mode** that activates when users hover over the designated tutor area. This creates a clear distinction between normal typing and guided learning.

### How It Works

1. **Normal Mode**: Users can type normally in any input field
2. **Tutor Mode**: When hovering over the tutor container, the virtual keyboard captures all physical keyboard input
3. **Visual Feedback**: Clear indicators show when tutor mode is active

### Configuration

```javascript
const keyboard = createKidsKeyboard({
  container: '#kids-keyboard-input',
  targetOutput: '#kids-keyboard-tutor-output',      // Output that receives tutor mode typing
  tutorContainer: '#kids-keyboard-tutor',   // Container that triggers tutor mode
  onTutorModeChange: (isActive) => {
    console.log('Tutor mode:', isActive ? 'ON' : 'OFF');
  }
});
```

## 🗺️ Development Roadmap

### Phase 1: Pre-School Foundation (Ages 3-5)
**Target**: Children with no alphabet/number knowledge

#### Phase 1A: Basic Audio System ⏳ *Next*
- **Audio toggle** with persistent settings
- **Phonetic sounds** for all letters (A says "ah")
- **Web Speech API** integration (no audio files needed)
- **Virtual keyboard clicks** trigger audio feedback

#### Phase 1B: Key Information Display ⏳ *Planned*
- **Large letter display** when keys are clicked
- **Visual feedback** with animations and colors
- **Simple information panel** showing letter and sound

#### Phase 1C: Animal/Object Associations ⏳ *Planned*
- **Memory aids**: A=Apple🍎, B=Bear🐻, C=Cat🐱
- **Enhanced audio**: "A is for Apple" pronunciation
- **Visual learning cards** with emoji associations

### Phase 2: Kindergarten Skills (Ages 5-6)
**Target**: Basic letter recognition, learning phonics

#### Phase 2A: Finger Positioning Guide
- **Hand position illustrations** showing correct fingers
- **Kid-friendly finger names** ("Pointer Pete", "Middle Mike")
- **Progressive learning** starting with home row

#### Phase 2B: Sign Language Integration
- **ASL alphabet** integration for inclusive learning
- **Multi-modal learning** (audio + visual + sign)
- **Cultural sensitivity** and accessibility focus

### Phase 3: Elementary Skills (Ages 6-8)
**Target**: Basic reading, number recognition

#### Phase 3A: Simple Word Building
- **Guided word formation** (CAT, DOG, SUN)
- **Phonics integration** blending sounds into words
- **Word recognition games** with progress tracking

#### Phase 3B: Touch Typing Fundamentals
- **Proper finger positioning** for all keys
- **Typing speed tracking** age-appropriate goals
- **Simple typing exercises** and mini-games

### Phase 4: AI-Powered Learning (Ages 8+)
**Target**: Personalized, adaptive instruction

#### Phase 4A: Voice Conversation
- **AI tutor integration** using OpenAI/Claude APIs
- **Voice interaction** for natural conversation
- **Child-safe guardrails** and parental controls

#### Phase 4B: Adaptive Instruction
- **Pattern recognition** analyzing typing behavior
- **Personalized suggestions** based on individual progress
- **Difficulty adjustment** matching child's skill level

#### Phase 4C: Advanced Analytics
- **Progress tracking** with detailed insights
- **Parent/teacher reports** showing learning outcomes
- **Learning gap identification** with targeted practice

## Styling

### BEM CSS Architecture

Kids Keyboard uses **BEM (Block Element Modifier)** methodology for CSS classes, ensuring no conflicts with other libraries:

```css
/* Main Components */
.kids-keyboard                          /* Main keyboard container */
.kids-keyboard__row                     /* Individual keyboard rows */
.kids-keyboard__key                     /* Individual keys */

/* Key Types (Modifiers) */
.kids-keyboard__key--normal             /* Letter and number keys */
.kids-keyboard__key--function           /* Function keys (Enter, Backspace, etc.) */
.kids-keyboard__key--modifier           /* Modifier keys (Shift, Caps Lock) */
.kids-keyboard__key--space              /* Space bar */

/* Key States */
.kids-keyboard__key--highlighted        /* Keys highlighted by physical keyboard */
.kids-keyboard__key--highlight-normal   /* Normal keys when highlighted (green) */
.kids-keyboard__key--highlight-modifier /* Modifier keys when highlighted (yellow) */
.kids-keyboard__key--highlight-function /* Function keys when highlighted (blue) */
.kids-keyboard__key--active-modifier    /* Active modifier keys (Shift, Caps) */

/* Layout States */
.kids-keyboard--shift-layout            /* Keyboard in shift mode */

/* Character Display */
.kids-keyboard__key-char--default       /* Default character display */
.kids-keyboard__key-char--shift         /* Shifted character display */
```

### Tutor Mode Styling

```css
/* Tutor Container (IDs because there should only be one per page) */
#kids-keyboard-tutor                              /* Base tutor container */
#kids-keyboard-tutor.kids-keyboard__tutor--active /* Active tutor mode */
#kids-keyboard-tutor-output                                 /* Tutor output field */
```

### Custom Styling Example

```css
/* Customize key colors */
.kids-keyboard__key--normal {
  background: #e3f2fd;
  border-color: #2196f3;
}

.kids-keyboard__key--highlight-normal {
  background: #4caf50 !important;
  color: white;
}

/* Customize tutor mode indicator */
#kids-keyboard-tutor.kids-keyboard__tutor--active {
  border-color: #ff9800;
  background: rgba(255, 152, 0, 0.1);
}
```

### Responsive Design

The keyboard automatically adapts to different screen sizes:

- **Desktop (>1024px)**: Full-size keyboard with 45px keys
- **Tablet (768-1024px)**: Compact layout with 40px keys
- **Small Tablet (≤768px)**: Minimized spacing with 35px keys

## Examples

### Basic Typing Interface

```javascript
const keyboard = createKidsKeyboard({
  container: '#kids-keyboard-input',
  onChange: (input) => {
    document.getElementById('output').value = input;
  }
});
```

### Educational Application with Statistics

```javascript
const keyboard = createKidsKeyboard({
  container: '#kids-keyboard-input',
  targetOutput: '#kids-keyboard-tutor-output',
  tutorContainer: '#kids-keyboard-tutor',
  debug: true,

  onChange: (input) => {
    updateStats(input);
  },

  onKeyPress: (key) => {
    console.log('Key pressed:', key);
    trackKeystroke(key);
  },

  onTutorModeChange: (isActive) => {
    document.getElementById('kids-keyboard-tutor-mode').textContent = isActive ? 'ON' : 'OFF';
    toggleTutorUI(isActive);
  }
});

function updateStats(input) {
  document.getElementById('kids-keyboard-char-count').textContent = input.length;
  document.getElementById('kids-keyboard-word-count').textContent =
    input.trim() ? input.trim().split(/\s+/).length : 0;
}
```

### Complete HTML Example

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="node_modules/kids-keyboard/src/kids-keyboard.css">
</head>
<body>
  <div id="kids-keyboard-stats">
    <div class="kids-keyboard-stat-item">
      <div class="kids-keyboard-stat-item__label">Characters</div>
      <div class="kids-keyboard-stat-item__value" id="kids-keyboard-char-count">0</div>
    </div>
    <div class="kids-keyboard-stat-item">
      <div class="kids-keyboard-stat-item__label">Words</div>
      <div class="kids-keyboard-stat-item__value" id="kids-keyboard-word-count">0</div>
    </div>
  </div>

  <div id="kids-keyboard-tutor">
    <textarea id="kids-keyboard-tutor-output"
              placeholder="Hover over this area to activate tutor mode!"></textarea>
    <div id="kids-keyboard-input"></div>
  </div>

  <script src="node_modules/kids-keyboard/src/kids-keyboard.js"></script>
  <script>
    const keyboard = createKidsKeyboard({
      container: '#kids-keyboard-input',
      targetOutput: '#kids-keyboard-tutor-output',
      tutorContainer: '#kids-keyboard-tutor',
      onChange: (input) => updateStats(input)
    });
  </script>
</body>
</html>
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## TypeScript Support

Kids Keyboard includes comprehensive TypeScript definitions:

```typescript
import createKidsKeyboard, { KidsKeyboardOptions, KidsKeyboardState } from 'kids-keyboard';

const options: KidsKeyboardOptions = {
  container: '#kids-keyboard-input',
  targetOutput: '#kids-keyboard-tutor-output',
  debug: true,
  onChange: (input: string) => {
    console.log('Input:', input);
  },
  onTutorModeChange: (isActive: boolean) => {
    console.log('Tutor mode:', isActive ? 'ON' : 'OFF');
  }
};

const keyboard = createKidsKeyboard(options);
const state: KidsKeyboardState = keyboard.getState();
```

## Architecture & Performance

### No Build Step Required
Kids Keyboard is designed to work directly with modern bundlers like Vite, Webpack, and Rollup without requiring a build step. The source files are clean, modern JavaScript that bundlers can optimize.

### BEM CSS Methodology
All CSS classes follow BEM (Block Element Modifier) naming convention with the `kids-keyboard` namespace, preventing conflicts with other libraries:

```css
.kids-keyboard__key--modifier  /* Block__Element--Modifier */
```

### Performance Optimizations

- **Differential Rendering**: Only updates changed elements
- **CSS-Based Layout Switching**: Avoids expensive DOM operations
- **Memory Management**: Proper cleanup prevents memory leaks
- **Event Delegation**: Efficient event handling for all keys
- **Constant Caching**: Pre-computed layouts and mappings
- **Input Validation**: Length limits prevent memory issues
- **Minimal HTML**: Clean output without unnecessary attributes

### Clean HTML Output

Kids Keyboard generates minimal, semantic HTML without bloat:

```html
<!-- Clean, minimal key button -->
<button class="kids-keyboard__key kids-keyboard__key--normal" data-key="q">
  <span class="kids-keyboard__key-char--default">q</span>
  <span class="kids-keyboard__key-char--shift">Q</span>
</button>

<!-- Function keys are even simpler -->
<button class="kids-keyboard__key kids-keyboard__key--function" data-key="enter">
  ENTER
</button>
```

**What we removed:**
- ❌ Redundant `role="button"` (buttons already have button role)
- ❌ Unnecessary `tabindex="0"` (buttons are focusable by default)
- ❌ Verbose `aria-label` attributes (visible text provides the label)
- ❌ Internal `data-row-index` and `data-key-index` attributes

## Accessibility

- **ARIA Support**: Full screen reader compatibility with proper roles and labels
- **Keyboard Navigation**: Tab through virtual keys with focus indicators
- **High Contrast**: Supports system high contrast mode
- **Reduced Motion**: Respects `prefers-reduced-motion` preference
- **Semantic HTML**: Proper button elements with accessibility attributes

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

This library was inspired by [simple-keyboard](https://github.com/hodgef/simple-keyboard) by Francisco Hodge. Kids Keyboard is a lightweight, education-focused derivative optimized specifically for children's typing learning applications.

### Key Differences from simple-keyboard:

- **Simplified API** focused on educational use cases
- **Mouse-based tutor mode** activation
- **Enhanced accessibility** for young learners
- **Optimized performance** and memory usage
- **Built-in physical keyboard** integration

## Project Structure

```
kids-keyboard/
├── src/
│   ├── kids-keyboard.js     # Main JavaScript (UMD format, no build step)
│   ├── kids-keyboard.css    # BEM-namespaced styles (alphabetized properties)
│   └── kids-keyboard.d.ts   # TypeScript definitions
├── examples/
│   └── stats.html           # Working example with new layout structure
├── _notes                   # Development roadmap and implementation plan
├── package.json             # NPM package (points to src/, not dist/)
├── README.md               # This documentation
└── LICENSE                 # MIT license
```

### Current HTML Structure (Post-Refactoring)

```html
<div id="kids-keyboard-tutor">                    <!-- Main container -->
  <div id="kids-keyboard-output">                 <!-- Upper section (flex) -->
    <textarea id="kids-keyboard-text"></textarea> <!-- Left: typing output -->
    <div id="kids-keyboard-display"></div>        <!-- Right: key details -->
  </div>
  <div id="kids-keyboard-input"></div>            <!-- Lower section: keyboard -->
</div>
```

**Key Changes from v0.8:**
- Simplified container names (removed `-container` suffixes)
- Split output into text + display areas
- Removed redundant BEM classes on unique IDs
- Ready for educational content in display area

## For AI Code Assistants 🤖

### Current State (v0.9.0)
- **Core keyboard functionality**: ✅ Complete and stable
- **BEM CSS architecture**: ✅ Implemented with alphabetized properties
- **Clean HTML output**: ✅ Minimal attributes, no bloat
- **Educational features**: ⏳ In development (see roadmap above)

### Next Implementation Priority
1. **Phase 1A: Audio System** - Add Web Speech API for letter sounds
2. **Phase 1B: Display Panel** - Show key information in `#kids-keyboard-display`
3. **Phase 1C: Associations** - Add emoji-based letter associations

### Code Patterns to Follow
- **BEM naming**: `kids-keyboard__element--modifier`
- **ID vs Class**: IDs for unique elements, classes for reusable components
- **Progressive enhancement**: Each feature builds on previous
- **Educational focus**: Target pre-school children first (ages 3-5)

### Important Files to Understand
- `_notes`: Complete development plan and educational philosophy
- `src/kids-keyboard.js`: Main implementation (lines 233-271 for key creation)
- `examples/stats.html`: Current working example with new structure
- `src/kids-keyboard.css`: BEM styles (lines 315-357 for new layout)

## Changelog

### 0.9.0 (Current)
- ✅ **Educational Focus**: Comprehensive roadmap for pre-school through elementary
- ✅ **BEM CSS Architecture**: Namespaced classes prevent conflicts
- ✅ **No Build Step**: Works directly with modern bundlers
- ✅ **Mouse-based tutor mode**: Hover activation for guided learning
- ✅ **Comprehensive TypeScript support**: Full type definitions
- ✅ **Responsive design**: Adapts to desktop, tablet, and mobile
- ✅ **Accessibility features**: ARIA support, keyboard navigation
- ✅ **Performance optimizations**: Differential rendering, memory management
- ✅ **Alphabetized CSS**: Organized properties for maintainability
- ✅ **Minimal HTML**: Removed unnecessary attributes for cleaner output
- ✅ **Simplified Structure**: Split output into text + display areas
- 🔄 **BREAKING CHANGE**: Renamed `targetInput` → `targetOutput` for semantic clarity
- 🔄 **BREAKING CHANGE**: Renamed `getTargetInput()` → `getTargetOutput()` method
- 🔄 **BREAKING CHANGE**: Simplified container IDs (removed `-container` suffixes)
- 🔄 **BREAKING CHANGE**: New HTML structure with separate display area

### 0.10.0 (Planned - Phase 1A)
- 🎵 **Audio System**: Web Speech API integration for letter sounds
- 🔊 **Audio Toggle**: Persistent on/off setting with visual indicator
- 📚 **Phonetic Learning**: "A says 'ah'" pronunciation for all letters
- 🎯 **Pre-School Ready**: First educational features for ages 3-5

## Migration Guide

### From Earlier Versions (Breaking Changes in 0.9.0)

If you're upgrading from an earlier version, you'll need to update the following:

**1. API Option Names:**
```javascript
// OLD (before 0.9.0)
const keyboard = createKidsKeyboard({
  targetInput: '#my-input'
});

// NEW (0.9.0+)
const keyboard = createKidsKeyboard({
  targetOutput: '#my-output'  // Renamed for semantic clarity
});
```

**2. Method Names:**
```javascript
// OLD
const inputElement = keyboard.getTargetInput();

// NEW
const outputElement = keyboard.getTargetOutput();
```

**3. HTML Element IDs:**
```html
<!-- OLD -->
<textarea id="kids-keyboard-tutor-input"></textarea>

<!-- NEW -->
<textarea id="kids-keyboard-tutor-output"></textarea>
```

**4. CSS Selectors:**
```css
/* OLD */
#kids-keyboard-tutor-input { }

/* NEW */
#kids-keyboard-tutor-output { }
```

## Troubleshooting

### Common Issues

**Q: The keyboard doesn't appear**
```javascript
// Make sure to include the CSS file
import 'kids-keyboard/src/kids-keyboard.css';

// Ensure the container exists in the DOM
const keyboard = createKidsKeyboard({
  container: '#kids-keyboard-input' // This element must exist
});
```

**Q: Tutor mode doesn't activate**
```javascript
// Make sure tutorContainer and targetOutput are specified and exist
const keyboard = createKidsKeyboard({
  container: '#kids-keyboard-input',
  targetOutput: '#kids-keyboard-tutor-output',    // Must exist in DOM
  tutorContainer: '#kids-keyboard-tutor' // Must exist in DOM
});
```

**Q: Styles are conflicting with my CSS**
```css
/* Kids Keyboard uses BEM methodology - all classes are namespaced */
.kids-keyboard__key { /* This won't conflict with your .key class */ }

/* If you need to override, use specificity */
.my-app .kids-keyboard__key {
  background: custom-color;
}
```

## Support

- 📖 [Documentation](https://github.com/your-org/kids-keyboard/wiki)
- 🐛 [Bug Reports](https://github.com/your-org/kids-keyboard/issues)
- 💬 [Discussions](https://github.com/your-org/kids-keyboard/discussions)
- 📧 [Email Support](mailto:support@example.com)

---

Made with ❤️ for young learners everywhere.