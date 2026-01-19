let expression = "";
let cursorPos = 0;
const displayExpr = document.getElementById("expression");
const displayVal = document.getElementById("current-val");

// Handle clicking on the expression display to move cursor
displayExpr.addEventListener('click', (e) => {
    if (e.target === displayExpr) {
        cursorPos = expression.length;
        updateDisplay();
    }
});

function append(char) {
    if (displayVal.innerText === "Error" || displayVal.innerText === "NaN") {
        clearDisplay();
    }

    // Basic operator sanitization
    if (expression === "" && ['+', '×', '÷', '%'].includes(char)) return;

    // Prevent double operators
    const lastChar = expression.slice(cursorPos - 1, cursorPos);
    if (['+', '-', '×', '÷'].includes(lastChar) && ['+', '×', '÷', '%'].includes(char)) {
        expression = expression.slice(0, cursorPos - 1) + char + expression.slice(cursorPos);
    } else {
        expression = expression.slice(0, cursorPos) + char + expression.slice(cursorPos);
        cursorPos++;
    }

    updateDisplay();
}

function backspace() {
    if (cursorPos > 0) {
        expression = expression.slice(0, cursorPos - 1) + expression.slice(cursorPos);
        cursorPos--;
    }
    updateDisplay();
}

function clearDisplay() {
    expression = "";
    cursorPos = 0;
    displayVal.innerText = "0";
    updateDisplay();
}

function updateDisplay() {
    displayExpr.innerHTML = "";
    const chars = expression ? expression.split('') : [];

    for (let i = 0; i <= chars.length; i++) {
        if (i === cursorPos) {
            const cursor = document.createElement("span");
            cursor.className = "cursor";
            displayExpr.appendChild(cursor);
        }

        if (i < chars.length) {
            const charSpan = document.createElement("span");
            charSpan.innerText = chars[i];
            const index = i;
            charSpan.onclick = (e) => {
                e.stopPropagation();
                cursorPos = index;
                updateDisplay();
            };
            displayExpr.appendChild(charSpan);
        }
    }

    if (expression) {
        try {
            const preview = evaluate(expression);
            if (!isNaN(preview) && isFinite(preview)) {
                displayVal.innerText = formatNumber(preview);
                displayVal.style.opacity = "0.5";
            }
        } catch (e) { }
    } else {
        displayVal.innerText = "0";
        displayVal.style.opacity = "1";
    }
}

function calculate() {
    if (!expression) return;
    try {
        const result = evaluate(expression);
        displayVal.innerText = formatNumber(result);
        displayVal.style.opacity = "1";
        expression = result.toString();
        cursorPos = expression.length;
        displayExpr.innerHTML = "";
        updateDisplay();
    } catch (e) {
        displayVal.innerText = "Error";
        displayVal.style.opacity = "1";
    }
}

function evaluate(expr) {
    if (!expr) return 0;

    let processed = expr
        .replace(/×/g, "*")
        .replace(/÷/g, "/");

    // Smart Percentage Logic: 100 + 50% -> 100 + (100 * 0.5)
    processed = processed.replace(/(\d+\.?\d*)\s*([\+\-])\s*(\d+\.?\d*)%/g, (match, p1, op, p2) => {
        const val = parseFloat(p1);
        const perc = parseFloat(p2);
        const calculatedPerc = val * (perc / 100);
        return `${val}${op}${calculatedPerc}`;
    });

    // Simple percentage: 50% -> (50/100)
    processed = processed.replace(/(\d+\.?\d*)%/g, "($1/100)");

    try {
        // Use a Function constructor for safer evaluation than eval()
        return Function(`"use strict"; return (${processed})`)();
    } catch (e) {
        throw e;
    }
}

function formatNumber(num) {
    if (num === null || isNaN(num)) return "0";
    // Just return as string without commas
    return num.toString();
}

// Keyboard Support
document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') append(e.key);
    if (e.key === '.') append('.');
    if (e.key === '(') append('(');
    if (e.key === ')') append(')');
    if (e.key === '+') append('+');
    if (e.key === '-') append('-');
    if (e.key === '*') append('×');
    if (e.key === '/') append('÷');
    if (e.key === '%') append('%');
    if (e.key === '=' || e.key === 'Enter') calculate();
    if (e.key === 'Backspace') {
        e.preventDefault();
        backspace();
    }
    if (e.key === 'Escape') clearDisplay();
});
