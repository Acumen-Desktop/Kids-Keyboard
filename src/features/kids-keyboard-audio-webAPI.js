/**
 * Kids Keyboard - Web Speech API Audio Feature
 *
 * Phase 1A: Basic Audio System for Pre-School Children (Ages 3-5)
 * Functional TypeScript style implementation using Web Speech API.
 *
 * @version 0.10.0
 * @author James Swansburg
 * @license MIT
 *
 * FEATURES:
 * - Letter phonetic sounds ("A says 'ah'")
 * - Audio toggle with persistent settings
 * - Kid-friendly voice selection
 * - Adjustable speech rate and pitch
 * - Fallback for unsupported browsers
 *
 * EDUCATIONAL GOALS:
 * - Letter recognition for pre-school children
 * - Phonetic awareness development
 * - Cause-and-effect learning through interaction
 */

/**
 * Phonetic sound mappings for letters
 * Based on common phonics education standards
 */
const PHONETIC_SOUNDS = {
    'a': 'ah',     'b': 'buh',    'c': 'kuh',    'd': 'duh',    'e': 'eh',
    'f': 'fuh',    'g': 'guh',    'h': 'huh',    'i': 'ih',     'j': 'juh',
    'k': 'kuh',    'l': 'luh',    'm': 'muh',    'n': 'nuh',    'o': 'oh',
    'p': 'puh',    'q': 'kwuh',   'r': 'ruh',    's': 'suh',    't': 'tuh',
    'u': 'uh',     'v': 'vuh',    'w': 'wuh',    'x': 'ksuh',   'y': 'yuh',
    'z': 'zuh'
};

/**
 * Number pronunciations for digits
 */
const NUMBER_SOUNDS = {
    '0': 'zero',   '1': 'one',    '2': 'two',    '3': 'three',  '4': 'four',
    '5': 'five',   '6': 'six',    '7': 'seven',  '8': 'eight',  '9': 'nine'
};

/**
 * Function key descriptions
 */
const FUNCTION_KEY_SOUNDS = {
    'space': 'space bar',
    'enter': 'enter key',
    'backspace': 'backspace',
    'tab': 'tab key',
    'capslock': 'caps lock',
    'shiftleft': 'left shift',
    'shiftright': 'right shift'
};

/**
 * Default audio configuration
 */
const DEFAULT_AUDIO_CONFIG = {
    enabled: true,
    rate: 2.0,        // Faster to reduce lag during rapid typing
    pitch: 1.1,       // Slightly higher for friendliness
    volume: 0.8,      // Not too loud
    voice: null,      // Will be set to kid-friendly voice
    language: 'en-US'
};

/**
 * Audio system state - using closure for encapsulation
 */
const createAudioState = (initialConfig = {}) => {
    let config = { ...DEFAULT_AUDIO_CONFIG, ...initialConfig };
    let voices = [];
    let selectedVoice = null;
    let isInitialized = false;
    let lastSpeechTime = 0;
    let speechTimeout = null;

    return {
        getConfig: () => ({ ...config }),
        setConfig: (newConfig) => { config = { ...config, ...newConfig }; },
        getVoices: () => voices,
        setVoices: (newVoices) => { voices = newVoices; },
        getSelectedVoice: () => selectedVoice,
        setSelectedVoice: (voice) => { selectedVoice = voice; },
        isInitialized: () => isInitialized,
        setInitialized: (value) => { isInitialized = value; },
        getLastSpeechTime: () => lastSpeechTime,
        setLastSpeechTime: (time) => { lastSpeechTime = time; },
        getSpeechTimeout: () => speechTimeout,
        setSpeechTimeout: (timeout) => { speechTimeout = timeout; }
    };
};

/**
 * Check if Web Speech API is supported
 */
const checkAudioSupport = () => {
    if (typeof window === 'undefined') return false;
    return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
};

/**
 * Select a kid-friendly voice from available voices
 */
const selectKidFriendlyVoice = (voices) => {
    if (voices.length === 0) return null;

    // Prefer female voices (generally better for children)
    const preferredVoices = [
        'Karen',           // Often child-friendly
        'Samantha',        // Clear pronunciation
        'Victoria',        // Pleasant tone
        'Allison',         // Good for education
        'Google US English Female',
        'Microsoft Zira',
        'Alex'             // macOS default (good quality)
    ];

    // Try to find preferred voices
    for (const preferred of preferredVoices) {
        const voice = voices.find(v =>
            v.name.includes(preferred) && v.lang.startsWith('en')
        );
        if (voice) {
            console.log('🎵 Selected voice:', voice.name);
            return voice;
        }
    }

    // Fallback: prefer female English voices
    const femaleVoice = voices.find(v =>
        v.lang.startsWith('en') &&
        (v.name.toLowerCase().includes('female') || v.gender === 'female')
    );

    if (femaleVoice) {
        console.log('🎵 Selected female voice:', femaleVoice.name);
        return femaleVoice;
    }

    // Final fallback: first English voice
    const englishVoice = voices.find(v => v.lang.startsWith('en'));
    const selectedVoice = englishVoice || voices[0];
    console.log('🎵 Selected fallback voice:', selectedVoice?.name);
    return selectedVoice;
};

