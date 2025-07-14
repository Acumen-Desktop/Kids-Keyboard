/**
 * Kids Keyboard - Core Data
 * 
 * Static keyboard layouts, key mappings, and constants.
 * Pure data module with no dependencies.
 * 
 * @version 1.0.0
 * @license MIT
 */

export const KEYBOARD_LAYOUTS = Object.freeze({
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

export const PHYSICAL_KEY_MAP = new Map([
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

export const SHIFT_MAP = Object.freeze({
    '`': '~', '1': '!', '2': '@', '3': '#', '4': '$', '5': '%',
    '6': '^', '7': '&', '8': '*', '9': '(', '0': ')', '-': '_', '=': '+',
    '[': '{', ']': '}', '\\': '|', ';': ':', "'": '"',
    ',': '<', '.': '>', '/': '?'
});

export const KEY_TYPES = Object.freeze({
    MODIFIER: 'modifier',
    FUNCTION: 'function', 
    CHARACTER: 'character',
    SPACE: 'space'
});

export const MODIFIER_KEYS = Object.freeze([
    'ShiftLeft', 'ShiftRight', 'CapsLock'
]);

export const FUNCTION_KEYS = Object.freeze([
    'Backspace', 'Tab', 'Enter', 'Space'
]);

export const MAX_INPUT_LENGTH = 10000;

export function getKeyType(key) {
    if (MODIFIER_KEYS.includes(key)) return KEY_TYPES.MODIFIER;
    if (key === 'Space') return KEY_TYPES.SPACE;
    if (key.length > 1) return KEY_TYPES.FUNCTION;
    return KEY_TYPES.CHARACTER;
}

export function getKeyDisplayText(key) {
    if (key === 'ShiftLeft' || key === 'ShiftRight') return 'Shift';
    return key;
}

export function getKeyMapName(key) {
    return (MODIFIER_KEYS.includes(key) || key === 'Space') ? key : key.toLowerCase();
}

export function isModifierKey(key) {
    return MODIFIER_KEYS.includes(key);
}

export function transformCharacter(char, state) {
    if (/^[a-z]$/i.test(char)) {
        const shouldUppercase = state.isShiftPressed !== state.isCapsLockOn;
        return shouldUppercase ? char.toUpperCase() : char.toLowerCase();
    }

    if (state.isShiftPressed) {
        return SHIFT_MAP[char] || char;
    }

    return char;
}