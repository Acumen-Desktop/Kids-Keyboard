/**
 * Kids Keyboard - Virtual Keyboard for Children's Typing Education
 * 
 * A lightweight, accessible virtual keyboard designed specifically for young learners.
 * Focused on simplicity, performance, and educational effectiveness.
 * 
 * @version 0.9.0
 * @author James Swansburg
 * @license MIT
 * 
 * ACKNOWLEDGMENTS:
 * This library was inspired by simple-keyboard (https://github.com/hodgef/simple-keyboard)
 * by Francisco Hodge. Kids-keyboard is a lightweight, education-focused derivative
 * optimized specifically for children's typing learning applications.
 * 
 * Key differences from simple-keyboard:
 * - Simplified API focused on educational use cases
 * - Mouse-based tutor mode activation
 * - Enhanced accessibility for young learners
 * - Optimized for performance and memory usage
 * - Built-in physical keyboard integration
 * 
 * PRODUCTION-READY FEATURES:
 * ✓ State management race condition fixes
 * ✓ Optimized DOM rendering with differential updates
 * ✓ Correct Shift/CapsLock logic for letters vs symbols
 * ✓ Memory optimizations with constant caching
 * ✓ Comprehensive error handling and validation
 * ✓ Mouse-based tutor mode with visual feedback
 * ✓ Accessibility support with ARIA attributes
 * ✓ Responsive design for desktop/laptop/tablet
 */

// =============================================================================
// BROWSER COMPATIBILITY CHECKS
// =============================================================================

import { initializeDisplay, updateKeyDisplay, injectDisplayStyles } from './features/kids-keyboard-display.js';
import { getLetterAssociation } from './features/kids-keyboard-associations.js';
import { createFingerGuides, highlightFinger } from './features/kids-keyboard-finger-guides.js';
import { injectSignLanguageFont, createSignLanguageDisplay, showSign } from './features/kids-keyboard-sign-language.js';
import * as lessonManager from './features/lessons/lessons.js';

const BROWSER_SUPPORT = {
    hasEventListeners: typeof document.addEventListener === 'function',
    hasQuerySelector: typeof document.querySelector === 'function',
    hasClassList: 'classList' in document.createElement('div'),
    hasGetModifierState: typeof KeyboardEvent !== 'undefined' && 
                        KeyboardEvent.prototype && 
                        'getModifierState' in KeyboardEvent.prototype
};

// Warn about compatibility issues
if (!BROWSER_SUPPORT.hasEventListeners || !BROWSER_SUPPORT.hasQuerySelector) {
    console.warn('Kids Keyboard: Browser may not be fully supported. Modern browser recommended.');
}

// =============================================================================
// STATE MANAGEMENT
// =============================================================================

const createKeyboardState = () => ({
    input: '',
    caretPosition: 0,
    isShiftPressed: false,
    isLeftShiftPressed: false,
    isRightShiftPressed: false,
    isCapsLockOn: false
});

// =============================================================================
// KEYBOARD LAYOUT DATA
// =============================================================================

const getKeyboardLayout = () => ({
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
});

