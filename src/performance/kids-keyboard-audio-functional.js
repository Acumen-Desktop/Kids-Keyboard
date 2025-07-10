/**
 * Kids Keyboard - Functionally Optimized Audio System
 * 
 * PERFORMANCE OPTIMIZATIONS (maintaining functional style):
 * ✓ Reduced debouncing from 100ms to 50ms
 * ✓ Simplified speech cancellation logic  
 * ✓ Eliminated redundant timeout management
 * ✓ Cached voice selection and reduced repeated lookups
 * ✓ Streamlined speech execution path
 * ✓ MAINTAINS ORIGINAL FUNCTIONAL/CLOSURE STYLE
 * 
 * @version 0.10.1-functional
 * @author James Swansburg
 * @license MIT
 */

// =============================================================================
// CONSTANTS & CONFIGURATION
// =============================================================================

const AUDIO_CONFIG = Object.freeze({
    DEBOUNCE_INTERVAL: 50, // Reduced from 100ms for better responsiveness
    MIN_SPEECH_GAP: 25,    // Minimum time between speech attempts
    DEFAULT_RATE: 2.0,     // Faster to reduce lag during rapid typing
    DEFAULT_PITCH: 1.1,
    DEFAULT_VOLUME: 0.8,
    LANGUAGE: 'en-US'
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
    'space': 'space bar', 'enter': 'enter key', 'backspace': 'backspace',
    'tab': 'tab key', 'capslock': 'caps lock',
    'shiftleft': 'left shift', 'shiftright': 'right shift'
});

// Preferred voices for faster lookup
const PREFERRED_VOICES = [
    'Karen', 'Samantha', 'Victoria', 'Allison',
    'Google US English Female', 'Microsoft Zira', 'Alex'
];

// =============================================================================
// CORE UTILITY FUNCTIONS (Pure Functions)
// =============================================================================

const checkAudioSupport = () => {
    return typeof window !== 'undefined' && 
           'speechSynthesis' in window && 
           'SpeechSynthesisUtterance' in window;
};

const selectOptimalVoice = (voices) => {
    if (voices.length === 0) return null;

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
};

const isAudioLetterKey = (key) => key.length === 1 && /[a-z]/i.test(key);
const isAudioNumberKey = (key) => key.length === 1 && /[0-9]/.test(key);

// =============================================================================
// OPTIMIZED AUDIO STATE (Functional with Closures)
// =============================================================================

const createOptimizedAudioState = (initialConfig = {}) => {
    // Private state variables (closure)
    let config = {
        enabled: true,
        rate: AUDIO_CONFIG.DEFAULT_RATE,
        pitch: AUDIO_CONFIG.DEFAULT_PITCH,
        volume: AUDIO_CONFIG.DEFAULT_VOLUME,
        language: AUDIO_CONFIG.LANGUAGE,
        ...initialConfig
    };
    
    let voices = [];
    let selectedVoice = null;
    let isInitialized = false;
    let lastSpeechTime = 0;
    let pendingTimeout = null;
    let isSupported = checkAudioSupport();

    // Settings persistence (private functions)
    const loadSettings = () => {
        if (typeof localStorage === 'undefined') return;
        
        try {
            const saved = localStorage.getItem('kids-keyboard-audio');
            if (saved) {
                const settings = JSON.parse(saved);
                config = { ...config, ...settings };
                
                if (settings.voiceName && voices.length > 0) {
                    const voice = voices.find(v => v.name === settings.voiceName);
                    if (voice) selectedVoice = voice;
                }
            }
        } catch (error) {
            console.warn('Failed to load audio settings:', error);
        }
    };

    const saveSettings = () => {
        if (typeof localStorage === 'undefined') return;
        
        try {
            const settings = {
                ...config,
                voiceName: selectedVoice?.name || null
            };
            localStorage.setItem('kids-keyboard-audio', JSON.stringify(settings));
        } catch (error) {
            console.warn('Failed to save audio settings:', error);
        }
    };

    // Voice initialization (async but functional)
    const initializeVoices = () => {
        if (!isSupported) return Promise.resolve(false);

        return new Promise((resolve) => {
            const loadVoices = () => {
                const availableVoices = speechSynthesis.getVoices();
                if (availableVoices.length > 0) {
                    voices = availableVoices;
                    selectedVoice = selectOptimalVoice(voices);
                    isInitialized = true;
                    resolve(true);
                }
            };

            loadVoices();
            
            if (speechSynthesis.onvoiceschanged !== undefined) {
                speechSynthesis.onvoiceschanged = () => {
                    loadVoices();
                    speechSynthesis.onvoiceschanged = null;
                };
            }
        });
    };

    // Initialize on creation
    if (isSupported) {
        initializeVoices().then(() => loadSettings());
    }

    // Public API (functional interface)
    return {
        // Getters
        getConfig: () => ({ ...config }),
        getVoices: () => voices,
        getSelectedVoice: () => selectedVoice,
        isSupported: () => isSupported,
        isInitialized: () => isInitialized,
        getLastSpeechTime: () => lastSpeechTime,
        getPendingTimeout: () => pendingTimeout,
        
        // Setters
        setConfig: (newConfig) => {
            config = { ...config, ...newConfig };
            saveSettings();
        },
        setSelectedVoice: (voice) => {
            selectedVoice = voice;
            saveSettings();
        },
        setLastSpeechTime: (time) => { lastSpeechTime = time; },
        setPendingTimeout: (timeout) => { pendingTimeout = timeout; },
        
        // Initialization
        initializeVoices,
        
        // Cleanup
        cleanup: () => {
            if (pendingTimeout) {
                clearTimeout(pendingTimeout);
                pendingTimeout = null;
            }
            if (speechSynthesis.speaking) {
                speechSynthesis.cancel();
            }
        }
    };
};

