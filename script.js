const PLUS_SIGN = '+';
const MINUS_SIGN = '−';
const DIVISION_SIGN = '÷';
const MULTIPLICATION_SIGN = '×';
const LPAREN = '(';
const RPAREN = ')';
const NEGATIVE_SIGN = '-';
const POWER_SIGN = '^';
const DECIMAL = '.';
const ZERO = '0';
const SYNTAX_ERROR_MESSAGE = 'Syntax Error';
const DIVIDE_BY_ZERO_ERROR_MESSAGE = 'Math Error';

function isNumber(n) {
  return !isNaN(n);
}


function isString(str) {
  return typeof str === 'string';
}


const calculator = {
  expression: '',
  clearButton: document.querySelector('#clear'),
  deleteButton: document.querySelector('#delete'),
  equalsButton: document.querySelector('#equals'),
  buttons: document.querySelectorAll(
    '.btn:not(#clear):not(#delete):not(#equals)'
  ),
  expressionArea: document.querySelector('.display .expression'),
  answerArea: document.querySelector('.display .answer'),

  binaryOperators: [
    PLUS_SIGN,
    MINUS_SIGN,
    DIVISION_SIGN,
    MULTIPLICATION_SIGN,
    POWER_SIGN,
  ],

  unaryOperators: [
    NEGATIVE_SIGN,
  ],

  symbols: [
    LPAREN,
    RPAREN,
    PLUS_SIGN,
    MINUS_SIGN,
    DIVISION_SIGN,
    MULTIPLICATION_SIGN,
    POWER_SIGN,
    NEGATIVE_SIGN,
  ],

  operations: {
    [PLUS_SIGN]: function(x, y) {
      return x + y;
    },

    [MINUS_SIGN]: function(x, y) {
      return x - y;
    },

    [MULTIPLICATION_SIGN]: function(x, y) {
      return x * y;
    },

    [DIVISION_SIGN]: function(x, y) {
      return x / y;
    },

    [POWER_SIGN]: function(x, y) {
      return x ** y;
    },

    [NEGATIVE_SIGN]: function(x) {
      return -x;
    },
  },

  getPrecendence(operation) {
    switch (operation) {
      case PLUS_SIGN:
      case MINUS_SIGN:
        return 1;
      case MULTIPLICATION_SIGN:
      case DIVISION_SIGN:
        return 2;
      case POWER_SIGN:
      case NEGATIVE_SIGN:
        return 3;
      default:
        return 0;
    }
  },

  tokenize(expression) {
    const tokens = [];
    let i = 0;
    while (i < expression.length) {
      if (this.symbols.includes(expression[i])) {
        tokens.push(expression[i]);
      } else if (isNumber(expression[i]) || expression[i] === DECIMAL) {
        let number = '';
        while (
          i < expression.length
          && (
            isNumber(expression[i])
            || expression[i] === DECIMAL
          )
        ) {
          number += expression[i];
          i++;
        }
        tokens.push(number);
        i--;
      } else {
        tokens.push(expression[i]);
      }
      i++;
    }
    return tokens;
  },

  validateTokens(tokens) {
    const validatedTokens = [];
    const lparens = [];
    let currPos = 0;
    while (currPos < tokens.length) {
      prevPos = currPos - 1;
      nextPos = currPos + 1;
      let token = tokens[currPos];
      if (isNumber(token)) {
        if (
          nextPos < tokens.length
          && !this.binaryOperators.includes(tokens[nextPos])
          && tokens[nextPos] !== LPAREN
          && tokens[nextPos] !== RPAREN
        ) {
          throw SYNTAX_ERROR_MESSAGE;
        }
        token = parseFloat(token);
      } else if (this.binaryOperators.includes(token)) {
        if (
          prevPos < 0
          || nextPos === tokens.length
          || (
            !isNumber(tokens[nextPos])
            && !this.unaryOperators.includes(tokens[nextPos])
            && tokens[nextPos] !== LPAREN
          )
        ) {
          throw SYNTAX_ERROR_MESSAGE;
        } else if (tokens[nextPos] === ZERO) {
          throw DIVIDE_BY_ZERO_ERROR_MESSAGE;
        }
      } else if (
        this.unaryOperators.includes(token)
        && (
          nextPos === tokens.length
          || (
            !isNumber(tokens[nextPos])
            && tokens[nextPos] !== LPAREN
          )
        )
      ) {
        throw SYNTAX_ERROR_MESSAGE;
      } else if (token === LPAREN) {
        if (
          nextPos === tokens.length
          || (
            !isNumber(tokens[nextPos])
            && !this.unaryOperators.includes(tokens[nextPos])
            && tokens[nextPos] !== LPAREN
          )
        ) {
          throw SYNTAX_ERROR_MESSAGE;
        }
        if (
          !(prevPos < 0)
          && (
            isNumber(tokens[prevPos])
            || tokens[prevPos] === RPAREN
          )
        ) {
          validatedTokens.push(MULTIPLICATION_SIGN);
        }
        lparens.push(token);
      } else if (token === RPAREN) {
        if (
          prevPos < 0
          || (
            nextPos < tokens.length
            && !this.binaryOperators.includes(tokens[nextPos])
            && tokens[nextPos] !== RPAREN
            && tokens[nextPos] !== LPAREN
          )
        ) {
          throw SYNTAX_ERROR_MESSAGE;
        }
        if (lparens.pop() === undefined) {
          throw SYNTAX_ERROR_MESSAGE;
        }
      }
      validatedTokens.push(token);
      currPos++;
    }
    if (lparens.length) {
      throw SYNTAX_ERROR_MESSAGE;
    }
    return validatedTokens;
  },

  calculate(expression) {
    const tokens = this.tokenize(expression);
    const validatedTokens = this.validateTokens(tokens);
    const operators = [];
    const operands = [];
    const operate = () => {
      let x;
      let y;
      let res;
      const operator = operators.pop();
      if (this.unaryOperators.includes(operator)) {
        x = operands.pop();
        res = this.operations[operator](x);
      } else {
        y = operands.pop();
        x = operands.pop();
        res = this.operations[operator](x, y);
      }
      return res;
    }
    for (let token of validatedTokens) {
      if (isNumber(token)) {
        operands.push(token);
      } else if (token === LPAREN) {
        operators.push(token);
      } else if (
        this.binaryOperators.includes(token)
        || this.unaryOperators.includes(token)
      ) {
        if (
          !operators.length
          || operators.at(-1) === LPAREN
          || (
            this.getPrecendence(operators.at(-1))
            < this.getPrecendence(token)
          )
        ) {
          operators.push(token);
        } else {
          operands.push(operate());
          operators.push(token);
        }
      } else if (token === RPAREN) {
        while (operators.length && operators.at(-1) !== LPAREN) {
          operands.push(operate());
        }
        operators.pop();
      }
    }
    while (operators.length) {
      operands.push(operate());
    }
    return operands.pop();
  },

  updateDisplay(event) {
    if (
      this.expressionArea.textContent !== SYNTAX_ERROR_MESSAGE
      && this.expressionArea.textContent !== DIVIDE_BY_ZERO_ERROR_MESSAGE
    ) {
      let buttonText = event.target.textContent
      if (buttonText === '( - )') {
        buttonText = '-';
      }
      if (this.answerArea.textContent.length) {
        this.expressionArea.textContent = this.answerArea.textContent;
        this.expression = this.answerArea.textContent;
      }
      this.expressionArea.textContent += buttonText;
      this.answerArea.textContent = '';
      this.expression += buttonText;
    }
  },

  clearDisplay(event) {
    this.expressionArea.textContent = '';
    this.answerArea.textContent = '';
    this.expression = '';
  },

  deleteLastCharacter(event) {
    if (
      this.expressionArea.textContent === SYNTAX_ERROR_MESSAGE
      || this.expressionArea.textContent === DIVIDE_BY_ZERO_ERROR_MESSAGE
    ) {
      this.expressionArea.textContent = this.expression;
    } else {
      const updatedExpression = this.expressionArea.textContent.slice(0, -1);
      this.expressionArea.textContent = updatedExpression;
      this.answerArea.textContent = '';
      this.expression = updatedExpression;
    }
  },

  calculateExpression(event) {
    try {
      this.answerArea.textContent = calculator.calculate(this.expression);
    } catch (e) {
      this.expressionArea.textContent = e;
    }
  },
}

calculator.buttons.forEach((button) => {
  button.addEventListener('click', calculator.updateDisplay.bind(calculator));
});
calculator.clearButton.addEventListener('click', calculator.clearDisplay.bind(calculator));
calculator.deleteButton.addEventListener('click', calculator.deleteLastCharacter.bind(calculator));
calculator.equalsButton.addEventListener('click', calculator.calculateExpression.bind(calculator));

