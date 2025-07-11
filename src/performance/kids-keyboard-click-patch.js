/**
 * Kids Keyboard - Simple Click Fix Patch
 * 
 * This patch fixes VK click inconsistency without major code changes.
 * Apply this after loading the main keyboard library.
 * 
 * FIXES:
 * ✓ Prevents duplicate event listeners
 * ✓ Improves event handling reliability  
 * ✓ Adds click debugging
 * ✓ Better error recovery
 */

(function() {
    'use strict';
    
    // Track if patch is already applied
    if (window.kidsKeyboardClickPatchApplied) {
        console.log('🔧 Kids Keyboard click patch already applied');
        return;
    }

    console.log('🔧 Applying Kids Keyboard click fix patch...');

    // Store original createKidsKeyboard function
    const originalCreateKidsKeyboard = window.createKidsKeyboard;
    
    if (!originalCreateKidsKeyboard) {
        console.error('🔧 Kids Keyboard not found - cannot apply click patch');
        return;
    }

    // Enhanced createKidsKeyboard with click fixes
    window.createKidsKeyboard = function(options = {}) {
        const keyboard = originalCreateKidsKeyboard(options);
        
        // Track click state
        let clickHandlerAttached = false;
        let clickCount = 0;
        let lastClickTime = 0;
        
        // Get container element
        let container;
        try {
            container = typeof options.container === 'string' 
                ? document.querySelector(options.container)
                : options.container;
        } catch (error) {
            console.error('🔧 Patch: Invalid container', error);
            return keyboard;
        }

        if (!container) {
            console.error('🔧 Patch: Container not found');
            return keyboard;
        }

        // Robust click handler
        const robustClickHandler = (event) => {
            const now = performance.now();
            
            // Debounce rapid clicks (reduced from 50ms to 25ms)
            if (now - lastClickTime < 25) {
                if (options.debug) console.log('🔧 Click debounced');
                return;
            }
            lastClickTime = now;
            
            clickCount++;
            
            if (options.debug) {
                console.log(`🔧 Click #${clickCount}:`, {
                    target: event.target.className,
                    key: event.target.dataset?.key,
                    timestamp: now
                });
            }

            // Verify it's a key element
            if (!event.target.matches('.kids-keyboard__key')) {
                if (options.debug) console.log('🔧 Click ignored - not a key');
                return;
            }

            // Prevent default but allow propagation for better compatibility
            event.preventDefault();
            // Note: Removed stopPropagation to fix click reliability issues

            const keyElement = event.target;
            const keyName = keyElement.dataset.key;

            if (!keyName) {
                if (options.debug) console.log('🔧 Click ignored - no data-key');
                return;
            }

            // Visual feedback
            keyElement.style.transform = 'scale(0.95)';
            keyElement.style.backgroundColor = '#ff9800';
            
            setTimeout(() => {
                keyElement.style.transform = '';
                keyElement.style.backgroundColor = '';
            }, 100);

            // Convert key name back to original format
            let originalKey = keyName;
            if (keyName === 'shiftleft') originalKey = 'ShiftLeft';
            else if (keyName === 'shiftright') originalKey = 'ShiftRight';
            else if (keyName === 'capslock') originalKey = 'CapsLock';
            else if (keyName === 'backspace') originalKey = 'Backspace';
            else if (keyName === 'enter') originalKey = 'Enter';
            else if (keyName === 'space') originalKey = 'Space';
            else if (keyName === 'tab') originalKey = 'Tab';

            // Call original callback
            if (options.onKeyPress && typeof options.onKeyPress === 'function') {
                try {
                    options.onKeyPress(originalKey, event, 'virtual');
                    if (options.debug) console.log(`🔧 Key press successful: ${originalKey}`);
                } catch (error) {
                    console.error('🔧 Key press callback error:', error);
                }
            } else {
                console.warn('🔧 No onKeyPress callback defined');
            }
        };

        // Attach robust click handler
        const attachClickHandler = () => {
            if (clickHandlerAttached) {
                if (options.debug) console.log('🔧 Click handler already attached');
                return;
            }

            // Remove any existing listeners first
            container.removeEventListener('click', robustClickHandler, true);
            container.removeEventListener('click', robustClickHandler, false);

            // Attach click handler and focus management
            container.addEventListener('click', robustClickHandler, {
                capture: true,
                passive: false
            });
            
            // Add mouseout handler to remove focus and fix persistent blue highlights
            container.addEventListener('mouseout', (event) => {
                if (event.target.matches('.kids-keyboard__key')) {
                    event.target.blur(); // Remove focus to clear blue highlighting
                    if (options.debug) console.log('🔧 Focus removed from key:', event.target.dataset.key);
                }
            });
            
            clickHandlerAttached = true;
            
            if (options.debug) {
                console.log('🔧 Robust click handler attached to:', container.id || 'unnamed container');
            }
        };

        // Wait for DOM to be ready, then attach handler
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', attachClickHandler);
        } else {
            // DOM already ready
            setTimeout(attachClickHandler, 100);
        }

        // Monitor for issues and reattach if needed
        const monitorClickHealth = () => {
            const keyElements = container.querySelectorAll('.kids-keyboard__key');
            if (keyElements.length > 0 && !clickHandlerAttached) {
                if (options.debug) console.log('🔧 Reattaching click handler');
                attachClickHandler();
            }
        };

        // Check health every 5 seconds
        const healthCheckInterval = setInterval(monitorClickHealth, 5000);

        // Enhanced destroy function
        const originalDestroy = keyboard.destroy;
        keyboard.destroy = function() {
            clearInterval(healthCheckInterval);
            container.removeEventListener('click', robustClickHandler, true);
            container.removeEventListener('click', robustClickHandler, false);
            clickHandlerAttached = false;
            
            if (originalDestroy) {
                originalDestroy.call(this);
            }
        };

        // Add debug info
        keyboard.getClickDebugInfo = () => ({
            clickCount,
            handlerAttached: clickHandlerAttached,
            container: container.id || 'unnamed',
            keyElementCount: container.querySelectorAll('.kids-keyboard__key').length
        });

        if (options.debug) {
            console.log('🔧 Click patch applied successfully');
        }

        return keyboard;
    };

    // Mark patch as applied
    window.kidsKeyboardClickPatchApplied = true;
    console.log('✅ Kids Keyboard click patch applied successfully');

})();