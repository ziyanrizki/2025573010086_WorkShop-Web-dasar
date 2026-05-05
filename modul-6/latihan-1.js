const display = document.getElementById("display");
const buttons = document.getElementById("buttons");

let firstValue = "";
let operator = "";
let secondValue = "";

// Event Delegation
buttons.addEventListener("click", (e) => {
  const btn = e.target;

  if (btn.dataset.value !== undefined) {
    handleNumber(btn.dataset.value);
  } else if (btn.dataset.op !== undefined) {
    handleOperator(btn.dataset.op);
  } else if (btn.dataset.equals !== undefined) {
    calculate();
  } else if (btn.dataset.clear !== undefined) {
    clearAll();
  }
});

function handleNumber(num) {
  display.value += num;
}

function handleOperator(op) {
  firstValue = display.value;
  operator = op;
  display.value = "";
}

function calculate() {
  secondValue = display.value;
  let result;

  const a = parseFloat(firstValue);
  const b = parseFloat(secondValue);

  switch (operator) {
    case "+": result = a + b; break;
    case "-": result = a - b; break;
    case "*": result = a * b; break;
    case "/": result = a / b; break;
  }

  display.value = result;
  firstValue = result;
  operator = "";
  secondValue = "";
}

function clearAll() {
  display.value = "";
  firstValue = "";
  operator = "";
  secondValue = "";
}

// Keyboard Support
document.addEventListener("keydown", (e) => {
  if (!isNaN(e.key) || e.key === ".") {
    handleNumber(e.key);
  } else if (["+", "-", "*", "/"].includes(e.key)) {
    handleOperator(e.key);
  } else if (e.key === "Enter") {
    calculate();
  } else if (e.key === "Escape") {
    clearAll();
  }
});