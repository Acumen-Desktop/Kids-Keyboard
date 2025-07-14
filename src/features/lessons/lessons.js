/**
 * Kids Keyboard - Lessons Feature
 * 
 * This module provides simple word-building lessons for children.
 * 
 * @version 0.1.0
 * @author James Swansburg
 * @license MIT
 */

// =============================================================================
// DATA
// =============================================================================

const wordList = [
    'cat', 'dog', 'sun', 'hat', 'run', 'big', 'red', 'bed', 'bus', 'cup'
];

// =============================================================================
// STATE
// =============================================================================

let currentWord = '';
let typedWord = '';
let lessonActive = false;

// =============================================================================
// DOM ELEMENTS
// =============================================================================

let lessonContainer = null;
let wordDisplay = null;

// =============================================================================
// PUBLIC API
// =============================================================================

export function startLesson(container) {
    if (!container) {
        console.error('Lessons: Container is required.');
        return;
    }

    lessonActive = true;
    lessonContainer = container;
    lessonContainer.innerHTML = `<div id="word-display"></div>`;
    wordDisplay = document.getElementById('word-display');

    nextWord();
}

export function endLesson() {
    lessonActive = false;
    if (lessonContainer) {
        lessonContainer.innerHTML = '';
    }
}

export function isLessonActive() {
    return lessonActive;
}

export function handleKeyPress(key) {
    if (!lessonActive) return;

    if (key.length === 1 && typedWord.length < currentWord.length) {
        typedWord += key.toLowerCase();
        updateWordDisplay();

        if (typedWord === currentWord) {
            celebrate();
            setTimeout(nextWord, 1500);
        }
    } else if (key === 'Backspace') {
        typedWord = typedWord.slice(0, -1);
        updateWordDisplay();
    }
}

// =============================================================================
// PRIVATE FUNCTIONS
// =============================================================================

function nextWord() {
    typedWord = '';
    currentWord = wordList[Math.floor(Math.random() * wordList.length)];
    updateWordDisplay();
}

function updateWordDisplay() {
    if (!wordDisplay) return;

    wordDisplay.innerHTML = '';
    for (let i = 0; i < currentWord.length; i++) {
        const letterSpan = document.createElement('span');
        letterSpan.className = 'letter';
        if (i < typedWord.length) {
            letterSpan.textContent = typedWord[i];
            if (typedWord[i] === currentWord[i]) {
                letterSpan.classList.add('correct');
            } else {
                letterSpan.classList.add('incorrect');
            }
        } else {
            letterSpan.textContent = '_';
        }
        wordDisplay.appendChild(letterSpan);
    }
}

function celebrate() {
    if (!wordDisplay) return;

    wordDisplay.classList.add('celebrate');
    setTimeout(() => {
        wordDisplay.classList.remove('celebrate');
    }, 1000);
}