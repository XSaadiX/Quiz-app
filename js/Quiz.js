/**
 * Quiz class - Manages the entire quiz functionality
 * Demonstrates Encapsulation and Composition OOP principles
 * Contains and manages multiple Question instances
 */
class Quiz {
    /**
     * Constructor for Quiz class
    
     */
    constructor(questions = [], options = {}) {
        // Encapsulation: Private-like properties
        this._questions = [];
        this._isCompleted = false;
        this._score = 0;
        this._startTime = null;
        this._endTime = null;
        this._attempts = 0;
        
        // Configuration options with defaults
        this._config = {
            passThreshold: options.passThreshold || 0.7, // 70% to pass
            maxAttempts: options.maxAttempts || Infinity,
            timeLimit: options.timeLimit || null, // in minutes, null for no limit
            shuffleQuestions: options.shuffleQuestions || false,
            showCorrectAnswers: options.showCorrectAnswers || true,
            saveProgress: options.saveProgress !== false, // default true
            storageKey: options.storageKey || 'quizState'
        };
        
        // Validate and add questions
        this._initializeQuestions(questions);
        
        // Bind methods to preserve context
        this._bindMethods();
    }

    // Getter methods for encapsulated properties
    get questions() {
        return [...this._questions]; // Return copy to prevent external modification
    }

    get isCompleted() {
        return this._isCompleted;
    }

    get score() {
        return this._score;
    }

    get totalQuestions() {
        return this._questions.length;
    }

    get passThreshold() {
        return this._config.passThreshold;
    }

    get attempts() {
        return this._attempts;
    }

    get duration() {
        if (!this._startTime) return 0;
        const endTime = this._endTime || new Date();
        return Math.floor((endTime - this._startTime) / 1000); // in seconds
    }

    /**
     * Private method to initialize questions with validation
      * @private
     */
    _initializeQuestions(questions) {
        if (!Array.isArray(questions)) {
            throw new Error('Questions must be provided as an array');
        }

        questions.forEach((question, index) => {
            if (!(question instanceof Question)) {
                throw new Error(`Question at index ${index} is not a valid Question instance`);
            }
            this._questions.push(question);
        });

        if (this._config.shuffleQuestions) {
            this._shuffleQuestions();
        }
    }

    /**
     * Private method to bind methods to preserve context
     * @private
     */
    _bindMethods() {
        this.setAnswer = this.setAnswer.bind(this);
        this.submitQuiz = this.submitQuiz.bind(this);
        this.resetAllAnswers = this.resetAllAnswers.bind(this);
    }