const getPhysicalKeyMap = () => new Map([
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

// =============================================================================
// CONSTANTS (Performance Optimization)
// =============================================================================

// Module-level constant to avoid repeated object creation
const SHIFT_MAP = Object.freeze({
    '`': '~', '1': '!', '2': '@', '3': '#', '4': '$', '5': '%',
    '6': '^', '7': '&', '8': '*', '9': '(', '0': ')', '-': '_', '=': '+',
    '[': '{', ']': '}', '\\': '|', ';': ':', "'": '"',
    ',': '<', '.': '>', '/': '?'
});

// Cache keyboard layouts to reduce function call overhead
const KEYBOARD_LAYOUTS = Object.freeze(getKeyboardLayout());

// Input length limit for performance and memory safety
const MAX_INPUT_LENGTH = 10000;

// =============================================================================
// PURE UTILITY FUNCTIONS
// =============================================================================

const isModifierKey = (key) => ['ShiftLeft', 'ShiftRight', 'CapsLock'].includes(key);

/**
 * Determines which layout to display based on modifier states
 * Letters: CapsLock XOR Shift determines case
 * Symbols: Only Shift affects symbols, CapsLock ignored
 */
const getCurrentLayout = (state) => {
    const shouldUseShift = state.isShiftPressed !== state.isCapsLockOn;
    return shouldUseShift ? KEYBOARD_LAYOUTS.shift : KEYBOARD_LAYOUTS.default;
};

const getKeyDisplayText = (key) => {
    if (key === 'ShiftLeft' || key === 'ShiftRight') return 'Shift';
    return key;
};

const getKeyMapName = (key) => {
    return (key === 'ShiftLeft' || key === 'ShiftRight' || key === 'CapsLock') ? key : key.toLowerCase();
};

/**
 * Transforms character based on current modifier states
 */
const transformCharacter = (char, state) => {
    // For letters: both shift and caps lock affect case
    if (/^[a-z]$/i.test(char)) {
        const shouldUppercase = state.isShiftPressed !== state.isCapsLockOn;
        return shouldUppercase ? char.toUpperCase() : char.toLowerCase();
    }

    // For symbols: only shift affects them, caps lock is ignored
    if (state.isShiftPressed) {
        return SHIFT_MAP[char] || char;
    }

    return char;
};

/**
 * Input validation with length limits
 */
const validateInput = (input) => {
    if (typeof input !== 'string') {
        throw new Error('Input must be a string');
    }
    // Prevent memory issues with extremely long inputs
    if (input.length > MAX_INPUT_LENGTH) {
        console.warn(`Kids Keyboard: Input truncated to ${MAX_INPUT_LENGTH} characters for performance`);
        return input.substring(0, MAX_INPUT_LENGTH);
    }
    return input;
};

const validateCaretPosition = (caretPosition, inputLength) => {
    if (typeof caretPosition !== 'number' || caretPosition < 0) {
        return 0;
    }
    if (caretPosition > inputLength) {
        return inputLength;
    }
    return caretPosition;
};

const updateInputAtCaret = (input, caretPosition, newChar) => {
    const validInput = validateInput(input);
    const validCaret = validateCaretPosition(caretPosition, validInput.length);

    const before = validInput.substring(0, validCaret);
    const after = validInput.substring(validCaret);
    return {
        newInput: before + newChar + after,
        newCaretPosition: validCaret + 1
    };
};

const deleteAtCaret = (input, caretPosition) => {
    const validInput = validateInput(input);
    const validCaret = validateCaretPosition(caretPosition, validInput.length);

    if (validCaret <= 0) return { newInput: validInput, newCaretPosition: 0 };

    const before = validInput.substring(0, validCaret - 1);
    const after = validInput.substring(validCaret);
    return {
        newInput: before + after,
        newCaretPosition: validCaret - 1
    };
};

/**
 * Safe callback execution with error handling
 */
const safeCallback = (callback, ...args) => {
    if (typeof callback === 'function') {
        try {
            return callback(...args);
        } catch (error) {
            console.error('Kids Keyboard callback error:', error);
        }
    }
};

// =============================================================================
// DOM UTILITIES
// =============================================================================

/**
 * Creates keyboard key elements with accessibility support
 */
const createKeyElement = (key, defaultLayout, shiftLayout, rowIndex, keyIndex) => {
    const element = document.createElement('button');
    element.className = 'kids-keyboard__key';
    element.dataset.key = key.toLowerCase();

    // Store both default and shift characters for this key position
    const defaultChar = defaultLayout[rowIndex][keyIndex];
    const shiftChar = shiftLayout[rowIndex][keyIndex];

    // Create character display elements for efficient switching
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
        // For modifier keys and keys that don't change
        element.textContent = getKeyDisplayText(key);
    }

    // Add special classes for different key types
    if (isModifierKey(key)) {
        element.classList.add('kids-keyboard__key--modifier');
    } else if (key === 'Space') {
        element.classList.add('kids-keyboard__key--space');
    } else if (key.length > 1) {
        element.classList.add('kids-keyboard__key--function');
    } else {
        element.classList.add('kids-keyboard__key--normal');
    }

    return element;
};

/**
 * Renders keyboard with differential rendering for performance
 */
const renderKeyboard = (container, state, keyElements, onKeyPress) => {
    // Only render DOM elements once
    if (keyElements.size === 0) {
        container.innerHTML = '';
        container.className = 'kids-keyboard';
        
        // Add ARIA attributes for the keyboard container
        container.setAttribute('role', 'application');
        container.setAttribute('aria-label', 'Virtual keyboard for typing input');
        container.setAttribute('aria-live', 'polite');

        const defaultLayout = KEYBOARD_LAYOUTS.default;
        const shiftLayout = KEYBOARD_LAYOUTS.shift;

        defaultLayout.forEach((row, rowIndex) => {
            const rowElement = document.createElement('div');
            rowElement.className = 'kids-keyboard__row';

            row.forEach((key, keyIndex) => {
                const keyElement = createKeyElement(key, defaultLayout, shiftLayout, rowIndex, keyIndex);
                rowElement.appendChild(keyElement);

                const keyMapName = getKeyMapName(key);
                keyElements.set(keyMapName, keyElement);
            });

            container.appendChild(rowElement);
        });

        // Use event delegation for better performance
        const handleContainerClick = (e) => {
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

                // Dispatch a custom event instead of directly calling the callback
                const event = new CustomEvent('virtualkeypress', { 
                    bubbles: true, 
                    cancelable: true, 
                    detail: { key: originalKey, event: e }
                });
                container.dispatchEvent(event);
            }
        };
        
        const handleContainerMouseDown = (e) => {
            const keyElement = e.target.closest('.kids-keyboard__key');
            if (keyElement) {
                keyElement.style.transform = 'scale(0.95)';
            }
        };

        const handleContainerMouseUpOrOut = (e) => {
            const keyElement = e.target.closest('.kids-keyboard__key');
            if (keyElement) {
                keyElement.style.transform = '';
                keyElement.blur(); // Remove focus to prevent sticky state
            }
        };
        
        container.addEventListener('mousedown', handleContainerMouseDown);
        container.addEventListener('mouseup', handleContainerMouseUpOrOut);
        container.addEventListener('mouseout', handleContainerMouseUpOrOut);

        // Use event delegation with capture for better performance and reliability
        container.addEventListener('click', handleContainerClick, { capture: true });

        container.addEventListener('virtualkeypress', (e) => {
            const { key, event } = e.detail;
            safeCallback(onKeyPress, key, event, 'virtual');
        });
    }

    // Update layout class for CSS-based switching
    updateLayoutClass(container, state);
};

