/**
 * Kids Keyboard - Letter Associations Feature
 * 
 * This module provides associations (e.g., A for Apple) for each letter of the alphabet
 * to make learning more engaging and memorable for young children.
 * 
 * @version 0.1.0
 * @author James Swansburg
 * @license MIT
 */

// =============================================================================
// ASSOCIATIONS DATA
// =============================================================================

const letterAssociations = {
    a: { name: 'Apple', emoji: '🍎' },
    b: { name: 'Bear', emoji: '🐻' },
    c: { name: 'Cat', emoji: '🐱' },
    d: { name: 'Dog', emoji: '🐶' },
    e: { name: 'Elephant', emoji: '🐘' },
    f: { name: 'Fish', emoji: '🐠' },
    g: { name: 'Goat', emoji: '🐐' },
    h: { name: 'Horse', emoji: '🐴' },
    i: { name: 'Iguana', emoji: '🦎' },
    j: { name: 'Jellyfish', emoji: ' jellyfish' },
    k: { name: 'Kangaroo', emoji: '🦘' },
    l: { name: 'Lion', emoji: '🦁' },
    m: { name: 'Monkey', emoji: '🐵' },
    n: { name: 'Nest', emoji: ' nests' },
    o: { name: 'Octopus', emoji: '🐙' },
    p: { name: 'Pig', emoji: '🐷' },
    q: { name: 'Queen', emoji: '👸' },
    r: { name: 'Rabbit', emoji: '🐰' },
    s: { name: 'Snake', emoji: '🐍' },
    t:. { name: 'Turtle', emoji: '🐢' },
    u: { name: 'Unicorn', emoji: '🦄' },
    v: { name: 'Volcano', emoji: '🌋' },
    w: { name: 'Whale', emoji: '🐳' },
    x: { name: 'X-ray', emoji: '🦴' },
    y: { name: 'Yak', emoji: '🐃' },
    z: { name: 'Zebra', emoji: '🦓' }
};

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Gets the association for a given letter.
 * @param {string} letter - The letter to look up (case-insensitive).
 * @returns {object|null} An object with name and emoji, or null if not found.
 */
export function getLetterAssociation(letter) {
    if (typeof letter !== 'string' || letter.length !== 1) {
        return null;
    }
    return letterAssociations[letter.toLowerCase()] || null;
}
