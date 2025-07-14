/**
 * Kids Keyboard - Event Management
 * 
 * Pure event handling functions for keyboard interactions.
 * Separates event logic from DOM manipulation and state changes.
 * 
 * @version 1.0.0
 * @license MIT
 */

import { PHYSICAL_KEY_MAP } from './keyboard-data.js';

export function createEventHandlers(callbacks = {}) {
    const {
        onKeyPress = () => {},
        onStateChange = () => {},
        onTutorModeChange = () => {},
        onError = () => {}
    } = callbacks;

    function handleVirtualKeyClick(event) {
        if (!event.target.matches('.kids-keyboard__key')) return;
        
        event.preventDefault();
        const keyName = event.target.dataset.key;
        const virtualKey = normalizeVirtualKey(keyName);
        
        try {
            onKeyPress(virtualKey, event, 'virtual');
        } catch (error) {
            onError('Virtual key press error', error);
        }
    }

    function handlePhysicalKeyDown(event, state) {
        if (!state.isTutorModeActive) return;
        
        const virtualKey = PHYSICAL_KEY_MAP.get(event.code);
        if (!virtualKey) return;

        try {
            onStateChange(event);

            if (shouldPreventDefault(virtualKey)) {
                event.preventDefault();
                onKeyPress(virtualKey, event, 'physical');
            }
        } catch (error) {
            onError('Physical key down error', error);
        }
    }

    function handlePhysicalKeyUp(event, state) {
        if (!state.isTutorModeActive) return;
        
        const virtualKey = PHYSICAL_KEY_MAP.get(event.code);
        if (!virtualKey) return;

        try {
            onStateChange(event);
        } catch (error) {
            onError('Physical key up error', error);
        }
    }

    function handleTutorModeToggle() {
        try {
            onTutorModeChange();
        } catch (error) {
            onError('Tutor mode toggle error', error);
        }
    }

    function handleMouseDown(event) {
        const keyElement = event.target.closest('.kids-keyboard__key');
        if (!keyElement) return;
        
        keyElement.style.transform = 'scale(0.95)';
    }

    function handleMouseUpOrOut(event) {
        const keyElement = event.target.closest('.kids-keyboard__key');
        if (!keyElement) return;
        
        keyElement.style.transform = '';
        keyElement.blur();
    }

    return {
        handleVirtualKeyClick,
        handlePhysicalKeyDown,
        handlePhysicalKeyUp,
        handleTutorModeToggle,
        handleMouseDown,
        handleMouseUpOrOut
    };
}

function normalizeVirtualKey(keyName) {
    const keyMap = {
        'shiftleft': 'ShiftLeft',
        'shiftright': 'ShiftRight',
        'capslock': 'CapsLock',
        'backspace': 'Backspace',
        'enter': 'Enter',
        'space': 'Space',
        'tab': 'Tab'
    };
    
    return keyMap[keyName] || keyName;
}

function shouldPreventDefault(virtualKey) {
    return (
        virtualKey.length === 1 ||
        ['Backspace', 'Enter', 'Space', 'Tab', 'CapsLock'].includes(virtualKey)
    );
}

export function attachEventListeners(container, tutorContainer, handlers, state) {
    container.addEventListener('click', handlers.handleVirtualKeyClick);
    container.addEventListener('mousedown', handlers.handleMouseDown);
    container.addEventListener('mouseup', handlers.handleMouseUpOrOut);
    container.addEventListener('mouseout', handlers.handleMouseUpOrOut);
    
    // Removed automatic mouse hover activation - now manual control only
    
    const handleKeyDown = (event) => handlers.handlePhysicalKeyDown(event, state);
    const handleKeyUp = (event) => handlers.handlePhysicalKeyUp(event, state);
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    return function cleanup() {
        container.removeEventListener('click', handlers.handleVirtualKeyClick);
        container.removeEventListener('mousedown', handlers.handleMouseDown);
        container.removeEventListener('mouseup', handlers.handleMouseUpOrOut);
        container.removeEventListener('mouseout', handlers.handleMouseUpOrOut);
        
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);
    };
}

export function createCustomEvent(type, detail) {
    return new CustomEvent(type, {
        bubbles: true,
        cancelable: true,
        detail
    });
}

export function safeCallback(callback, ...args) {
    if (typeof callback === 'function') {
        try {
            return callback(...args);
        } catch (error) {
            console.error('Callback error:', error);
            return null;
        }
    }
    return null;
}