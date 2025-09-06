/**
 * Main application entry point
 * Initializes the Quiz App when DOM is ready
 */

// Global app instance
let quizApp = null;

/**
 * Initialize the application
 */
function initializeApp() {
    try {
        // Create quiz app instance
        quizApp = new QuizApp(document.body, {
            autoSave: true,
            showProgress: true,
            confirmReset: true,
            animationDuration: 300,
            debugMode: false // Set to true for development
        });

        console.log('Quiz App initialized successfully');
        
        // Add CSS for animations and additional styles
        addDynamicStyles();
        
        // Add accessibility improvements
        enhanceAccessibility();
        
    } catch (error) {
        console.error('Failed to initialize Quiz App:', error);
        showFallbackError();
    }
}

/**
 * Add dynamic CSS styles for enhanced UI
 */
function addDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Animation keyframes */
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes bounceIn {
            0% {
                transform: scale(0.3);
                opacity: 0;
            }
            50% {
                transform: scale(1.05);
            }
            70% {
                transform: scale(0.9);
            }
            100% {
                transform: scale(1);
                opacity: 1;
            }
        }
        
        /* Enhanced button styles */
        .btn.pulse {
            animation: pulse 2s infinite;
        }
        
        .question-card {
            animation: fadeIn 0.5s ease;
        }
        
        .result-screen {
            animation: bounceIn 0.6s ease;
        }
        
        /* Loading spinner */
        .loading-spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Error message styles */
        .error-container {
            background: white;
            border-radius: 10px;
            padding: 30px;
            margin: 20px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-left: 4px solid #e74c3c;
        }
        
        .error-title {
            color: #e74c3c;
            font-size: 1.5rem;
            margin-bottom: 10px;
            font-weight: 600;
        }
        
        .error-message {
            color: #666;
            margin-bottom: 20px;
        }
        
        .error-actions button {
            background: #e74c3c;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: 600;
        }
        
        .error-actions button:hover {
            background: #c0392b;
        }
        
        /* Keyboard navigation indicators */
        .keyboard-help {
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            font-size: 0.8rem;
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: 1000;
        }
        
        .keyboard-help.show {
            opacity: 1;
        }
        
        /* Print styles */
        @media print {
            .quiz-controls,
            .progress-container,
            .keyboard-help {
                display: none !important;
            }
            
            .question-card {
                break-inside: avoid;
                margin-bottom: 20px;
                border: 1px solid #ddd;
            }
            
            .result-screen {
                text-align: center;
                padding: 20px;
            }
        }
        
        /* High contrast mode improvements */
        @media (prefers-contrast: high) {
            .question-card {
                border: 2px solid #000;
                background: #fff;
            }
            
            .option {
                border: 1px solid #000;
            }
            
            .option.selected {
                background: #000;
                color: #fff;
            }
        }
        
        /* Reduced motion preferences */
        @media (prefers-reduced-motion: reduce) {
            * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }
    `;
    
    document.head.appendChild(style);
}

/**
 * Enhance accessibility features
 */
function enhanceAccessibility() {
    // Add skip link
    const skipLink = document.createElement('a');
    skipLink.href = '#questions-container';
    skipLink.textContent = 'Skip to questions';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: #000;
        color: #fff;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 1000;
    `;
    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '6px';
    });
    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add ARIA labels and descriptions
    const quizHeader = document.querySelector('.quiz-header');
    if (quizHeader) {
        quizHeader.setAttribute('role', 'banner');
        quizHeader.setAttribute('aria-label', 'Quiz header with title and controls');
    }
    
    const questionsContainer = document.getElementById('questions-container');
    if (questionsContainer) {
        questionsContainer.setAttribute('role', 'main');
        questionsContainer.setAttribute('aria-label', 'Quiz questions');
    }
    
    // Add keyboard help
    addKeyboardHelp();
    
    // Announce progress changes
    addProgressAnnouncements();
}

/**
 * Add keyboard help dialog
 */
function addKeyboardHelp() {
    const helpDiv = document.createElement('div');
    helpDiv.className = 'keyboard-help';
    helpDiv.innerHTML = `
        <strong>Keyboard Shortcuts:</strong><br>
        Ctrl+Enter: Submit Quiz<br>
        Ctrl+R: Reset Quiz<br>
        Esc: Return to Quiz
    `;
    
    document.body.appendChild(helpDiv);
    
    // Show help on focus
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F1' || (e.ctrlKey && e.key === '?')) {
            e.preventDefault();
            helpDiv.classList.toggle('show');
        }
    });
    
    // Hide help when clicking outside
    document.addEventListener('click', (e) => {
        if (!helpDiv.contains(e.target)) {
            helpDiv.classList.remove('show');
        }
    });
}

/**
 * Add progress announcements for screen readers
 */
function addProgressAnnouncements() {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
    `;
    document.body.appendChild(announcer);
    
    // Store reference for quiz app to use
    window.accessibilityAnnouncer = announcer;
}


/**
 * Handle application errors globally
 */
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    
    // Show user-friendly error message
    if (quizApp) {
        quizApp._showError('An unexpected error occurred. Please try refreshing the page.');
    }
});

/**
 * Handle unhandled promise rejections
 */
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Prevent default browser behavior
    event.preventDefault();
    
    // Show user-friendly error message
    if (quizApp) {
        quizApp._showError('An error occurred while processing your request.');
    }
});

/**
 * Clean up when page unloads
 */
window.addEventListener('beforeunload', () => {
    if (quizApp) {
        quizApp.destroy();
    }
});

/**
 * Initialize when DOM is ready
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM is already ready
    initializeApp();
}

