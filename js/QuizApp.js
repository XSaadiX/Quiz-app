/**
 * QuizApp class - Main application controller
 * Manages UI interactions and coordinates between Quiz logic and user interface
 * Demonstrates proper separation of concerns and event-driven architecture
 */
class QuizApp {
    /**
     * Constructor for QuizApp

     */
    constructor(container = document.body, options = {}) {
        // Initialize properties
        this._container = container;
        this._quiz = null;
        this._currentResult = null;
        this._eventListeners = new Map(); // Track event listeners for cleanup
        
        // Configuration options
        this._config = {
            autoSave: options.autoSave !== false,
            showProgress: options.showProgress !== false,
            confirmReset: options.confirmReset !== false,
            animationDuration: options.animationDuration || 300,
            debugMode: options.debugMode || false
        };
        
        // DOM element references
        this._elements = {
            quizScreen: null,
            resultScreen: null,
            questionsContainer: null,
            progressBar: null,
            submitButtons: [],
            resetButton: null,
            retakeButton: null
        };
        
        // Initialize the application
        this._initialize();
    }

    /**
     * Private method to initialize the application
     * @private
     */
    _initialize() {
        try {
            this._cacheDOM();
            this._bindEvents();
            this._initializeQuiz();
            this._loadQuizState();
            this._render();
            
            if (this._config.debugMode) {
                console.log('QuizApp initialized successfully');
            }
        } catch (error) {
            console.error('Failed to initialize QuizApp:', error);
            this._showError('Failed to initialize quiz application');
        }
    }

    /**
     * Private method to cache DOM elements
     * @private
     */
    _cacheDOM() {
        this._elements.quizScreen = document.getElementById('quiz-screen');
        this._elements.resultScreen = document.getElementById('result-screen');
        this._elements.questionsContainer = document.getElementById('questions-container');
        this._elements.progressBar = document.getElementById('progress-fill');
        this._elements.answeredCount = document.getElementById('answered-count');
        this._elements.totalCount = document.getElementById('total-count');
        
        // Cache buttons
        this._elements.submitButtons = [
            document.getElementById('submit-btn'),
            document.getElementById('submit-btn-bottom')
        ].filter(btn => btn !== null);
        
        this._elements.resetButton = document.getElementById('reset-btn');
        this._elements.retakeButton = document.getElementById('retake-btn');
        
        // Result screen elements
        this._elements.resultIcon = document.getElementById('result-icon');
        this._elements.resultTitle = document.getElementById('result-title');
        this._elements.scoreDisplay = document.getElementById('score-display');
        this._elements.totalDisplay = document.getElementById('total-display');
        this._elements.percentageDisplay = document.getElementById('result-percentage');
    }

    /**
     * Private method to bind event listeners
     * @private
     */
    _bindEvents() {
        // Reset button
        if (this._elements.resetButton) {
            this._addEventListener(this._elements.resetButton, 'click', () => this._handleReset());
        }
        
        // Submit buttons
        this._elements.submitButtons.forEach(button => {
            this._addEventListener(button, 'click', () => this._handleSubmit());
        });
        
        // Retake button
        if (this._elements.retakeButton) {
            this._addEventListener(this._elements.retakeButton, 'click', () => this._handleRetake());
        }
        
        // Keyboard shortcuts
        this._addEventListener(document, 'keydown', (e) => this._handleKeyboard(e));
        
        // Window beforeunload for unsaved changes
        this._addEventListener(window, 'beforeunload', (e) => this._handleBeforeUnload(e));
        
        // Visibility change for auto-save
        this._addEventListener(document, 'visibilitychange', () => this._handleVisibilityChange());
    }

    /**
     * Private method to add event listener and track it
 
    
     */
    _addEventListener(element, event, handler) {
        element.addEventListener(event, handler);
        
        // Track for cleanup
        if (!this._eventListeners.has(element)) {
            this._eventListeners.set(element, []);
        }
        this._eventListeners.get(element).push({ event, handler });
    }

    /**
     * Private method to initialize quiz with questions
     * @private
     */
    _initializeQuiz() {
        const questions = this._createQuestions();
        this._quiz = new Quiz(questions, {
            passThreshold: 0.7,
            saveProgress: this._config.autoSave,
            showCorrectAnswers: true
        });
    }