/**
 * Initialize voice selection with async loading
 */
const initializeVoices = (audioState) => {
    if (!checkAudioSupport()) {
        console.warn('🔇 Web Speech API not supported in this browser');
        return Promise.resolve(false);
    }

    return new Promise((resolve) => {
        const loadVoices = () => {
            const voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
                audioState.setVoices(voices);
                const selectedVoice = selectKidFriendlyVoice(voices);
                audioState.setSelectedVoice(selectedVoice);
                audioState.setInitialized(true);
                console.log('🎵 Audio system initialized with', voices.length, 'voices');
                resolve(true);
            }
        };

        // Try loading immediately
        loadVoices();

        // Also listen for the voiceschanged event (Chrome, Safari)
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = () => {
                loadVoices();
                speechSynthesis.onvoiceschanged = null; // Remove listener after first load
            };
        }
    });
};

/**
 * Enhanced speech synthesis function with debouncing and better cancellation
 */
const speak = (text, audioState) => {
    if (!checkAudioSupport() || !text) return;

    const config = audioState.getConfig();
    if (!config.enabled) return;

    const now = Date.now();
    const lastSpeechTime = audioState.getLastSpeechTime();
    const speechTimeout = audioState.getSpeechTimeout();

    // Clear any pending speech timeout
    if (speechTimeout) {
        clearTimeout(speechTimeout);
        audioState.setSpeechTimeout(null);
    }

    // Force cancel any ongoing speech immediately
    speechSynthesis.cancel();

    // Debounce rapid key presses (minimum 100ms between sounds)
    const timeSinceLastSpeech = now - lastSpeechTime;
    const minInterval = 100; // milliseconds

    const actualSpeak = () => {
        // Update last speech time
        audioState.setLastSpeechTime(Date.now());

        // Double-check cancellation worked
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);

        // Apply configuration
        utterance.rate = config.rate;
        utterance.pitch = config.pitch;
        utterance.volume = config.volume;
        utterance.lang = config.language;

        // Use selected voice if available
        const selectedVoice = audioState.getSelectedVoice();
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        // Enhanced error handling
        utterance.onerror = (event) => {
            console.error('🔇 Speech synthesis error:', event.error);
            // Try to recover by canceling and clearing the queue
            speechSynthesis.cancel();
        };

        // Success callback for debugging
        utterance.onstart = () => {
            console.log('🎵 Audio started:', text);
        };

        utterance.onend = () => {
            console.log('🎵 Audio finished:', text);
        };

        // Speak the text
        try {
            speechSynthesis.speak(utterance);
        } catch (error) {
            console.error('🔇 Failed to speak:', error);
        }
    };

    // If enough time has passed, speak immediately
    if (timeSinceLastSpeech >= minInterval) {
        actualSpeak();
    } else {
        // Otherwise, delay to prevent rapid-fire audio
        const delay = minInterval - timeSinceLastSpeech;
        const timeout = setTimeout(actualSpeak, delay);
        audioState.setSpeechTimeout(timeout);
        console.log(`🎵 Debouncing audio: waiting ${delay}ms`);
    }
};

/**
 * Play simple letter sound for physical keyboard (fast typing)
 */
const playLetterSoundSimple = (letter, audioState) => {
    const text = letter.toLowerCase();
    speak(text, audioState);
    console.log('🎵 Playing simple letter:', text);
};

/**
 * Play detailed letter sound for virtual keyboard (educational)
 */
const playLetterSoundDetailed = (letter, audioState) => {
    const lowerLetter = letter.toLowerCase();
    const phoneticSound = PHONETIC_SOUNDS[lowerLetter];

    if (phoneticSound) {
        const text = `Letter ${letter.toUpperCase()}. ${letter.toUpperCase()} says ${phoneticSound}`;
        speak(text, audioState);
        console.log('🎵 Playing detailed letter sound:', text);
    }
};

/**
 * Play simple number sound for physical keyboard
 */
const playNumberSoundSimple = (number, audioState) => {
    const text = number.toString();
    speak(text, audioState);
    console.log('🎵 Playing simple number:', text);
};

/**
 * Play detailed number sound for virtual keyboard
 */
const playNumberSoundDetailed = (number, audioState) => {
    const numberWord = NUMBER_SOUNDS[number];
    if (numberWord) {
        const text = `Number ${number}. ${number} is ${numberWord}`;
        speak(text, audioState);
        console.log('🎵 Playing detailed number sound:', text);
    }
};

