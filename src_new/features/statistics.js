/**
 * Kids Keyboard - Statistics System
 * 
 * Usage tracking and metrics for educational progress.
 * Privacy-focused local storage only.
 * 
 * @version 1.0.0
 * @license MIT
 */

const STORAGE_KEY = 'kids-keyboard-stats';
const MAX_HISTORY_DAYS = 30;

let statsState = {
    session: createSessionStats(),
    historical: loadHistoricalStats(),
    isTracking: true
};

function createSessionStats() {
    return {
        startTime: Date.now(),
        keysPressed: 0,
        lettersTyped: 0,
        numbersTyped: 0,
        functionsUsed: 0,
        correctKeys: 0,
        mistakes: 0,
        timeSpent: 0,
        wordsCompleted: 0,
        lessonTime: 0,
        tutorModeTime: 0,
        lastActivity: Date.now()
    };
}

function loadHistoricalStats() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return createHistoricalStats();
        
        const data = JSON.parse(saved);
        cleanOldData(data);
        return data;
    } catch (error) {
        console.warn('Failed to load statistics:', error);
        return createHistoricalStats();
    }
}

function createHistoricalStats() {
    return {
        totalSessions: 0,
        totalKeysPressed: 0,
        totalTimeSpent: 0,
        averageAccuracy: 0,
        dailyStats: {},
        achievements: [],
        preferences: {
            trackingEnabled: true,
            shareProgress: false
        }
    };
}

function cleanOldData(data) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - MAX_HISTORY_DAYS);
    const cutoffKey = formatDateKey(cutoffDate);
    
    Object.keys(data.dailyStats || {}).forEach(dateKey => {
        if (dateKey < cutoffKey) {
            delete data.dailyStats[dateKey];
        }
    });
}

export function trackKeyPress(key, isCorrect = true) {
    if (!statsState.isTracking) return;
    
    statsState.session.keysPressed++;
    statsState.session.lastActivity = Date.now();
    
    if (isCorrect) {
        statsState.session.correctKeys++;
    } else {
        statsState.session.mistakes++;
    }
    
    if (/^[a-zA-Z]$/.test(key)) {
        statsState.session.lettersTyped++;
    } else if (/^[0-9]$/.test(key)) {
        statsState.session.numbersTyped++;
    } else if (['Backspace', 'Enter', 'Space', 'Tab'].includes(key)) {
        statsState.session.functionsUsed++;
    }
    
    checkAchievements();
}

export function trackLessonProgress(wordsCompleted, timeSpent) {
    if (!statsState.isTracking) return;
    
    statsState.session.wordsCompleted += wordsCompleted;
    statsState.session.lessonTime += timeSpent;
    statsState.session.lastActivity = Date.now();
}

export function trackTutorMode(isActive) {
    if (!statsState.isTracking) return;
    
    const now = Date.now();
    if (isActive) {
        statsState.tutorModeStart = now;
    } else if (statsState.tutorModeStart) {
        const timeSpent = now - statsState.tutorModeStart;
        statsState.session.tutorModeTime += timeSpent;
        delete statsState.tutorModeStart;
    }
}

export function getSessionStats() {
    updateSessionTime();
    return { ...statsState.session };
}

export function getHistoricalStats() {
    return { ...statsState.historical };
}

export function getTodayStats() {
    const today = formatDateKey(new Date());
    return statsState.historical.dailyStats[today] || createDayStats();
}

export function getWeeklyStats() {
    const weekStats = createSessionStats();
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = formatDateKey(date);
        const dayStats = statsState.historical.dailyStats[dateKey];
        
        if (dayStats) {
            weekStats.keysPressed += dayStats.keysPressed;
            weekStats.lettersTyped += dayStats.lettersTyped;
            weekStats.numbersTyped += dayStats.numbersTyped;
            weekStats.timeSpent += dayStats.timeSpent;
            weekStats.wordsCompleted += dayStats.wordsCompleted;
        }
    }
    
    return weekStats;
}

export function getAccuracy() {
    const session = statsState.session;
    const totalKeys = session.correctKeys + session.mistakes;
    
    if (totalKeys === 0) return 100;
    return Math.round((session.correctKeys / totalKeys) * 100);
}