    /**
     * Private method to create quiz questions
     * @returns {Question[]} Array of question instances
     * @private
     */
    _createQuestions() {
        // Use the external questions data
        if (typeof QuizQuestions !== 'undefined') {
            return QuizQuestions.createQuestionInstances();
        } else {
            // Fallback questions if questionsData.js is not loaded
            console.warn('QuizQuestions not found, using fallback questions');
            return this._createFallbackQuestions();
        }
    }

    /**
     * Fallback method to create questions if external data is not available
     * @returns {Question[]} Array of question instances
     * @private
     */
    _createFallbackQuestions() {
        return [
            new MultipleChoiceQuestion(1, "What is the capital of France?", 
                ["London", "Berlin", "Paris", "Madrid"], "Paris"),
            
            new TrueFalseQuestion(2, "JavaScript is a compiled language.", "False"),
            
            new MultipleChoiceQuestion(3, "Which method is used to add an element to the end of an array?", 
                ["push()", "pop()", "shift()", "unshift()"], "push()"),
            
            new TrueFalseQuestion(4, "CSS stands for Cascading Style Sheets.", "True"),
            
            new MultipleChoiceQuestion(5, "What does HTML stand for?", 
                ["Hypertext Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlink and Text Markup Language"], 
                "Hypertext Markup Language"),
            
            new TrueFalseQuestion(6, "React is a JavaScript library for building user interfaces.", "True"),
            
            new MultipleChoiceQuestion(7, "Which of the following is NOT a JavaScript data type?", 
                ["String", "Boolean", "Float", "Number"], "Float"),
            
            new MultipleChoiceQuestion(8, "What is the correct way to create a function in JavaScript?", 
                ["function myFunction() {}", "create myFunction() {}", "def myFunction() {}", "func myFunction() {}"], 
                "function myFunction() {}"),
            
            new TrueFalseQuestion(9, "The '===' operator in JavaScript checks for both value and type equality.", "True"),
            
            new MultipleChoiceQuestion(10, "Which HTTP status code indicates a successful response?", 
                ["404", "500", "200", "301"], "200"),
            
            new TrueFalseQuestion(11, "JSON stands for JavaScript Object Notation.", "True"),
            
            new MultipleChoiceQuestion(12, "Which method is used to convert a JSON string to a JavaScript object?", 
                ["JSON.stringify()", "JSON.parse()", "JSON.convert()", "JSON.object()"], "JSON.parse()")
        ];
    }

    /**
     * Private method to load quiz state from storage
     * @private
     */
    _loadQuizState() {
        if (this._quiz && this._config.autoSave) {
            this._quiz.loadFromStorage();
        }
    }

    /**
     * Main render method to display the quiz
     */
    _render() {
        if (!this._quiz) {
            this._showError('Quiz not initialized');
            return;
        }

        this._renderQuestions();
        this._updateProgress();
        this._updateSubmitButtonState();
    }

    /**
     * Private method to render all questions
        * @private
     */
    _renderQuestions() {
        if (!this._elements.questionsContainer) return;

        // Clear existing content
        this._elements.questionsContainer.innerHTML = '';

        // Render each question
        this._quiz.questions.forEach(question => {
            try {
                const questionElement = question.render((questionId, answer) => {
                    this._handleAnswerChange(questionId, answer);
                });
                
                // Add animation class
                questionElement.style.opacity = '0';
                questionElement.style.transform = 'translateY(20px)';
                
                this._elements.questionsContainer.appendChild(questionElement);
                
                // Animate in
                setTimeout(() => {
                    questionElement.style.transition = `all ${this._config.animationDuration}ms ease`;
                    questionElement.style.opacity = '1';
                    questionElement.style.transform = 'translateY(0)';
                }, 50);
                
            } catch (error) {
                console.error('Error rendering question:', error);
            }
        });

        // Update total count
        if (this._elements.totalCount) {
            this._elements.totalCount.textContent = this._quiz.totalQuestions;
        }
    }

    /**
     * Private method to handle answer changes

     * @private
     */
    _handleAnswerChange(questionId, answer) {
        try {
            const success = this._quiz.setAnswer(questionId, answer);
            
            if (success) {
                this._updateProgress();
                this._updateSubmitButtonState();
                
                // Add visual feedback
                this._addAnswerFeedback(questionId);
                
                if (this._config.debugMode) {
                    console.log(`Answer set for question ${questionId}: ${answer}`);
                }
            }
        } catch (error) {
            console.error('Error handling answer change:', error);
            this._showError('Failed to save your answer. Please try again.');
        }
    }

