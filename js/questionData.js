/**
 * Quiz Questions Data
 * Contains all quiz questions organized by topic and type
 * Easy to modify and maintain
 */

const QuizQuestions = {
    /**
     * Array of all quiz questions
     * Each question object contains: id, type, text, options (for multiple choice), correctAnswer
     */
    questions: [
        // JavaScript Fundamentals
        {
            id: 1,
            type: 'multiple-choice',
            text: "What is the capital of France?",
            options: ["London", "Berlin", "Paris", "Madrid"],
            correctAnswer: "Paris",
            category: "Geography"
        },
        {
            id: 2,
            type: 'true-false',
            text: "JavaScript is a compiled language.",
            correctAnswer: "False",
            category: "JavaScript"
        },
        {
            id: 3,
            type: 'multiple-choice',
            text: "Which method is used to add an element to the end of an array?",
            options: ["push()", "pop()", "shift()", "unshift()"],
            correctAnswer: "push()",
            category: "JavaScript"
        },
        {
            id: 4,
            type: 'true-false',
            text: "CSS stands for Cascading Style Sheets.",
            correctAnswer: "True",
            category: "CSS"
        },
        {
            id: 5,
            type: 'multiple-choice',
            text: "What does HTML stand for?",
            options: [
                "Hypertext Markup Language", 
                "High Tech Modern Language", 
                "Home Tool Markup Language", 
                "Hyperlink and Text Markup Language"
            ],
            correctAnswer: "Hypertext Markup Language",
            category: "HTML"
        },
        {
            id: 6,
            type: 'true-false',
            text: "React is a JavaScript library for building user interfaces.",
            correctAnswer: "True",
            category: "JavaScript"
        },
        {
            id: 7,
            type: 'multiple-choice',
            text: "Which of the following is NOT a JavaScript data type?",
            options: ["String", "Boolean", "Float", "Number"],
            correctAnswer: "Float",
            category: "JavaScript"
        },
        {
            id: 8,
            type: 'multiple-choice',
            text: "What is the correct way to create a function in JavaScript?",
            options: [
                "function myFunction() {}", 
                "create myFunction() {}", 
                "def myFunction() {}", 
                "func myFunction() {}"
            ],
            correctAnswer: "function myFunction() {}",
            category: "JavaScript"
        },
        {
            id: 9,
            type: 'true-false',
            text: "The '===' operator in JavaScript checks for both value and type equality.",
            correctAnswer: "True",
            category: "JavaScript"
        },
        {
            id: 10,
            type: 'multiple-choice',
            text: "Which HTTP status code indicates a successful response?",
            options: ["404", "500", "200", "301"],
            correctAnswer: "200",
            category: "HTTP"
        },
        {
            id: 11,
            type: 'true-false',
            text: "JSON stands for JavaScript Object Notation.",
            correctAnswer: "True",
            category: "JavaScript"
        },
        {
            id: 12,
            type: 'multiple-choice',
            text: "Which method is used to convert a JSON string to a JavaScript object?",
            options: ["JSON.stringify()", "JSON.parse()", "JSON.convert()", "JSON.object()"],
            correctAnswer: "JSON.parse()",
            category: "JavaScript"
        }
    ],

    /**
     * Method to create Question instances from data
     */
    createQuestionInstances() {
        return this.questions.map(questionData => {
            if (questionData.type === 'true-false') {
                return new TrueFalseQuestion(
                    questionData.id,
                    questionData.text,
                    questionData.correctAnswer
                );
            } else if (questionData.type === 'multiple-choice') {
                return new MultipleChoiceQuestion(
                    questionData.id,
                    questionData.text,
                    questionData.options,
                    questionData.correctAnswer
                );
            } else {
                throw new Error(`Unknown question type: ${questionData.type}`);
            }
        });
    },

    /**
     * Get questions by category
     */
    getByCategory(category) {
        return this.questions.filter(q => q.category === category);
    },

    /**
     * Get questions by type
        */
    getByType(type) {
        return this.questions.filter(q => q.type === type);
    },

    /**
     * Get random subset of questions
     * @param {number} count - Number of questions to select
     * @returns {object[]} Random questions
     */
    getRandomQuestions(count) {
        const shuffled = [...this.questions].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    },

    /**
     * Add a new question
     * @param {object} questionData - Question data object
     */
    addQuestion(questionData) {
        // Validate required fields
        const required = ['id', 'type', 'text', 'correctAnswer'];
        for (const field of required) {
            if (!questionData[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        // Validate multiple choice has options
        if (questionData.type === 'multiple-choice' && !questionData.options) {
            throw new Error('Multiple choice questions must have options');
        }

        // Check for duplicate ID
        if (this.questions.find(q => q.id === questionData.id)) {
            throw new Error(`Question with ID ${questionData.id} already exists`);
        }

        this.questions.push({
            category: 'Custom',
            ...questionData
        });
    },

    /**
     * Remove a question by ID
     * @param {number} id - Question ID
     * @returns {boolean} True if removed, false if not found
     */
    removeQuestion(id) {
        const index = this.questions.findIndex(q => q.id === id);
        if (index !== -1) {
            this.questions.splice(index, 1);
            return true;
        }
        return false;
    },

    /**
     * Get statistics about the question pool
     * @returns {object} Statistics object
     */
    getStatistics() {
        const categories = {};
        const types = {};

        this.questions.forEach(q => {
            // Count by category
            categories[q.category] = (categories[q.category] || 0) + 1;
            
            // Count by type
            types[q.type] = (types[q.type] || 0) + 1;
        });

        return {
            total: this.questions.length,
            categories,
            types,
            averageOptionsPerMC: this._getAverageOptionsCount()
        };
    },

    /**
     * Private method to calculate average options per multiple choice question
     * @returns {number} Average number of options
     * @private
     */
    _getAverageOptionsCount() {
        const mcQuestions = this.questions.filter(q => q.type === 'multiple-choice');
        if (mcQuestions.length === 0) return 0;
        
        const totalOptions = mcQuestions.reduce((sum, q) => sum + q.options.length, 0);
        return Math.round((totalOptions / mcQuestions.length) * 10) / 10; // Round to 1 decimal
    },

    /**
     * Export questions as JSON
     * @returns {string} JSON string
     */
    exportAsJSON() {
        return JSON.stringify({
            questions: this.questions,
            metadata: {
                exportedAt: new Date().toISOString(),
                totalQuestions: this.questions.length,
                statistics: this.getStatistics()
            }
        }, null, 2);
    },

    /**
     * Import questions from JSON

     */
    importFromJSON(jsonString, append = false) {
        try {
            const data = JSON.parse(jsonString);
            
            if (!data.questions || !Array.isArray(data.questions)) {
                throw new Error('Invalid JSON format: missing questions array');
            }

            if (!append) {
                this.questions = [];
            }

            data.questions.forEach(q => this.addQuestion(q));
            
        } catch (error) {
            throw new Error(`Failed to import questions: ${error.message}`);
        }
    }
};

// Additional question sets for different topics/difficulties
const AdditionalQuestionSets = {
    /**
     * Advanced JavaScript questions
     */
    advancedJavaScript: [
        {
            id: 101,
            type: 'multiple-choice',
            text: "What is the output of: console.log(typeof typeof 1)?",
            options: ["number", "string", "undefined", "object"],
            correctAnswer: "string",
            category: "JavaScript Advanced"
        },
        {
            id: 102,
            type: 'true-false',
            text: "JavaScript has block scope with var keyword.",
            correctAnswer: "False",
            category: "JavaScript Advanced"
        }
    ],

    /**
     * HTML5 questions
     */
    html5: [
        {
            id: 201,
            type: 'multiple-choice',
            text: "Which HTML5 element is used for drawing graphics?",
            options: ["<canvas>", "<graphics>", "<draw>", "<svg>"],
            correctAnswer: "<canvas>",
            category: "HTML5"
        },
        {
            id: 202,
            type: 'true-false',
            text: "The <article> element can contain multiple <section> elements.",
            correctAnswer: "True",
            category: "HTML5"
        }
    ],

    /**
     * CSS3 questions
     */
    css3: [
        {
            id: 301,
            type: 'multiple-choice',
            text: "Which CSS property is used to create rounded corners?",
            options: ["corner-radius", "border-radius", "round-corner", "border-round"],
            correctAnswer: "border-radius",
            category: "CSS3"
        },
        {
            id: 302,
            type: 'true-false',
            text: "CSS Grid and Flexbox can be used together in the same layout.",
            correctAnswer: "True",
            category: "CSS3"
        }
    ]
};

// Make available globally
if (typeof window !== 'undefined') {
    window.QuizQuestions = QuizQuestions;
    window.AdditionalQuestionSets = AdditionalQuestionSets;
}