export function getTypingSpeed() {
    const session = statsState.session;
    const timeMinutes = session.timeSpent / (1000 * 60);
    
    if (timeMinutes === 0) return 0;
    return Math.round(session.keysPressed / timeMinutes);
}

export function endSession() {
    if (!statsState.isTracking) return;
    
    updateSessionTime();
    saveSessionToHistory();
    statsState.session = createSessionStats();
    saveHistoricalStats();
}

function updateSessionTime() {
    const now = Date.now();
    statsState.session.timeSpent = now - statsState.session.startTime;
}

function saveSessionToHistory() {
    const today = formatDateKey(new Date());
    const todayStats = statsState.historical.dailyStats[today] || createDayStats();
    
    todayStats.sessions++;
    todayStats.keysPressed += statsState.session.keysPressed;
    todayStats.lettersTyped += statsState.session.lettersTyped;
    todayStats.numbersTyped += statsState.session.numbersTyped;
    todayStats.timeSpent += statsState.session.timeSpent;
    todayStats.wordsCompleted += statsState.session.wordsCompleted;
    
    const sessionAccuracy = getAccuracy();
    todayStats.accuracy = Math.round(
        (todayStats.accuracy * (todayStats.sessions - 1) + sessionAccuracy) / todayStats.sessions
    );
    
    statsState.historical.dailyStats[today] = todayStats;
    statsState.historical.totalSessions++;
    statsState.historical.totalKeysPressed += statsState.session.keysPressed;
    statsState.historical.totalTimeSpent += statsState.session.timeSpent;
    
    const totalSessions = statsState.historical.totalSessions;
    statsState.historical.averageAccuracy = Math.round(
        (statsState.historical.averageAccuracy * (totalSessions - 1) + sessionAccuracy) / totalSessions
    );
}

function createDayStats() {
    return {
        sessions: 0,
        keysPressed: 0,
        lettersTyped: 0,
        numbersTyped: 0,
        timeSpent: 0,
        wordsCompleted: 0,
        accuracy: 100
    };
}

function formatDateKey(date) {
    return date.toISOString().split('T')[0];
}

function saveHistoricalStats() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(statsState.historical));
    } catch (error) {
        console.warn('Failed to save statistics:', error);
    }
}

function checkAchievements() {
    const achievements = [];
    const session = statsState.session;
    
    if (session.keysPressed === 10 && !hasAchievement('first_10_keys')) {
        achievements.push('first_10_keys');
    }
    
    if (session.keysPressed >= 100 && !hasAchievement('century_typist')) {
        achievements.push('century_typist');
    }
    
    if (getAccuracy() === 100 && session.keysPressed >= 20 && !hasAchievement('perfect_accuracy')) {
        achievements.push('perfect_accuracy');
    }
    
    if (session.wordsCompleted >= 5 && !hasAchievement('word_builder')) {
        achievements.push('word_builder');
    }
    
    achievements.forEach(addAchievement);
}

function hasAchievement(achievementId) {
    return statsState.historical.achievements.includes(achievementId);
}

function addAchievement(achievementId) {
    if (!hasAchievement(achievementId)) {
        statsState.historical.achievements.push(achievementId);
        saveHistoricalStats();
    }
}

export function getAchievements() {
    const achievementData = {
        'first_10_keys': { name: 'First Steps', description: 'Typed your first 10 keys!' },
        'century_typist': { name: 'Century Typist', description: 'Typed 100 keys in one session!' },
        'perfect_accuracy': { name: 'Perfect Aim', description: 'Perfect accuracy with 20+ keys!' },
        'word_builder': { name: 'Word Builder', description: 'Completed 5 words in a lesson!' }
    };
    
    return statsState.historical.achievements.map(id => ({
        id,
        ...achievementData[id]
    }));
}

export function exportStats() {
    return {
        session: getSessionStats(),
        historical: getHistoricalStats(),
        exportDate: new Date().toISOString()
    };
}

export function resetStats() {
    statsState.historical = createHistoricalStats();
    statsState.session = createSessionStats();
    
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.warn('Failed to clear statistics:', error);
    }
}

export function setTrackingEnabled(enabled) {
    statsState.isTracking = Boolean(enabled);
    statsState.historical.preferences.trackingEnabled = statsState.isTracking;
    saveHistoricalStats();
}

export function isTrackingEnabled() {
    return statsState.isTracking;
}