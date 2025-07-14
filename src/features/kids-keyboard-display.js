/**
 * Kids Keyboard - Key Information Display Feature
 * 
 * This module enhances the keyboard by displaying detailed information about each key
 * when it is pressed. It's designed to be visually engaging for young children,
 * helping them associate the physical key with its character and sound.
 * 
 * @version 0.1.0
 * @author James Swansburg
 * @license MIT
 */

// =============================================================================
// CONSTANTS
// =============================================================================

const DISPLAY_ELEMENT_ID = 'kids-keyboard-key-display';
const INFO_PANEL_ID = 'kids-keyboard-info-panel';

// Animation classes
const KEY_PRESS_ANIMATION = 'key-press-pop';
const FADE_IN_ANIMATION = 'fade-in-quick';

// Vowel and consonant colors for educational purposes
const VOWEL_COLOR = '#ffadad'; // A soft red
const CONSONANT_COLOR = '#a0c4ff'; // A gentle blue
const OTHER_KEY_COLOR = '#fdffb6'; // A friendly yellow

// =============================================================================
// STATE MANAGEMENT
// =============================================================================

let displayElement = null;
let infoPanel = null;

// =============================================================================
// DOM UTILITIES
// =============================================================================

/**
 * Initializes the display module by caching DOM elements.
 * Creates the elements if they don't exist.
 * @param {HTMLElement} keyboardContainer - The main keyboard container element.
 */
export function initializeDisplay(keyboardContainer) {
    if (!keyboardContainer) {
        console.error('Display Feature: Keyboard container is required for initialization.');
        return;
    }

    // Check if elements already exist
    displayElement = document.getElementById(DISPLAY_ELEMENT_ID);
    infoPanel = document.getElementById(INFO_PANEL_ID);

    // Create and prepend elements if they are not in the DOM
    if (!displayElement) {
        displayElement = document.createElement('div');
        displayElement.id = DISPLAY_ELEMENT_ID;
        displayElement.className = 'kids-keyboard-key-display';
        keyboardContainer.parentNode.insertBefore(displayElement, keyboardContainer);
    }

    if (!infoPanel) {
        infoPanel = document.createElement('div');
        infoPanel.id = INFO_PANEL_ID;
        infoPanel.className = 'kids-keyboard-info-panel';
        keyboardContainer.parentNode.insertBefore(infoPanel, displayElement);
    }

    console.log('Key Information Display initialized.');
}

/**
 * Determines the color for a given key based on its type.
 * @param {string} key - The key character (e.g., 'a', 'B', '5').
 * @returns {string} The background color for the key display.
 */
function getKeyColor(key) {
    const lowerKey = key.toLowerCase();
    if ('aeiou'.includes(lowerKey)) {
        return VOWEL_COLOR;
    }
    if ('bcdfghjklmnpqrstvwxyz'.includes(lowerKey)) {
        return CONSONANT_COLOR;
    }
    return OTHER_KEY_COLOR;
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Updates the display with information about the pressed key.
 * @param {string} key - The primary character of the key (e.g., 'a', 'A', '1').
 * @param {object} keyInfo - Additional information about the key.
 * @param {string} keyInfo.name - The descriptive name (e.g., "Letter A").
 * @param {string} keyInfo.sound - The phonetic sound (e.g., "says 'ah'").
 * @param {string} [keyInfo.emoji] - An optional emoji association.
 */
export function updateKeyDisplay(key, keyInfo) {
    if (!displayElement || !infoPanel) {
        console.warn('Display elements not initialized. Call initializeDisplay() first.');
        return;
    }

    // 1. Update the large key display
    displayElement.textContent = key;
    displayElement.style.backgroundColor = getKeyColor(key);
    
    // Trigger animation
    displayElement.classList.remove(KEY_PRESS_ANIMATION);
    void displayElement.offsetWidth; // Force reflow
    displayElement.classList.add(KEY_PRESS_ANIMATION);

    // 2. Update the information panel
    let infoHTML = `
        <div class="info-name">${keyInfo.name}</div>
        <div class="info-sound">${keyInfo.sound}</div>
    `;
    if (keyInfo.emoji) {
        infoHTML += `<div class="info-emoji">${keyInfo.emoji}</div>`;
    }
    infoPanel.innerHTML = infoHTML;

    // Trigger fade-in animation for the panel
    infoPanel.classList.remove(FADE_IN_ANIMATION);
    void infoPanel.offsetWidth; // Force reflow
    infoPanel.classList.add(FADE_IN_ANIMATION);
}

/**
 * Clears the key display and info panel.
 */
export function clearDisplay() {
    if (displayElement) {
        displayElement.textContent = '';
        displayElement.style.backgroundColor = 'transparent';
        displayElement.classList.remove(KEY_PRESS_ANIMATION);
    }
    if (infoPanel) {
        infoPanel.innerHTML = '';
        infoPanel.classList.remove(FADE_IN_ANIMATION);
    }
}

// =============================================================================
// STYLES
// =============================================================================

/**
 * Injects the necessary CSS for the display feature into the document head.
 * This makes the component self-contained and easy to integrate.
 */
export function injectDisplayStyles() {
    const styleId = 'kids-keyboard-display-styles';
    if (document.getElementById(styleId)) {
        return; // Styles already injected
    }

    const styles = `
        .kids-keyboard-key-display {
            width: 150px;
            height: 150px;
            margin: 20px auto;
            border-radius: 25px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 80px;
            font-weight: bold;
            color: #333;
            box-shadow: 0 10px 20px rgba(0,0,0,0.1), 0 6px 6px rgba(0,0,0,0.15);
            transition: background-color 0.3s ease;
            font-family: 'Comic Sans MS', 'Chalkboard SE', 'cursive';
        }

        .kids-keyboard-info-panel {
            text-align: center;
            margin-bottom: 20px;
            padding: 15px;
            background-color: #fff;
            border-radius: 15px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            font-family: 'Arial', sans-serif;
            min-height: 80px;
        }
        
        .info-name {
            font-size: 24px;
            font-weight: bold;
            color: #333;
        }

        .info-sound {
            font-size: 18px;
            color: #555;
            margin-top: 5px;
        }

        .info-emoji {
            font-size: 40px;
            margin-top: 10px;
        }

        /* Animations */
        @keyframes key-press-pop {
            0% { transform: scale(0.8); opacity: 0.5; }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); opacity: 1; }
        }

        .key-press-pop {
            animation: key-press-pop 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
        }

        @keyframes fade-in-quick {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .fade-in-quick {
            animation: fade-in-quick 0.3s ease-out both;
        }
    `;

    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
}