/**
 * Play function key sound (same for both PK and VK)
 */
const playFunctionKeySound = (key, audioState) => {
    const keyDescription = FUNCTION_KEY_SOUNDS[key.toLowerCase()];
    if (keyDescription) {
        speak(keyDescription, audioState);
        console.log('🎵 Playing function key sound:', keyDescription);
    }
};

/**
 * Legacy function for backward compatibility
 */
const playLetterSound = (letter, audioState) => {
    playLetterSoundDetailed(letter, audioState);
};

/**
 * Legacy function for backward compatibility
 */
const playNumberSound = (number, audioState) => {
    playNumberSoundDetailed(number, audioState);
};

/**
 * Play sound for physical keyboard (PK) - fast and simple
 */
const playPhysicalKeySound = (key, audioState) => {
    const config = audioState.getConfig();
    if (!config.enabled || !checkAudioSupport()) return;

    const lowerKey = key.toLowerCase();

    // Check if it's a letter - just say the letter
    if (lowerKey.length === 1 && /[a-z]/.test(lowerKey)) {
        playLetterSoundSimple(lowerKey, audioState);
    }
    // Check if it's a number - just say the number
    else if (lowerKey.length === 1 && /[0-9]/.test(lowerKey)) {
        playNumberSoundSimple(lowerKey, audioState);
    }
    // Check if it's a function key
    else if (FUNCTION_KEY_SOUNDS[lowerKey]) {
        playFunctionKeySound(lowerKey, audioState);
    }
    else {
        console.log('🔇 No audio defined for PK key:', key);
    }
};

/**
 * Play sound for virtual keyboard (VK) - detailed and educational
 */
const playVirtualKeySound = (key, audioState) => {
    const config = audioState.getConfig();
    if (!config.enabled || !checkAudioSupport()) return;

    const lowerKey = key.toLowerCase();

    // Check if it's a letter - detailed explanation
    if (lowerKey.length === 1 && /[a-z]/.test(lowerKey)) {
        playLetterSoundDetailed(lowerKey, audioState);
    }
    // Check if it's a number - detailed explanation
    else if (lowerKey.length === 1 && /[0-9]/.test(lowerKey)) {
        playNumberSoundDetailed(lowerKey, audioState);
    }
    // Check if it's a function key
    else if (FUNCTION_KEY_SOUNDS[lowerKey]) {
        playFunctionKeySound(lowerKey, audioState);
    }
    else {
        console.log('🔇 No audio defined for VK key:', key);
    }
};

/**
 * Main function to play sound for any key (legacy - defaults to detailed)
 */
const playKeySound = (key, audioState) => {
    playVirtualKeySound(key, audioState);
};

/**
 * Settings persistence functions
 */
const saveSettings = (audioState) => {
    if (typeof localStorage === 'undefined') return;

    const config = audioState.getConfig();
    const selectedVoice = audioState.getSelectedVoice();

    const settings = {
        enabled: config.enabled,
        rate: config.rate,
        pitch: config.pitch,
        volume: config.volume,
        voiceName: selectedVoice?.name || null
    };

    localStorage.setItem('kids-keyboard-audio', JSON.stringify(settings));
};

const loadSettings = (audioState) => {
    if (typeof localStorage === 'undefined') return null;

    try {
        const saved = localStorage.getItem('kids-keyboard-audio');
        if (saved) {
            const settings = JSON.parse(saved);
            console.log('🎵 Audio settings loaded from localStorage');
            return settings;
        }
    } catch (error) {
        console.warn('🔇 Failed to load audio settings:', error);
    }
    return null;
};

/**
 * Audio control functions
 */
const toggleAudio = (audioState) => {
    const config = audioState.getConfig();
    const newEnabled = !config.enabled;
    audioState.setConfig({ ...config, enabled: newEnabled });
    saveSettings(audioState);
    console.log('🎵 Audio', newEnabled ? 'enabled' : 'disabled');
    return newEnabled;
};

const enableAudio = (audioState) => {
    const config = audioState.getConfig();
    audioState.setConfig({ ...config, enabled: true });
    saveSettings(audioState);
    console.log('🎵 Audio enabled');
};

const disableAudio = (audioState) => {
    const config = audioState.getConfig();
    audioState.setConfig({ ...config, enabled: false });

    // Clean up any pending timeouts
    const speechTimeout = audioState.getSpeechTimeout();
    if (speechTimeout) {
        clearTimeout(speechTimeout);
        audioState.setSpeechTimeout(null);
    }

    // Stop any ongoing speech
    speechSynthesis.cancel();
    saveSettings(audioState);
    console.log('🔇 Audio disabled');
};

