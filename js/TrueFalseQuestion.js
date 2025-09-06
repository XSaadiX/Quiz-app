/**
 * TrueFalseQuestion class - Handles true/false questions
 * Demonstrates Inheritance and Polymorphism OOP principles
 * Extends the base Question class
 */
class TrueFalseQuestion extends Question {
    /**
     * Constructor for TrueFalseQuestion
 
     */
    constructor(id, text, correctAnswer) {
        // Validate correct answer format
        if (!['True', 'False'].includes(correctAnswer)) {
            throw new Error('Correct answer for True/False question must be "True" or "False"');
        }
        
        // Call parent constructor with fixed options (Inheritance)
        super(id, text, ['True', 'False'], correctAnswer, 'true-false');
    }

    /**
     * Polymorphism - Override the render method from parent class
     * Creates and returns DOM element for true/false question

     */
    render(onAnswerChange) {
        // Create main question container
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-card';
        questionDiv.setAttribute('data-question-id', this.id);
        questionDiv.setAttribute('data-question-type', 'true-false');

        // Create question text element
        const questionTextDiv = document.createElement('div');
        questionTextDiv.className = 'question-text';
        questionTextDiv.textContent = `${this.id}. ${this.text}`;

        // Create options container
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'options';

        // Create True and False options
        this.options.forEach((option, index) => {
            const optionLabel = document.createElement('label');
            optionLabel.className = `option ${this.selectedAnswer === option ? 'selected' : ''}`;
            optionLabel.setAttribute('for', `q${this.id}_option${index}`);

            const radioInput = document.createElement('input');
            radioInput.type = 'radio';
            radioInput.id = `q${this.id}_option${index}`;
            radioInput.name = `question-${this.id}`;
            radioInput.value = option;
            radioInput.checked = this.selectedAnswer === option;

            // Create option text with emoji for better UX
            const optionText = document.createElement('span');
            optionText.className = 'option-text';
            const emoji = option === 'True' ? '✓' : '✗';
            optionText.innerHTML = `<strong>${emoji} ${option}</strong>`;

            // Add event listener for answer selection
            radioInput.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this._handleAnswerSelection(e.target.value, onAnswerChange, optionsDiv);
                }
            });

