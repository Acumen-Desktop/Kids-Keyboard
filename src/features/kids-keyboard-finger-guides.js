/**
 * Kids Keyboard - Finger Positioning Guides Feature
 * 
 * This module provides visual guides to help children learn the correct finger placement
 * for each key, which is a fundamental skill for touch typing.
 * 
 * @version 0.1.0
 * @author James Swansburg
 * @license MIT
 */

// =============================================================================
// DATA
// =============================================================================

const fingerKeyMap = {
    'q': 'left-pinky', 'a': 'left-pinky', 'z': 'left-pinky',
    'w': 'left-ring', 's': 'left-ring', 'x': 'left-ring',
    'e': 'left-middle', 'd': 'left-middle', 'c': 'left-middle',
    'r': 'left-index', 'f': 'left-index', 'v': 'left-index',
    't': 'left-index', 'g': 'left-index', 'b': 'left-index',
    'y': 'right-index', 'h': 'right-index', 'n': 'right-index',
    'u': 'right-index', 'j': 'right-index', 'm': 'right-index',
    'i': 'right-middle', 'k': 'right-middle', ',': 'right-middle',
    'o': 'right-ring', 'l': 'right-ring', '.': 'right-ring',
    'p': 'right-pinky', ';': 'right-pinky', '/': 'right-pinky',
    '[': 'right-pinky', ']': 'right-pinky', "'": 'right-pinky',
    '-': 'right-pinky', '=': 'right-pinky',
    '1': 'left-pinky', '2': 'left-ring', '3': 'left-middle', '4': 'left-index', '5': 'left-index',
    '6': 'right-index', '7': 'right-index', '8': 'right-middle', '9': 'right-ring', '0': 'right-pinky',
    'Space': 'thumb',
};

// =============================================================================
// DOM UTILITIES
// =============================================================================

let handsContainer = null;

/**
 * Creates the visual representation of the hands and fingers.
 * @param {HTMLElement} keyboardContainer - The main keyboard container element.
 */
export function createFingerGuides(keyboardContainer) {
    if (!keyboardContainer) {
        console.error('Finger Guides: Keyboard container is required.');
        return;
    }

    handsContainer = document.createElement('div');
    handsContainer.id = 'kids-keyboard-finger-guides';
    handsContainer.innerHTML = `
        <div class="hand left-hand">
            <div class="finger pinky" id="left-pinky"></div>
            <div class="finger ring" id="left-ring"></div>
            <div class="finger middle" id="left-middle"></div>
            <div class="finger index" id="left-index"></div>
            <div class="finger thumb" id="left-thumb"></div>
        </div>
        <div class="hand right-hand">
            <div class="finger thumb" id="right-thumb"></div>
            <div class="finger index" id="right-index"></div>
            <div class="finger middle" id="right-middle"></div>
            <div class="finger ring" id="right-ring"></div>
            <div class="finger pinky" id="right-pinky"></div>
        </div>
    `;
    keyboardContainer.parentNode.insertBefore(handsContainer, keyboardContainer.nextSibling);
}

/**
 * Highlights the correct finger for the given key.
 * @param {string} key - The key that was pressed.
 */
export function highlightFinger(key) {
    if (!handsContainer) return;

    // Clear previous highlights
    handsContainer.querySelectorAll('.finger').forEach(f => f.classList.remove('active'));

    const fingerId = fingerKeyMap[key.toLowerCase()];
    if (fingerId) {
        if (fingerId === 'thumb') {
            document.getElementById('left-thumb').classList.add('active');
            document.getElementById('right-thumb').classList.add('active');
        } else {
            const fingerElement = document.getElementById(fingerId);
            if (fingerElement) {
                fingerElement.classList.add('active');
            }
        }
    }
}
