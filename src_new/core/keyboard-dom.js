/**
 * Kids Keyboard - DOM Management
 * 
 * Pure functions for creating and manipulating keyboard DOM elements.
 * All functions are functional and side-effect free where possible.
 * 
 * @version 1.0.0
 * @license MIT
 */

import { 
    KEYBOARD_LAYOUTS, 
    getKeyType, 
    getKeyDisplayText, 
    getKeyMapName,
    KEY_TYPES 
} from './keyboard-data.js';

export function createKeyElement(key, defaultLayout, shiftLayout, rowIndex, keyIndex) {
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
        element.textContent = getKeyDisplayText(key);
    }
    
    const keyType = getKeyType(key);
    element.classList.add(`kids-keyboard__key--${keyType}`);
    
    return element;
}

export function createKeyboardRow(rowKeys, rowIndex, defaultLayout, shiftLayout) {
    const rowElement = document.createElement('div');
    rowElement.className = 'kids-keyboard__row';
    
    const elements = new Map();
    
    rowKeys.forEach((key, keyIndex) => {
        const keyElement = createKeyElement(key, defaultLayout, shiftLayout, rowIndex, keyIndex);
        rowElement.appendChild(keyElement);
        
        const keyMapName = getKeyMapName(key);
        elements.set(keyMapName, keyElement);
    });
    
    return { element: rowElement, keyElements: elements };
}

export function createKeyboardContainer() {
    const container = document.createElement('div');
    container.className = 'kids-keyboard';
    container.setAttribute('role', 'application');
    container.setAttribute('aria-label', 'Virtual keyboard for typing input');
    container.setAttribute('aria-live', 'polite');
    
    return container;
}

export function renderKeyboard(container) {
    const keyElements = new Map();
    const defaultLayout = KEYBOARD_LAYOUTS.default;
    const shiftLayout = KEYBOARD_LAYOUTS.shift;
    
    container.innerHTML = '';
    
    defaultLayout.forEach((row, rowIndex) => {
        const { element: rowElement, keyElements: rowKeyElements } = 
            createKeyboardRow(row, rowIndex, defaultLayout, shiftLayout);
        
        container.appendChild(rowElement);
        
        for (const [key, element] of rowKeyElements) {
            keyElements.set(key, element);
        }
    });
    
    return keyElements;
}

export function highlightKey(keyElements, key, highlight) {
    const keyMapName = getKeyMapName(key);
    const element = keyElements.get(keyMapName);
    if (!element) return;
    
    element.classList.remove(
        'kids-keyboard__key--highlighted',
        'kids-keyboard__key--highlight-normal',
        'kids-keyboard__key--highlight-modifier',
        'kids-keyboard__key--highlight-function'
    );
    
    if (highlight) {
        const keyType = getKeyType(key);
        let highlightClass;
        
        switch (keyType) {
            case KEY_TYPES.MODIFIER:
                highlightClass = 'kids-keyboard__key--highlight-modifier';
                break;
            case KEY_TYPES.FUNCTION:
                if (key !== 'Space') {
                    highlightClass = 'kids-keyboard__key--highlight-function';
                } else {
                    highlightClass = 'kids-keyboard__key--highlight-normal';
                }
                break;
            default:
                highlightClass = 'kids-keyboard__key--highlight-normal';
        }
        
        element.classList.add(highlightClass, 'kids-keyboard__key--highlighted');
    }
}

export function updateKeyStates(keyElements, state) {
    keyElements.forEach((element, key) => {
        element.classList.remove(
            'kids-keyboard__key--active-modifier',
            'kids-keyboard__key--highlight-modifier'
        );
        
        if (key === 'ShiftLeft' && state.isLeftShiftPressed) {
            element.classList.add('kids-keyboard__key--active-modifier');
        } else if (key === 'ShiftRight' && state.isRightShiftPressed) {
            element.classList.add('kids-keyboard__key--active-modifier');
        } else if (key === 'CapsLock' && state.isCapsLockOn) {
            element.classList.add(
                'kids-keyboard__key--active-modifier',
                'kids-keyboard__key--highlight-modifier',
                'kids-keyboard__key--highlighted'
            );
        } else if (key === 'CapsLock' && !state.isCapsLockOn) {
            element.classList.remove('kids-keyboard__key--highlighted');
        }
    });
}

export function updateLayoutClass(container, state) {
    const shouldUseShift = state.isShiftPressed !== state.isCapsLockOn;
    container.classList.toggle('kids-keyboard--shift-layout', shouldUseShift);
}

export function createTutorContainer() {
    const tutorContainer = document.createElement('div');
    tutorContainer.id = 'kids-keyboard-tutor';
    
    const outputSection = document.createElement('div');
    outputSection.id = 'kids-keyboard-output';
    
    const textArea = document.createElement('textarea');
    textArea.id = 'kids-keyboard-text';
    textArea.placeholder = 'Start typing...';
    
    const displayArea = document.createElement('div');
    displayArea.id = 'kids-keyboard-display';
    
    outputSection.appendChild(textArea);
    outputSection.appendChild(displayArea);
    
    const inputSection = document.createElement('div');
    inputSection.id = 'kids-keyboard-input';
    
    tutorContainer.appendChild(outputSection);
    tutorContainer.appendChild(inputSection);
    
    return {
        container: tutorContainer,
        textArea,
        displayArea,
        inputSection
    };
}

export function updateTutorModeVisual(tutorContainer, isActive) {
    tutorContainer.classList.toggle('active', isActive);
}

export function syncTargetOutput(targetOutput, state) {
    if (!targetOutput) return;
    
    targetOutput.value = state.input;
    targetOutput.setSelectionRange(state.caretPosition, state.caretPosition);
    targetOutput.dispatchEvent(new Event('input', { bubbles: true }));
}