    /**
     * Private method to add visual feedback when answer is selected

     * @private
     */
    _addAnswerFeedback(questionId) {
        const questionCard = document.querySelector(`[data-question-id="${questionId}"]`);
        if (questionCard) {
            questionCard.style.borderLeft = '4px solid #27ae60';
            setTimeout(() => {
                questionCard.style.borderLeft = '4px solid #667eea';
            }, 1000);
        }
    }

    /**
     * Private method to update progress display
     * @private
     */
    _updateProgress() {
        if (!this._config.showProgress) return;

        const answeredCount = this._quiz.getAnsweredCount();
        const totalCount = this._quiz.totalQuestions;
        const percentage = this._quiz.getProgressPercentage();

        // Update progress bar
        if (this._elements.progressBar) {
            this._elements.progressBar.style.width = `${percentage}%`;
        }

        // Update counter
        if (this._elements.answeredCount) {
            this._elements.answeredCount.textContent = answeredCount;
        }

        // Add milestone feedback
        if (percentage === 25 || percentage === 50 || percentage === 75) {
            this._showProgressMilestone(percentage);
        }
    }

    /**
     * Private method to show progress milestone notification
     * @private
     */
    _showProgressMilestone(percentage) {
        const notification = document.createElement('div');
        notification.className = 'progress-milestone';
        notification.textContent = `${percentage}% Complete! Keep going!`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #27ae60;
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            z-index: 1000;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    /**
     * Private method to update submit button state
     * @private
     */
    _updateSubmitButtonState() {
        const allAnswered = this._quiz.areAllQuestionsAnswered();
        
        this._elements.submitButtons.forEach(button => {
            if (button) {
                button.disabled = !allAnswered;
                
                if (allAnswered) {
                    button.classList.add('pulse');
                } else {
                    button.classList.remove('pulse');
                }
            }
        });
    }

    /**
     * Private method to handle quiz reset
     * @private
     */
    _handleReset() {
        const shouldConfirm = this._config.confirmReset && this._quiz.getAnsweredCount() > 0;
        
        if (shouldConfirm) {
            const confirmed = confirm('Are you sure you want to reset all answers? This action cannot be undone.');
            if (!confirmed) return;
        }

        try {
            this._quiz.resetAllAnswers();
            this._currentResult = null;
            this._render();
            
            // Show success message
            this._showMessage('Quiz reset successfully!', 'success');
            
            if (this._config.debugMode) {
                console.log('Quiz reset completed');
            }
        } catch (error) {
            console.error('Error resetting quiz:', error);
            this._showError('Failed to reset quiz. Please try again.');
        }
    }

    /**
     * Private method to handle quiz submission
     * @private
     */
    _handleSubmit() {
        try {
            if (!this._quiz.areAllQuestionsAnswered()) {
                this._showError('Please answer all questions before submitting.');
                return;
            }

            const result = this._quiz.submitQuiz();
            this._currentResult = result;
            this._showResult(result);
            
            if (this._config.debugMode) {
                console.log('Quiz submitted:', result);
            }
        } catch (error) {
            console.error('Error submitting quiz:', error);
            this._showError('Failed to submit quiz. Please try again.');
        }
    }

    /**
     * Private method to handle retake action
     * @private
     */
    _handleRetake() {
        try {
            this._quiz.resetAllAnswers();
            this._currentResult = null;
            this._showQuizScreen();
            this._render();
            
            if (this._config.debugMode) {
                console.log('Quiz retake initiated');
            }
        } catch (error) {
            console.error('Error during retake:', error);
            this._showError('Failed to start new quiz. Please refresh the page.');
        }
    }

    /**
     * Private method to handle keyboard shortcuts
     * @private
     */
    _handleKeyboard(e) {
        // Only handle shortcuts when quiz screen is visible
        if (this._elements.resultScreen && !this._elements.resultScreen.classList.contains('hidden')) {
            return;
        }

        switch (e.key) {
            case 'Enter':
                if (e.ctrlKey && this._quiz.areAllQuestionsAnswered()) {
                    e.preventDefault();
                    this._handleSubmit();
                }
                break;
            case 'r':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this._handleReset();
                }
                break;
            case 'Escape':
                if (this._currentResult) {
                    this._handleRetake();
                }
                break;
        }
    }

