/**
 * Kids Keyboard - Lessons System
 * 
 * Word-building lessons for progressive typing education.
 * Functional approach with immutable state management.
 * 
 * @version 1.0.0
 * @license MIT
 */

import { showCelebration, showMessage } from './visual-display.js';
import { speakText } from './audio-system.js';

const WORD_LISTS = Object.freeze({
    beginner: [
        'cat', 'dog', 'sun', 'hat', 'run', 'big', 'red', 'bed', 'bus', 'cup'
    ],
    intermediate: [
        'apple', 'happy', 'house', 'water', 'green', 'friend', 'magic', 'smile'
    ],
    advanced: [
        'rainbow', 'butterfly', 'adventure', 'wonderful', 'playground'
    ]
});

const LESSON_CONFIG = Object.freeze({
    containerClass: 'kids-keyboard-lesson',
    wordDisplayClass: 'lesson-word-display',
    letterClass: 'lesson-letter',
    correctClass: 'lesson-letter--correct',
    incorrectClass: 'lesson-letter--incorrect',
    currentClass: 'lesson-letter--current',
    celebrationDelay: 1500,
    encouragements: [
        'Great job!', 'Awesome!', 'Well done!', 'Perfect!', 
        'You\'re doing great!', 'Fantastic!', 'Keep it up!'
    ]
});

let lessonState = {
    isActive: false,
    currentWord: '',
    typedWord: '',
    wordIndex: 0,
    level: 'beginner',
    container: null,
    wordDisplay: null,
    correctWords: 0,
    totalAttempts: 0
};

export function startLesson(container, level = 'beginner') {
    if (!container) {
        console.error('Lessons: Container required');
        return false;
    }

    lessonState = {
        ...lessonState,
        isActive: true,
        container,
        level,
        wordIndex: 0,
        correctWords: 0,
        totalAttempts: 0
    };

    setupLessonUI();
    nextWord();
    
    speakText('Let\'s start typing! Type the word you see.');
    return true;
}

export function endLesson() {
    if (!lessonState.isActive) return;

    const accuracy = lessonState.totalAttempts > 0 
        ? Math.round((lessonState.correctWords / lessonState.totalAttempts) * 100)
        : 0;

    showMessage(`Lesson complete! You typed ${lessonState.correctWords} words correctly. Accuracy: ${accuracy}%`, 'success');
    speakText(`Great job! You completed the lesson with ${accuracy} percent accuracy.`);

    if (lessonState.container) {
        lessonState.container.innerHTML = '';
    }

    lessonState = {
        ...lessonState,
        isActive: false,
        currentWord: '',
        typedWord: '',
        container: null,
        wordDisplay: null
    };
}

export function isLessonActive() {
    return lessonState.isActive;
}

export function handleKeyPress(key) {
    if (!lessonState.isActive) return false;

    switch (key) {
        case 'Backspace':
            if (lessonState.typedWord.length > 0) {
                lessonState.typedWord = lessonState.typedWord.slice(0, -1);
                updateWordDisplay();
            }
            break;
            
        case 'Enter':
            if (lessonState.typedWord === lessonState.currentWord) {
                completeWord();
            } else {
                showIncorrectAttempt();
            }
            break;
            
        default:
            if (key.length === 1 && lessonState.typedWord.length < lessonState.currentWord.length) {
                lessonState.typedWord += key.toLowerCase();
                updateWordDisplay();
                
                if (lessonState.typedWord === lessonState.currentWord) {
                    setTimeout(completeWord, 500);
                }
            }
            break;
    }
    
    return true; // Indicates key was handled by lesson
}

function setupLessonUI() {
    if (!lessonState.container) return;

    lessonState.container.innerHTML = `
        <div class="${LESSON_CONFIG.containerClass}">
            <div class="lesson-header">
                <h3>Typing Lesson - ${capitalize(lessonState.level)}</h3>
                <div class="lesson-stats">
                    Words: ${lessonState.correctWords} | Level: ${lessonState.level}
                </div>
            </div>
            <div class="${LESSON_CONFIG.wordDisplayClass}" id="lesson-word-display"></div>
            <div class="lesson-instructions">
                Type the word above. Press Enter when done, or Backspace to fix mistakes.
            </div>
        </div>
    `;

    lessonState.wordDisplay = document.getElementById('lesson-word-display');
    injectLessonStyles();
}

function nextWord() {
    const wordList = WORD_LISTS[lessonState.level] || WORD_LISTS.beginner;
    
    lessonState.currentWord = wordList[lessonState.wordIndex % wordList.length];
    lessonState.typedWord = '';
    lessonState.wordIndex++;
    
    updateWordDisplay();
    speakText(`Type the word: ${lessonState.currentWord}`);
}

