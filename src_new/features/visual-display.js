/**
 * Kids Keyboard - Visual Display System
 * 
 * Educational visual feedback with animations and color coding.
 * Self-contained styling and DOM management.
 * 
 * @version 1.0.0
 * @license MIT
 */

import { isVowel, isConsonant } from './associations.js';

const DISPLAY_CONFIG = Object.freeze({
    displayElementId: 'kids-keyboard-key-display',
    infoPanelId: 'kids-keyboard-info-panel',
    keyPressAnimation: 'key-press-pop',
    fadeInAnimation: 'fade-in-quick',
    vowelColor: '#ffadad',      // Soft red
    consonantColor: '#a0c4ff',  // Gentle blue  
    numberColor: '#caffbf',     // Light green
    functionColor: '#fdffb6',   // Friendly yellow
    modifierColor: '#ffc6ff'    // Light purple
});

let displayState = {
    displayElement: null,
    infoPanel: null,
    isInitialized: false
};

export function initializeDisplay(container) {
    if (!container) {
        console.error('Display: Container required for initialization');
        return false;
    }

    injectDisplayStyles();
    
    displayState.displayElement = findOrCreateElement(
        DISPLAY_CONFIG.displayElementId,
        'kids-keyboard-key-display',
        container
    );
    
    displayState.infoPanel = findOrCreateElement(
        DISPLAY_CONFIG.infoPanelId,
        'kids-keyboard-info-panel',
        container
    );
    
    displayState.isInitialized = true;
    return true;
}

function findOrCreateElement(id, className, container) {
    let element = document.getElementById(id);
    
    if (!element) {
        element = document.createElement('div');
        element.id = id;
        element.className = className;
        
        // Insert before the keyboard container
        if (container.parentNode) {
            container.parentNode.insertBefore(element, container);
        } else {
            // Fallback: append to body
            document.body.appendChild(element);
        }
    }
    
    return element;
}

export function updateKeyDisplay(key, keyInfo) {
    if (!displayState.isInitialized) {
        console.warn('Display not initialized. Call initializeDisplay() first.');
        return;
    }

    updateLargeKeyDisplay(key);
    updateInfoPanel(keyInfo);
}

function updateLargeKeyDisplay(key) {
    const { displayElement } = displayState;
    if (!displayElement) return;

    displayElement.textContent = key;
    displayElement.style.backgroundColor = getKeyColor(key);
    
    // Trigger animation
    displayElement.classList.remove(DISPLAY_CONFIG.keyPressAnimation);
    void displayElement.offsetWidth; // Force reflow
    displayElement.classList.add(DISPLAY_CONFIG.keyPressAnimation);
}

function updateInfoPanel(keyInfo) {
    const { infoPanel } = displayState;
    if (!infoPanel || !keyInfo) return;

    let html = '';
    
    if (keyInfo.name) {
        html += `<div class="info-name">${keyInfo.name}</div>`;
    }
    
    if (keyInfo.sound) {
        html += `<div class="info-sound">${keyInfo.sound}</div>`;
    }
    
    if (keyInfo.emoji) {
        html += `<div class="info-emoji">${keyInfo.emoji}</div>`;
    }
    
    if (keyInfo.category) {
        html += `<div class="info-category">${keyInfo.category}</div>`;
    }
    
    infoPanel.innerHTML = html;
    
    // Trigger fade-in animation
    infoPanel.classList.remove(DISPLAY_CONFIG.fadeInAnimation);
    void infoPanel.offsetWidth; // Force reflow
    infoPanel.classList.add(DISPLAY_CONFIG.fadeInAnimation);
}

function getKeyColor(key) {
    if (key.match(/^[0-9]$/)) {
        return DISPLAY_CONFIG.numberColor;
    }
    
    if (isVowel(key)) {
        return DISPLAY_CONFIG.vowelColor;
    }
    
    if (isConsonant(key)) {
        return DISPLAY_CONFIG.consonantColor;
    }
    
    if (['ShiftLeft', 'ShiftRight', 'CapsLock'].includes(key)) {
        return DISPLAY_CONFIG.modifierColor;
    }
    
    return DISPLAY_CONFIG.functionColor;
}

