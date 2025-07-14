/**
 * Kids Keyboard - Main Component
 * 
 * Functional web component following the recommended pattern.
 * Uses class syntax only as browser interface, not architecture.
 * All business logic in pure functions.
 * 
 * @version 1.0.0
 * @license MIT
 */

// Core functionality imports
import { createInitialState, processKeyPress, updateModifierStates, activateTutorMode, deactivateTutorMode } from './core/keyboard-state.js';
import { renderKeyboard, createTutorContainer, highlightKey, updateKeyStates, updateLayoutClass, syncTargetOutput } from './core/keyboard-dom.js';
import { createEventHandlers, attachEventListeners } from './core/keyboard-events.js';
import { PHYSICAL_KEY_MAP } from './core/keyboard-data.js';

// Feature imports
import { getKeyInfo } from './features/associations.js';
import { initializeAudio, speakKeyInfo, setAudioEnabled, createAudioToggleButton } from './features/audio-system.js';
import { initializeDisplay, updateKeyDisplay, clearDisplay } from './features/visual-display.js';
import { startLesson, endLesson, isLessonActive, handleKeyPress as handleLessonKeyPress } from './features/lessons.js';
import { trackKeyPress, getSessionStats, endSession } from './features/statistics.js';

// Pure functions handle all logic
const parseComponentData = (element) => {
    return {
        learningMode: element.getAttribute('learning-mode') || 'associations',
        enableAudio: element.getAttribute('enable-audio') !== 'false',
        enableStats: element.getAttribute('enable-stats') !== 'false',
        targetOutput: element.getAttribute('target-output') || null,
        autoTutor: element.getAttribute('auto-tutor') === 'true'
    };
};

const createComponentHTML = (data) => {
    return `
        <link rel="stylesheet" href="./styles/keyboard-core.css">
        <link rel="stylesheet" href="./styles/layout.css">
        
        <div id="kids-keyboard-tutor">
            <div class="kids-keyboard__controls">
                <h3>Kids Keyboard</h3>
                <div class="kids-keyboard__control-group">
                    <span class="kids-keyboard__control-label">Audio:</span>
                    <div id="audio-toggle-container"></div>
                </div>
                <div class="kids-keyboard__control-group">
                    <span class="kids-keyboard__control-label">Mode:</span>
                    <select id="learning-mode-select" class="kids-keyboard__select">
                        <option value="associations">Letter Associations</option>
                        <option value="lessons">Typing Lessons</option>
                    </select>
                </div>
                <div class="kids-keyboard__control-group">
                    <button id="start-lesson-btn" class="kids-keyboard__button">Start Lesson</button>
                    <button id="end-lesson-btn" class="kids-keyboard__button kids-keyboard__button--secondary">End Lesson</button>
                    <button id="clear-text-btn" class="kids-keyboard__button kids-keyboard__button--danger">Clear Text</button>
                </div>
            </div>
            
            <div id="kids-keyboard-output">
                <textarea id="kids-keyboard-text" placeholder="Start typing or click keys..."></textarea>
                <div id="kids-keyboard-display"></div>
            </div>
            
            <div id="kids-keyboard-input"></div>
            
            <div class="kids-keyboard__stats" id="stats-panel">
                <h4>Session Statistics</h4>
                <div class="kids-keyboard__stat-grid">
                    <div class="kids-keyboard__stat-item">
                        <span class="kids-keyboard__stat-value" id="keys-typed">0</span>
                        <span class="kids-keyboard__stat-label">Keys</span>
                    </div>
                    <div class="kids-keyboard__stat-item">
                        <span class="kids-keyboard__stat-value" id="accuracy">100%</span>
                        <span class="kids-keyboard__stat-label">Accuracy</span>
                    </div>
                    <div class="kids-keyboard__stat-item">
                        <span class="kids-keyboard__stat-value" id="words-typed">0</span>
                        <span class="kids-keyboard__stat-label">Words</span>
                    </div>
                </div>
            </div>
        </div>
    `;
};

