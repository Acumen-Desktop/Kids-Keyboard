# Kids Keyboard 🎯

A lightweight, accessible virtual keyboard designed specifically for children's typing education. Built with modern web standards and optimized for educational environments.

[![npm version](https://badge.fury.io/js/kids-keyboard.svg)](https://badge.fury.io/js/kids-keyboard)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🎯 **Education-Focused**: Designed specifically for children learning to type
- 🖱️ **Mouse-Based Tutor Mode**: Intuitive hover activation for guided learning
- ♿ **Accessibility First**: Full ARIA support and keyboard navigation
- 📱 **Responsive Design**: Works on desktop, laptop, and tablet devices
- ⚡ **High Performance**: Optimized rendering with minimal memory usage
- 🎨 **Visual Feedback**: Clear indicators for physical keyboard synchronization
- 🔧 **Easy Integration**: Simple API with comprehensive TypeScript support
- 🎨 **BEM CSS Architecture**: Namespaced classes prevent styling conflicts
- 📦 **No Build Required**: Works directly with modern bundlers like Vite

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
  targetOutput: '#kids-keyboard-tutor-output',
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
  <textarea id="kids-keyboard-tutor-output"
            placeholder="Hover over this area to activate tutor mode, then start typing!"></textarea>
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
  tutorContainer: '#kids-keyboard-tutor', // Container that triggers tutor mode
  onTutorModeChange: (isActive) => {
    console.log('Tutor mode:', isActive ? 'ON' : 'OFF');
  }
});
```

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

## File Structure

```
kids-keyboard/
├── src/
│   ├── kids-keyboard.js     # Main JavaScript file (UMD format)
│   ├── kids-keyboard.css    # Stylesheet with BEM classes
│   └── kids-keyboard.d.ts   # TypeScript definitions
├── examples/
│   └── stats.html           # Complete working example
├── package.json             # NPM package configuration
├── README.md               # This documentation
└── LICENSE                 # MIT license
```

## Changelog

### 0.9.0 (Current)
- ✅ **BEM CSS Architecture**: Namespaced classes prevent conflicts
- ✅ **No Build Step**: Works directly with modern bundlers
- ✅ **Mouse-based tutor mode**: Hover activation for guided learning
- ✅ **Comprehensive TypeScript support**: Full type definitions
- ✅ **Responsive design**: Adapts to desktop, tablet, and mobile
- ✅ **Accessibility features**: ARIA support, keyboard navigation
- ✅ **Performance optimizations**: Differential rendering, memory management
- ✅ **Alphabetized CSS**: Organized properties for maintainability
- ✅ **Minimal HTML**: Removed unnecessary attributes for cleaner output
- 🔄 **BREAKING CHANGE**: Renamed `targetInput` → `targetOutput` for semantic clarity
- 🔄 **BREAKING CHANGE**: Renamed `getTargetInput()` → `getTargetOutput()` method
- 🔄 **BREAKING CHANGE**: Renamed HTML IDs from `*-input` → `*-output` for clarity

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