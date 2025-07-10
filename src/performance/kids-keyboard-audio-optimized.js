/**
 * Kids Keyboard - Optimized Audio System
 * 
 * PERFORMANCE OPTIMIZATIONS:
 * ✓ Reduced debouncing from 100ms to 50ms for better responsiveness  
 * ✓ Simplified speech cancellation logic
 * ✓ Eliminated redundant timeout management
 * ✓ Cached voice selection and reduced repeated lookups
 * ✓ Streamlined event handling for rapid keystrokes
 * ✓ Removed unnecessary promise chains
 * 
 * @version 0.10.1-optimized
 * @author James Swansburg
 * @license MIT
 */

// =============================================================================
// CONSTANTS & CONFIGURATION
// =============================================================================

const AUDIO_CONFIG = Object.freeze({
    DEBOUNCE_INTERVAL: 50, // Reduced from 100ms
    MIN_SPEECH_GAP: 25,    // Minimum time between speech attempts
    MAX_QUEUE_SIZE: 3,     // Limit audio queue size
    DEFAULT_RATE: 2.0,     // Increased from 0.8 to reduce lag
    DEFAULT_PITCH: 1,
    DEFAULT_VOLUME: 0.8
});

const PHONETIC_SOUNDS = Object.freeze({
    'a': 'ah', 'b': 'buh', 'c': 'kuh', 'd': 'duh', 'e': 'eh',
    'f': 'fuh', 'g': 'guh', 'h': 'huh', 'i': 'ih', 'j': 'juh',
    'k': 'kuh', 'l': 'luh', 'm': 'muh', 'n': 'nuh', 'o': 'oh',
    'p': 'puh', 'q': 'kwuh', 'r': 'ruh', 's': 'suh', 't': 'tuh',
    'u': 'uh', 'v': 'vuh', 'w': 'wuh', 'x': 'ksuh', 'y': 'yuh', 'z': 'zuh'
});

const NUMBER_SOUNDS = Object.freeze({
    '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four',
    '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine'
});

const FUNCTION_KEY_SOUNDS = Object.freeze({
    'space': 'space bar',
    'enter': 'enter key', 
    'backspace': 'backspace',
    'tab': 'tab key',
    'capslock': 'caps lock',
    'shiftleft': 'left shift',
    'shiftright': 'right shift'
});

// Preferred voice names for kid-friendly audio
const PREFERRED_VOICES = [
    'Karen', 'Samantha', 'Victoria', 'Allison',
    'Google US English Female', 'Microsoft Zira', 'Alex'
];

// =============================================================================
// OPTIMIZED AUDIO STATE
// =============================================================================

class OptimizedAudioState {
    constructor(initialConfig = {}) {
        this.config = {
            enabled: true,
            rate: AUDIO_CONFIG.DEFAULT_RATE,
            pitch: AUDIO_CONFIG.DEFAULT_PITCH,
            volume: AUDIO_CONFIG.DEFAULT_VOLUME,
            language: 'en-US',
            ...initialConfig
        };
        
        this.voices = [];
        this.selectedVoice = null;
        this.isInitialized = false;
        this.lastSpeechTime = 0;
        this.speechTimeout = null;
        this.isSupported = this.checkSupport();
        
        if (this.isSupported) {
            this.initializeVoices();
            this.loadSettings();
        }
    }

    checkSupport() {
        return typeof window !== 'undefined' && 
               'speechSynthesis' in window && 
               'SpeechSynthesisUtterance' in window;
    }

    async initializeVoices() {
        if (!this.isSupported) return false;

        return new Promise((resolve) => {
            const loadVoices = () => {
                const voices = speechSynthesis.getVoices();
                if (voices.length > 0) {
                    this.voices = voices;
                    this.selectedVoice = this.selectOptimalVoice(voices);
                    this.isInitialized = true;
                    resolve(true);
                }
            };

            loadVoices();
            
            // Handle async voice loading
            if (speechSynthesis.onvoiceschanged !== undefined) {
                speechSynthesis.onvoiceschanged = () => {
                    loadVoices();
                    speechSynthesis.onvoiceschanged = null;
                };
            }
        });
    }