export function clearDisplay() {
    const { displayElement, infoPanel } = displayState;
    
    if (displayElement) {
        displayElement.textContent = '';
        displayElement.style.backgroundColor = 'transparent';
        displayElement.classList.remove(DISPLAY_CONFIG.keyPressAnimation);
    }
    
    if (infoPanel) {
        infoPanel.innerHTML = '';
        infoPanel.classList.remove(DISPLAY_CONFIG.fadeInAnimation);
    }
}

export function showMessage(message, type = 'info') {
    const { infoPanel } = displayState;
    if (!infoPanel) return;

    const messageHtml = `
        <div class="display-message display-message--${type}">
            ${message}
        </div>
    `;
    
    infoPanel.innerHTML = messageHtml;
    infoPanel.classList.add(DISPLAY_CONFIG.fadeInAnimation);
}

export function showCelebration(message = '🎉 Great job! 🎉') {
    const { displayElement, infoPanel } = displayState;
    
    if (displayElement) {
        displayElement.textContent = '🌟';
        displayElement.style.backgroundColor = '#ffeb3b';
        displayElement.classList.add('celebration-bounce');
    }
    
    if (infoPanel) {
        infoPanel.innerHTML = `
            <div class="celebration-message">
                ${message}
            </div>
        `;
        infoPanel.classList.add('celebration-glow');
    }
    
    setTimeout(() => {
        if (displayElement) {
            displayElement.classList.remove('celebration-bounce');
        }
        if (infoPanel) {
            infoPanel.classList.remove('celebration-glow');
        }
    }, 2000);
}

function injectDisplayStyles() {
    const styleId = 'kids-keyboard-display-styles';
    if (document.getElementById(styleId)) return;

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
            font-family: 'Comic Sans MS', 'Chalkboard SE', cursive;
            user-select: none;
        }

        .kids-keyboard-info-panel {
            text-align: center;
            margin-bottom: 20px;
            padding: 15px;
            background-color: #fff;
            border-radius: 15px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            font-family: Arial, sans-serif;
            min-height: 80px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        
        .info-name {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
        }

        .info-sound {
            font-size: 18px;
            color: #555;
            margin-bottom: 5px;
        }

        .info-emoji {
            font-size: 40px;
            margin: 10px 0;
        }

        .info-category {
            font-size: 12px;
            color: #999;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .display-message {
            padding: 10px;
            border-radius: 10px;
            font-weight: bold;
        }

        .display-message--info {
            background-color: #e3f2fd;
            color: #1565c0;
        }

        .display-message--success {
            background-color: #e8f5e8;
            color: #2e7d32;
        }

        .display-message--error {
            background-color: #ffebee;
            color: #c62828;
        }

        .celebration-message {
            font-size: 20px;
            font-weight: bold;
            color: #ff6f00;
            animation: pulse 1s ease-in-out infinite;
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

        @keyframes celebration-bounce {
            0%, 20%, 60%, 100% { transform: translateY(0) scale(1); }
            40% { transform: translateY(-20px) scale(1.1); }
            80% { transform: translateY(-10px) scale(1.05); }
        }

        .celebration-bounce {
            animation: celebration-bounce 1.5s ease-in-out;
        }

        @keyframes celebration-glow {
            0%, 100% { box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
            50% { box-shadow: 0 8px 25px rgba(255, 193, 7, 0.4); }
        }

        .celebration-glow {
            animation: celebration-glow 2s ease-in-out;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .kids-keyboard-key-display {
                width: 120px;
                height: 120px;
                font-size: 60px;
            }

            .info-name {
                font-size: 20px;
            }

            .info-sound {
                font-size: 16px;
            }

            .info-emoji {
                font-size: 30px;
            }
        }
    `;

    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
}

export function getDisplayConfig() {
    return { ...DISPLAY_CONFIG };
}

export function isDisplayInitialized() {
    return displayState.isInitialized;
}