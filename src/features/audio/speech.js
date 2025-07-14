
// src/features/audio/speech.js

export function createSpeechSynthesizer(config = {}) {
    const state = {
        isSupported: 'speechSynthesis' in window,
        voices: [],
        ...config
    };

    function loadVoices() {
        state.voices = speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
    }

    if (state.isSupported) {
        loadVoices();
        speechSynthesis.onvoiceschanged = loadVoices;
    }

    function speak(text, { voiceName, rate = 1, pitch = 1 } = {}) {
        if (!state.isSupported || !text) return;

        const utterance = new SpeechSynthesisUtterance(text);
        if (voiceName) {
            const voice = state.voices.find(v => v.name === voiceName);
            if (voice) utterance.voice = voice;
        }
        utterance.rate = rate;
        utterance.pitch = pitch;

        speechSynthesis.speak(utterance);
    }

    return {
        get isSupported() { return state.isSupported; },
        getVoices: () => state.voices,
        speak
    };
}
