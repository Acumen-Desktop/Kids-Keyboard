/**
 * Kids Keyboard - Letter Associations
 * 
 * Educational letter-to-animal/object associations for memory aids.
 * Pure data and functions for enhanced learning.
 * 
 * @version 1.0.0
 * @license MIT
 */

const LETTER_ASSOCIATIONS = Object.freeze({
    a: { name: 'Apple', emoji: '🍎' },
    b: { name: 'Bear', emoji: '🐻' },
    c: { name: 'Cat', emoji: '🐱' },
    d: { name: 'Dog', emoji: '🐶' },
    e: { name: 'Elephant', emoji: '🐘' },
    f: { name: 'Fish', emoji: '🐠' },
    g: { name: 'Goat', emoji: '🐐' },
    h: { name: 'Horse', emoji: '🐴' },
    i: { name: 'Iguana', emoji: '🦎' },
    j: { name: 'Jellyfish', emoji: '🪼' },
    k: { name: 'Kangaroo', emoji: '🦘' },
    l: { name: 'Lion', emoji: '🦁' },
    m: { name: 'Monkey', emoji: '🐵' },
    n: { name: 'Nest', emoji: '🪺' },
    o: { name: 'Octopus', emoji: '🐙' },
    p: { name: 'Pig', emoji: '🐷' },
    q: { name: 'Queen', emoji: '👸' },
    r: { name: 'Rabbit', emoji: '🐰' },
    s: { name: 'Snake', emoji: '🐍' },
    t: { name: 'Turtle', emoji: '🐢' },
    u: { name: 'Unicorn', emoji: '🦄' },
    v: { name: 'Volcano', emoji: '🌋' },
    w: { name: 'Whale', emoji: '🐳' },
    x: { name: 'X-ray', emoji: '🦴' },
    y: { name: 'Yak', emoji: '🐃' },
    z: { name: 'Zebra', emoji: '🦓' }
});

export function getLetterAssociation(letter) {
    if (typeof letter !== 'string' || letter.length !== 1) {
        return null;
    }
    return LETTER_ASSOCIATIONS[letter.toLowerCase()] || null;
}

export function getAllAssociations() {
    return { ...LETTER_ASSOCIATIONS };
}

export function getKeyInfo(key) {
    const upperKey = key.toUpperCase();
    const association = getLetterAssociation(key);

    if (association) {
        return {
            key,
            name: `is for ${association.name}`,
            sound: `says '${key.toLowerCase()}'`,
            emoji: association.emoji,
            category: 'letter'
        };
    }

    if (key.match(/^[0-9]$/)) {
        return {
            key,
            name: `Number ${key}`,
            sound: `is ${key}`,
            category: 'number'
        };
    }

    switch (key) {
        case 'Space':
            return { 
                key,
                name: 'Space Bar', 
                sound: 'makes a space',
                category: 'function'
            };
        case 'Enter':
            return { 
                key,
                name: 'Enter Key', 
                sound: 'starts a new line',
                category: 'function'
            };
        case 'Backspace':
            return { 
                key,
                name: 'Backspace Key', 
                sound: 'erases text',
                category: 'function'
            };
        case 'Tab':
            return { 
                key,
                name: 'Tab Key', 
                sound: 'makes a big space',
                category: 'function'
            };
        case 'CapsLock':
            return { 
                key,
                name: 'Caps Lock', 
                sound: 'makes BIG letters',
                category: 'modifier'
            };
        case 'ShiftLeft':
        case 'ShiftRight':
            return { 
                key,
                name: 'Shift Key', 
                sound: 'changes letters',
                category: 'modifier'
            };
        default:
            return { 
                key,
                name: key, 
                sound: '',
                category: 'symbol'
            };
    }
}

export function isVowel(letter) {
    if (typeof letter !== 'string' || letter.length !== 1) {
        return false;
    }
    return 'aeiouAEIOU'.includes(letter);
}

export function isConsonant(letter) {
    if (typeof letter !== 'string' || letter.length !== 1) {
        return false;
    }
    const lower = letter.toLowerCase();
    return lower >= 'a' && lower <= 'z' && !isVowel(letter);
}