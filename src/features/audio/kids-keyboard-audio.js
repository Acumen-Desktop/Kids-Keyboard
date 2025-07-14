// src/features/audio/kids-keyboard-audio.js

import { createAudioEffects } from './audio-effects.js';

export function createKidsKeyboardAudio(config = {}) {
    const effects = createAudioEffects();

    function playKeySound(key) {
        const lowerKey = key.toLowerCase();
        if (lowerKey.length === 1 && lowerKey >= 'a' && lowerKey <= 'z') {
            effects.playLetterSound(lowerKey, config);
        } else {
            effects.playWord(lowerKey, config);
        }
    }

    return {
        playKeySound
    };
}