const initializeKeyboard = (element, data) => {
    const container = element.querySelector('#kids-keyboard-input');
    const tutorContainer = element.querySelector('#kids-keyboard-tutor');
    const textArea = element.querySelector('#kids-keyboard-text');
    const displayArea = element.querySelector('#kids-keyboard-display');
    
    let state = createInitialState();
    let keyElements = new Map();
    let cleanup = null;
    
    // Initialize features
    if (data.enableAudio) {
        initializeAudio();
        const audioToggleContainer = element.querySelector('#audio-toggle-container');
        createAudioToggleButton(audioToggleContainer);
    }
    
    initializeDisplay(container);
    
    // State management
    const setState = (newState) => {
        const prevState = state;
        state = typeof newState === 'function' ? newState(state) : newState;
        
        // Update visual elements
        updateLayoutClass(container, state);
        updateKeyStates(keyElements, state);
        
        // Sync with target output if in tutor mode
        if (state.isTutorModeActive) {
            syncTargetOutput(textArea, state);
        }
        
        // Update statistics
        updateStatsDisplay(element);
    };
    
    // Event handlers
    const handleKeyPress = (key, event, source) => {
        // Handle lessons first
        if (isLessonActive()) {
            const handled = handleLessonKeyPress(key);
            if (handled) return;
        }
        
        // Get key information for display/audio
        const keyInfo = getKeyInfo(key);
        
        // Update display
        updateKeyDisplay(key, keyInfo);
        
        // Play audio
        if (data.enableAudio) {
            speakKeyInfo(keyInfo);
        }
        
        // Track statistics
        trackKeyPress(key, true);
        
        // Process key press
        const newState = processKeyPress(state, key);
        setState(newState);
    };
    
    const handleTutorModeToggle = (isActive) => {
        if (isActive !== undefined) {
            const newState = isActive 
                ? activateTutorMode(state, textArea)
                : deactivateTutorMode(state);
            setState(newState);
        }
    };
    
    const handlePhysicalKey = (event, isKeyDown) => {
        if (!state.isTutorModeActive) return;
        
        const virtualKey = PHYSICAL_KEY_MAP.get(event.code);
        if (!virtualKey) return;
        
        // Update modifier states
        const modifierState = updateModifierStates(state, event);
        setState(modifierState);
        
        if (isKeyDown) {
            highlightKey(keyElements, virtualKey, true);
            
            if (shouldHandleKey(virtualKey)) {
                event.preventDefault();
                handleKeyPress(virtualKey, event, 'physical');
            }
        } else {
            // Key up
            if (virtualKey !== 'CapsLock' || !state.isCapsLockOn) {
                highlightKey(keyElements, virtualKey, false);
            }
        }
    };
    
    // Create event handlers
    const eventHandlers = createEventHandlers({
        onKeyPress: handleKeyPress,
        onStateChange: setState,
        onTutorModeChange: handleTutorModeToggle,
        onError: (message, error) => console.error('Keyboard error:', message, error)
    });
    
    // Enhanced event handlers for physical keys
    const enhancedHandlers = {
        ...eventHandlers,
        handlePhysicalKeyDown: (event) => handlePhysicalKey(event, true),
        handlePhysicalKeyUp: (event) => handlePhysicalKey(event, false)
    };
    
    // Render keyboard and setup events
    keyElements = renderKeyboard(container);
    cleanup = attachEventListeners(container, tutorContainer, enhancedHandlers, state);
    
    // Setup UI event listeners
    setupUIEventListeners(element, data);
    
    return { state, setState, cleanup };
};