    /**
     * Private method to handle before unload
     * @private
     */
    _handleBeforeUnload(e) {
        if (this._quiz && this._quiz.getAnsweredCount() > 0 && !this._quiz.isCompleted) {
            e.preventDefault();
            e.returnValue = 'You have unsaved progress. Are you sure you want to leave?';
            return e.returnValue;
        }
    }

    /**
     * Private method to handle visibility change
     * @private
     */
    _handleVisibilityChange() {
        if (document.hidden && this._config.autoSave && this._quiz) {
            // Auto-save when tab becomes hidden
            this._quiz._saveToStorage();
        }
    }

    /**
     * Private method to show quiz screen
     * @private
     */
    _showQuizScreen() {
        if (this._elements.quizScreen) {
            this._elements.quizScreen.classList.remove('hidden');
        }
        if (this._elements.resultScreen) {
            this._elements.resultScreen.classList.add('hidden');
        }
    }

    /**
     * Private method to show result screen
     * @param {object} result - Quiz result object
     * @private
     */
    _showResult(result) {
        this._showResultScreen();
        this._updateResultDisplay(result);
    }

    /**
     * Private method to show result screen
     * @private
     */
    _showResultScreen() {
        if (this._elements.quizScreen) {
            this._elements.quizScreen.classList.add('hidden');
        }
        if (this._elements.resultScreen) {
            this._elements.resultScreen.classList.remove('hidden');
        }
    }

    /**
     * Private method to update result display
     * @param {object} result - Quiz result object
     * @private
     */
    _updateResultDisplay(result) {
        if (!result) return;

        // Update icon and title
        if (this._elements.resultIcon && this._elements.resultTitle) {
            if (result.passed) {
                this._elements.resultIcon.textContent = '🎉';
                this._elements.resultTitle.textContent = 'Congratulations! You Passed!';
                this._elements.resultTitle.className = 'result-title pass';
            } else {
                this._elements.resultIcon.textContent = '😞';
                this._elements.resultTitle.textContent = 'Sorry, You Failed';
                this._elements.resultTitle.className = 'result-title fail';
            }
        }

        // Update score display
        if (this._elements.scoreDisplay) {
            this._elements.scoreDisplay.textContent = result.score;
            this._elements.scoreDisplay.style.color = result.passed ? '#27ae60' : '#e74c3c';
        }

        if (this._elements.totalDisplay) {
            this._elements.totalDisplay.textContent = result.total;
        }

        // Update percentage display
        if (this._elements.percentageDisplay) {
            this._elements.percentageDisplay.textContent = 
                `Your score: ${result.percentage}% ${result.passed ? '(Pass ≥ 70%)' : '(Need ≥ 70% to pass)'}`;
        }
    }

    /**
     * Private method to show error message
     * @private
     */
    _showError(message) {
        this._showMessage(message, 'error');
    }

    /**
     * Private method to show general message
 
     * @private
     */
    _showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;
        
        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            info: '#3498db'
        };
        
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 1001;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            max-width: 300px;
            word-wrap: break-word;
        `;

        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    /**
     * Public method to get current quiz statistics
     */
    getStatistics() {
        return this._quiz ? this._quiz.getStatistics() : null;
    }

    /**
     * Public method to export quiz data
     * @returns {string} Exported quiz data as JSON
     */
    exportData() {
        return this._quiz ? this._quiz.exportData() : null;
    }

    /**
 to destroy the app and clean up
     */
    destroy() {
        // Remove all event listeners
        this._eventListeners.forEach((listeners, element) => {
            listeners.forEach(({ event, handler }) => {
                element.removeEventListener(event, handler);
            });
        });
        this._eventListeners.clear();

        // Clear quiz state
        if (this._quiz) {
            this._quiz._clearStorage();
        }

        // Clear properties
        this._quiz = null;
        this._currentResult = null;
        this._container = null;
        this._elements = {};

        if (this._config.debugMode) {
            console.log('QuizApp destroyed');
        }
    }
}