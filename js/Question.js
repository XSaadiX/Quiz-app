/**
 * Abstract Question class - Base class for all question types
 * Demonstrates Abstraction and Encapsulation OOP principles
 */
class Question {
    /**
     * Constructor for Question class
 
     */
    constructor(id, text, options, correctAnswer, type = 'multiple-choice') {
        // Encapsulation: Private-like properties
        this._id = id;
        this._text = text;
        this._options = options;
        this._correctAnswer = correctAnswer;
        this._type = type;
        this._selectedAnswer = null;
        
        // Validate required parameters
        this._validateInput();
    }

    // Getter methods for encapsulated properties
    get id() {
        return this._id;
    }

    get text() {
        return this._text;
    }

    get options() {
        return [...this._options]; // Return copy to prevent external modification
    }

    get correctAnswer() {
        return this._correctAnswer;
    }

    get type() {
        return this._type;
    }

    get selectedAnswer() {
        return this._selectedAnswer;
    }

    /**
     * Private method to validate input parameters
     * @private
     */
    _validateInput() {
        if (!this._id || !this._text || !Array.isArray(this._options) || !this._correctAnswer) {
            throw new Error('Invalid question parameters provided');
        }
        
        if (!this._options.includes(this._correctAnswer)) {
            throw new Error('Correct answer must be one of the provided options');
        }
    }

    /**
     * Method to check if the selected answer is correct
      */
    isCorrect() {
        return this._selectedAnswer === this._correctAnswer;
    }

    /**
     * Method to set the selected answer
      */
    setAnswer(answer) {
        if (this._options.includes(answer)) {
            this._selectedAnswer = answer;
        } else {
            throw new Error('Selected answer must be one of the available options');
        }
    }

    /**
     * Method to reset the selected answer
     */
    resetAnswer() {
        this._selectedAnswer = null;
    }

    /**
     * Method to get question data as object
     * @returns {object} Question data
     */
    getQuestionData() {
        return {
            id: this._id,
            text: this._text,
            options: this.options,
            type: this._type,
            selectedAnswer: this._selectedAnswer,
            isAnswered: this._selectedAnswer !== null
        };
    }

    /**
     * Abstract method for rendering question UI
     * Must be implemented by subclasses (Polymorphism)
  
     */
    render(onAnswerChange) {
        throw new Error('render() method must be implemented by subclass');
    }

    /**
     * Method to convert question to JSON string
     * @returns {string} JSON representation of question
     */
    toJSON() {
        return JSON.stringify({
            id: this._id,
            text: this._text,
            options: this._options,
            correctAnswer: this._correctAnswer,
            type: this._type,
            selectedAnswer: this._selectedAnswer
        });
    }

    /**
     * Static method to create Question from JSON
 
     */
    static fromJSON(jsonString) {
        const data = JSON.parse(jsonString);
        const question = new Question(data.id, data.text, data.options, data.correctAnswer, data.type);
        if (data.selectedAnswer) {
            question.setAnswer(data.selectedAnswer);
        }
        return question;
    }
}