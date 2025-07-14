/**
 * Kids Keyboard - Audio System
 * 
 * Web Speech API integration for educational audio feedback.
 * Kid-friendly voice selection and pronunciation.
 * 
 * @version 1.0.0
 * @license MIT
 */

const DEFAULT_CONFIG = Object.freeze({
    enabled: true,
    rate: 0.8,        // Slower speech for kids (UI interactions)
    fastRate: 2.0,    // Fast speech for typing (physical keyboard)
    pitch: 1.1,       // Slightly higher pitch for friendliness
    volume: 0.8,
    voice: null,      // Auto-select kid-friendly voice
    language: 'en-US'
});

const PREFERRED_VOICES = Object.freeze([
    'Karen',          // macOS
    'Samantha',       // macOS  
    'Vicki',          // macOS
    'Susan',          // Windows
    'Microsoft Zira', // Windows
    'Google UK English Female', // Chrome
    'Google US English Female'  // Chrome
]);

let audioState = {
    synthesis: null,
    selectedVoice: null,
    config: { ...DEFAULT_CONFIG },
    isInitialized: false
};

export function initializeAudio(config = {}) {
    if (!('speechSynthesis' in window)) {
        console.warn('Web Speech API not supported');
        return false;
    }

    audioState.synthesis = window.speechSynthesis;
    audioState.config = { ...DEFAULT_CONFIG, ...config };
    
    loadVoices();
    
    if (audioState.synthesis.onvoiceschanged !== undefined) {
        audioState.synthesis.onvoiceschanged = loadVoices;
    }
    
    audioState.isInitialized = true;
    return true;
}

function loadVoices() {
    if (!audioState.synthesis) return;
    
    const voices = audioState.synthesis.getVoices();
    
    if (voices.length === 0) {
        setTimeout(loadVoices, 100);
        return;
    }
    
    let selectedVoice = null;
    
    for (const preferredName of PREFERRED_VOICES) {
        selectedVoice = voices.find(voice => 
            voice.name.includes(preferredName) && 
            voice.lang.startsWith('en')
        );
        if (selectedVoice) break;
    }
    
    if (!selectedVoice) {
        selectedVoice = voices.find(voice => 
            voice.lang.startsWith('en') && 
            voice.name.toLowerCase().includes('female')
        );
    }
    
    if (!selectedVoice) {
        selectedVoice = voices.find(voice => voice.lang.startsWith('en'));
    }
    
    audioState.selectedVoice = selectedVoice || voices[0];
}

export function speakText(text, options = {}) {
    if (!audioState.isInitialized || !audioState.config.enabled || !text) {
        return Promise.resolve();
    }
    
    return new Promise((resolve, reject) => {
        try {
            // Cancel any pending speech and wait a moment for it to take effect
            audioState.synthesis.cancel();
            
            setTimeout(() => {
                try {
                    const utterance = new SpeechSynthesisUtterance(text);
                    const config = { ...audioState.config, ...options };
                    
                    utterance.voice = audioState.selectedVoice;
                    utterance.rate = config.rate;
                    utterance.pitch = config.pitch;
                    utterance.volume = config.volume;
                    utterance.lang = config.language;
                    
                    utterance.onend = () => resolve();
                    utterance.onerror = (error) => {
                        // Don't log or reject on interruption/canceled errors - they're expected
                        if (error.error === 'interrupted' || error.error === 'canceled') {
                            resolve();
                        } else {
                            console.warn('Speech synthesis error:', error);
                            reject(error);
                        }
                    };
                    
                    audioState.synthesis.speak(utterance);
                } catch (innerError) {
                    console.warn('Failed to speak text (inner):', innerError);
                    reject(innerError);
                }
            }, 10);
        } catch (error) {
            console.warn('Failed to speak text:', error);
            reject(error);
        }
    });
}

export function speakKeyInfo(keyInfo, fast = false) {
    if (!keyInfo) return Promise.resolve();
    
    if (fast) {
        // For fast typing, just speak the key itself
        return speakKeyFast(keyInfo.key || '');
    }
    
    // Simplified educational description for VK clicks
    if (keyInfo.category === 'letter' && keyInfo.name && keyInfo.key) {
        // Add the letter back for speech: "Y is for Yak" format
        const letter = keyInfo.key.toUpperCase();
        return speakText(`${letter} ${keyInfo.name}`);
    }
    
    // For other keys, speak the name
    return speakText(keyInfo.name || keyInfo.key || '');
}

