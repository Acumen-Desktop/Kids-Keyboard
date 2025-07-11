/**
 * Kids Keyboard - Unified and Optimized Audio System
 * 
 * This script combines the best features of the various experimental audio files:
 * - The robust, dual-voice functional approach from 'kids-keyboard-audio-functional.js'
 * - Performance optimizations from 'kids-keyboard-audio-optimized.js'
 * - The core Web Speech API logic from 'kids-keyboard-audio-webAPI.js'
 * 
 * @version 0.11.0
 * @author James Swansburg (with consolidation by Gemini)
 * @license MIT
 */

// =============================================================================
// CONSTANTS & CONFIGURATION
// =============================================================================

const AUDIO_CONFIG = Object.freeze({
    DEBOUNCE_INTERVAL: 50, // Optimized for responsiveness
    MIN_SPEECH_GAP: 25,
    DEFAULT_RATE: 2.0,
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

const PREFERRED_VOICES = [
    'Karen', 'Samantha', 'Victoria', 'Allison',
    'Google US English Female', 'Microsoft Zira', 'Alex'
];

// =============================================================================
// CORE UTILITY FUNCTIONS
// =============================================================================

const checkAudioSupport = () => {
    return typeof window !== 'undefined' && 
           'speechSynthesis' in window && 
           'SpeechSynthesisUtterance' in window;
};

const selectOptimalVoices = (voices) => {
    if (voices.length === 0) return { primary: null, secondary: null };

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

    if (!primaryVoice) {
        primaryVoice = voices.find(v => 
            v.lang.startsWith('en') && 
            (v.name.toLowerCase().includes('female') || v.gender === 'female')
        ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
    }

    const secondaryPreferences = [
        'Fred','Daniel', 'David', 'Mark',
        'Microsoft David', 'Google UK English Male',
        'Alex', 'Bruce'
    ];

    let secondaryVoice = null;
    for (const preferred of secondaryPreferences) {
        const voice = voices.find(v => 
            v.name.includes(preferred) && 
            v.lang.startsWith('en') &&
            v.name !== primaryVoice?.name
        );
        if (voice) {
            secondaryVoice = voice;
            break;
        }
    }

    if (!secondaryVoice) {
        secondaryVoice = voices.find(v => 
            v.lang.startsWith('en') &&
            v.name !== primaryVoice?.name &&
            (v.name.toLowerCase().includes('male') || 
             v.gender === 'male' ||
             !v.name.toLowerCase().includes('female'))
        );
    }

    if (!secondaryVoice) {
        secondaryVoice = primaryVoice;
    }

    return { primary: primaryVoice, secondary: secondaryVoice };
};

const isAudioLetterKey = (key) => key.length === 1 && /[a-z]/i.test(key);
const isAudioNumberKey = (key) => key.length === 1 && /[0-9]/.test(key);

// =============================================================================
// AUDIO STATE MANAGEMENT
// =============================================================================

const createAudioState = (initialConfig = {}) => {
    let config = {
        enabled: true,
        rate: AUDIO_CONFIG.DEFAULT_RATE,
        pitch: AUDIO_CONFIG.DEFAULT_PITCH,
        volume: AUDIO_CONFIG.DEFAULT_VOLUME,
        language: AUDIO_CONFIG.LANGUAGE,
        ...initialConfig
    };
    
    let voices = [];
    let primaryVoice = null;
    let secondaryVoice = null;
    let isInitialized = false;
    let lastSpeechTime = 0;
    let pendingTimeout = null;
    let isSupported = checkAudioSupport();

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

    if (isSupported) {
        initializeVoices().then(() => loadSettings());
    }

    return {
        getConfig: () => ({ ...config }),
        getVoices: () => voices,
        getPrimaryVoice: () => primaryVoice,
        getSecondaryVoice: () => secondaryVoice,
        isSupported: () => isSupported,
        isInitialized: () => isInitialized,
        getLastSpeechTime: () => lastSpeechTime,
        getPendingTimeout: () => pendingTimeout,
        
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
        setLastSpeechTime: (time) => { lastSpeechTime = time; },
        setPendingTimeout: (timeout) => { pendingTimeout = timeout; },
        
        initializeVoices,
        
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
// SPEECH ENGINE
// =============================================================================

const createSpeechEngine = (audioState) => {
    
    const executeSpeech = (text, timestamp, voiceType = 'primary', rate = null, pitch = null) => {
        audioState.setLastSpeechTime(timestamp);

        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        
        const config = audioState.getConfig();
        utterance.rate = rate !== null ? rate : config.rate;
        utterance.pitch = pitch !== null ? pitch : config.pitch;
        utterance.volume = config.volume;
        utterance.lang = config.language;

        const voice = voiceType === 'secondary' ? 
            audioState.getSecondaryVoice() : 
            audioState.getPrimaryVoice();
        
        if (voice) {
            utterance.voice = voice;
        }

        utterance.onerror = () => speechSynthesis.cancel();

        try {
            speechSynthesis.speak(utterance);
        } catch (error) {
            console.error('Speech failed:', error);
        }
    };

    const executeDualSpeech = (primaryText, secondaryText, timestamp) => {
        audioState.setLastSpeechTime(timestamp);

        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }

        const config = audioState.getConfig();

        const utterance1 = new SpeechSynthesisUtterance(primaryText);
        utterance1.rate = config.rate;
        utterance1.pitch = config.pitch;
        utterance1.volume = config.volume;
        utterance1.lang = config.language;
        
        const primaryVoice = audioState.getPrimaryVoice();
        if (primaryVoice) {
            utterance1.voice = primaryVoice;
        }

        const utterance2 = new SpeechSynthesisUtterance(secondaryText);
        utterance2.rate = Math.max(0.6, config.rate - 0.8);
        utterance2.pitch = config.pitch - 0.2;
        utterance2.volume = config.volume;
        utterance2.lang = config.language;
        
        const secondaryVoice = audioState.getSecondaryVoice();
        if (secondaryVoice) {
            utterance2.voice = secondaryVoice;
        }

        utterance1.onerror = () => speechSynthesis.cancel();
        utterance2.onerror = () => speechSynthesis.cancel();

        try {
            speechSynthesis.speak(utterance1);
            
            utterance1.onend = () => {
                setTimeout(() => {
                    if (!speechSynthesis.speaking) {
                        speechSynthesis.speak(utterance2);
                    }
                }, 300);
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

        cancelPendingSpeech();

        if (timeSinceLastSpeech >= AUDIO_CONFIG.DEBOUNCE_INTERVAL) {
            executeSpeech(text, now, voiceType);
        } else {
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

        cancelPendingSpeech();

        if (timeSinceLastSpeech >= AUDIO_CONFIG.DEBOUNCE_INTERVAL) {
            executeDualSpeech(primaryText, secondaryText, now);
        } else {
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
// AUDIO FUNCTIONS
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
        const letterName = lowerKey;
        const phoneticSound = PHONETIC_SOUNDS[lowerKey];
        
        speechEngine.speakDual(letterName, phoneticSound);
    } else if (isAudioNumberKey(lowerKey)) {
        speechEngine.speak(lowerKey);
    } else {
        const functionSound = FUNCTION_KEY_SOUNDS[lowerKey];
        if (functionSound) {
            speechEngine.speak(functionSound);
        }
    }
};

// =============================================================================
// MAIN FACTORY FUNCTION
// =============================================================================

const createKidsKeyboardAudio = async (options = {}) => {
    const audioState = createAudioState(options);
    const speechEngine = createSpeechEngine(audioState);
    
    if (audioState.isSupported()) {
        await audioState.initializeVoices();
    }
    
    return {
        playPhysicalKeySound: (key) => playPhysicalKeySound(key, speechEngine, audioState),
        playVirtualKeySound: (key) => playVirtualKeySound(key, speechEngine, audioState),
        
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
        
        setPrimaryVoice: (voice) => {
            const voices = audioState.getVoices();
            if (typeof voice === 'string') {
                const foundVoice = voices.find(v => v.name === voice);
                if (foundVoice) audioState.setPrimaryVoice(foundVoice);
            } else if (voice && voice.name) {
                audioState.setPrimaryVoice(voice);
            }
        },

        setSecondaryVoice: (voice) => {
            const voices = audioState.getVoices();
            if (typeof voice === 'string') {
                const foundVoice = voices.find(v => v.name === voice);
                if (foundVoice) audioState.setSecondaryVoice(foundVoice);
            } else if (voice && voice.name) {
                audioState.setSecondaryVoice(voice);
            }
        },
        
        speak: (text) => speechEngine.speak(text),
        test: () => speechEngine.speak('Hello! This is the Kids Keyboard audio system.'),
        testSecondary: () => speechEngine.speak('This is the secondary voice.', 'secondary'),
        
        getConfig: () => audioState.getConfig(),
        getVoices: () => audioState.getVoices(),
        getPrimaryVoice: () => audioState.getPrimaryVoice(),
        getSecondaryVoice: () => audioState.getSecondaryVoice(),
        getStatus: () => ({
            supported: audioState.isSupported(),
            initialized: audioState.isInitialized(),
            enabled: audioState.getConfig().enabled,
            voicesAvailable: audioState.getVoices().length,
            primaryVoice: audioState.getPrimaryVoice()?.name || 'None',
            secondaryVoice: audioState.getSecondaryVoice()?.name || 'None'
        }),
        
        isSupported: () => audioState.isSupported(),
        isInitialized: () => audioState.isInitialized(),
        
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