            // Add keyboard support
            optionLabel.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    radioInput.checked = true;
                    this._handleAnswerSelection(option, onAnswerChange, optionsDiv);
                }
            });

            // Add hover effects for True/False
            optionLabel.addEventListener('mouseenter', () => {
                if (option === 'True') {
                    optionLabel.style.borderColor = '#27ae60';
                } else {
                    optionLabel.style.borderColor = '#e74c3c';
                }
            });

            optionLabel.addEventListener('mouseleave', () => {
                if (!radioInput.checked) {
                    optionLabel.style.borderColor = '';
                }
            });

            optionLabel.appendChild(radioInput);
            optionLabel.appendChild(optionText);
            optionsDiv.appendChild(optionLabel);
        });

        // Assemble the complete question
        questionDiv.appendChild(questionTextDiv);
        questionDiv.appendChild(optionsDiv);

        return questionDiv;
    }

    /**
     * Private method to handle answer selection and update UI
     * @param {string} selectedValue - The selected answer ('True' or 'False')
     * @param {function} onAnswerChange - Callback function
     * @param {HTMLElement} optionsContainer - Options container element
     * @private
     */
    _handleAnswerSelection(selectedValue, onAnswerChange, optionsContainer) {
        try {
            // Update internal state
            this.setAnswer(selectedValue);
            
            // Update UI visual selection
            const allOptions = optionsContainer.querySelectorAll('.option');
            allOptions.forEach(option => {
                option.classList.remove('selected');
                option.style.borderColor = '';
            });
            
            const selectedOption = optionsContainer.querySelector(`input[value="${selectedValue}"]`).parentElement;
            selectedOption.classList.add('selected');
            
            // Add appropriate color coding for True/False
            if (selectedValue === 'True') {
                selectedOption.style.borderColor = '#27ae60';
                selectedOption.style.backgroundColor = 'rgba(39, 174, 96, 0.1)';
            } else {
                selectedOption.style.borderColor = '#e74c3c';
                selectedOption.style.backgroundColor = 'rgba(231, 76, 60, 0.1)';
            }
            
            // Trigger callback
            if (typeof onAnswerChange === 'function') {
                onAnswerChange(this.id, selectedValue);
            }
            
            // Add visual feedback
            this._addSelectionFeedback(selectedOption);
            
        } catch (error) {
            console.error('Error handling answer selection:', error);
        }
    }

    /**
     * Private method to add visual feedback when answer is selected
     * @param {HTMLElement} selectedElement - The selected option element
     * @private
     */
    _addSelectionFeedback(selectedElement) {
        selectedElement.style.transform = 'scale(1.05)';
        setTimeout(() => {
            selectedElement.style.transform = '';
        }, 300);
    }

    /**
     * Method to get the boolean value of the correct answer
     * @returns {boolean} True if correct answer is 'True', false otherwise
     */
    getCorrectAnswerAsBoolean() {
        return this.correctAnswer === 'True';
    }

    /**
     * Method to get the boolean value of the selected answer
     * @returns {boolean|null} True if selected 'True', false if 'False', null if not answered
     */
    getSelectedAnswerAsBoolean() {
        if (this.selectedAnswer === null) return null;
        return this.selectedAnswer === 'True';
    }

    /**
     * Method to set answer using boolean value
     * @param {boolean} booleanAnswer - True for 'True', false for 'False'
     */
    setAnswerFromBoolean(booleanAnswer) {
        const stringAnswer = booleanAnswer ? 'True' : 'False';
        this.setAnswer(stringAnswer);
    }

    /**
     * Method to get statistics about this question type
     */
    getQuestionStats() {
        return {
            ...this.getQuestionData(),
            questionType: 'True/False',
            difficulty: 'Easy', // True/False questions are generally easier
            correctAnswerBoolean: this.getCorrectAnswerAsBoolean(),
            selectedAnswerBoolean: this.getSelectedAnswerAsBoolean()
        };
    }

    /**
     * Method to validate if the question statement is appropriate for True/False
      */
    validateStatement() {
        const statement = this.text.toLowerCase();
        const warnings = [];
        
        // Check for ambiguous words
        const ambiguousWords = ['sometimes', 'usually', 'often', 'rarely', 'might', 'could', 'may'];
        ambiguousWords.forEach(word => {
            if (statement.includes(word)) {
                warnings.push(`Statement contains ambiguous word: "${word}"`);
            }
        });
        
        // Check for multiple statements (compound statements)
        if (statement.includes(' and ') || statement.includes(' or ')) {
            warnings.push('Statement appears to be compound - consider splitting into multiple questions');
        }
        
        // Check for question format
        if (statement.includes('?')) {
            warnings.push('True/False statements should be declarative, not questions');
        }
        
        return {
            isValid: warnings.length === 0,
            warnings: warnings,
            suggestions: this._generateSuggestions(warnings)
        };
    }

    /**
     * Private method to generate suggestions based on validation warnings
 
     * @private
     */
    _generateSuggestions(warnings) {
        const suggestions = [];
        
        if (warnings.some(w => w.includes('ambiguous'))) {
            suggestions.push('Use absolute terms like "always", "never", "all", "none" for clearer True/False questions');
        }
        
        if (warnings.some(w => w.includes('compound'))) {
            suggestions.push('Split compound statements into separate True/False questions');
        }
        
        if (warnings.some(w => w.includes('question'))) {
            suggestions.push('Rephrase as a declarative statement rather than a question');
        }
        
        return suggestions;
    }

    /**
     * Static method to create a True/False question from a boolean expression
   
     */
    static fromBoolean(id, statement, isTrue) {
        const correctAnswer = isTrue ? 'True' : 'False';
        return new TrueFalseQuestion(id, statement, correctAnswer);
    }

    /**
     * Method to create the opposite version of this question
      */
    createOppositeQuestion() {
        const oppositeAnswer = this.correctAnswer === 'True' ? 'False' : 'True';
        const negatedText = this._negateStatement(this.text);
        return new TrueFalseQuestion(this.id + 1000, negatedText, oppositeAnswer);
    }

    /**
     * Private method to negate a statement
   
     * @private
     */
    _negateStatement(statement) {
        // Simple negation - could be enhanced with more sophisticated logic
        if (statement.toLowerCase().startsWith('the ') || statement.toLowerCase().startsWith('a ')) {
            return statement + ' is not true';
        }
        return 'It is not true that ' + statement.toLowerCase();
    }

    /**
     * Override toString method for debugging
      */
    toString() {
        return `TrueFalseQuestion #${this.id}: ${this.text} (Answer: ${this.correctAnswer})`;
    }
}