export function speakKeyFast(key) {
    if (!key) return Promise.resolve();
    
    const lowerKey = key.toLowerCase();
    
    // Letters - just the letter name (A, B, C, etc.)
    if (/^[a-z]$/.test(lowerKey)) {
        return speakText(lowerKey, { rate: audioState.config.fastRate });
    }
    
    // Numbers - just the number name
    if (/^[0-9]$/.test(lowerKey)) {
        return speakNumber(lowerKey, true);
    }
    
    // Function keys - brief description at fast speed
    switch (key) {
        case 'Space':
            return speakText('space', { rate: audioState.config.fastRate });
        case 'Enter':
            return speakText('enter', { rate: audioState.config.fastRate });
        case 'Backspace':
            return speakText('delete', { rate: audioState.config.fastRate });
        case 'Tab':
            return speakText('tab', { rate: audioState.config.fastRate });
        default:
            // For other keys, just speak the key name quickly
            return speakText(key.toLowerCase(), { rate: audioState.config.fastRate });
    }
}

export function speakLetter(letter, fast = false) {
    const lowerLetter = letter.toLowerCase();
    
    if (!/^[a-z]$/.test(lowerLetter)) {
        return Promise.resolve();
    }
    
    if (fast) {
        // Just the letter sound at fast speed for typing
        const phonetic = getPhoneticSound(lowerLetter);
        return speakText(phonetic, { rate: audioState.config.fastRate });
    } else {
        // Full educational description at normal speed for UI clicks
        const phonetic = getPhoneticSound(lowerLetter);
        return speakText(`${letter.toUpperCase()} says ${phonetic}`);
    }
}

export function speakNumber(number, fast = false) {
    if (!/^[0-9]$/.test(number)) {
        return Promise.resolve();
    }
    
    const numberWords = {
        '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four',
        '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine'
    };
    
    if (fast) {
        // Just the number name at fast speed for typing
        return speakText(numberWords[number], { rate: audioState.config.fastRate });
    } else {
        // Full educational description at normal speed for UI clicks
        return speakText(`${number} is ${numberWords[number]}`);
    }
}

function getPhoneticSound(letter) {
    const phoneticMap = {
        'a': 'ah', 'b': 'buh', 'c': 'kuh', 'd': 'duh', 'e': 'eh',
        'f': 'fuh', 'g': 'guh', 'h': 'huh', 'i': 'ih', 'j': 'juh',
        'k': 'kuh', 'l': 'luh', 'm': 'muh', 'n': 'nuh', 'o': 'oh',
        'p': 'puh', 'q': 'kwuh', 'r': 'ruh', 's': 'suh', 't': 'tuh',
        'u': 'uh', 'v': 'vuh', 'w': 'wuh', 'x': 'ks', 'y': 'yuh', 'z': 'zuh'
    };
    
    return phoneticMap[letter] || letter;
}

export function setAudioEnabled(enabled) {
    audioState.config.enabled = Boolean(enabled);
    
    if (!enabled) {
        stopSpeaking();
    }
    
    saveAudioSettings();
}

export function isAudioEnabled() {
    return audioState.config.enabled;
}

export function setAudioConfig(newConfig) {
    audioState.config = { ...audioState.config, ...newConfig };
    saveAudioSettings();
}

export function getAudioConfig() {
    return { ...audioState.config };
}

export function getAvailableVoices() {
    if (!audioState.synthesis) return [];
    return audioState.synthesis.getVoices();
}

export function setVoice(voiceName) {
    const voices = getAvailableVoices();
    const voice = voices.find(v => v.name === voiceName);
    
    if (voice) {
        audioState.selectedVoice = voice;
        saveAudioSettings();
    }
}

export function stopSpeaking() {
    if (audioState.synthesis) {
        audioState.synthesis.cancel();
    }
}

function saveAudioSettings() {
    try {
        const settings = {
            enabled: audioState.config.enabled,
            rate: audioState.config.rate,
            pitch: audioState.config.pitch,
            volume: audioState.config.volume,
            voice: audioState.selectedVoice?.name || null
        };
        
        localStorage.setItem('kids-keyboard-audio', JSON.stringify(settings));
    } catch (error) {
        console.warn('Failed to save audio settings:', error);
    }
}

export function loadAudioSettings() {
    try {
        const saved = localStorage.getItem('kids-keyboard-audio');
        if (!saved) return;
        
        const settings = JSON.parse(saved);
        audioState.config = { ...audioState.config, ...settings };
        
        if (settings.voice) {
            const voices = getAvailableVoices();
            const voice = voices.find(v => v.name === settings.voice);
            if (voice) {
                audioState.selectedVoice = voice;
            }
        }
    } catch (error) {
        console.warn('Failed to load audio settings:', error);
    }
}

export function createAudioToggleButton(container) {
    const button = document.createElement('button');
    button.className = 'kids-keyboard__audio-toggle';
    button.setAttribute('aria-label', 'Toggle audio');
    
    function updateButton() {
        button.textContent = audioState.config.enabled ? '🔊' : '🔇';
        button.title = audioState.config.enabled ? 'Turn off audio' : 'Turn on audio';
    }
    
    button.addEventListener('click', () => {
        setAudioEnabled(!audioState.config.enabled);
        updateButton();
    });
    
    updateButton();
    container.appendChild(button);
    
    return button;
}