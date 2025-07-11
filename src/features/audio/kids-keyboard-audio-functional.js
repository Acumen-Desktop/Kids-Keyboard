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

const selectOptimalVoices = (voices) => {
    if (voices.length === 0) return { primary: null, secondary: null };

    // Find primary voice (fast, clear - same as PK)
    let primaryVoice = null;
    for (const preferred of PREFERRED_VOICES) {
        const voice = voices.find(v => 
            v.name.includes(preferred) && v.lang.startsWith('en')
        );
        if (voice) {
            primaryVoice = voice;
            break;
        }
    }

    // Fallback for primary voice
    if (!primaryVoice) {
        primaryVoice = voices.find(v => 
            v.lang.startsWith('en') && 
            (v.name.toLowerCase().includes('female') || v.gender === 'female')
        ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
    }

    // Find secondary voice (different from primary, slower for phonetics)
    const secondaryPreferences = [
        'Daniel', 'David', 'Mark',           // Male voices for contrast
        'Microsoft David', 'Google UK English Male',
        'Alex', 'Bruce', 'Fred'             // Different character
    ];

    let secondaryVoice = null;
    for (const preferred of secondaryPreferences) {
        const voice = voices.find(v => 
            v.name.includes(preferred) && 
            v.lang.startsWith('en') &&
            v.name !== primaryVoice?.name     // Must be different from primary
        );
        if (voice) {
            secondaryVoice = voice;
            break;
        }
    }

    // Fallback for secondary: find any male voice different from primary
    if (!secondaryVoice) {
        secondaryVoice = voices.find(v => 
            v.lang.startsWith('en') &&
            v.name !== primaryVoice?.name &&
            (v.name.toLowerCase().includes('male') || 
             v.gender === 'male' ||
             !v.name.toLowerCase().includes('female'))
        );
    }

    // Final fallback: use primary voice for both if no alternative found
    if (!secondaryVoice) {
        secondaryVoice = primaryVoice;
    }

    return { primary: primaryVoice, secondary: secondaryVoice };
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
    let primaryVoice = null;     // Fast voice (same as PK)
    let secondaryVoice = null;   // Slower voice for phonetics
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
                
                if (settings.primaryVoiceName && voices.length > 0) {
                    const voice = voices.find(v => v.name === settings.primaryVoiceName);
                    if (voice) primaryVoice = voice;
                }
                if (settings.secondaryVoiceName && voices.length > 0) {
                    const voice = voices.find(v => v.name === settings.secondaryVoiceName);
                    if (voice) secondaryVoice = voice;
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
                primaryVoiceName: primaryVoice?.name || null,
                secondaryVoiceName: secondaryVoice?.name || null
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
                    const voiceSelection = selectOptimalVoices(voices);
                    primaryVoice = voiceSelection.primary;
                    secondaryVoice = voiceSelection.secondary;
                    isInitialized = true;
                    
                    console.log('🎵 Primary voice (fast):', primaryVoice?.name);
                    console.log('🎵 Secondary voice (phonetics):', secondaryVoice?.name);
                    
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
        getPrimaryVoice: () => primaryVoice,
        getSecondaryVoice: () => secondaryVoice,
        getSelectedVoice: () => primaryVoice, // Legacy compatibility
        isSupported: () => isSupported,
        isInitialized: () => isInitialized,
        getLastSpeechTime: () => lastSpeechTime,
        getPendingTimeout: () => pendingTimeout,
        
        // Setters
        setConfig: (newConfig) => {
            config = { ...config, ...newConfig };
            saveSettings();
        },
        setPrimaryVoice: (voice) => {
            primaryVoice = voice;
            saveSettings();
        },
        setSecondaryVoice: (voice) => {
            secondaryVoice = voice;
            saveSettings();
        },
        setSelectedVoice: (voice) => {
            primaryVoice = voice; // Legacy compatibility
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
    
    const executeSpeech = (text, timestamp, voiceType = 'primary', rate = null, pitch = null) => {
        audioState.setLastSpeechTime(timestamp);

        // Quick cancellation of any ongoing speech
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Apply configuration
        const config = audioState.getConfig();
        utterance.rate = rate !== null ? rate : config.rate;
        utterance.pitch = pitch !== null ? pitch : config.pitch;
        utterance.volume = config.volume;
        utterance.lang = config.language;

        // Select voice based on type
        const voice = voiceType === 'secondary' ? 
            audioState.getSecondaryVoice() : 
            audioState.getPrimaryVoice();
        
        if (voice) {
            utterance.voice = voice;
        }

        // Minimal error handling
        utterance.onerror = () => speechSynthesis.cancel();

        try {
            speechSynthesis.speak(utterance);
        } catch (error) {
            console.error('Speech failed:', error);
        }
    };

    const executeDualSpeech = (primaryText, secondaryText, timestamp) => {
        audioState.setLastSpeechTime(timestamp);

        // Quick cancellation of any ongoing speech
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }

        const config = audioState.getConfig();

        // First utterance: Primary voice (fast, same as PK)
        const utterance1 = new SpeechSynthesisUtterance(primaryText);
        utterance1.rate = config.rate;  // Fast rate (2.0)
        utterance1.pitch = config.pitch;
        utterance1.volume = config.volume;
        utterance1.lang = config.language;
        
        const primaryVoice = audioState.getPrimaryVoice();
        if (primaryVoice) {
            utterance1.voice = primaryVoice;
        }

        // Second utterance: Secondary voice (slower, different voice)
        const utterance2 = new SpeechSynthesisUtterance(secondaryText);
        utterance2.rate = Math.max(0.6, config.rate - 0.8); // Slower (1.2 if config is 2.0)
        utterance2.pitch = config.pitch - 0.2; // Slightly lower pitch for contrast
        utterance2.volume = config.volume;
        utterance2.lang = config.language;
        
        const secondaryVoice = audioState.getSecondaryVoice();
        if (secondaryVoice) {
            utterance2.voice = secondaryVoice;
        }

        // Minimal error handling
        utterance1.onerror = () => speechSynthesis.cancel();
        utterance2.onerror = () => speechSynthesis.cancel();

        try {
            // Speak first utterance
            speechSynthesis.speak(utterance1);
            
            // Add slight pause then speak second utterance
            utterance1.onend = () => {
                setTimeout(() => {
                    if (!speechSynthesis.speaking) { // Only if not cancelled
                        speechSynthesis.speak(utterance2);
                    }
                }, 300); // 300ms pause between voices
            };
            
        } catch (error) {
            console.error('Dual speech failed:', error);
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

    const speak = (text, voiceType = 'primary') => {
        if (!audioState.isSupported() || !audioState.getConfig().enabled || !text) {
            return;
        }

        const now = performance.now();
        const timeSinceLastSpeech = now - audioState.getLastSpeechTime();

        // Clear any pending speech
        cancelPendingSpeech();

        // Fast path: if enough time has passed, speak immediately
        if (timeSinceLastSpeech >= AUDIO_CONFIG.DEBOUNCE_INTERVAL) {
            executeSpeech(text, now, voiceType);
        } else {
            // Debounce: schedule for later
            const delay = AUDIO_CONFIG.DEBOUNCE_INTERVAL - timeSinceLastSpeech;
            const timeout = setTimeout(() => {
                executeSpeech(text, performance.now(), voiceType);
                audioState.setPendingTimeout(null);
            }, delay);
            audioState.setPendingTimeout(timeout);
        }
    };

    const speakDual = (primaryText, secondaryText) => {
        if (!audioState.isSupported() || !audioState.getConfig().enabled || !primaryText) {
            return;
        }

        const now = performance.now();
        const timeSinceLastSpeech = now - audioState.getLastSpeechTime();

        // Clear any pending speech
        cancelPendingSpeech();

        // Fast path: if enough time has passed, speak immediately
        if (timeSinceLastSpeech >= AUDIO_CONFIG.DEBOUNCE_INTERVAL) {
            executeDualSpeech(primaryText, secondaryText, now);
        } else {
            // Debounce: schedule for later
            const delay = AUDIO_CONFIG.DEBOUNCE_INTERVAL - timeSinceLastSpeech;
            const timeout = setTimeout(() => {
                executeDualSpeech(primaryText, secondaryText, performance.now());
                audioState.setPendingTimeout(null);
            }, delay);
            audioState.setPendingTimeout(timeout);
        }
    };

    return {
        speak,
        speakDual,
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
        // Dual voice approach: Fast letter (same as PK) + slower phonetic sound
        const letterName = lowerKey; // Use lowercase to match PK exactly
        const phoneticSound = PHONETIC_SOUNDS[lowerKey];
        
        speechEngine.speakDual(letterName, phoneticSound);
    } else if (isAudioNumberKey(lowerKey)) {
        // Single voice for numbers (same as PK) - phonetic isn't different enough to warrant dual voice
        speechEngine.speak(lowerKey);
    } else {
        // Function keys: single voice (same as PK)
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
        getPrimaryVoice: () => audioState.getPrimaryVoice(),
        getSecondaryVoice: () => audioState.getSecondaryVoice(),
        getSelectedVoice: () => audioState.getSelectedVoice(), // Legacy
        getStatus: () => ({
            supported: audioState.isSupported(),
            initialized: audioState.isInitialized(),
            enabled: audioState.getConfig().enabled,
            voicesAvailable: audioState.getVoices().length,
            primaryVoice: audioState.getPrimaryVoice()?.name || 'None',
            secondaryVoice: audioState.getSecondaryVoice()?.name || 'None',
            selectedVoice: audioState.getPrimaryVoice()?.name || 'None' // Legacy
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