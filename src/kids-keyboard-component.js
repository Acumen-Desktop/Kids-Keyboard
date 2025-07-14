const css = `
/**
 * Kids Keyboard - Core Styles
 * 
 * Core keyboard and key styles that should remain stable.
 * This file contains the essential keyboard functionality CSS.
 * 
 * @version 0.9.0
 * @author James Swansburg
 * @license MIT
 */

/* =============================================================================
   KEYBOARD CONTAINER
   ============================================================================= */

.kids-keyboard {
  -moz-user-select: none;
  -webkit-user-select: none;
  background-color: #f5f5f5;
  border: 1px solid black;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin: 0 auto;
  max-width: 800px;
  min-width: 320px;
  padding: 12px;
  position: relative;
  user-select: none;
}

/* =============================================================================
   KEYBOARD ROWS
   ============================================================================= */

.kids-keyboard__row {
  display: flex;
  gap: 4px;
  justify-content: center;
  margin-bottom: 6px;
}

.kids-keyboard__row:last-child {
  margin-bottom: 0;
}

/* =============================================================================
   KEYBOARD KEYS - BASE STYLES
   ============================================================================= */

.kids-keyboard__key {
  align-items: center;
  background: white;
  border: 2px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: flex;
  font-size: 16px;
  font-weight: 500;
  justify-content: center;
  min-height: 45px;
  min-width: 45px;
  outline: none;
  position: relative;
  transition: all 0.15s ease;
}

/* Hover and Focus States */
.kids-keyboard__key:hover,
.kids-keyboard__key:focus {
  border-color: #bbb;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

/* Focus handling - prevent persistent blue highlights on mouse clicks */
.kids-keyboard__key:focus {
  outline: none; /* Remove default focus outline for mouse interactions */
}

.kids-keyboard__key:focus-visible {
  outline: 2px solid #2196F3;
  outline-offset: 2px;
}

.kids-keyboard__key:active {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transform: translateY(0);
}

/* =============================================================================
   KEY TYPES - STYLING BY FUNCTION
   ============================================================================= */

/* Normal character keys (letters, numbers, symbols) */
.kids-keyboard__key--normal {
  flex: 1;
}

/* Function keys (Backspace, Enter, Tab, etc.) */
.kids-keyboard__key--function {
  background: #f8f9fa;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

/* Modifier keys (Shift, Caps Lock, etc.) */
.kids-keyboard__key--modifier {
  background: #fff3cd;
  border-color: #ffeaa7;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

/* Space bar */
.kids-keyboard__key--space {
  flex: 6;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

/* =============================================================================
   SPECIFIC KEY SIZING
   ============================================================================= */

.kids-keyboard__key[data-key="backspace"] {
  flex: 2.5;
}

.kids-keyboard__key[data-key="tab"] {
  flex: 1.5;
}

.kids-keyboard__key[data-key="capslock"] {
  flex: 2.0;
}

.kids-keyboard__key[data-key="enter"] {
  flex: 2.2;
}

.kids-keyboard__key[data-key="shiftleft"],
.kids-keyboard__key[data-key="shiftright"] {
  flex: 2.5;
}

/* =============================================================================
   HIGHLIGHTING STATES - PHYSICAL KEYBOARD SYNC
   ============================================================================= */

.kids-keyboard__key--highlighted {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  font-weight: 700;
  transform: translateY(-2px);
}

/* Normal keys when highlighted (green) */
.kids-keyboard__key--highlight-normal {
  background-color: #4CAF50 !important;
  border-color: #45a049;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  color: white;
  font-weight: 700;
  transform: translateY(-2px);
}

/* Modifier keys when highlighted (yellow) */
.kids-keyboard__key--highlight-modifier {
  background-color: #FFC107 !important;
  border-color: #ffb300;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  color: #333;
  font-weight: 700;
  transform: translateY(-2px);
}

/* Function keys when highlighted (blue) */
.kids-keyboard__key--highlight-function {
  background-color: #2196F3 !important;
  border-color: #1976D2;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  color: white;
  font-weight: 700;
  transform: translateY(-2px);
}

/* =============================================================================
   ACTIVE MODIFIER STATES
   ============================================================================= */

.kids-keyboard__key--active-modifier {
  background-color: #ff9800;
  border-color: #f57c00;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
  color: white;
}

.kids-keyboard__key--active-modifier.kids-keyboard__key--highlighted {
  background-color: #ff6f00 !important;
  border-color: #e65100;
}

/* =============================================================================
   LAYOUT SWITCHING - DUAL CHARACTER DISPLAY
   ============================================================================= */

/* Default character display */
.kids-keyboard__key .kids-keyboard__key-char--default {
  display: block;
}

.kids-keyboard__key .kids-keyboard__key-char--shift {
  display: none;
}

/* Shift layout - show shifted characters */
.kids-keyboard--shift-layout .kids-keyboard__key .kids-keyboard__key-char--default {
  display: none;
}

.kids-keyboard--shift-layout .kids-keyboard__key .kids-keyboard__key-char--shift {
  display: block;
}

/**
 * Kids Keyboard - Layout Styles
 * 
 * Layout containers, tutor mode, and responsive design.
 * This file contains the structural CSS for the keyboard application.
 * 
 * @version 0.9.0
 * @author James Swansburg
 * @license MIT
 */

/* =============================================================================
   TUTOR MODE CONTAINER STYLING
   ============================================================================= */

/* Base tutor container - ID because there should only be one per page */
#kids-keyboard-tutor {
  background-color: lightpink;
  border: 2px solid fuchsia;
  border-radius: 12px;
  margin: 15px 0;
  padding: 15px;
  position: relative;
  transition: all 0.3s ease;
}
/* Tutor Mode ON state */
#kids-keyboard-tutor.active {
  background-color: rgba(76, 175, 80, 0.08);
  border: 2px solid #4CAF50;
  box-shadow: 0 4px 20px rgba(76, 175, 80, 0.25);
}

#kids-keyboard-tutor.active::after {
  font-size: 24px;
  transform: scale(1.1) rotate(5deg);
}

/* Keyboard enhancement in tutor mode */
#kids-keyboard-tutor .kids-keyboard {
  transition: box-shadow 0.3s ease;
}

#kids-keyboard-tutor.active .kids-keyboard {
  box-shadow: 0 8px 25px rgba(76, 175, 80, 0.15);
}

/* =============================================================================
   OUTPUT SECTION LAYOUT
   ============================================================================= */

#kids-keyboard-output {
  display: flex;
  flex-direction: row;
  gap: 10px;
  margin-bottom: 20px;
}

#kids-keyboard-text {
  background: #f8f9fa;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  flex: 1;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 16px;
  line-height: 1.5;
  min-height: 120px;
  padding: 15px;
  resize: vertical;
  transition: all 0.3s ease;
}

#kids-keyboard-text:focus {
  background: white;
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
  outline: none;
}

#kids-keyboard-display {
  background: #f8f9fa;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  flex: 0 0 200px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.4;
  min-height: 120px;
  overflow-y: auto;
  padding: 15px;
  transition: all 0.3s ease;
}

/* =============================================================================
   RESPONSIVE DESIGN - DESKTOP/LAPTOP/TABLET
   ============================================================================= */

/* Tablet and small desktop */
@media (max-width: 1024px) {
  .kids-keyboard {
    max-width: 90vw;
    padding: 10px;
  }
  
  .kids-keyboard__key {
    font-size: 14px;
    min-height: 40px;
    min-width: 40px;
  }
  
  .kids-keyboard__key--function,
  .kids-keyboard__key--modifier {
    font-size: 10px;
  }
}

/* Small tablets and large phones */
@media (max-width: 768px) {
  .kids-keyboard {
    max-width: 95vw;
    padding: 8px;
  }
  
  .kids-keyboard__key {
    font-size: 12px;
    min-height: 35px;
    min-width: 35px;
  }
  
  .kids-keyboard__key--function,
  .kids-keyboard__key--modifier {
    font-size: 9px;
  }
  
  .kids-keyboard__row {
    gap: 3px;
    margin-bottom: 4px;
  }

  /* Stack output vertically on mobile */
  #kids-keyboard-output {
    flex-direction: column;
  }

  #kids-keyboard-display {
    flex: 1;
    min-height: 80px;
  }
}

/* =============================================================================
   ACCESSIBILITY ENHANCEMENTS
   ============================================================================= */

/* High contrast mode support */
@media (prefers-contrast: high) {
  .kids-keyboard__key {
    border-width: 3px;
  }
  
  .kids-keyboard__key--highlight-normal {
    background-color: #2E7D32 !important;
  }
  
  .kids-keyboard__key--highlight-modifier {
    background-color: #F57F17 !important;
  }
  
  .kids-keyboard__key--highlight-function {
    background-color: #1565C0 !important;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .kids-keyboard__key,
  #kids-keyboard-tutor,
  #kids-keyboard-tutor::before,
  #kids-keyboard-tutor::after {
    transition: none;
  }
  
  .kids-keyboard__key:hover,
  .kids-keyboard__key:focus,
  .kids-keyboard__key--highlighted {
    transform: none;
  }
}

/* =============================================================================
   PRINT STYLES
   ============================================================================= */

@media print {
  .kids-keyboard {
    border: 1px solid #ccc;
    box-shadow: none;
  }
  
  .kids-keyboard__key {
    box-shadow: none;
  }
}
`;

class KidsKeyboardComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.state = this._createKeyboardState();
    this.keyElements = new Map();
    this.physicalKeyMap = this._getPhysicalKeyMap();
    this.isTutorMode = false;
  }

  connectedCallback() {
    this.render();
    this._setupEventListeners();
  }

  disconnectedCallback() {
    this._destroy();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ${css}
      </style>
      <div id="kids-keyboard-tutor">
        <div id="kids-keyboard-output">
          <textarea id="kids-keyboard-text"></textarea>
          <div id="kids-keyboard-display"></div>
        </div>
        <div id="kids-keyboard-input" class="kids-keyboard"></div>
      </div>
    `;
    this.container = this.shadowRoot.querySelector('#kids-keyboard-input');
    this.tutorContainer = this.shadowRoot.querySelector('#kids-keyboard-tutor');
    this.targetOutput = this.shadowRoot.querySelector('#kids-keyboard-text');
    this._renderKeyboard();
  }

  // All the methods from the original kids-keyboard.js will be placed here
  // as private methods (e.g., _createKeyboardState, _getKeyboardLayout, etc.)

  _createKeyboardState() {
    return {
      input: '',
      caretPosition: 0,
      isShiftPressed: false,
      isLeftShiftPressed: false,
      isRightShiftPressed: false,
      isCapsLockOn: false
    };
  }

  _getKeyboardLayout() {
    return {
      default: [
        ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
        ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
        ['CapsLock', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter'],
        ['ShiftLeft', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'ShiftRight'],
        ['Space']
      ],
      shift: [
        ['~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', 'Backspace'],
        ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '{', '}', '|'],
        ['CapsLock', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ':', '"', 'Enter'],
        ['ShiftLeft', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '<', '>', '?', 'ShiftRight'],
        ['Space']
      ]
    };
  }

  _getPhysicalKeyMap() {
    return new Map([
      ['Backquote', '`'], ['Digit1', '1'], ['Digit2', '2'], ['Digit3', '3'], ['Digit4', '4'],
      ['Digit5', '5'], ['Digit6', '6'], ['Digit7', '7'], ['Digit8', '8'], ['Digit9', '9'],
      ['Digit0', '0'], ['Minus', '-'], ['Equal', '='], ['Backspace', 'Backspace'],
      ['Tab', 'Tab'], ['KeyQ', 'q'], ['KeyW', 'w'], ['KeyE', 'e'], ['KeyR', 'r'],
      ['KeyT', 't'], ['KeyY', 'y'], ['KeyU', 'u'], ['KeyI', 'i'], ['KeyO', 'o'],
      ['KeyP', 'p'], ['BracketLeft', '['], ['BracketRight', ']'], ['Backslash', '\\'],
      ['CapsLock', 'CapsLock'], ['KeyA', 'a'], ['KeyS', 's'], ['KeyD', 'd'], ['KeyF', 'f'],
      ['KeyG', 'g'], ['KeyH', 'h'], ['KeyJ', 'j'], ['KeyK', 'k'], ['KeyL', 'l'],
      ['Semicolon', ';'], ['Quote', "'"], ['Enter', 'Enter'], ['ShiftLeft', 'ShiftLeft'],
      ['ShiftRight', 'ShiftRight'], ['KeyZ', 'z'], ['KeyX', 'x'], ['KeyC', 'c'],
      ['KeyV', 'v'], ['KeyB', 'b'], ['KeyN', 'n'], ['KeyM', 'm'], ['Comma', ','],
      ['Period', '.'], ['Slash', '/'], ['Space', 'Space']
    ]);
  }

  _renderKeyboard() {
    const KEYBOARD_LAYOUTS = this._getKeyboardLayout();
    this.container.innerHTML = '';
    this.container.className = 'kids-keyboard';
    this.container.setAttribute('role', 'application');
    this.container.setAttribute('aria-label', 'Virtual keyboard for typing input');
    this.container.setAttribute('aria-live', 'polite');

    const defaultLayout = KEYBOARD_LAYOUTS.default;
    const shiftLayout = KEYBOARD_LAYOUTS.shift;

    defaultLayout.forEach((row, rowIndex) => {
      const rowElement = document.createElement('div');
      rowElement.className = 'kids-keyboard__row';

      row.forEach((key, keyIndex) => {
        const keyElement = this._createKeyElement(key, defaultLayout, shiftLayout, rowIndex, keyIndex);
        rowElement.appendChild(keyElement);

        const keyMapName = this._getKeyMapName(key);
        this.keyElements.set(keyMapName, keyElement);
      });

      this.container.appendChild(rowElement);
    });
  }

  _createKeyElement(key, defaultLayout, shiftLayout, rowIndex, keyIndex) {
    const element = document.createElement('button');
    element.className = 'kids-keyboard__key';
    element.dataset.key = key.toLowerCase();

    const defaultChar = defaultLayout[rowIndex][keyIndex];
    const shiftChar = shiftLayout[rowIndex][keyIndex];

    if (defaultChar !== shiftChar && key.length === 1) {
      const defaultSpan = document.createElement('span');
      defaultSpan.className = 'kids-keyboard__key-char--default';
      defaultSpan.textContent = defaultChar;

      const shiftSpan = document.createElement('span');
      shiftSpan.className = 'kids-keyboard__key-char--shift';
      shiftSpan.textContent = shiftChar;

      element.appendChild(defaultSpan);
      element.appendChild(shiftSpan);
    } else {
      element.textContent = this._getKeyDisplayText(key);
    }

    if (this._isModifierKey(key)) {
      element.classList.add('kids-keyboard__key--modifier');
    } else if (key === 'Space') {
      element.classList.add('kids-keyboard__key--space');
    } else if (key.length > 1) {
      element.classList.add('kids-keyboard__key--function');
    } else {
      element.classList.add('kids-keyboard__key--normal');
    }

    return element;
  }

  _getKeyDisplayText(key) {
    if (key === 'ShiftLeft' || key === 'ShiftRight') return 'Shift';
    return key;
  }

  _getKeyMapName(key) {
    return (key === 'ShiftLeft' || key === 'ShiftRight' || key === 'CapsLock') ? key : key.toLowerCase();
  }

  _isModifierKey(key) {
    return ['ShiftLeft', 'ShiftRight', 'CapsLock'].includes(key);
  }

  _setupEventListeners() {
    this.tutorContainer.addEventListener('mouseenter', () => this.toggleTutorMode(true));
    this.tutorContainer.addEventListener('mouseleave', () => this.toggleTutorMode(false));

    document.addEventListener('keydown', this._handlePhysicalKeyDown.bind(this));
    document.addEventListener('keyup', this._handlePhysicalKeyUp.bind(this));

    this.container.addEventListener('click', this._handleVirtualKeyPress.bind(this));
  }

  toggleTutorMode(isActive) {
    this.isTutorMode = isActive;
    this.tutorContainer.classList.toggle('active', isActive);
    if (isActive) {
      this.state.input = this.targetOutput.value || '';
      this.state.caretPosition = this.targetOutput.selectionStart || 0;
    }
  }

  _handleVirtualKeyPress(e) {
    if (e.target.matches('.kids-keyboard__key')) {
      e.preventDefault();
      const keyName = e.target.dataset.key;
      let originalKey = keyName;
      if (keyName === 'shiftleft') originalKey = 'ShiftLeft';
      else if (keyName === 'shiftright') originalKey = 'ShiftRight';
      else if (keyName === 'capslock') originalKey = 'CapsLock';
      else if (keyName === 'backspace') originalKey = 'Backspace';
      else if (keyName === 'enter') originalKey = 'Enter';
      else if (keyName === 'space') originalKey = 'Space';
      else if (keyName === 'tab') originalKey = 'Tab';
      this._handleKeyPress(originalKey, e, 'virtual');
    }
  }

  _handlePhysicalKeyDown(event) {
    if (!this.isTutorMode) return;

    const virtualKey = this.physicalKeyMap.get(event.code);
    if (!virtualKey) return;

    this._updateModifierStatesInternal(event);
    this._highlightKey(virtualKey, true);

    if (virtualKey.length === 1 || ['Backspace', 'Enter', 'Space', 'Tab'].includes(virtualKey)) {
      event.preventDefault();
      this._handleKeyPress(virtualKey, event, 'physical');
    } else if (virtualKey === 'CapsLock') {
      event.preventDefault();
      this._handleKeyPress(virtualKey, event, 'physical');
    }
  }

  _handlePhysicalKeyUp(event) {
    if (!this.isTutorMode) return;

    const virtualKey = this.physicalKeyMap.get(event.code);
    if (!virtualKey) return;

    this._updateModifierStatesInternal(event);
    if (virtualKey !== 'CapsLock' || !this.state.isCapsLockOn) {
      this._highlightKey(virtualKey, false);
    }
  }

  _updateModifierStatesInternal(event) {
    this.state.isShiftPressed = event.shiftKey;
    if (event.type === 'keydown') {
      if (event.code === 'ShiftLeft') this.state.isLeftShiftPressed = true;
      else if (event.code === 'ShiftRight') this.state.isRightShiftPressed = true;
    } else if (event.type === 'keyup') {
      if (event.code === 'ShiftLeft') this.state.isLeftShiftPressed = false;
      else if (event.code === 'ShiftRight') this.state.isRightPressed = false;
    }

    if (typeof event.getModifierState === 'function') {
      this.state.isCapsLockOn = event.getModifierState('CapsLock');
    }
    this._updateLayoutClass();
    this._updateKeyStates();
  }

  _handleKeyPress(key, event, inputSource = 'unknown') {
    let inputChanged = false;

    switch (key) {
      case 'Backspace':
        const { newInput: backspaceInput, newCaretPosition: backspaceCaret } =
          this._deleteAtCaret(this.state.input, this.state.caretPosition);
        this.state.input = backspaceInput;
        this.state.caretPosition = backspaceCaret;
        inputChanged = true;
        break;
      case 'Enter':
        const { newInput: enterInput, newCaretPosition: enterCaret } =
          this._updateInputAtCaret(this.state.input, this.state.caretPosition, '\n');
        this.state.input = enterInput;
        this.state.caretPosition = enterCaret;
        inputChanged = true;
        break;
      case 'Space':
        const { newInput: spaceInput, newCaretPosition: spaceCaret } =
          this._updateInputAtCaret(this.state.input, this.state.caretPosition, ' ');
        this.state.input = spaceInput;
        this.state.caretPosition = spaceCaret;
        inputChanged = true;
        break;
      case 'Tab':
        const { newInput: tabInput, newCaretPosition: tabCaret } =
          this._updateInputAtCaret(this.state.input, this.state.caretPosition, '\t');
        this.state.input = tabInput;
        this.state.caretPosition = tabCaret;
        inputChanged = true;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
      case 'CapsLock':
        break;
      default:
        if (key.length === 1) {
          const transformedChar = this._transformCharacter(key, this.state);
          const { newInput: charInput, newCaretPosition: charCaret } =
            this._updateInputAtCaret(this.state.input, this.state.caretPosition, transformedChar);
          this.state.input = charInput;
          this.state.caretPosition = charCaret;
          inputChanged = true;
        }
        break;
    }

    if (inputChanged) {
      this.targetOutput.value = this.state.input;
      this.targetOutput.setSelectionRange(this.state.caretPosition, this.state.caretPosition);
      this.targetOutput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  _transformCharacter(char, state) {
    const SHIFT_MAP = {
      '`': '~', '1': '!', '2': '@', '3': '#', '4': '$',
      '5': '%',
      '6': '^', '7': '&', '8': '*', '9': '(', '0': ')', '-': '_', '=': '+',
      '[': '{', ']': '}', '\\': '|', ';': ':', "'": '"',
      ',': '<', '.': '>', '/': '?'
    };

    if (/^[a-z]$/i.test(char)) {
      const shouldUppercase = state.isShiftPressed !== state.isCapsLockOn;
      return shouldUppercase ? char.toUpperCase() : char.toLowerCase();
    }

    if (state.isShiftPressed) {
      return SHIFT_MAP[char] || char;
    }

    return char;
  }

  _updateInputAtCaret(input, caretPosition, newChar) {
    const before = input.substring(0, caretPosition);
    const after = input.substring(caretPosition);
    return {
      newInput: before + newChar + after,
      newCaretPosition: caretPosition + 1
    };
  }

  _deleteAtCaret(input, caretPosition) {
    if (caretPosition <= 0) return { newInput: input, newCaretPosition: 0 };

    const before = input.substring(0, caretPosition - 1);
    const after = input.substring(caretPosition);
    return {
      newInput: before + after,
      newCaretPosition: caretPosition - 1
    };
  }

  _updateLayoutClass() {
    const shouldUseShift = this.state.isShiftPressed !== this.state.isCapsLockOn;
    this.container.classList.toggle('kids-keyboard--shift-layout', shouldUseShift);
  }

  _highlightKey(key, highlight) {
    const keyMapName = this._getKeyMapName(key);
    const element = this.keyElements.get(keyMapName);
    if (!element) return;

    element.classList.remove('kids-keyboard__key--highlighted', 'kids-keyboard__key--highlight-normal', 'kids-keyboard__key--highlight-modifier', 'kids-keyboard__key--highlight-function');

    if (highlight) {
      if (this._isModifierKey(key)) {
        element.classList.add('kids-keyboard__key--highlight-modifier');
      } else if (key.length > 1 && key !== 'Space') {
        element.classList.add('kids-keyboard__key--highlight-function');
      } else {
        element.classList.add('kids-keyboard__key--highlight-normal');
      }
      element.classList.add('kids-keyboard__key--highlighted');
    }
  }

  _updateKeyStates() {
    this.keyElements.forEach((element, key) => {
      element.classList.remove('kids-keyboard__key--active-modifier', 'kids-keyboard__key--highlight-modifier');

      if (key === 'ShiftLeft' && this.state.isLeftShiftPressed) {
        element.classList.add('kids-keyboard__key--active-modifier');
      } else if (key === 'ShiftRight' && this.state.isRightShiftPressed) {
        element.classList.add('kids-keyboard__key--active-modifier');
      } else if (key === 'CapsLock' && this.state.isCapsLockOn) {
        element.classList.add('kids-keyboard__key--active-modifier', 'kids-keyboard__key--highlight-modifier', 'kids-keyboard__key--highlighted');
      } else if (key === 'CapsLock' && !this.state.isCapsLockOn) {
        element.classList.remove('kids-keyboard__key--highlighted');
      }
    });
  }

  _destroy() {
    document.removeEventListener('keydown', this._handlePhysicalKeyDown);
    document.removeEventListener('keyup', this._handlePhysicalKeyUp);
    this.keyElements.clear();
  }
}

customElements.define('kids-keyboard', KidsKeyboardComponent);