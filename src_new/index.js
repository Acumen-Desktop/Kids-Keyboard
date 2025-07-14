/**
 * Kids Keyboard - Entry Point
 * 
 * Main exports for the Kids Keyboard system.
 * Supports multiple module systems and usage patterns.
 * 
 * @version 1.0.0
 * @license MIT
 */

// Main component export
import KidsKeyboard from './kids-keyboard.js';

// Core functionality exports
export { 
    createInitialState,
    processKeyPress,
    updateModifierStates,
    validateInput
} from './core/keyboard-state.js';

export {
    KEYBOARD_LAYOUTS,
    PHYSICAL_KEY_MAP,
    getKeyType,
    transformCharacter
} from './core/keyboard-data.js';

// Feature exports
export {
    getLetterAssociation,
    getKeyInfo,
    isVowel,
    isConsonant
} from './features/associations.js';

export {
    initializeAudio,
    speakText,
    speakKeyInfo,
    speakKeyFast,
    speakLetter,
    speakNumber,
    setAudioEnabled,
    isAudioEnabled,
    getAudioConfig,
    setAudioConfig
} from './features/audio-system.js';

export {
    initializeDisplay,
    updateKeyDisplay,
    clearDisplay,
    showMessage,
    showCelebration
} from './features/visual-display.js';

export {
    startLesson,
    endLesson,
    isLessonActive,
    setLessonLevel,
    getLessonStats,
    getAvailableLevels
} from './features/lessons.js';

export {
    trackKeyPress,
    getSessionStats,
    getHistoricalStats,
    getTodayStats,
    getWeeklyStats,
    getAccuracy,
    getTypingSpeed,
    endSession,
    getAchievements,
    exportStats,
    resetStats,
    setTrackingEnabled,
    isTrackingEnabled
} from './features/statistics.js';

// Default export is the web component
export default KidsKeyboard;

// Factory function for programmatic usage
export function createKidsKeyboard(container, options = {}) {
    if (typeof container === 'string') {
        container = document.querySelector(container);
    }
    
    if (!container) {
        throw new Error('Container element required');
    }
    
    const keyboard = document.createElement('kids-keyboard');
    
    // Set attributes from options
    if (options.learningMode) {
        keyboard.setAttribute('learning-mode', options.learningMode);
    }
    
    if (options.enableAudio === false) {
        keyboard.setAttribute('enable-audio', 'false');
    }
    
    if (options.enableStats === false) {
        keyboard.setAttribute('enable-stats', 'false');
    }
    
    if (options.targetOutput) {
        keyboard.setAttribute('target-output', options.targetOutput);
    }
    
    if (options.autoTutor) {
        keyboard.setAttribute('auto-tutor', 'true');
    }
    
    container.appendChild(keyboard);
    
    return keyboard;
}

// Legacy support for simple-keyboard style API
export function SimpleKeyboard(container, options = {}) {
    console.warn('SimpleKeyboard API is deprecated. Use createKidsKeyboard instead.');
    return createKidsKeyboard(container, options);
}

// Support multiple module systems
if (typeof module !== 'undefined' && module.exports) {
    // CommonJS
    module.exports = KidsKeyboard;
    module.exports.default = KidsKeyboard;
    module.exports.createKidsKeyboard = createKidsKeyboard;
} else if (typeof define === 'function' && define.amd) {
    // AMD
    define([], () => KidsKeyboard);
} else {
    // Browser global
    window.KidsKeyboard = KidsKeyboard;
    window.createKidsKeyboard = createKidsKeyboard;
}