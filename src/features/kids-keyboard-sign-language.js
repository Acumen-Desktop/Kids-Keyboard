/**
 * Kids Keyboard - Sign Language Feature
 * 
 * This module provides American Sign Language (ASL) representations for each letter.
 * It uses a web font to display the signs, making it lightweight and scalable.
 * 
 * @version 0.1.0
 * @author James Swansburg
 * @license MIT
 */

// =============================================================================
// CONSTANTS
// =============================================================================

const FONT_URL = 'https://www.fontsquirrel.com/fonts/download/asl-alphabet';
const FONT_FAMILY = 'ASL_Alphabet';
const SIGN_DISPLAY_ID = 'kids-keyboard-sign-display';

// =============================================================================
// DOM UTILITIES
// =============================================================================

let signDisplayElement = null;

/**
 * Injects the ASL font into the document head.
 */
export function injectSignLanguageFont() {
    const fontFace = `
        @font-face {
            font-family: '${FONT_FAMILY}';
            src: url('${FONT_URL}') format('truetype');
            font-weight: normal;
            font-style: normal;
        }
    `;
    const styleElement = document.createElement('style');
    styleElement.textContent = fontFace;
    document.head.appendChild(styleElement);
}

/**
 * Creates the display element for the sign language character.
 * @param {HTMLElement} keyboardContainer - The main keyboard container element.
 */
export function createSignLanguageDisplay(keyboardContainer) {
    if (!keyboardContainer) {
        console.error('Sign Language: Keyboard container is required.');
        return;
    }

    signDisplayElement = document.createElement('div');
    signDisplayElement.id = SIGN_DISPLAY_ID;
    signDisplayElement.style.fontFamily = FONT_FAMILY;
    signDisplayElement.style.fontSize = '100px';
    signDisplayElement.style.textAlign = 'center';
    signDisplayElement.style.marginBottom = '20px';

    keyboardContainer.parentNode.insertBefore(signDisplayElement, keyboardContainer);
}

/**
 * Displays the sign for the given letter.
 * @param {string} letter - The letter to display.
 */
export function showSign(letter) {
    if (!signDisplayElement) return;

    if (letter && letter.match(/^[a-z]$/i)) {
        signDisplayElement.textContent = letter.toUpperCase();
    } else {
        signDisplayElement.textContent = '';
    }
}
