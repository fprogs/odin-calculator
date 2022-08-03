function updateDisplay(event) {
  buttonText = event.target.textContent
  if (buttonText === '( - )') {
    buttonText = '-';
  }
  expression.textContent += buttonText;
}

function clearDisplay(event) {
  expression.textContent = '';
}

function deleteLastCharacter(event) {
  expression.textContent = expression.textContent.slice(0, -1);
}


const clearButton = document.querySelector('#clear');
const deleteButton = document.querySelector('#delete');
const equalsButton = document.querySelector('#equals');
const buttons = document.querySelectorAll(
  '.btn:not(#clear):not(#delete):not(#equals)'
);
const expression = document.querySelector('.display .expression');
const answer = document.querySelector('.display .answer');

buttons.forEach((button) => {
  button.addEventListener('click', updateDisplay);
});

clearButton.addEventListener('click', clearDisplay);

deleteButton.addEventListener('click', deleteLastCharacter);
