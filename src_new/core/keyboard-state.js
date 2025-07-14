/**
 * Kids Keyboard - State Management
 * 
 * Pure functions for managing keyboard state.
 * All functions are immutable and return new state objects.
 * 
 * @version 1.0.0
 * @license MIT
 */

import { MAX_INPUT_LENGTH, transformCharacter } from './keyboard-data.js';

export function createInitialState() {
    return Object.freeze({
        input: '',
        caretPosition: 0,
        isShiftPressed: false,
        isLeftShiftPressed: false,
        isRightShiftPressed: false,
        isCapsLockOn: false,
        isTutorModeActive: false
    });
}

export function validateInput(input) {
    if (typeof input !== 'string') {
        throw new Error('Input must be a string');
    }
    if (input.length > MAX_INPUT_LENGTH) {
        console.warn(`Input truncated to ${MAX_INPUT_LENGTH} characters for performance`);
        return input.substring(0, MAX_INPUT_LENGTH);
    }
    return input;
}

export function validateCaretPosition(position, inputLength) {
    if (typeof position !== 'number' || position < 0) {
        return 0;
    }
    if (position > inputLength) {
        return inputLength;
    }
    return position;
}

export function updateInput(state, newInput) {
    const validInput = validateInput(newInput);
    const validCaret = validateCaretPosition(state.caretPosition, validInput.length);
    
    return {
        ...state,
        input: validInput,
        caretPosition: validCaret
    };
}

export function insertAtCaret(state, char) {
    const validInput = validateInput(state.input);
    const validCaret = validateCaretPosition(state.caretPosition, validInput.length);
    
    const before = validInput.substring(0, validCaret);
    const after = validInput.substring(validCaret);
    const newInput = before + char + after;
    
    return {
        ...state,
        input: newInput,
        caretPosition: validCaret + 1
    };
}

export function deleteAtCaret(state) {
    const validInput = validateInput(state.input);
    const validCaret = validateCaretPosition(state.caretPosition, validInput.length);
    
    if (validCaret <= 0) return state;
    
    const before = validInput.substring(0, validCaret - 1);
    const after = validInput.substring(validCaret);
    const newInput = before + after;
    
    return {
        ...state,
        input: newInput,
        caretPosition: validCaret - 1
    };
}

export function setCaretPosition(state, position) {
    const validPosition = validateCaretPosition(position, state.input.length);
    
    return {
        ...state,
        caretPosition: validPosition
    };
}

export function clearInput(state) {
    return {
        ...state,
        input: '',
        caretPosition: 0
    };
}

export function updateModifierStates(state, event) {
    const newState = { ...state };
    
    newState.isShiftPressed = event.shiftKey;
    
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
    
    if (typeof event.getModifierState === 'function') {
        const capsLockState = event.getModifierState('CapsLock');
        newState.isCapsLockOn = capsLockState;
    }
    
    return newState;
}

export function toggleTutorMode(state) {
    return {
        ...state,
        isTutorModeActive: !state.isTutorModeActive
    };
}

export function activateTutorMode(state, targetOutput) {
    if (!targetOutput) return { ...state, isTutorModeActive: true };
    
    return {
        ...state,
        isTutorModeActive: true,
        input: targetOutput.value || '',
        caretPosition: targetOutput.selectionStart || 0
    };
}

export function deactivateTutorMode(state) {
    return {
        ...state,
        isTutorModeActive: false
    };
}

export function processKeyPress(state, key) {
    switch (key) {
        case 'Backspace':
            return deleteAtCaret(state);
        case 'Enter':
            return insertAtCaret(state, '\n');
        case 'Space':
            return insertAtCaret(state, ' ');
        case 'Tab':
            return insertAtCaret(state, '\t');
        case 'ShiftLeft':
        case 'ShiftRight':
        case 'CapsLock':
            return state;
        default:
            if (key.length === 1) {
                const transformedChar = transformCharacter(key, state);
                return insertAtCaret(state, transformedChar);
            }
            return state;
    }
}

export function shouldUseShiftLayout(state) {
    return state.isShiftPressed !== state.isCapsLockOn;
}