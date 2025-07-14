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
import { PHYSICAL_KEY_MAP, transformCharacter } from './core/keyboard-data.js';

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
            <!-- Compact pill-shaped toggles overlapping top border -->
            <div class="kids-keyboard__pill-toggles">
                <button id="tutor-toggle-btn" class="kids-keyboard__pill-toggle kids-keyboard__tutor-toggle" aria-label="Toggle tutor mode">
                    🎯 ON
                </button>
                <select id="learning-mode-select" class="kids-keyboard__pill-toggle kids-keyboard__mode-select">
                    <option value="associations">🍎 Associations</option>
                    <option value="lessons">📚 Lessons</option>
                </select>
                <button id="clear-text-btn" class="kids-keyboard__pill-toggle kids-keyboard__clear-btn" title="Clear text">
                    🗑️ Clear
                </button>
            </div>
            
            <div id="kids-keyboard-output">
                <textarea id="kids-keyboard-text" placeholder="Start typing or click keys..."></textarea>
                <div id="kids-keyboard-display"></div>
            </div>
            
            <div id="kids-keyboard-input" class="kids-keyboard__input-container">
            </div>
            
            <div class="kids-keyboard__lesson-controls">
                <button id="start-lesson-btn" class="kids-keyboard__button">Start Lesson</button>
                <button id="end-lesson-btn" class="kids-keyboard__button kids-keyboard__button--secondary">End Lesson</button>
            </div>
            
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
        const audioToggleContainer = element.querySelector('#kids-keyboard-tutor');
        createAudioToggleButton(audioToggleContainer);
    }
    
    initializeDisplay(container, displayArea);
    
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
        // Handle different learning modes
        if (data.learningMode === 'lessons') {
            // Lessons mode: check if lesson is active
            if (isLessonActive()) {
                const handled = handleLessonKeyPress(key);
                if (handled) return;
            }
        } else if (data.learningMode === 'associations') {
            // Associations mode: always process normally
            // This is the main educational mode for letter-animal associations
        }
        
        // For physical keyboard, use transformed character for audio/display consistency  
        const isPhysicalKeyboard = source === 'physical';
        const displayKey = isPhysicalKeyboard && key.length === 1 ? 
            transformCharacter(key, state) : key;
        
        // Get key information for display/audio using the correct character
        const keyInfo = getKeyInfo(displayKey);
        
        // Update display - simple for physical keyboard, enhanced for virtual clicks
        updateKeyDisplay(displayKey, keyInfo, isPhysicalKeyboard, state);
        
        // Play audio - fast for physical keyboard, full for virtual clicks
        if (data.enableAudio) {
            speakKeyInfo(keyInfo, isPhysicalKeyboard);
        }
        
        // Track statistics only in lessons mode
        if (data.learningMode === 'lessons') {
            trackKeyPress(key, true);
        }
        
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
    cleanup = attachEventListeners(container, tutorContainer, enhancedHandlers, () => state);
    
    // Setup UI event listeners with setState access
    setupUIEventListeners(element, data, setState, () => state);
    
    return { state, setState, cleanup };
};

const setupUIEventListeners = (element, data, setState, getCurrentState) => {
    // Learning mode selector
    const modeSelect = element.querySelector('#learning-mode-select');
    if (modeSelect) {
        modeSelect.value = data.learningMode;
        modeSelect.addEventListener('change', (e) => {
            data.learningMode = e.target.value;
            element.setAttribute('learning-mode', e.target.value);
            
            // End any active lesson when switching modes
            if (e.target.value === 'associations' && isLessonActive()) {
                endLesson();
            }
            
            updateModeUI(element, e.target.value);
        });
    }
    
    // Initialize mode UI
    updateModeUI(element, data.learningMode);
    
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
            // Clear text by updating keyboard state
            const currentState = getCurrentState();
            const newState = {
                ...currentState,
                input: '',
                caretPosition: 0
            };
            setState(newState);
            
            // Also manually sync the textarea to ensure it updates
            const textArea = element.querySelector('#kids-keyboard-text');
            if (textArea) {
                textArea.value = '';
                textArea.setSelectionRange(0, 0);
            }
            
            clearDisplay();
        });
    }
    
    // Tutor mode toggle button
    const tutorToggleBtn = element.querySelector('#tutor-toggle-btn');
    if (tutorToggleBtn) {
        tutorToggleBtn.addEventListener('click', () => {
            // Toggle tutor mode using setState function
            const textArea = element.querySelector('#kids-keyboard-text');
            const currentState = getCurrentState();
            const newTutorMode = !currentState.isTutorModeActive;
            
            const newState = newTutorMode 
                ? activateTutorMode(currentState, textArea)
                : deactivateTutorMode(currentState);
            
            setState(newState);
            
            // Update button appearance
            updateTutorModeButton(element, newTutorMode);
        });
    }
    
    updateLessonButtons(element);
    // Initialize tutor mode button with current state
    const currentState = getCurrentState();
    updateTutorModeButton(element, currentState.isTutorModeActive);
};