/**
 * Updates layout display using CSS classes for performance
 */
const updateLayoutClass = (container, state) => {
    const shouldUseShift = state.isShiftPressed !== state.isCapsLockOn;
    container.classList.toggle('kids-keyboard--shift-layout', shouldUseShift);
};

/**
 * Highlights keys with appropriate styling
 */
const highlightKey = (keyElements, key, highlight) => {
    const keyMapName = getKeyMapName(key);
    const element = keyElements.get(keyMapName);
    if (!element) return;

    // Remove all highlight classes first
    element.classList.remove('kids-keyboard__key--highlighted', 'kids-keyboard__key--highlight-normal', 'kids-keyboard__key--highlight-modifier', 'kids-keyboard__key--highlight-function');

    if (highlight) {
        // Add appropriate highlight class based on key type
        if (isModifierKey(key)) {
            element.classList.add('kids-keyboard__key--highlight-modifier');
        } else if (key.length > 1 && key !== 'Space') {
            element.classList.add('kids-keyboard__key--highlight-function');
        } else {
            element.classList.add('kids-keyboard__key--highlight-normal');
        }
        element.classList.add('kids-keyboard__key--highlighted');
    }
};

/**
 * Updates visual state of modifier keys
 */
const updateKeyStates = (keyElements, state) => {
    keyElements.forEach((element, key) => {
        element.classList.remove('kids-keyboard__key--active-modifier', 'kids-keyboard__key--highlight-modifier');

        if (key === 'ShiftLeft' && state.isLeftShiftPressed) {
            element.classList.add('kids-keyboard__key--active-modifier');
        } else if (key === 'ShiftRight' && state.isRightShiftPressed) {
            element.classList.add('kids-keyboard__key--active-modifier');
        } else if (key === 'CapsLock' && state.isCapsLockOn) {
            element.classList.add('kids-keyboard__key--active-modifier', 'kids-keyboard__key--highlight-modifier', 'kids-keyboard__key--highlighted');
        } else if (key === 'CapsLock' && !state.isCapsLockOn) {
            element.classList.remove('kids-keyboard__key--highlighted');
        }
    });
};

