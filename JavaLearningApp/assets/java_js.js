// Page order for navigation
const pageOrder = [
    'home',
    'intro', 
    'syntax',
    'variables',
    'datatypes',
    'operators',
    'conditions',
    'loops',
    'arrays',
    'playground'
];

let currentPageIndex = 0;

// Show specific page
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        targetPage.scrollTop = 0;
        currentPageIndex = pageOrder.indexOf(pageId);
        updateNavButtons();
    }
}

// Navigate to a page
function navigate(pageId) {
    showPage(pageId);
}

// Go to home
function goHome() {
    showPage('home');
}

// Go to previous page
function goPrevious() {
    if (currentPageIndex > 0) {
        currentPageIndex--;
        showPage(pageOrder[currentPageIndex]);
    }
}

// Go to next page
function goNext() {
    if (currentPageIndex < pageOrder.length - 1) {
        currentPageIndex++;
        showPage(pageOrder[currentPageIndex]);
    }
}

// Update navigation button states
function updateNavButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    // Disable prev button on home page
    if (currentPageIndex === 0) {
        prevBtn.disabled = true;
    } else {
        prevBtn.disabled = false;
    }
    
    // Disable next button on last page
    if (currentPageIndex === pageOrder.length - 1) {
        nextBtn.disabled = true;
    } else {
        nextBtn.disabled = false;
    }
}