const setupUIEventListeners = (element, data) => {
    // Learning mode selector
    const modeSelect = element.querySelector('#learning-mode-select');
    if (modeSelect) {
        modeSelect.value = data.learningMode;
        modeSelect.addEventListener('change', (e) => {
            data.learningMode = e.target.value;
            element.setAttribute('learning-mode', e.target.value);
        });
    }
    
    // Lesson controls
    const startLessonBtn = element.querySelector('#start-lesson-btn');
    const endLessonBtn = element.querySelector('#end-lesson-btn');
    const displayArea = element.querySelector('#kids-keyboard-display');
    
    if (startLessonBtn) {
        startLessonBtn.addEventListener('click', () => {
            startLesson(displayArea, 'beginner');
            updateLessonButtons(element);
        });
    }
    
    if (endLessonBtn) {
        endLessonBtn.addEventListener('click', () => {
            endLesson();
            updateLessonButtons(element);
        });
    }
    
    // Clear text button
    const clearTextBtn = element.querySelector('#clear-text-btn');
    if (clearTextBtn) {
        clearTextBtn.addEventListener('click', () => {
            const textArea = element.querySelector('#kids-keyboard-text');
            if (textArea) {
                textArea.value = '';
                textArea.dispatchEvent(new Event('input', { bubbles: true }));
            }
            clearDisplay();
        });
    }
    
    updateLessonButtons(element);
};

const updateLessonButtons = (element) => {
    const startBtn = element.querySelector('#start-lesson-btn');
    const endBtn = element.querySelector('#end-lesson-btn');
    const active = isLessonActive();
    
    if (startBtn) startBtn.disabled = active;
    if (endBtn) endBtn.disabled = !active;
};

const updateStatsDisplay = (element) => {
    const stats = getSessionStats();
    
    const keysElement = element.querySelector('#keys-typed');
    const accuracyElement = element.querySelector('#accuracy');
    const wordsElement = element.querySelector('#words-typed');
    
    if (keysElement) keysElement.textContent = stats.keysPressed;
    if (accuracyElement) {
        const accuracy = stats.correctKeys + stats.mistakes > 0
            ? Math.round((stats.correctKeys / (stats.correctKeys + stats.mistakes)) * 100)
            : 100;
        accuracyElement.textContent = `${accuracy}%`;
    }
    if (wordsElement) wordsElement.textContent = stats.wordsCompleted;
};

const shouldHandleKey = (key) => {
    return (
        key.length === 1 ||
        ['Backspace', 'Enter', 'Space', 'Tab', 'CapsLock'].includes(key)
    );
};

// Class is just a thin browser interface
class KidsKeyboard extends HTMLElement {
    constructor() {
        super();
        this.keyboardInstance = null;
    }
    
    connectedCallback() {
        const data = parseComponentData(this);
        this.innerHTML = createComponentHTML(data);
        this.keyboardInstance = initializeKeyboard(this, data);
        
        // Auto-activate tutor mode if requested
        if (data.autoTutor) {
            setTimeout(() => {
                this.keyboardInstance.setState(state => ({ ...state, isTutorModeActive: true }));
            }, 100);
        }
    }
    
    disconnectedCallback() {
        if (this.keyboardInstance?.cleanup) {
            this.keyboardInstance.cleanup();
        }
        endSession();
    }
    
    attributeChangedCallback() {
        if (this.keyboardInstance) {
            const data = parseComponentData(this);
            // Re-initialize if needed
            this.connectedCallback();
        }
    }
    
    static get observedAttributes() {
        return ['learning-mode', 'enable-audio', 'enable-stats', 'target-output', 'auto-tutor'];
    }
    
    // Public API
    getState() {
        return this.keyboardInstance?.state;
    }
    
    clearText() {
        const textArea = this.querySelector('#kids-keyboard-text');
        if (textArea) {
            textArea.value = '';
            textArea.dispatchEvent(new Event('input', { bubbles: true }));
        }
        clearDisplay();
    }
    
    startLesson(level = 'beginner') {
        const displayArea = this.querySelector('#kids-keyboard-display');
        if (displayArea) {
            startLesson(displayArea, level);
            updateLessonButtons(this);
        }
    }
    
    endLesson() {
        endLesson();
        updateLessonButtons(this);
    }
    
    getStats() {
        return getSessionStats();
    }
}

customElements.define('kids-keyboard', KidsKeyboard);

export default KidsKeyboard;