// =============================================================================
// OPTIMIZED SPEECH ENGINE (Functional)
// =============================================================================

const createOptimizedSpeechEngine = (audioState) => {
    
    const executeSpeech = (text, timestamp) => {
        audioState.setLastSpeechTime(timestamp);

        // Quick cancellation of any ongoing speech
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Apply configuration
        const config = audioState.getConfig();
        utterance.rate = config.rate;
        utterance.pitch = config.pitch;
        utterance.volume = config.volume;
        utterance.lang = config.language;

        const selectedVoice = audioState.getSelectedVoice();
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        // Minimal error handling
        utterance.onerror = () => speechSynthesis.cancel();

        try {
            speechSynthesis.speak(utterance);
        } catch (error) {
            console.error('Speech failed:', error);
        }
    };

    const cancelPendingSpeech = () => {
        const timeout = audioState.getPendingTimeout();
        if (timeout) {
            clearTimeout(timeout);
            audioState.setPendingTimeout(null);
        }
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
    };

    const speak = (text) => {
        if (!audioState.isSupported() || !audioState.getConfig().enabled || !text) {
            return;
        }

        const now = performance.now();
        const timeSinceLastSpeech = now - audioState.getLastSpeechTime();

        // Clear any pending speech
        cancelPendingSpeech();

        // Fast path: if enough time has passed, speak immediately
        if (timeSinceLastSpeech >= AUDIO_CONFIG.DEBOUNCE_INTERVAL) {
            executeSpeech(text, now);
        } else {
            // Debounce: schedule for later
            const delay = AUDIO_CONFIG.DEBOUNCE_INTERVAL - timeSinceLastSpeech;
            const timeout = setTimeout(() => {
                executeSpeech(text, performance.now());
                audioState.setPendingTimeout(null);
            }, delay);
            audioState.setPendingTimeout(timeout);
        }
    };

    return {
        speak,
        cancelPendingSpeech,
        destroy: cancelPendingSpeech
    };
};

// =============================================================================
// AUDIO FUNCTIONS (Pure Functions)
// =============================================================================

const playPhysicalKeySound = (key, speechEngine, audioState) => {
    if (!audioState.getConfig().enabled) return;

    const lowerKey = key.toLowerCase();
    
    if (isAudioLetterKey(lowerKey)) {
        speechEngine.speak(lowerKey);
    } else if (isAudioNumberKey(lowerKey)) {
        speechEngine.speak(lowerKey);
    } else {
        const functionSound = FUNCTION_KEY_SOUNDS[lowerKey];
        if (functionSound) {
            speechEngine.speak(functionSound);
        }
    }
};