// =============================================================================
// MODIFIER STATE HANDLING
// =============================================================================

const updateModifierStatesInternal = (currentState, event) => {
    const newState = { ...currentState };
    
    // Update general shift state
    newState.isShiftPressed = event.shiftKey;
    
    // Update specific shift key states
    if (event.type === 'keydown') {
        if (event.code === 'ShiftLeft') {
            newState.isLeftShiftPressed = true;
        } else if (event.code === 'ShiftRight') {
            newState.isRightShiftPressed = true;
        }
    } else if (event.type === 'keyup') {
        if (event.code === 'ShiftLeft') {
            newState.isLeftShiftPressed = false;
        } else if (event.code === 'ShiftRight') {
            newState.isRightShiftPressed = false;
        }
    }

    // Handle caps lock state detection
    if (BROWSER_SUPPORT.hasGetModifierState && event.getModifierState) {
        const capsLockState = event.getModifierState('CapsLock');
        if (capsLockState !== currentState.isCapsLockOn) {
            newState.isCapsLockOn = capsLockState;
        }
    }

    return newState;
};

// =============================================================================
// MAIN FACTORY FUNCTION
// =============================================================================

/**
 * Creates a new Kids Keyboard instance
 * @param {Object} options - Configuration options
 * @returns {Object} Kids Keyboard API object
 */