const updateLessonButtons = (element) => {
    const startBtn = element.querySelector('#start-lesson-btn');
    const endBtn = element.querySelector('#end-lesson-btn');
    const active = isLessonActive();
    
    if (startBtn) startBtn.disabled = active;
    if (endBtn) endBtn.disabled = !active;
};

const updateModeUI = (element, mode) => {
    const lessonControls = element.querySelector('.kids-keyboard__lesson-controls');
    const statsPanel = element.querySelector('#stats-panel');
    const displayArea = element.querySelector('#kids-keyboard-display');
    
    if (lessonControls) {
        // Show lesson controls only in lessons mode
        lessonControls.style.display = mode === 'lessons' ? 'flex' : 'none';
    }
    
    if (statsPanel) {
        // Show statistics only in lessons mode
        statsPanel.style.display = mode === 'lessons' ? 'block' : 'none';
    }
    
    // Update display area based on mode
    if (displayArea && mode === 'associations') {
        // Clear any lesson content when switching to associations
        displayArea.innerHTML = '';
        displayArea.style.background = '#f8f9fa';
    }
    
    // Mode-specific behavior
    if (mode === 'associations') {
        // Associations mode: focus on letter-animal learning
        // All key presses show educational content
        // No stats tracking - just exploration and learning
    } else if (mode === 'lessons') {
        // Lessons mode: structured learning with start/stop controls
        // Key presses are processed by lesson system when lesson is active
        // Stats tracking for progress measurement
    }
};

const updateTutorModeButton = (element, isActive) => {
    const tutorBtn = element.querySelector('#tutor-toggle-btn');
    const tutorContainer = element.querySelector('#kids-keyboard-tutor');
    const keyboardInput = element.querySelector('#kids-keyboard-input');
    
    if (tutorBtn) {
        tutorBtn.textContent = isActive ? '🎯 ON' : '⚫ OFF';
        tutorBtn.title = isActive ? 'Turn off tutor mode' : 'Turn on tutor mode';
        tutorBtn.classList.toggle('active', isActive);
    }
    
    if (tutorContainer) {
        tutorContainer.classList.toggle('active', isActive);
    }
    
    // Enable/disable keyboard input based on tutor mode state
    if (keyboardInput) {
        keyboardInput.classList.toggle('disabled', !isActive);
    }
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
                updateTutorModeButton(this, true);
            }, 100);
        }
    }
    
    disconnectedCallback() {
        if (this.keyboardInstance?.cleanup) {
            this.keyboardInstance.cleanup();
        }
        endSession();
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        // Don't re-initialize for learning-mode changes - handle them internally
        if (name === 'learning-mode') {
            return; // Mode changes are handled by the internal event listener
        }
        
        if (this.keyboardInstance && oldValue !== newValue) {
            // Clean up existing instance
            if (this.keyboardInstance?.cleanup) {
                this.keyboardInstance.cleanup();
            }
            
            const data = parseComponentData(this);
            // Re-initialize for other attribute changes
            this.innerHTML = createComponentHTML(data);
            this.keyboardInstance = initializeKeyboard(this, data);
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