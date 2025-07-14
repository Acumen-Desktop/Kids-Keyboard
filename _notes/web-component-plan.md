# Web Component Development Approach

When creating web components, follow this functional programming approach that uses the class syntax only as a browser interface requirement, not as an architectural choice.

## Core Philosophy
- The class extending HTMLElement is infrastructure, not architecture
- Keep all business logic in pure functions outside the class
- Use the class only as lifecycle hooks that trigger functional code
- Avoid Shadow DOM for simple applications to reduce complexity
- Write components as intelligent HTML elements that build themselves

## Implementation Pattern

```javascript
// Pure functions handle all logic (testable, reusable)
const parseComponentData = (element) => {
  return {
    // Extract data from attributes or other sources
  };
};

const createComponentHTML = (data) => {
  return `
    <!-- Your component template -->
  `;
};

const renderComponent = (element, data) => {
  element.innerHTML = createComponentHTML(data);
};

// Class is just a thin browser interface
class MyComponent extends HTMLElement {
  connectedCallback() {
    // Element added to DOM - trigger functional rendering
    const data = parseComponentData(this);
    renderComponent(this, data);
  }
  
  attributeChangedCallback() {
    // Attributes changed - re-render functionally
    const data = parseComponentData(this);
    renderComponent(this, data);
  }
  
  static get observedAttributes() {
    // Define which attributes trigger re-renders
    return ['data-attribute-name'];
  }
}

customElements.define('my-component', MyComponent);
```

## CSS Strategy Without Shadow DOM
- Use component tag name as CSS namespace: `my-component .internal-class`
- Style components in regular CSS files with full editor support
- Let components inherit global design system variables naturally
- Use CSS custom properties for component theming

## Key Benefits
- No build step required
- Full CSS tooling support
- Functional programming principles maintained
- Easy debugging in normal DOM tree
- Components inherit global styles naturally
- Business logic remains pure and testable

## Mental Model
Think of web components as smart HTML elements that know how to build and update themselves, rather than as object-oriented widgets. The class syntax is just the delivery mechanism for your functional code to the browser's custom elements API.