const setRate = (rate, audioState) => {
    const config = audioState.getConfig();
    const newRate = Math.max(0.5, Math.min(2.0, rate));
    audioState.setConfig({ ...config, rate: newRate });
    saveSettings(audioState);
    console.log('🎵 Speech rate set to:', newRate);
};

const setPitch = (pitch, audioState) => {
    const config = audioState.getConfig();
    const newPitch = Math.max(0.5, Math.min(2.0, pitch));
    audioState.setConfig({ ...config, pitch: newPitch });
    saveSettings(audioState);
    console.log('🎵 Speech pitch set to:', newPitch);
};

const setVolume = (volume, audioState) => {
    const config = audioState.getConfig();
    const newVolume = Math.max(0.0, Math.min(1.0, volume));
    audioState.setConfig({ ...config, volume: newVolume });
    saveSettings(audioState);
    console.log('🎵 Volume set to:', newVolume);
};

const setVoice = (voice, audioState) => {
    const voices = audioState.getVoices();

    if (typeof voice === 'string') {
        const foundVoice = voices.find(v => v.name === voice);
        if (foundVoice) {
            audioState.setSelectedVoice(foundVoice);
            saveSettings(audioState);
            console.log('🎵 Voice set to:', foundVoice.name);
        }
    } else if (voice && voice.name) {
        audioState.setSelectedVoice(voice);
        saveSettings(audioState);
        console.log('🎵 Voice set to:', voice.name);
    }
};

const testAudio = (audioState) => {
    if (!checkAudioSupport()) {
        console.warn('🔇 Audio not supported');
        return;
    }

    speak('Hello! This is the Kids Keyboard audio system.', audioState);
    console.log('🎵 Playing audio test');
};

/**
 * Get system status
 */
const getStatus = (audioState) => {
    const config = audioState.getConfig();
    const voices = audioState.getVoices();
    const selectedVoice = audioState.getSelectedVoice();

    return {
        supported: checkAudioSupport(),
        initialized: audioState.isInitialized(),
        enabled: config.enabled,
        voicesAvailable: voices.length,
        selectedVoice: selectedVoice?.name || 'None'
    };
};

/**
 * Main factory function to create audio system
 * Returns an object with all audio functions bound to the internal state
 */
const createKidsKeyboardAudio = async (options = {}) => {
    // Create audio state
    const audioState = createAudioState(options);

    // Load saved settings
    const savedSettings = loadSettings(audioState);
    if (savedSettings) {
        const config = audioState.getConfig();
        audioState.setConfig({
            ...config,
            enabled: savedSettings.enabled ?? config.enabled,
            rate: savedSettings.rate ?? config.rate,
            pitch: savedSettings.pitch ?? config.pitch,
            volume: savedSettings.volume ?? config.volume
        });
    }

    // Initialize voices
    await initializeVoices(audioState);

    // Set saved voice if available
    if (savedSettings?.voiceName) {
        setVoice(savedSettings.voiceName, audioState);
    }

    // Return public API
    return {
        // Core audio functions
        playKeySound: (key) => playKeySound(key, audioState),
        playPhysicalKeySound: (key) => playPhysicalKeySound(key, audioState),
        playVirtualKeySound: (key) => playVirtualKeySound(key, audioState),

        // Detailed functions
        playLetterSound: (letter) => playLetterSound(letter, audioState),
        playLetterSoundSimple: (letter) => playLetterSoundSimple(letter, audioState),
        playLetterSoundDetailed: (letter) => playLetterSoundDetailed(letter, audioState),
        playNumberSound: (number) => playNumberSound(number, audioState),
        playNumberSoundSimple: (number) => playNumberSoundSimple(number, audioState),
        playNumberSoundDetailed: (number) => playNumberSoundDetailed(number, audioState),
        playFunctionKeySound: (key) => playFunctionKeySound(key, audioState),

        // Core speech
        speak: (text) => speak(text, audioState),
        test: () => testAudio(audioState),

        // Control functions
        toggle: () => toggleAudio(audioState),
        enable: () => enableAudio(audioState),
        disable: () => disableAudio(audioState),

        // Settings functions
        setRate: (rate) => setRate(rate, audioState),
        setPitch: (pitch) => setPitch(pitch, audioState),
        setVolume: (volume) => setVolume(volume, audioState),
        setVoice: (voice) => setVoice(voice, audioState),

        // Getters
        getConfig: () => audioState.getConfig(),
        getVoices: () => audioState.getVoices(),
        getSelectedVoice: () => audioState.getSelectedVoice(),
        getStatus: () => getStatus(audioState),

        // Utility
        isSupported: () => checkAudioSupport(),
        isInitialized: () => audioState.isInitialized()
    };
};

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
    // CommonJS
    module.exports = { createKidsKeyboardAudio };
} else if (typeof window !== 'undefined') {
    // Browser global
    window.createKidsKeyboardAudio = createKidsKeyboardAudio;
}