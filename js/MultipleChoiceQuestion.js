/**
 * MultipleChoiceQuestion class - Handles multiple choice questions
 * Demonstrates Inheritance and Polymorphism OOP principles
 * Extends the base Question class
 */
class MultipleChoiceQuestion extends Question {
    /**
     * Constructor for MultipleChoiceQuestion
 
     */
    constructor(id, text, options, correctAnswer) {
        // Call parent constructor (Inheritance)
        super(id, text, options, correctAnswer, 'multiple-choice');
        
        // Validate that we have appropriate number of options for multiple choice
        this._validateMultipleChoiceOptions();
    }

    /**
     * Private method to validate multiple choice specific requirements
     * @private
     */
    _validateMultipleChoiceOptions() {
        if (this.options.length < 2 || this.options.length > 6) {
            throw new Error('Multiple choice questions must have between 2 and 6 options');
        }
    }

    /**
     * Polymorphism - Override the render method from parent class
     * Creates and returns DOM element for multiple choice question
  
     */
    render(onAnswerChange) {
        // Create main question container
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-card';
        questionDiv.setAttribute('data-question-id', this.id);
        questionDiv.setAttribute('data-question-type', 'multiple-choice');

        // Create question text element
        const questionTextDiv = document.createElement('div');
        questionTextDiv.className = 'question-text';
        questionTextDiv.textContent = `${this.id}. ${this.text}`;

        // Create options container
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'options';

        // Create option elements
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

            const optionText = document.createElement('span');
            optionText.className = 'option-text';
            optionText.textContent = option;

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
            });
            
            const selectedOption = optionsContainer.querySelector(`input[value="${selectedValue}"]`).parentElement;
            selectedOption.classList.add('selected');
            
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
      * @private
     */
    _addSelectionFeedback(selectedElement) {
        selectedElement.style.transform = 'scale(1.02)';
        setTimeout(() => {
            selectedElement.style.transform = '';
        }, 200);
    }

    /**
     * Method to get statistics about this question type
      */
    getQuestionStats() {
        return {
            ...this.getQuestionData(),
            optionCount: this.options.length,
            questionType: 'Multiple Choice',
            difficulty: this._calculateDifficulty()
        };
    }

    /**
     * Private method to calculate question difficulty based on number of options
      * @private
     */
    _calculateDifficulty() {
        const optionCount = this.options.length;
        if (optionCount <= 2) return 'Easy';
        if (optionCount <= 3) return 'Medium';
        return 'Hard';
    }

    /**
     * Method to shuffle options (useful for randomizing question display)
      */
    createShuffledVersion() {
        const shuffledOptions = [...this.options].sort(() => Math.random() - 0.5);
        return new MultipleChoiceQuestion(this.id, this.text, shuffledOptions, this.correctAnswer);
    }

    /**
     * Override toString method for debugging
      */
    toString() {
        return `MultipleChoiceQuestion #${this.id}: ${this.text} (${this.options.length} options)`;
    }
}