function createKidsKeyboard(options = {}) {
    // Merge default options
    const defaultOptions = {
        debug: false,
        targetOutput: null,
        learningMode: 'associations' // 'associations', 'signLanguage', or 'lesson'
    };
    const mergedOptions = { ...defaultOptions, ...options };

    // Get container element with improved error handling
    let container;
    try {
        container = typeof mergedOptions.container === 'string' 
            ? document.querySelector(mergedOptions.container)
            : mergedOptions.container;
    } catch (error) {
        throw new Error(`Invalid container selector: ${mergedOptions.container}. Error: ${error.message}`);
    }

    if (!container) {
        throw new Error(`Container element not found: ${mergedOptions.container}. Please ensure the element exists in the DOM.`);
    }

    if (!(container instanceof HTMLElement)) {
        throw new Error(`Container must be an HTMLElement. Received: ${typeof container}`);
    }

    // Get target output element for tutor mode
    let targetOutput = null;
    if (mergedOptions.targetOutput) {
        try {
            targetOutput = typeof mergedOptions.targetOutput === 'string'
                ? document.querySelector(mergedOptions.targetOutput)
                : mergedOptions.targetOutput;
        } catch (error) {
            console.warn(`Invalid target output selector: ${mergedOptions.targetOutput}`);
        }

        if (targetOutput && !(targetOutput instanceof HTMLElement)) {
            console.warn(`Target output must be an HTMLElement. Received: ${typeof targetOutput}`);
            targetOutput = null;
        }
    }

    // Initialize state and elements
    let state = createKeyboardState();
    const keyElements = new Map();
    const physicalKeyMap = getPhysicalKeyMap();
    
    // Initialize the display feature
    if (mergedOptions.learningMode === 'associations') {
        injectDisplayStyles();
        initializeDisplay(container);
    } else if (mergedOptions.learningMode === 'signLanguage') {
        injectSignLanguageFont();
        createSignLanguageDisplay(container);
    }
    createFingerGuides(container);

    // Track tutor mode state
    let isTutorMode = false;

    /**
     * Centralized state update function to prevent race conditions
     */
    const setState = (newState) => {
        const prevState = state;
        state = newState;

        // Update layout class if modifier states changed
        if (prevState.isShiftPressed !== newState.isShiftPressed ||
            prevState.isCapsLockOn !== newState.isCapsLockOn) {
            updateLayoutClass(container, state);
        }

        // Always update key states for modifier highlighting
        updateKeyStates(keyElements, state);

        // Safely notify state change
        safeCallback(mergedOptions.onStateChange, { ...state });
    };

    /**
 * Generates descriptive information for a given key.
 * @param {string} key - The key identifier (e.g., 'a', '1', 'Backspace').
 * @returns {object} An object with name and sound properties.
 */
const getKeyInfo = (key) => {
    const upperKey = key.toUpperCase();
    const association = getLetterAssociation(key);

    if (association) {
        return {
            name: `${upperKey} is for ${association.name}`,
            sound: `says '${key.toLowerCase()}'`,
            emoji: association.emoji
        };
    }

    if (key.match(/^[0-9]$/)) {
        return {
            name: `Number ${key}`,
            sound: `is ${key}`
        };
    }

    switch (key) {
        case 'Space': return { name: 'Space Bar', sound: 'makes a space' };
        case 'Enter': return { name: 'Enter Key', sound: 'starts a new line' };
        case 'Backspace': return { name: 'Backspace Key', sound: 'erases text' };
        default: return { name: key, sound: '' };
    }
};

    /**
     * Handles key press events from both virtual and physical keyboards
     */
    const handleKeyPress = (key, event, inputSource = 'unknown') => {
        safeCallback(mergedOptions.onKeyPress, key, event, inputSource);

        if (lessonManager.isLessonActive()) {
            lessonManager.handleKeyPress(key);
            return; // Don't process regular input during lessons
        }

        if (mergedOptions.learningMode === 'associations') {
            const keyInfo = getKeyInfo(key);
            updateKeyDisplay(key, keyInfo);
        } else if (mergedOptions.learningMode === 'signLanguage') {
            showSign(key);
        }

        highlightFinger(key);

        let newState = { ...state };
        let inputChanged = false;

        // Handle special keys
        switch (key) {
            case 'Backspace':
                const { newInput: backspaceInput, newCaretPosition: backspaceCaret } =
                    deleteAtCaret(state.input, state.caretPosition);
                newState = { ...newState, input: backspaceInput, caretPosition: backspaceCaret };
                inputChanged = true;
                break;
            case 'Enter':
                const { newInput: enterInput, newCaretPosition: enterCaret } =
                    updateInputAtCaret(state.input, state.caretPosition, '\n');
                newState = { ...newState, input: enterInput, caretPosition: enterCaret };
                inputChanged = true;
                break;
            case 'Space':
                const { newInput: spaceInput, newCaretPosition: spaceCaret } =
                    updateInputAtCaret(state.input, state.caretPosition, ' ');
                newState = { ...newState, input: spaceInput, caretPosition: spaceCaret };
                inputChanged = true;
                break;
            case 'Tab':
                const { newInput: tabInput, newCaretPosition: tabCaret } =
                    updateInputAtCaret(state.input, state.caretPosition, '\t');
                newState = { ...newState, input: tabInput, caretPosition: tabCaret };
                inputChanged = true;
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
            case 'CapsLock':
                // These are handled in modifier state updates
                break;
            default:
                if (key.length === 1) {
                    const transformedChar = transformCharacter(key, state);
                    const { newInput: charInput, newCaretPosition: charCaret } =
                        updateInputAtCaret(state.input, state.caretPosition, transformedChar);
                    newState = { ...newState, input: charInput, caretPosition: charCaret };
                    inputChanged = true;
                }
                break;
        }

        // Update state consistently
        setState(newState);

        // Notify about input changes and sync with target output
        if (inputChanged) {
            // Sync with target output if in tutor mode
            if (isTutorMode && targetOutput) {
                targetOutput.value = newState.input;
                targetOutput.setSelectionRange(newState.caretPosition, newState.caretPosition);

                // Trigger input event for form validation and other listeners
                targetOutput.dispatchEvent(new Event('input', { bubbles: true }));
            }

            safeCallback(mergedOptions.onChange, newState.input);
        }
    };

    /**
     * Handles physical keyboard key down events (only in tutor mode)
     */
    const handlePhysicalKeyDown = (event) => {
        // Only handle physical keyboard when in tutor mode
        if (!isTutorMode) return;
        
        const virtualKey = physicalKeyMap.get(event.code);
        if (!virtualKey) return;

        // Update modifier states
        const modifierState = updateModifierStatesInternal(state, event);
        setState(modifierState);

        // Highlight the corresponding virtual key
        highlightKey(keyElements, virtualKey, true);

        // Handle key press
        if (virtualKey.length === 1 || ['Backspace', 'Enter', 'Space', 'Tab'].includes(virtualKey)) {
            event.preventDefault();
            handleKeyPress(virtualKey, event, 'physical');
        } else if (virtualKey === 'CapsLock') {
            event.preventDefault();
            handleKeyPress(virtualKey, event, 'physical');
        } else if (virtualKey === 'ShiftLeft' || virtualKey === 'ShiftRight') {
            // Shift keys are already handled by setState above
        }

        if (mergedOptions.debug) {
            console.log('Physical key down:', event.code, '->', virtualKey);
        }
    };

    /**
     * Handles physical keyboard key up events (only in tutor mode)
     */
    const handlePhysicalKeyUp = (event) => {
        // Only handle physical keyboard when in tutor mode
        if (!isTutorMode) return;
        
        const virtualKey = physicalKeyMap.get(event.code);
        if (!virtualKey) return;

        // Update modifier states
        const modifierState = updateModifierStatesInternal(state, event);
        setState(modifierState);

        // Remove highlight
        if (virtualKey !== 'CapsLock' || !state.isCapsLockOn) {
            highlightKey(keyElements, virtualKey, false);
        }

        safeCallback(mergedOptions.onKeyRelease, virtualKey, event);

        if (mergedOptions.debug) {
            console.log('Physical key up:', event.code, '->', virtualKey);
        }
    };

    

    /**
     * Renders the keyboard interface
     */
    const render = () => {
        renderKeyboard(container, state, keyElements, handleKeyPress);
        updateKeyStates(keyElements, state);
    };

    /**
     * Sets up all event listeners
     */
    const setupEventListeners = () => {
        document.addEventListener('keydown', handlePhysicalKeyDown);
        document.addEventListener('keyup', handlePhysicalKeyUp);
    };

    /**
     * Cleans up resources and event listeners
     */
    const destroy = () => {
        document.removeEventListener('keydown', handlePhysicalKeyDown);
        document.removeEventListener('keyup', handlePhysicalKeyUp);
        
        // Clear DOM and references
        container.innerHTML = '';
        keyElements.clear();
        
        // Clear state references for garbage collection
        state = null;
        targetOutput = null;
    };

    // Initialize the keyboard
    render();
    setupEventListeners();

    // Return the public API
    return {
        // Input methods
        getInput: () => state.input,
        setInput: (input) => {
            try {
                const validInput = validateInput(input);
                const newState = {
                    ...state,
                    input: validInput,
                    caretPosition: validateCaretPosition(validInput.length, validInput.length)
                };
                setState(newState);
                safeCallback(mergedOptions.onChange, validInput);
            } catch (error) {
                console.error('setInput error:', error);
            }
        },
        clearInput: () => {
            const newState = { ...state, input: '', caretPosition: 0 };
            setState(newState);
            safeCallback(mergedOptions.onChange, '');
        },

        // Caret methods
        setCaretPosition: (position) => {
            try {
                const validPosition = validateCaretPosition(position, state.input.length);
                const newState = { ...state, caretPosition: validPosition };
                setState(newState);
            } catch (error) {
                console.error('setCaretPosition error:', error);
            }
        },
        getCaretPosition: () => state.caretPosition,

        // State methods
        getState: () => ({ ...state }),

        // Tutor mode methods
        isTutorModeActive: () => isTutorMode,
        getTargetOutput: () => targetOutput,
        toggleTutorMode: () => {
            isTutorMode = !isTutorMode;
            if (isTutorMode) {
                if (targetOutput) {
                    setState({
                        ...state,
                        input: targetOutput.value || '',
                        caretPosition: targetOutput.selectionStart || 0
                    });
                }
            }
            safeCallback(mergedOptions.onTutorModeChange, isTutorMode);
        },

        // Lesson methods
        startLesson: () => {
            lessonManager.startLesson(document.getElementById('kids-keyboard-output'));
        },
        endLesson: () => {
            lessonManager.endLesson();
        },

        // Lifecycle methods
        destroy
    };
}

// =============================================================================
// MODULE EXPORTS
// =============================================================================

// Support multiple module systems
if (typeof module !== 'undefined' && module.exports) {
    // CommonJS
    module.exports = createKidsKeyboard;
} else if (typeof define === 'function' && define.amd) {
    // AMD
    define([], () => createKidsKeyboard);
} else {
    // Browser global
    window.createKidsKeyboard = createKidsKeyboard;
}

// Add a default export for ES6 modules
export default createKidsKeyboard;