    selectOptimalVoice(voices) {
        // Fast lookup for preferred voices
        for (const preferred of PREFERRED_VOICES) {
            const voice = voices.find(v => 
                v.name.includes(preferred) && v.lang.startsWith('en')
            );
            if (voice) return voice;
        }

        // Fallback to first English female voice
        return voices.find(v => 
            v.lang.startsWith('en') && 
            (v.name.toLowerCase().includes('female') || v.gender === 'female')
        ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
    }

    loadSettings() {
        if (typeof localStorage === 'undefined') return;
        
        try {
            const saved = localStorage.getItem('kids-keyboard-audio');
            if (saved) {
                const settings = JSON.parse(saved);
                Object.assign(this.config, settings);
                
                if (settings.voiceName && this.voices.length > 0) {
                    const voice = this.voices.find(v => v.name === settings.voiceName);
                    if (voice) this.selectedVoice = voice;
                }
            }
        } catch (error) {
            console.warn('Failed to load audio settings:', error);
        }
    }

    saveSettings() {
        if (typeof localStorage === 'undefined') return;
        
        try {
            const settings = {
                ...this.config,
                voiceName: this.selectedVoice?.name || null
            };
            localStorage.setItem('kids-keyboard-audio', JSON.stringify(settings));
        } catch (error) {
            console.warn('Failed to save audio settings:', error);
        }
    }
}

// =============================================================================
// OPTIMIZED SPEECH ENGINE
// =============================================================================

class OptimizedSpeechEngine {
    constructor(audioState) {
        this.audioState = audioState;
        this.lastSpeechTime = 0;
        this.pendingTimeout = null;
    }

    speak(text) {
        if (!this.audioState.isSupported || !this.audioState.config.enabled || !text) {
            return;
        }

        const now = performance.now();
        const timeSinceLastSpeech = now - this.lastSpeechTime;

        // Clear any pending speech
        this.cancelPendingSpeech();

        // Fast path: if enough time has passed, speak immediately
        if (timeSinceLastSpeech >= AUDIO_CONFIG.DEBOUNCE_INTERVAL) {
            this.executeSpeech(text, now);
        } else {
            // Debounce: schedule for later
            const delay = AUDIO_CONFIG.DEBOUNCE_INTERVAL - timeSinceLastSpeech;
            this.pendingTimeout = setTimeout(() => {
                this.executeSpeech(text, performance.now());
                this.pendingTimeout = null;
            }, delay);
        }
    }

    executeSpeech(text, timestamp) {
        this.lastSpeechTime = timestamp;

        // Quick cancellation of any ongoing speech
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Apply configuration
        const config = this.audioState.config;
        utterance.rate = config.rate;
        utterance.pitch = config.pitch;
        utterance.volume = config.volume;
        utterance.lang = config.language;

        if (this.audioState.selectedVoice) {
            utterance.voice = this.audioState.selectedVoice;
        }

        // Minimal error handling
        utterance.onerror = () => speechSynthesis.cancel();

        try {
            speechSynthesis.speak(utterance);
        } catch (error) {
            console.error('Speech failed:', error);
        }
    }

    cancelPendingSpeech() {
        if (this.pendingTimeout) {
            clearTimeout(this.pendingTimeout);
            this.pendingTimeout = null;
        }
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
    }

    destroy() {
        this.cancelPendingSpeech();
    }
}

// =============================================================================
// OPTIMIZED AUDIO FUNCTIONS
// =============================================================================

class OptimizedAudioSystem {
    constructor(options = {}) {
        this.audioState = new OptimizedAudioState(options);
        this.speechEngine = new OptimizedSpeechEngine(this.audioState);
    }

    // Fast audio functions for physical keyboard (minimal processing)
    playPhysicalKeySound(key) {
        if (!this.audioState.config.enabled) return;

        const lowerKey = key.toLowerCase();
        
        if (lowerKey.length === 1) {
            if (/[a-z]/.test(lowerKey)) {
                this.speechEngine.speak(lowerKey);
            } else if (/[0-9]/.test(lowerKey)) {
                this.speechEngine.speak(lowerKey);
            }
        } else {
            const functionSound = FUNCTION_KEY_SOUNDS[lowerKey];
            if (functionSound) {
                this.speechEngine.speak(functionSound);
            }
        }
    }

    // Detailed audio for virtual keyboard (educational)
    playVirtualKeySound(key) {
        if (!this.audioState.config.enabled) return;

        const lowerKey = key.toLowerCase();

        if (lowerKey.length === 1) {
            if (/[a-z]/.test(lowerKey)) {
                const phoneticSound = PHONETIC_SOUNDS[lowerKey];
                const text = `Letter ${key.toUpperCase()}. ${key.toUpperCase()} says ${phoneticSound}`;
                this.speechEngine.speak(text);
            } else if (/[0-9]/.test(lowerKey)) {
                const numberWord = NUMBER_SOUNDS[lowerKey];
                const text = `Number ${lowerKey}. ${lowerKey} is ${numberWord}`;
                this.speechEngine.speak(text);
            }
        } else {
            const functionSound = FUNCTION_KEY_SOUNDS[lowerKey];
            if (functionSound) {
                this.speechEngine.speak(functionSound);
            }
        }
    }