// Simple Java interpreter/simulator
function interpretJavaCode(code) {
    let output = '';
    
    try {
        // Extract all System.out.println statements
        const printRegex = /System\.out\.println\((.*?)\);/g;
        let match;
        
        // Create a safe evaluation context
        const context = {};
        
        // Extract variable declarations
        const varRegex = /(int|String|double|boolean|char)\s+(\w+)\s*=\s*(.+?);/g;
        let varMatch;
        
        while ((varMatch = varRegex.exec(code)) !== null) {
            const type = varMatch[1];
            const varName = varMatch[2];
            let value = varMatch[3].trim();
            
            // Remove quotes from strings
            if (type === 'String') {
                value = value.replace(/"/g, '');
            } else if (type === 'char') {
                value = value.replace(/'/g, '');
            } else if (type === 'boolean') {
                value = (value === 'true');
            } else if (type === 'int' || type === 'double') {
                value = parseFloat(value);
            }
            
            context[varName] = value;
        }
        
        // Extract array declarations
        const arrayRegex = /(String|int|double)\[\]\s+(\w+)\s*=\s*\{(.+?)\};/g;
        let arrayMatch;
        
        while ((arrayMatch = arrayRegex.exec(code)) !== null) {
            const type = arrayMatch[1];
            const arrayName = arrayMatch[2];
            const elements = arrayMatch[3].split(',').map(e => {
                e = e.trim();
                if (type === 'String') {
                    return e.replace(/"/g, '');
                } else {
                    return parseFloat(e);
                }
            });
            
            context[arrayName] = elements;
        }
        
        // Process println statements
        while ((match = printRegex.exec(code)) !== null) {
            let expression = match[1].trim();
            
            // Handle string literals
            if (expression.startsWith('"') && expression.endsWith('"')) {
                output += expression.slice(1, -1) + '\n';
            } else {
                // Try to evaluate the expression
                try {
                    // Replace variables with their values
                    let evalExpression = expression;
                    
                    // Handle string concatenation
                    for (let varName in context) {
                        const regex = new RegExp('\\b' + varName + '\\b', 'g');
                        if (typeof context[varName] === 'string') {
                            evalExpression = evalExpression.replace(regex, '"' + context[varName] + '"');
                        } else {
                            evalExpression = evalExpression.replace(regex, context[varName]);
                        }
                    }
                    
                    // Remove remaining quotes and evaluate
                    evalExpression = evalExpression.replace(/"/g, '');
                    
                    // If it contains +, it's likely string concatenation
                    if (evalExpression.includes('+')) {
                        const parts = evalExpression.split('+').map(p => p.trim());
                        let result = '';
                        for (let part of parts) {
                            if (!isNaN(part)) {
                                result += part;
                            } else {
                                result += part;
                            }
                        }
                        output += result + '\n';
                    } else {
                        output += evalExpression + '\n';
                    }
                } catch (e) {
                    output += expression + '\n';
                }
            }
        }
        
        // Handle for loops
        const forLoopRegex = /for\s*\(\s*int\s+(\w+)\s*=\s*(\d+)\s*;\s*\1\s*([<>]=?)\s*(\d+)\s*;\s*\1\+\+\s*\)\s*\{([\s\S]*?)\}/g;
        let forMatch;
        
        while ((forMatch = forLoopRegex.exec(code)) !== null) {
            const varName = forMatch[1];
            const start = parseInt(forMatch[2]);
            const operator = forMatch[3];
            const end = parseInt(forMatch[4]);
            const loopBody = forMatch[5];
            
            for (let i = start; eval(`${i} ${operator} ${end}`); i++) {
                context[varName] = i;
                
                // Process println in loop
                const loopPrintRegex = /System\.out\.println\((.*?)\);/g;
                let loopPrintMatch;
                
                while ((loopPrintMatch = loopPrintRegex.exec(loopBody)) !== null) {
                    let expr = loopPrintMatch[1].trim();
                    
                    // Replace loop variable
                    expr = expr.replace(new RegExp('\\b' + varName + '\\b', 'g'), i);
                    
                    // Handle string concatenation
                    if (expr.includes('"')) {
                        expr = expr.replace(/"/g, '');
                        expr = expr.replace(/\+/g, '');
                        expr = expr.trim();
                    }
                    
                    output += expr + '\n';
                }
            }
        }
        
        // Handle array loops
        const arrayLoopRegex = /for\s*\(\s*int\s+(\w+)\s*=\s*0\s*;\s*\1\s*<\s*(\w+)\.length\s*;\s*\1\+\+\s*\)\s*\{([\s\S]*?)\}/g;
        let arrayLoopMatch;
        
        while ((arrayLoopMatch = arrayLoopRegex.exec(code)) !== null) {
            const indexVar = arrayLoopMatch[1];
            const arrayName = arrayLoopMatch[2];
            const loopBody = arrayLoopMatch[3];
            
            if (context[arrayName]) {
                const arr = context[arrayName];
                for (let i = 0; i < arr.length; i++) {
                    // Process println in loop
                    const loopPrintRegex = /System\.out\.println\((.*?)\);/g;
                    let loopPrintMatch;
                    
                    while ((loopPrintMatch = loopPrintRegex.exec(loopBody)) !== null) {
                        let expr = loopPrintMatch[1].trim();
                        
                        // Replace array access
                        expr = expr.replace(new RegExp(arrayName + '\\[' + indexVar + '\\]', 'g'), arr[i]);
                        expr = expr.replace(/"/g, '');
                        
                        output += expr + '\n';
                    }
                }
            }
        }
        
        // Handle if-else statements
        const ifRegex = /if\s*\((.*?)\)\s*\{([\s\S]*?)\}\s*(?:else\s+if\s*\((.*?)\)\s*\{([\s\S]*?)\})?(?:\s*else\s*\{([\s\S]*?)\})?/g;
        let ifMatch;
        
        while ((ifMatch = ifRegex.exec(code)) !== null) {
            const condition = ifMatch[1];
            const ifBody = ifMatch[2];
            const elseIfCondition = ifMatch[3];
            const elseIfBody = ifMatch[4];
            const elseBody = ifMatch[5];
            
            // Simple condition evaluation
            let conditionMet = false;
            
            // Replace variables in condition
            let evalCondition = condition;
            for (let varName in context) {
                evalCondition = evalCondition.replace(new RegExp('\\b' + varName + '\\b', 'g'), context[varName]);
            }
            
            try {
                conditionMet = eval(evalCondition);
            } catch (e) {
                // Default behavior for evaluation errors
            }
            
            let bodyToExecute = '';
            if (conditionMet) {
                bodyToExecute = ifBody;
            } else if (elseIfCondition) {
                try {
                    let evalElseIfCondition = elseIfCondition;
                    for (let varName in context) {
                        evalElseIfCondition = evalElseIfCondition.replace(new RegExp('\\b' + varName + '\\b', 'g'), context[varName]);
                    }
                    if (eval(evalElseIfCondition)) {
                        bodyToExecute = elseIfBody;
                    } else if (elseBody) {
                        bodyToExecute = elseBody;
                    }
                } catch (e) {
                    if (elseBody) bodyToExecute = elseBody;
                }
            } else if (elseBody) {
                bodyToExecute = elseBody;
            }
            
            // Execute body
            if (bodyToExecute) {
                const bodyPrintRegex = /System\.out\.println\((.*?)\);/g;
                let bodyPrintMatch;
                while ((bodyPrintMatch = bodyPrintRegex.exec(bodyToExecute)) !== null) {
                    let expr = bodyPrintMatch[1].trim().replace(/"/g, '');
                    output += expr + '\n';
                }
            }
        }
        
        if (output === '') {
            output = '✓ Code compiled successfully!\n\n(No output to display)';
        }
        
    } catch (error) {
        output = '❌ Error: ' + error.message;
    }
    
    return output.trim();
}

// Run code for tutorial pages
function runCode(type) {
    const code = document.getElementById('code-' + type).value;
    const outputDiv = document.getElementById('output-' + type);
    
    const result = interpretJavaCode(code);
    outputDiv.textContent = result;
}

// Run playground code
function runPlayground() {
    const code = document.getElementById('playground-code').value;
    const outputDiv = document.getElementById('playground-output');
    
    const result = interpretJavaCode(code);
    outputDiv.textContent = result;
}

// Load example code
function loadExample(type) {
    const examples = {
        hello: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        System.out.println("Welcome to Java!");
    }
}`,
        math: `public class Main {
    public static void main(String[] args) {
        int x = 10;
        int y = 5;
        System.out.println("Sum: " + (x + y));
        System.out.println("Product: " + (x * y));
    }
}`,
        loop: `public class Main {
    public static void main(String[] args) {
        for (int i = 1; i <= 5; i++) {
            System.out.println("Count: " + i);
        }
    }
}`,
        array: `public class Main {
    public static void main(String[] args) {
        String[] fruits = {"Apple", "Banana", "Orange"};
        for (int i = 0; i < fruits.length; i++) {
            System.out.println(fruits[i]);
        }
    }
}`
    };
    
    document.getElementById('playground-code').value = examples[type];
    document.getElementById('playground-output').textContent = 'Click "Run My Code!" to see output! ✨';
}

// Clear playground
function clearPlayground() {
    document.getElementById('playground-code').value = `public class Main {
    public static void main(String[] args) {
        // Write your code here!
    }
}`;
    document.getElementById('playground-output').textContent = 'Your output will appear here! ✨';
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    showPage('home');
    updateNavButtons();
});