const playVirtualKeySound = (key, speechEngine, audioState) => {
    if (!audioState.getConfig().enabled) return;

    const lowerKey = key.toLowerCase();

    if (isAudioLetterKey(lowerKey)) {
        const phoneticSound = PHONETIC_SOUNDS[lowerKey];
        const text = `Letter ${key.toUpperCase()}. ${key.toUpperCase()} says ${phoneticSound}`;
        speechEngine.speak(text);
    } else if (isAudioNumberKey(lowerKey)) {
        const numberWord = NUMBER_SOUNDS[lowerKey];
        const text = `Number ${lowerKey}. ${lowerKey} is ${numberWord}`;
        speechEngine.speak(text);
    } else {
        const functionSound = FUNCTION_KEY_SOUNDS[lowerKey];
        if (functionSound) {
            speechEngine.speak(functionSound);
        }
    }
};

// =============================================================================
// MAIN FACTORY FUNCTION (Functional Composition)
// =============================================================================

const createKidsKeyboardAudio = async (options = {}) => {
    // Create audio state and speech engine
    const audioState = createOptimizedAudioState(options);
    const speechEngine = createOptimizedSpeechEngine(audioState);
    
    // Wait for voice initialization if supported
    if (audioState.isSupported()) {
        await audioState.initializeVoices();
    }
    
    // Return functional API (no classes, just closures and pure functions)
    return {
        // Primary audio functions
        playPhysicalKeySound: (key) => playPhysicalKeySound(key, speechEngine, audioState),
        playVirtualKeySound: (key) => playVirtualKeySound(key, speechEngine, audioState),
        
        // Legacy compatibility
        playKeySound: (key) => playVirtualKeySound(key, speechEngine, audioState),
        playLetterSound: (letter) => playVirtualKeySound(letter, speechEngine, audioState),
        playNumberSound: (number) => playVirtualKeySound(number, speechEngine, audioState),
        playFunctionKeySound: (key) => playVirtualKeySound(key, speechEngine, audioState),
        
        // Control functions
        toggle: () => {
            const config = audioState.getConfig();
            const newEnabled = !config.enabled;
            audioState.setConfig({ ...config, enabled: newEnabled });
            if (!newEnabled) speechEngine.cancelPendingSpeech();
            return newEnabled;
        },
        
        enable: () => audioState.setConfig({ ...audioState.getConfig(), enabled: true }),
        
        disable: () => {
            audioState.setConfig({ ...audioState.getConfig(), enabled: false });
            speechEngine.cancelPendingSpeech();
        },
        
        // Settings
        setRate: (rate) => {
            const config = audioState.getConfig();
            audioState.setConfig({ ...config, rate: Math.max(0.5, Math.min(2.0, rate)) });
        },
        
        setPitch: (pitch) => {
            const config = audioState.getConfig();
            audioState.setConfig({ ...config, pitch: Math.max(0.5, Math.min(2.0, pitch)) });
        },
        
        setVolume: (volume) => {
            const config = audioState.getConfig();
            audioState.setConfig({ ...config, volume: Math.max(0.0, Math.min(1.0, volume)) });
        },
        
        setVoice: (voice) => {
            const voices = audioState.getVoices();
            if (typeof voice === 'string') {
                const foundVoice = voices.find(v => v.name === voice);
                if (foundVoice) audioState.setSelectedVoice(foundVoice);
            } else if (voice && voice.name) {
                audioState.setSelectedVoice(voice);
            }
        },
        
        // Core functions
        speak: (text) => speechEngine.speak(text),
        test: () => speechEngine.speak('Hello! This is the Kids Keyboard audio system.'),
        
        // Getters
        getConfig: () => audioState.getConfig(),
        getVoices: () => audioState.getVoices(),
        getSelectedVoice: () => audioState.getSelectedVoice(),
        getStatus: () => ({
            supported: audioState.isSupported(),
            initialized: audioState.isInitialized(),
            enabled: audioState.getConfig().enabled,
            voicesAvailable: audioState.getVoices().length,
            selectedVoice: audioState.getSelectedVoice()?.name || 'None'
        }),
        
        isSupported: () => audioState.isSupported(),
        isInitialized: () => audioState.isInitialized(),
        
        // Cleanup
        destroy: () => {
            speechEngine.destroy();
            audioState.cleanup();
        }
    };
};

// =============================================================================
// MODULE EXPORTS
// =============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createKidsKeyboardAudio };
} else if (typeof window !== 'undefined') {
    window.createKidsKeyboardAudio = createKidsKeyboardAudio;
}