
const template = document.createElement('template');
template.innerHTML = `
    <style>
        @import url('../../src/kids-keyboard-core.css');
        @import url('../../src/kids-keyboard-layout.css');

        #kids-keyboard-tutor {
            position: relative;
            border: 2px solid #ccc;
            border-radius: 8px;
            padding: 20px;
            padding-top: 50px; /* Space for the toggle button */
        }
        #kids-keyboard-tutor.active {
            border-color: #4CAF50;
        }
        #tutor-mode-toggle {
            position: absolute;
            top: 10px;
            left: 10px;
            padding: 8px 16px;
            border: 1px solid #ccc;
            border-radius: 20px;
            background-color: #f0f0f0;
            cursor: pointer;
            transition: background-color 0.3s, color 0.3s;
            z-index: 10;
        }
        #tutor-mode-toggle.active {
            background-color: #4CAF50;
            color: white;
            border-color: #4CAF50;
        }
        #kids-keyboard-output {
            display: flex;
            margin-bottom: 10px;
        }
        #kids-keyboard-text {
            flex-grow: 1;
            margin-right: 10px;
        }
        #kids-keyboard-display {
            width: 200px;
            border: 1px solid #eee;
            padding: 10px;
        }
    </style>
    <div id="kids-keyboard-tutor">
        <button id="tutor-mode-toggle">Tutor Mode: OFF</button>
        <div id="kids-keyboard-output">
            <textarea id="kids-keyboard-text" placeholder="Click 'Tutor Mode' to start!"></textarea>
            <div id="kids-keyboard-display"></div>
        </div>
        <div id="kids-keyboard-input"></div>
    </div>
`;

class KidsKeyboardShell extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
}

customElements.define('kids-keyboard-shell', KidsKeyboardShell);