    /**
     * Private method to shuffle questions array
     * @private
     */
    _shuffleQuestions() {
        for (let i = this._questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this._questions[i], this._questions[j]] = [this._questions[j], this._questions[i]];
        }
    }

    /**
     * Method to get a specific question by ID
  
     */
    getQuestion(id) {
        return this._questions.find(q => q.id === id) || null;
    }

    /**
     * Method to get question by index
     * @param {number} index - Question index
     * @returns {Question|null} Question instance or null if invalid index
     */
    getQuestionByIndex(index) {
        if (index >= 0 && index < this._questions.length) {
            return this._questions[index];
        }
        return null;
    }

    /**
     * Method to set answer for a specific question
 
     */
    setAnswer(questionId, answer) {
        try {
            const question = this.getQuestion(questionId);
            if (!question) {
                throw new Error(`Question with ID ${questionId} not found`);
            }

            question.setAnswer(answer);
            
            // Start timer on first answer if not started
            if (!this._startTime) {
                this._startTime = new Date();
            }

            // Save progress if enabled
            if (this._config.saveProgress && !this._isCompleted) {
                this._saveToStorage();
            }

            return true;
        } catch (error) {
            console.error('Error setting answer:', error);
            return false;
        }
    }

    /**
     * Method to reset all answers
     */
    resetAllAnswers() {
        this._questions.forEach(question => question.resetAnswer());
        this._isCompleted = false;
        this._score = 0;
        this._startTime = null;
        this._endTime = null;
        this._clearStorage();
    }

    /**
     * Method to calculate the current score
      */
    calculateScore() {
        let correctAnswers = 0;
        this._questions.forEach(question => {
            if (question.isCorrect()) {
                correctAnswers++;
            }
        });
        this._score = correctAnswers;
        return correctAnswers;
    }

    /**
     * Method to check if quiz is passed
      */
    isPassed() {
        const percentage = this._score / this._questions.length;
        return percentage >= this._config.passThreshold;
    }

    /**
     * Method to submit the quiz and get results
      */
    submitQuiz() {
        if (!this.areAllQuestionsAnswered()) {
            throw new Error('Cannot submit quiz: not all questions have been answered');
        }

        if (this._isCompleted) {
            throw new Error('Quiz has already been submitted');
        }

        // Calculate final score
        this.calculateScore();
        
        // Mark as completed
        this._isCompleted = true;
        this._endTime = new Date();
        this._attempts++;
        
        // Clear storage after completion
        this._clearStorage();

        // Generate detailed results
        const results = this._generateResults();
        
        return results;
    }

    /**
     * Private method to generate detailed quiz results
      * @private
     */
    _generateResults() {
        const percentage = Math.round((this._score / this._questions.length) * 100);
        const passed = this.isPassed();
        
        const results = {
            score: this._score,
            total: this._questions.length,
            percentage: percentage,
            passed: passed,
            passingScore: Math.ceil(this._questions.length * this._config.passThreshold),
            duration: this.duration,
            attempts: this._attempts,
            completedAt: new Date().toISOString(),
            questions: this._config.showCorrectAnswers ? this._getQuestionResults() : null
        };

        return results;
    }

    /**
     * Private method to get detailed question results
      * @private
     */
    _getQuestionResults() {
        return this._questions.map(question => ({
            id: question.id,
            text: question.text,
            selectedAnswer: question.selectedAnswer,
            correctAnswer: question.correctAnswer,
            isCorrect: question.isCorrect(),
            type: question.type
        }));
    }

    /**
     * Method to check if all questions are answered
      */
    areAllQuestionsAnswered() {
        return this._questions.every(question => question.selectedAnswer !== null);
    }

    /**
     * Method to get count of answered questions
      */
    getAnsweredCount() {
        return this._questions.filter(question => question.selectedAnswer !== null).length;
    }

    /**
     * Method to get progress percentage
      */
    getProgressPercentage() {
        return Math.round((this.getAnsweredCount() / this._questions.length) * 100);
    }

    /**
     * Method to check if time limit has been exceeded
      */
    isTimeUp() {
        if (!this._config.timeLimit || !this._startTime) return false;
        const elapsedMinutes = (new Date() - this._startTime) / (1000 * 60);
        return elapsedMinutes >= this._config.timeLimit;
    }

    /**
     * Method to get remaining time in seconds
      */
    getRemainingTime() {
        if (!this._config.timeLimit || !this._startTime) return null;
        const elapsedSeconds = (new Date() - this._startTime) / 1000;
        const totalSeconds = this._config.timeLimit * 60;
        return Math.max(0, totalSeconds - elapsedSeconds);
    }

    /**
     * Private method to save current state to localStorage
     * @private
     */
    _saveToStorage() {
        if (!this._config.saveProgress || this._isCompleted) return;
        
        try {
            const quizState = {
                answers: this._questions.map(q => ({
                    id: q.id,
                    selectedAnswer: q.selectedAnswer
                })),
                startTime: this._startTime ? this._startTime.toISOString() : null,
                isCompleted: this._isCompleted,
                attempts: this._attempts,
                version: '1.0' // for future compatibility
            };
            
            localStorage.setItem(this._config.storageKey, JSON.stringify(quizState));
        } catch (error) {
            console.warn('Failed to save quiz state to localStorage:', error);
        }
    }

    /**
     * Method to load state from localStorage
     */
    loadFromStorage() {
        if (!this._config.saveProgress) return false;
        
        try {
            const savedState = localStorage.getItem(this._config.storageKey);
            if (!savedState) return false;
            
            const state = JSON.parse(savedState);
            
            // Don't load if quiz was completed
            if (state.isCompleted) {
                this._clearStorage();
                return false;
            }
            
            // Restore answers
            if (state.answers && Array.isArray(state.answers)) {
                state.answers.forEach(savedAnswer => {
                    const question = this.getQuestion(savedAnswer.id);
                    if (question && savedAnswer.selectedAnswer) {
                        question.setAnswer(savedAnswer.selectedAnswer);
                    }
                });
            }
            
            // Restore timing
            if (state.startTime) {
                this._startTime = new Date(state.startTime);
            }
            
            // Restore attempts
            if (typeof state.attempts === 'number') {
                this._attempts = state.attempts;
            }
            
            return true;
        } catch (error) {
            console.warn('Failed to load quiz state from localStorage:', error);
            this._clearStorage();
            return false;
        }
    }

    /**
     * Private method to clear localStorage
     * @private
     */
    _clearStorage() {
        try {
            localStorage.removeItem(this._config.storageKey);
        } catch (error) {
            console.warn('Failed to clear quiz state from localStorage:', error);
        }
    }

    /**
     * Method to add a new question to the quiz
 
     */
    addQuestion(question) {
        if (!(question instanceof Question)) {
            throw new Error('Invalid question instance');
        }
        
        if (this._isCompleted) {
            throw new Error('Cannot add questions to a completed quiz');
        }
        
        this._questions.push(question);
        return true;
    }

    /**
     * Method to remove a question by ID
  
     */
    removeQuestion(questionId) {
        if (this._isCompleted) {
            throw new Error('Cannot remove questions from a completed quiz');
        }
        
        const index = this._questions.findIndex(q => q.id === questionId);
        if (index !== -1) {
            this._questions.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * Method to get quiz statistics
      */
    getStatistics() {
        const answeredCount = this.getAnsweredCount();
        const correctCount = this._isCompleted ? this._score : 0;
        
        return {
            totalQuestions: this._questions.length,
            answeredQuestions: answeredCount,
            correctAnswers: correctCount,
            progress: this.getProgressPercentage(),
            isCompleted: this._isCompleted,
            passed: this._isCompleted ? this.isPassed() : null,
            duration: this.duration,
            averageTimePerQuestion: answeredCount > 0 ? this.duration / answeredCount : 0,
            questionTypes: this._getQuestionTypeStats(),
            attempts: this._attempts
        };
    }

    /**
     * Private method to get question type statistics
      * @private
     */
    _getQuestionTypeStats() {
        const stats = {};
        this._questions.forEach(question => {
            const type = question.type;
            if (!stats[type]) {
                stats[type] = { total: 0, answered: 0, correct: 0 };
            }
            stats[type].total++;
            if (question.selectedAnswer !== null) {
                stats[type].answered++;
                if (question.isCorrect()) {
                    stats[type].correct++;
                }
            }
        });
        return stats;
    }

    /**
     * Method to export quiz data as JSON
      */
    exportData() {
        return JSON.stringify({
            questions: this._questions.map(q => ({
                id: q.id,
                text: q.text,
                options: q.options,
                correctAnswer: q.correctAnswer,
                type: q.type,
                selectedAnswer: q.selectedAnswer
            })),
            config: this._config,
            statistics: this.getStatistics(),
            exportedAt: new Date().toISOString()
        }, null, 2);
    }

    /**
     * Static method to create Quiz from exported data
 
     */
    static fromExportedData(jsonData) {
        const data = JSON.parse(jsonData);
        const questions = data.questions.map(qData => {
            let question;
            if (qData.type === 'true-false') {
                question = new TrueFalseQuestion(qData.id, qData.text, qData.correctAnswer);
            } else {
                question = new MultipleChoiceQuestion(qData.id, qData.text, qData.options, qData.correctAnswer);
            }
            if (qData.selectedAnswer) {
                question.setAnswer(qData.selectedAnswer);
            }
            return question;
        });
        
        return new Quiz(questions, data.config);
    }
}