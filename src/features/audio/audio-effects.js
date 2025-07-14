
// src/features/audio/audio-effects.js

import { createSpeechSynthesizer } from './speech.js';

const PHONETIC_SOUNDS = {
    a: 'ah', b: 'buh', c: 'kuh', d: 'duh', e: 'eh',
    f: 'fuh', g: 'guh', h: 'huh', i: 'ih', j: 'juh',
    k: 'kuh', l: 'luh', m: 'muh', n: 'nuh', o: 'oh',
    p: 'puh', q: 'kwuh', r: 'ruh', s: 'suh', t: 'tuh',
    u: 'uh', v: 'vuh', w: 'wuh', x: 'ksuh', y: 'yuh', z: 'zuh'
};

export function createAudioEffects(config = {}) {
    const speech = createSpeechSynthesizer();

    function playLetterSound(key, options) {
        if (speech.isSupported) {
            speech.speak(key, options);
        }
    }

    function playPhoneticSound(key, options) {
        const sound = PHONETIC_SOUNDS[key.toLowerCase()];
        if (speech.isSupported && sound) {
            speech.speak(sound, options);
        }
    }

    function playWord(word, options) {
        if (speech.isSupported) {
            speech.speak(word, options);
        }
    }

    return {
        playLetterSound,
        playPhoneticSound,
        playWord
    };
}