    // Control functions
    toggle() {
        this.audioState.config.enabled = !this.audioState.config.enabled;
        this.audioState.saveSettings();
        if (!this.audioState.config.enabled) {
            this.speechEngine.cancelPendingSpeech();
        }
        return this.audioState.config.enabled;
    }

    enable() {
        this.audioState.config.enabled = true;
        this.audioState.saveSettings();
    }

    disable() {
        this.audioState.config.enabled = false;
        this.speechEngine.cancelPendingSpeech();
        this.audioState.saveSettings();
    }

    // Settings
    setRate(rate) {
        this.audioState.config.rate = Math.max(0.5, Math.min(2.0, rate));
        this.audioState.saveSettings();
    }

    setPitch(pitch) {
        this.audioState.config.pitch = Math.max(0.5, Math.min(2.0, pitch));
        this.audioState.saveSettings();
    }

    setVolume(volume) {
        this.audioState.config.volume = Math.max(0.0, Math.min(1.0, volume));
        this.audioState.saveSettings();
    }

    setVoice(voice) {
        if (typeof voice === 'string') {
            const foundVoice = this.audioState.voices.find(v => v.name === voice);
            if (foundVoice) {
                this.audioState.selectedVoice = foundVoice;
                this.audioState.saveSettings();
            }
        } else if (voice && voice.name) {
            this.audioState.selectedVoice = voice;
            this.audioState.saveSettings();
        }
    }

    // Getters
    getConfig() { return { ...this.audioState.config }; }
    getVoices() { return this.audioState.voices; }
    getSelectedVoice() { return this.audioState.selectedVoice; }
    isSupported() { return this.audioState.isSupported; }
    isInitialized() { return this.audioState.isInitialized; }

    getStatus() {
        return {
            supported: this.audioState.isSupported,
            initialized: this.audioState.isInitialized,
            enabled: this.audioState.config.enabled,
            voicesAvailable: this.audioState.voices.length,
            selectedVoice: this.audioState.selectedVoice?.name || 'None'
        };
    }

    // Test and utility functions
    test() {
        this.speechEngine.speak('Hello! This is the Kids Keyboard audio system.');
    }

    speak(text) {
        this.speechEngine.speak(text);
    }

    destroy() {
        this.speechEngine.destroy();
    }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

async function createKidsKeyboardAudio(options = {}) {
    const audioSystem = new OptimizedAudioSystem(options);
    
    // Wait for voice initialization if supported
    if (audioSystem.isSupported()) {
        await audioSystem.audioState.initializeVoices();
    }
    
    return {
        // Primary audio functions
        playPhysicalKeySound: (key) => audioSystem.playPhysicalKeySound(key),
        playVirtualKeySound: (key) => audioSystem.playVirtualKeySound(key),
        
        // Legacy compatibility
        playKeySound: (key) => audioSystem.playVirtualKeySound(key),
        playLetterSound: (letter) => audioSystem.playVirtualKeySound(letter),
        playNumberSound: (number) => audioSystem.playVirtualKeySound(number),
        playFunctionKeySound: (key) => audioSystem.playVirtualKeySound(key),
        
        // Control functions
        toggle: () => audioSystem.toggle(),
        enable: () => audioSystem.enable(),
        disable: () => audioSystem.disable(),
        
        // Settings
        setRate: (rate) => audioSystem.setRate(rate),
        setPitch: (pitch) => audioSystem.setPitch(pitch),
        setVolume: (volume) => audioSystem.setVolume(volume),
        setVoice: (voice) => audioSystem.setVoice(voice),
        
        // Core functions
        speak: (text) => audioSystem.speak(text),
        test: () => audioSystem.test(),
        
        // Getters
        getConfig: () => audioSystem.getConfig(),
        getVoices: () => audioSystem.getVoices(),
        getSelectedVoice: () => audioSystem.getSelectedVoice(),
        getStatus: () => audioSystem.getStatus(),
        isSupported: () => audioSystem.isSupported(),
        isInitialized: () => audioSystem.isInitialized()
    };
}

// =============================================================================
// MODULE EXPORTS
// =============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createKidsKeyboardAudio };
} else if (typeof window !== 'undefined') {
    window.createKidsKeyboardAudio = createKidsKeyboardAudio;
}