function updateWordDisplay() {
    if (!lessonState.wordDisplay) return;

    lessonState.wordDisplay.innerHTML = '';
    
    for (let i = 0; i < lessonState.currentWord.length; i++) {
        const letterSpan = document.createElement('span');
        letterSpan.className = LESSON_CONFIG.letterClass;
        
        const currentLetter = lessonState.currentWord[i];
        const typedLetter = lessonState.typedWord[i];
        
        if (i < lessonState.typedWord.length) {
            letterSpan.textContent = typedLetter;
            
            if (typedLetter === currentLetter) {
                letterSpan.classList.add(LESSON_CONFIG.correctClass);
            } else {
                letterSpan.classList.add(LESSON_CONFIG.incorrectClass);
            }
        } else {
            letterSpan.textContent = currentLetter;
            
            if (i === lessonState.typedWord.length) {
                letterSpan.classList.add(LESSON_CONFIG.currentClass);
            }
        }
        
        lessonState.wordDisplay.appendChild(letterSpan);
    }
}

function completeWord() {
    lessonState.correctWords++;
    lessonState.totalAttempts++;
    
    const encouragement = LESSON_CONFIG.encouragements[
        Math.floor(Math.random() * LESSON_CONFIG.encouragements.length)
    ];
    
    showCelebration(`🎉 ${encouragement} 🎉`);
    speakText(encouragement);
    
    updateStats();
    
    setTimeout(() => {
        if (lessonState.correctWords % 5 === 0) {
            showLevelProgress();
        } else {
            nextWord();
        }
    }, LESSON_CONFIG.celebrationDelay);
}

function showIncorrectAttempt() {
    lessonState.totalAttempts++;
    
    showMessage('Try again! Check your spelling.', 'error');
    speakText('Oops! Try again.');
    
    lessonState.typedWord = '';
    updateWordDisplay();
    updateStats();
}

function updateStats() {
    const statsElement = lessonState.container?.querySelector('.lesson-stats');
    if (statsElement) {
        const accuracy = lessonState.totalAttempts > 0 
            ? Math.round((lessonState.correctWords / lessonState.totalAttempts) * 100)
            : 100;
        
        statsElement.textContent = 
            `Words: ${lessonState.correctWords} | Accuracy: ${accuracy}% | Level: ${lessonState.level}`;
    }
}

function showLevelProgress() {
    showMessage(
        `Awesome! You've typed ${lessonState.correctWords} words! Keep going!`,
        'success'
    );
    
    speakText(`You're doing great! You've typed ${lessonState.correctWords} words correctly.`);
    
    setTimeout(nextWord, 2000);
}

export function setLessonLevel(level) {
    if (WORD_LISTS[level]) {
        lessonState.level = level;
        lessonState.wordIndex = 0;
        
        if (lessonState.isActive) {
            nextWord();
        }
    }
}

export function getLessonStats() {
    return {
        correctWords: lessonState.correctWords,
        totalAttempts: lessonState.totalAttempts,
        accuracy: lessonState.totalAttempts > 0 
            ? Math.round((lessonState.correctWords / lessonState.totalAttempts) * 100)
            : 0,
        level: lessonState.level,
        currentWord: lessonState.currentWord,
        isActive: lessonState.isActive
    };
}

export function getAvailableLevels() {
    return Object.keys(WORD_LISTS);
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function injectLessonStyles() {
    const styleId = 'kids-keyboard-lesson-styles';
    if (document.getElementById(styleId)) return;

    const styles = `
        .kids-keyboard-lesson {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 20px;
            margin: 10px 0;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            text-align: center;
            font-family: Arial, sans-serif;
        }

        .lesson-header h3 {
            margin: 0 0 10px 0;
            color: #333;
            font-size: 24px;
        }

        .lesson-stats {
            color: #666;
            font-size: 14px;
            margin-bottom: 20px;
        }

        .lesson-word-display {
            font-size: 48px;
            font-weight: bold;
            margin: 30px 0;
            font-family: 'Courier New', monospace;
            letter-spacing: 4px;
            min-height: 60px;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-wrap: wrap;
            gap: 2px;
        }

        .lesson-letter {
            display: inline-block;
            padding: 8px 12px;
            border-radius: 8px;
            background: #fff;
            border: 2px solid #ddd;
            min-width: 20px;
            text-align: center;
            transition: all 0.3s ease;
        }

        .lesson-letter--correct {
            background-color: #c8e6c9;
            border-color: #4caf50;
            color: #2e7d32;
        }

        .lesson-letter--incorrect {
            background-color: #ffcdd2;
            border-color: #f44336;
            color: #c62828;
            animation: shake 0.5s ease-in-out;
        }

        .lesson-letter--current {
            background-color: #fff3e0;
            border-color: #ff9800;
            animation: pulse 1s ease-in-out infinite;
        }

        .lesson-instructions {
            color: #666;
            font-size: 16px;
            margin-top: 20px;
            font-style: italic;
        }

        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .lesson-word-display {
                font-size: 36px;
                letter-spacing: 2px;
            }

            .lesson-letter {
                padding: 6px 8px;
                min-width: 15px;
            }

            .lesson-header h3 {
                font-size: 20px;
            }
        }
    `;

    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
}