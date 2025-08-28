import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState([]);
  const [memory, setMemory] = useState(0);
  const [theme, setTheme] = useState('light');
  const [showHistory, setShowHistory] = useState(false);
  const [angleMode, setAngleMode] = useState('deg');

  // Convert angle based on mode
  const convertAngle = (angle) => {
    return angleMode === 'deg' ? (angle * Math.PI) / 180 : angle;
  };

  // Format number
  const formatNumber = (num) => {
    if (typeof num !== 'number' || isNaN(num)) return '0';
    if (Math.abs(num) > 1e15 || (Math.abs(num) < 1e-6 && num !== 0)) {
      return num.toExponential(6);
    }
    return parseFloat(num.toPrecision(12)).toString();
  };

  // Handle number input
  const handleNumber = (digit) => {
    if (display === '0' || display === 'Error') {
      setDisplay(digit);
    } else {
      setDisplay(display + digit);
    }
  };

  // Handle decimal
  const handleDecimal = () => {
    if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  // Handle operations
  const handleOperation = (op) => {
    const newExpression = expression ? `${expression} ${display} ${op} ` : `${display} ${op} `;
    setExpression(newExpression);
    setDisplay('0');
  };

  // Calculate result
  const calculate = (expr) => {
    try {
      const sanitized = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/\^/g, '**');
      
      const result = new Function('return ' + sanitized)();
      return result;
    } catch (error) {
      return 'Error';
    }
  };

  // Handle equals
  const handleEquals = () => {
    if (expression) {
      const fullExpression = expression + display;
      const result = calculate(fullExpression);
      const calculationString = `${fullExpression} = ${result}`;
      
      setHistory([...history.slice(-9), { 
        id: Date.now(), 
        expression: calculationString, 
        result: result.toString() 
      }]);
      
      setDisplay(result.toString());
      setExpression('');
    }
  };

  // Handle scientific functions
  const handleScientific = (func) => {
    const value = parseFloat(display);
    let result;
    
    try {
      switch (func) {
        case 'sin': result = Math.sin(convertAngle(value)); break;
        case 'cos': result = Math.cos(convertAngle(value)); break;
        case 'tan': result = Math.tan(convertAngle(value)); break;
        case 'ln': result = value > 0 ? Math.log(value) : 'Error'; break;
        case 'log': result = value > 0 ? Math.log10(value) : 'Error'; break;
        case 'sqrt': result = value >= 0 ? Math.sqrt(value) : 'Error'; break;
        case 'square': result = value * value; break;
        case 'factorial': 
          if (value >= 0 && Number.isInteger(value) && value <= 170) {
            result = value <= 1 ? 1 : Array.from({length: value}, (_, i) => i + 1).reduce((a, b) => a * b, 1);
          } else result = 'Error';
          break;
        case 'reciprocal': result = value !== 0 ? 1 / value : 'Error'; break;
        case 'negate': result = -value; break;
        default: result = value;
      }
      setDisplay(formatNumber(result));
    } catch {
      setDisplay('Error');
    }
  };

  // Memory functions
  const handleMemory = (action) => {
    const value = parseFloat(display);
    switch (action) {
      case 'MS': setMemory(value); break;
      case 'MR': setDisplay(memory.toString()); break;
      case 'MC': setMemory(0); break;
      case 'M+': setMemory(memory + value); break;
      case 'M-': setMemory(memory - value); break;
    }
  };

  // Clear functions
  const handleClear = (type = 'C') => {
    if (type === 'AC') {
      setDisplay('0');
      setExpression('');
    } else {
      setDisplay('0');
    }
  };

  // Backspace function
  const handleBackspace = () => {
    if (display.length > 1 && display !== 'Error') {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // 🎹 KEYBOARD EVENT LISTENER
  useEffect(() => {
    const handleKeyPress = (event) => {
      const { key, keyCode, shiftKey, ctrlKey } = event;
      
      // Prevent default behavior for calculator keys
      if (['0','1','2','3','4','5','6','7','8','9','+','-','*','/','=','Enter','Escape','Backspace','.'].includes(key)) {
        event.preventDefault();
      }

      // Numbers (0-9)
      if (key >= '0' && key <= '9') {
        handleNumber(key);
        return;
      }

      // Operations
      switch (key) {
        case '+':
          handleOperation('+');
          break;
        case '-':
          handleOperation('-');
          break;
        case '*':
          handleOperation('×');
          break;
        case '/':
          handleOperation('÷');
          break;
        case '=':
        case 'Enter':
          handleEquals();
          break;
        case '.':
          handleDecimal();
          break;
        case 'Escape':
          handleClear('AC');
          break;
        case 'Backspace':
          handleBackspace();
          break;
        case 'Delete':
          handleClear('C');
          break;
      }

      // Shift + Key combinations
      if (shiftKey) {
        switch (key) {
          case '8': // Shift + 8 = *
            handleOperation('×');
            break;
          case '=': // Shift + = = +
            handleOperation('+');
            break;
        }
      }

      // Ctrl + Key combinations
      if (ctrlKey) {
        switch (key.toLowerCase()) {
          case 'h':
            event.preventDefault();
            setShowHistory(!showHistory);
            break;
          case 't':
            event.preventDefault();
            toggleTheme();
            break;
        }
      }

      // Scientific function shortcuts
      switch (key.toLowerCase()) {
        case 's':
          if (!ctrlKey && !shiftKey) handleScientific('sin');
          break;
        case 'c':
          if (!ctrlKey && !shiftKey) handleScientific('cos');
          break;
        case 't':
          if (!ctrlKey && !shiftKey) handleScientific('tan');
          break;
        case 'l':
          if (!ctrlKey && !shiftKey) handleScientific('ln');
          break;
        case 'q':
          handleScientific('square');
          break;
        case 'r':
          handleScientific('sqrt');
          break;
        case 'n':
          handleScientific('negate');
          break;
        case 'p':
          handleNumber(Math.PI.toString());
          break;
        case 'e':
          if (!ctrlKey) handleNumber(Math.E.toString());
          break;
      }

      // Function keys
      if (keyCode >= 112 && keyCode <= 121) { // F1-F10
        event.preventDefault();
        switch (keyCode) {
          case 112: // F1
            handleMemory('MR');
            break;
          case 113: // F2
            handleMemory('MS');
            break;
          case 114: // F3
            handleMemory('MC');
            break;
          case 115: // F4
            handleMemory('M+');
            break;
          case 116: // F5
            handleMemory('M-');
            break;
        }
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyPress);
    
    // Focus the document to ensure keyboard events are captured
    document.body.focus();

    // Cleanup event listener
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [display, expression, history, memory, showHistory, theme, angleMode]); // Dependencies

  return (
    <div className={`calculator-app ${theme}`} tabIndex="0">
      <div className="calculator-container">
        {/* Keyboard Instructions */}
        <div className="keyboard-help">
          <p><strong>⌨️ Keyboard Shortcuts:</strong> Numbers (0-9) | Operations (+,-,*,/) | Enter/= (Calculate) | Esc (Clear) | Backspace (Delete) | S,C,T (Sin,Cos,Tan) | Q (x²) | R (√) | P (π) | E (e) | Ctrl+H (History) | Ctrl+T (Theme)</p>
        </div>

        {/* Header */}
        <header className="calculator-header">
          <h1>Scientific Calculator</h1>
          <div className="controls">
            <button onClick={toggleTheme} className="theme-btn" title="Ctrl+T">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button onClick={() => setShowHistory(!showHistory)} className="history-btn" title="Ctrl+H">
              📋
            </button>
          </div>
        </header>

        <div className="calculator-content">
          {/* Display */}
          <div className="display-section">
            <div className="display-header">
              <div className="mode-indicators">
                <span className="mode">{angleMode.toUpperCase()}</span>
                {memory !== 0 && <span className="memory">M</span>}
              </div>
            </div>
            <div className="expression-display">{expression || '0'}</div>
            <div className="result-display">{display}</div>
          </div>

          {/* Buttons */}
          <div className="button-grid">
            {/* Row 1: Memory Functions */}
            <button onClick={() => handleMemory('MC')} className="btn memory" title="F3 or MC">MC</button>
            <button onClick={() => handleMemory('MR')} className="btn memory" title="F1 or MR">MR</button>
            <button onClick={() => handleMemory('MS')} className="btn memory" title="F2 or MS">MS</button>
            <button onClick={() => handleMemory('M+')} className="btn memory" title="F4 or M+">M+</button>
            <button onClick={() => handleMemory('M-')} className="btn memory" title="F5 or M-">M-</button>

            {/* Row 2: Clear and Special */}
            <button onClick={() => handleClear('AC')} className="btn clear" title="Escape">AC</button>
            <button onClick={() => handleClear('C')} className="btn clear" title="Delete">C</button>
            <button onClick={() => handleScientific('negate')} className="btn function" title="N">±</button>
            <button onClick={() => handleOperation('÷')} className="btn operation" title="/">/</button>
            <button onClick={() => handleScientific('sqrt')} className="btn scientific" title="R">√</button>

            {/* Row 3: Scientific Functions */}
            <button onClick={() => handleScientific('sin')} className="btn scientific" title="S">sin</button>
            <button onClick={() => handleScientific('cos')} className="btn scientific" title="C">cos</button>
            <button onClick={() => handleScientific('tan')} className="btn scientific" title="T">tan</button>
            <button onClick={() => handleOperation('×')} className="btn operation" title="*">×</button>
            <button onClick={() => handleScientific('square')} className="btn scientific" title="Q">x²</button>

            {/* Row 4: More Functions */}
            <button onClick={() => handleScientific('ln')} className="btn scientific" title="L">ln</button>
            <button onClick={() => handleScientific('log')} className="btn scientific">log</button>
            <button onClick={() => handleScientific('factorial')} className="btn scientific">x!</button>
            <button onClick={() => handleOperation('-')} className="btn operation" title="-">-</button>
            <button onClick={() => handleScientific('reciprocal')} className="btn scientific">1/x</button>

            {/* Rows 5-8: Numbers */}
            <button onClick={() => handleNumber('7')} className="btn number" title="7">7</button>
            <button onClick={() => handleNumber('8')} className="btn number" title="8">8</button>
            <button onClick={() => handleNumber('9')} className="btn number" title="9">9</button>
            <button onClick={() => handleOperation('+')} className="btn operation" title="+">+</button>
            <button onClick={() => handleNumber(Math.PI.toString())} className="btn constant" title="P">π</button>

            <button onClick={() => handleNumber('4')} className="btn number" title="4">4</button>
            <button onClick={() => handleNumber('5')} className="btn number" title="5">5</button>
            <button onClick={() => handleNumber('6')} className="btn number" title="6">6</button>
            <button onClick={() => setAngleMode(angleMode === 'deg' ? 'rad' : 'deg')} className="btn mode">
              {angleMode}
            </button>
            <button onClick={() => handleNumber(Math.E.toString())} className="btn constant" title="E">e</button>

            <button onClick={() => handleNumber('1')} className="btn number" title="1">1</button>
            <button onClick={() => handleNumber('2')} className="btn number" title="2">2</button>
            <button onClick={() => handleNumber('3')} className="btn number" title="3">3</button>
            <button onClick={handleEquals} className="btn equals" style={{gridRow: 'span 2'}} title="Enter or =">=</button>
            <button onClick={() => handleNumber('(')} className="btn function">(</button>

            <button onClick={() => handleNumber('0')} className="btn number" style={{gridColumn: 'span 2'}} title="0">0</button>
            <button onClick={handleDecimal} className="btn number" title=".">.</button>
            <button onClick={() => handleNumber(')')} className="btn function">)</button>
          </div>
        </div>

        {/* History Panel */}
        {showHistory && (
          <div className="history-panel">
            <div className="history-header">
              <h3>History</h3>
              <button onClick={() => setHistory([])} className="btn clear">Clear</button>
            </div>
            <div className="history-list">
              {history.length === 0 ? (
                <p>No calculations yet</p>
              ) : (
                history.slice().reverse().map(item => (
                  <div key={item.id} className="history-item" onClick={() => setDisplay(item.result)}>
                    {item.expression}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
