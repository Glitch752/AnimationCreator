var isEventSupported = (function(){
    var TAGNAMES = {
        'select':'input','change':'input',
        'submit':'form','reset':'form',
        'error':'img','load':'img','abort':'img'
    }
    function isEventSupported(eventName) {
        var el = document.createElement(TAGNAMES[eventName] || 'div');
        eventName = 'on' + eventName;
        var isSupported = (eventName in el);
        if (!isSupported) {
            el.setAttribute(eventName, 'return;');
            isSupported = typeof el[eventName] == 'function';
        }
        el = null;
        return isSupported;
    }
    return isEventSupported;
})();

if (isEventSupported("pointerdown")) {
    document.addEventListener("pointerdown", mouseDown, false );
    document.addEventListener("pointerup",   mouseUp  , false );
    document.addEventListener("pointermove", mouseMove, false );
} else if (isEventSupported("touchstart")) {
    document.addEventListener("touchstart",  mouseDown, false );
    document.addEventListener("touchend",    mouseUp  , false );
    document.addEventListener("touchmove",   mouseMove, false );
} else if (isEventSupported("mousedown")) {
    document.addEventListener("mousedown",   mouseDown, false );
    document.addEventListener("mouseup",     mouseUp  , false );
    document.addEventListener("mousemove",   mouseMove, false );
}

document.addEventListener("keydown",   keyDown   );
document.addEventListener("keyup",     keyUp     );

document.addEventListener("wheel",     wheel     );

let globalListeners = {};

function addGlobalListener(listenerType, callback) {
    if(!globalListeners[listenerType]) globalListeners[listenerType] = [];
    globalListeners[listenerType].push(callback);
}

function runGlobalListeners(listenerType, e) {
    for (let i = 0; i < globalListeners[listenerType].length; i++) {
        const globalListener = globalListeners[listenerType][i];
        globalListener(e);
    }
}

function mouseDown(e) {
    runGlobalListeners("mousedown", e);
}
function mouseUp(e) {
    runGlobalListeners("mouseup", e);
}
function mouseMove(e) {
    runGlobalListeners("mousemove", e);
}

function keyDown(e) {
    // Check if the user is currently typing in an input field
    if (document.activeElement.tagName == "INPUT") return;
    
    runGlobalListeners("keydown", e);
}
function keyUp(e) {
    runGlobalListeners("keyup", e);
}

function wheel(e) {
    runGlobalListeners("wheel", e);
}