let mouseClicked = false;
let mouseX = 0, mouseY = 0;

let startMouseX = 0, startMouseY = 0;

let startclientX = 0, startclientY = 0;

let selectionDraggingDirection = false;
let selectionDraggingStartX = 0, selectionDraggingStartY = 0;
let selectionElementStartX = 0, selectionElementStartY = 0;
let selectionElementStartWidth = 0, selectionElementStartHeight = 0;

const arrowChange = 100;

let objects = [];

window.onload = function() {
    objects = JSON.parse(localStorage.getItem("objects"));

    if(objects !== null) {
        createObjects(objects);
    }
}

const objectElementTypes = {
    "text": "textarea"
};
  
addGlobalListener("wheel", (e) => {
    let target = e.target;
    let clickedFrame = false;

    while(target.parentElement) {
        if(target.classList.contains("leftPanel")) {
            clickedFrame = true;
            break;
        }
        target = target.parentElement;
    }

    if(!clickedFrame) return;
    
    let currentScale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--current-scale"));
    
    let oldScale = currentScale;
    
    currentScale -= e.deltaY / 2000;

    if(currentScale < 0.1) {
       currentScale = 0.1;
    }
    if(currentScale > 4) {
        currentScale = 4;
    }

    document.documentElement.style.setProperty("--current-scale", currentScale);

    let scaleChange = 1 - currentScale / oldScale;

    let offsetX = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--current-offset-x"));
    let offsetY = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--current-offset-y"));

    let leftPanel = document.getElementById("leftPanel");

    let relativeMouseX = mouseX - leftPanel.getBoundingClientRect().left;
    let relativeMouseY = mouseY - leftPanel.getBoundingClientRect().top;

    offsetX += (relativeMouseX - offsetX) * scaleChange
    offsetY += (relativeMouseY - offsetY) * scaleChange

    document.documentElement.style.setProperty("--current-offset-x", offsetX + "px");
    document.documentElement.style.setProperty("--current-offset-y", offsetY + "px");
});

let draggingObject = false;
let draggingObjectData = {};
let draggingObjectStartX = 0, draggingObjectStartY = 0;

addGlobalListener("mousedown", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    let target = e.target;
    let clickedFrame = false;

    while(target.parentElement) {
        if(target.classList.contains("leftPanel")) {
            clickedFrame = true;
            break;
        }
        target = target.parentElement;
    }

    if(!clickedFrame) return;

    let selectedAddObject = getSelectedAddObject();
    if(selectedAddObject !== null) {
        deselectAddObject();

        draggingObject = selectedAddObject;

        let frame = document.getElementById("frame");

        draggingObjectStartX = (mouseX - frame.getBoundingClientRect().left) / parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--current-scale"));
        draggingObjectStartY = (mouseY - frame.getBoundingClientRect().top ) / parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--current-scale"));

        if(selectedAddObject === "polygon") {
            draggingObjectData["sides"] = document.getElementById("polygonSides").value;
        }
        if(selectedAddObject === "text") {
            draggingObjectData["text"] = "";
        }

        return;
    }

    if(checkSelectionBoxDrag(e)) return;

    hideSelectionBox();

    mouseClicked = true;

    startMouseX = mouseX;
    startMouseY = mouseY;

    startclientX = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--current-offset-x"));
    startclientY = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--current-offset-y"));
});

function checkSelectionBoxDrag(e) {

    if(e.target.classList.contains("selectionBoxDragRegion")) {
        selectionBoxDragDown(e.target);

        return true;
    }

    if(e.target.classList.contains("selectionBox")) {
        selectionBoxDragDown(null);

        return true;
    }

    return false;
}

addGlobalListener("mouseup", (e) => {
    mouseClicked = false;

    if(draggingObject !== false) {
        let currentTemp = document.querySelector(".object.temp");
        if(currentTemp) {
            currentTemp.classList.remove("temp");
        }

        let index = currentTemp.dataset.index;
        let object = objects[index];

        object.temp = false;
        object.x = getComputedStyle(currentTemp).getPropertyValue("--offsetX");
        object.y = getComputedStyle(currentTemp).getPropertyValue("--offsetY");
        object.width = getComputedStyle(currentTemp).getPropertyValue("--width");
        object.height = getComputedStyle(currentTemp).getPropertyValue("--height");
        createObjects(objects);

        draggingObject = false;
    }

    selectionBoxDragUp(e.target);
});

addGlobalListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if(selectionDraggingDirection !== false) {
        if(objects[selectedElement.dataset.index].type === "line") {
            switch(selectionDraggingDirection) {
                case "left":
                    break;
            }
        } else {
            let dragging = objects[selectedElement.dataset.index];

            let changeLeft = () => {
                let change = (mouseX - selectionDraggingStartX) / parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--current-scale"));
                
                dragging.x = selectionElementStartX + change;
                dragging.width = selectionElementStartWidth - change;
                
                if(keysHeld["Shift"]) {
                    dragging.height = dragging.width;
                }
            }
            let changeTop = () => {
                let change = (mouseY - selectionDraggingStartY) / parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--current-scale"));
                
                dragging.y = selectionElementStartY + change;
                dragging.height = selectionElementStartHeight - change;
            
                if(keysHeld["Shift"]) {
                    dragging.width = dragging.height;
                }
            }
            let changeRight = () => {
                let change = (mouseX - selectionDraggingStartX) / parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--current-scale"));
                
                dragging.width = selectionElementStartWidth + change;
                
                if(keysHeld["Shift"]) {
                    dragging.height = dragging.width;
                }
            }
            let changeBottom = () => {
                let change = (mouseY - selectionDraggingStartY) / parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--current-scale"));
                
                dragging.height = selectionElementStartHeight + change;

                if(keysHeld["Shift"]) {
                    dragging.width = dragging.height;
                }
            }

            switch(selectionDraggingDirection) {
                case "left":
                    changeLeft();
                    break;
                case "top":
                    changeTop();
                    break;
                case "bottom":
                    changeBottom();
                    break;
                case "right":
                    changeRight();
                    break;
                case "topleft":
                    changeTop();
                    changeLeft();
                    break;
                case "bottomright":
                    changeBottom();
                    changeRight();
                    break;
                case "topright":
                    changeTop();
                    changeRight();
                    break;
                case "bottomleft":
                    changeBottom();
                    changeLeft();
                    break;
                case "selection":
                    let changeY = (mouseY - selectionDraggingStartY) / parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--current-scale"));
                    dragging.y = selectionElementStartY + changeY;
                
                    let changeX = (mouseX - selectionDraggingStartX) / parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--current-scale"));
                    dragging.x = selectionElementStartX + changeX;
                    break;
            }
            
            setSelectionPosition(dragging);
        }
    } else if(mouseClicked) {
        if(checkDraggingTextBorder()) return;

        let mouseMovedX = startMouseX - mouseX;
        let mouseMovedY = startMouseY - mouseY;

        let offsetChangeX = startclientX - mouseMovedX;
        let offsetChangeY = startclientY - mouseMovedY;

        document.documentElement.style.setProperty("--current-offset-x", offsetChangeX + "px");
        document.documentElement.style.setProperty("--current-offset-y", offsetChangeY + "px");
    } else if(draggingObject !== false) {
        let currentTemp = document.querySelector(".object.temp");
        if(currentTemp) {
            let frame = document.getElementById("frame");
            let width  = ((mouseX - frame.getBoundingClientRect().left) / parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--current-scale")) - draggingObjectStartX);
            let height = ((mouseY - frame.getBoundingClientRect().top)  / parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--current-scale")) - draggingObjectStartY);
            
            if(draggingObject !== "line") {
                if(width < 0) {
                    currentTemp.style.setProperty("--offsetX", draggingObjectStartX + width);
                    width *= -1;
                } else {
                    currentTemp.style.setProperty("--offsetX", draggingObjectStartX);
                }
    
                if(height < 0) {
                    currentTemp.style.setProperty("--offsetY", draggingObjectStartY + height);
                    height *= -1;
                } else {
                    currentTemp.style.setProperty("--offsetY", draggingObjectStartY);
                }
            } else {
                currentTemp.style.setProperty("--offsetX", draggingObjectStartX);
                currentTemp.style.setProperty("--offsetY", draggingObjectStartY);
            }

            currentTemp.style.setProperty("--width",  width);
            currentTemp.style.setProperty("--height", height);

            if(draggingObject === "line") {
                currentTemp.style.setProperty("--size", `${distance(draggingObjectStartX, draggingObjectStartY, draggingObjectStartX + width, draggingObjectStartY + height)}px`);
                currentTemp.style.setProperty("--rotation", `${Math.atan2(height, width)}rad`);
            }
        } else {
            objects.push({
                type:      draggingObject,
                x:         draggingObjectStartX,
                y:         draggingObjectStartY,
                width:     0,
                height:    0,
                data:      draggingObjectData,
                color:     "ffffff",
                temp:      true
            });

            createObjects(objects);

            currentTemp = document.querySelector(".object.temp");
        }
    }
});

function distance(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

let keysHeld = {};

addGlobalListener("keydown", (e) => {
    keysHeld[e.key] = true;

    switch(e.key) {
        case "Escape":
            deselectAddObject();

            selectionDraggingDirection = false;
            let selectionBox = document.getElementById("selectionBox");
            selectionBox.classList.remove("shown");
            let keybindHints = document.getElementById("keybindHints");
            keybindHints.classList.remove("shown");
            break;
        case "ArrowUp":
            if(selectedElement !== false) {
                let object = objects[selectedElement.dataset.index];
                object.y = parseFloat(object.y) - arrowChange;
                setSelectionPosition(objects[selectedElement.dataset.index]);
            }
            break;
        case "ArrowDown":
            if(selectedElement !== false) {
                let object = objects[selectedElement.dataset.index];
                object.y = parseFloat(object.y) + arrowChange;
                setSelectionPosition(objects[selectedElement.dataset.index]);
            }
            break;
        case "ArrowLeft":
            if(selectedElement !== false) {
                let object = objects[selectedElement.dataset.index];
                object.x = parseFloat(object.x) - arrowChange;
                setSelectionPosition(objects[selectedElement.dataset.index]);
            }
            break;
        case "ArrowRight":
            if(selectedElement !== false) {
                let object = objects[selectedElement.dataset.index];
                object.x = parseFloat(object.x) + arrowChange;
                setSelectionPosition(objects[selectedElement.dataset.index]);
            }
            break;
        case "Backspace":
        case "Delete":
            if(markerSelected !== null) return;
            if(selectedElement !== false) {
                objects.splice(selectedElement.dataset.index, 1);
                selectedElement = false;
                hideSelectionBox();
                createObjects(objects);
            }
            break;
        default:
            break;
    }
});

addGlobalListener("keyup", (e) => {
    keysHeld[e.key] = false;
});

function deselectAddObject() {
    // let siblingElements = addNavigationSubmenuItem.parentElement.children;
    let siblingElements = document.querySelectorAll(".leftTabSubListItem");
    for(var i = 0; i < siblingElements.length; i++) {
        let siblingElement = siblingElements[i];
        siblingElement.classList.remove("selected");
    }
}

function getSelectedAddObject() {
    let selectedSubItem = document.querySelector(".leftTabSubListItem.selected");
    if(selectedSubItem) {
        return selectedSubItem.dataset.object;
    } else {
        return null;
    }
}

let currentSelectedListeners = [];
function regenerateSelectedListeners() {
    for(let i = 0; i < currentSelectedListeners.length; i++) {
        if(currentSelectedListeners[i] !== null) {
            currentSelectedListeners[i].removeEventListener("mousedown", clickSelection);
        }
    }

    currentSelectedListeners = [];

    let selections = document.querySelectorAll(".object");
    for(let i = 0; i < selections.length; i++) {
        let selection = selections[i];
        selection.setAttribute("data-selection-index", i);
        selection.addEventListener("mousedown", clickSelection);
        currentSelectedListeners.push(selection);
    }
}

let selectedElement = false;

function clickSelection(e) {
    if(draggingObject !== false) return;

    let selection = e.target;

    selectedElement = selection;

    setSelectionPosition(objects[selectedElement.dataset.index]);
    selectionBoxDragDown(null);

    let colorPicker = document.getElementById("objectColor");
    colorPicker.value = getComputedStyle(selection).getPropertyValue("--color").trim() || "#ffffff";

    let customObjectSettings = document.getElementById("customObjectSettings");
    customObjectSettings.innerHTML = "";

    const objectTypeCustomSettings = {
        "text": [
            {
                "name": "Size",
                "value": "size",
                "type": "number",
                "min": 1,
                "setProperty": { "property": "--size", "withPixels": true }
            },
            {
                "name": "Font",
                "value": "font",
                "type": "text",
                "setProperty": { "property": "font-family" }
                // TODO: Add font picker
            },
            { "name": "Bold",          "value": "bold",          "type": "checkbox", "setProperty": { "property": "font-weight", "value": "700" } },
            { "name": "Italic",        "value": "italic",        "type": "checkbox", "setProperty": { "property": "font-style", "value": "italic" } },
            // TODO: Add underline
            // { "name": "Underline",     "value": "underline",     "type": "checkbox", "setProperty": { "property": "text-decoration", "value": "underline" } },
            {
                "name": "Align",
                "value": "textAlign",
                "type": "select",
                "options": [{ "value": "left", "name": "Left"}, {"value": "center", "name": "Center"}, {"value": "right", "name": "Right"}],
                "setProperty": { "property": "text-align" }
            },
            {
                "name": "Line Height",
                "value": "lineHeight",
                "type": "number",
                "min": 1,
                "setProperty": { "property": "line-height", "withPixels": true }
            },
            // TODO: Add letter spacing
            // {
            //     // Letter spacing is different than the other properties because we set the letter-spacing property on the canvas element.
            //     "name": "Letter Spacing",
            //     "value": "letterSpacing",
            //     "type": "number",
            //     "min": 0,
            //     "setProperty": { "property": "letter-spacing", "withPixels": true }
            // }
            // TODO: Add text shadow
        ],
        "polygon": [
            {
                "name": "Sides",
                "value": "sides",
                "type": "number",
                "min": 3,
                "max": 10,
                "setProperty": { "property": "data-sides", "style": false }
            }
        ]
    };

    let customSettings = objectTypeCustomSettings[objects[selection.dataset.index].type] || [];
    for(let i = 0; i < customSettings.length; i++) {
        let setting = customSettings[i];
        let settingElement = document.createElement("div");
        settingElement.classList.add("customObjectSetting");

        switch(setting.type) {
            case "number": {
                let objectData = objects[selection.dataset.index].data || {};

                let numberInput = document.createElement("input");
                numberInput.type = "number";
                numberInput.min = setting.min || null;
                numberInput.max = setting.max || null;
                numberInput.value = objectData[setting.value] || 0;
                numberInput.addEventListener("change", (e) => {
                    objectData[setting.value] = e.target.value;
                    selection.dataset.objectData = JSON.stringify(objectData);
                    updateObjectList();

                    if(setting.setProperty) {
                        let propertyValue = e.target.value;
                        if(setting.setProperty.withPixels) {
                            propertyValue += "px";
                        }

                        if(setting.setProperty.style === false) {
                            selection.setAttribute(setting.setProperty.property, propertyValue);
                        } else {
                            selection.style.setProperty(setting.setProperty.property, propertyValue);
                        }
                    }
                });

                numberInput.id = "objectSetting_" + setting.value;
                settingElement.appendChild(numberInput);
                break;
            }
            case "text": {
                let objectData = objects[selection.dataset.index].data || {};

                let textInput = document.createElement("input");
                textInput.type = "text";
                textInput.value = objectData[setting.value] || "";
                textInput.addEventListener("change", (e) => {
                    objectData[setting.value] = e.target.value;
                    updateObjectList();

                    if(setting.setProperty) {
                        selection.style.setProperty(setting.setProperty.property, e.target.value);
                    }
                });

                textInput.id = "objectSetting_" + setting.value;
                settingElement.appendChild(textInput);
                break;
            }
            case "checkbox": {
                let objectData = objects[selection.dataset.index].data || {};

                let checkboxInput = document.createElement("input");
                checkboxInput.type = "checkbox";
                checkboxInput.checked = objectData[setting.value] || false;
                checkboxInput.addEventListener("change", (e) => {
                    objectData[setting.value] = e.target.checked;
                    selection.dataset.objectData = JSON.stringify(objectData);
                    updateObjectList();

                    if(setting.setProperty) {
                        let propertyValue = (e.target.checked ? setting.setProperty.value : "");
                        selection.style.setProperty(setting.setProperty.property, propertyValue);
                    }
                });

                checkboxInput.id = "objectSetting_" + setting.value;
                settingElement.appendChild(checkboxInput);
                break;
            }
            case "select": {
                let objectData = objects[selection.dataset.index].data || {};

                let selectInput = document.createElement("select");
                for(let j = 0; j < setting.options.length; j++) {
                    let option = setting.options[j];
                    let optionElement = document.createElement("option");
                    optionElement.value = option.value;
                    optionElement.innerText = option.name;
                    selectInput.appendChild(optionElement);
                }
                selectInput.value = objectData[setting.value] || setting.options[0].value;

                selectInput.addEventListener("change", (e) => {
                    objectData[setting.value] = e.target.value;
                    selection.dataset.objectData = JSON.stringify(objectData);
                    updateObjectList();

                    if(setting.setProperty) {
                        selection.style.setProperty(setting.setProperty.property, e.target.value);
                    }
                });

                selectInput.id = "objectSetting_" + setting.value;
                settingElement.appendChild(selectInput);
                break;
            }
        }

        let settingName = document.createElement("label");
        settingName.classList.add("label");
        settingName.innerText = setting.name;
        settingName.htmlFor = "objectSetting_" + setting.value;
        settingElement.appendChild(settingName);
        
        customObjectSettings.appendChild(settingElement);
    }

    // e.stopImmediatePropagation();
}

function setSelectionPosition(selection) {
    let selectionBox = document.getElementById("selectionBox");

    selectionBox.classList.add("shown");

    let keybindHints = document.getElementById("keybindHints");
    keybindHints.classList.add("shown");

    if(!selection) return;

    if(selection.type !== "line") {
        selectionBox.style.setProperty("--offsetX", selection.x     );
        selectionBox.style.setProperty("--offsetY", selection.y     );
        selectionBox.style.setProperty("--width",   selection.width );
        selectionBox.style.setProperty("--height",  selection.height);
    } else {
        // TODO: When implementing line editing, make sure to update this
        // let offsetX = parseFloat(selection.x);
        // let sideOffsetX = Math.cos(parseFloat(selection.style.getPropertyValue("--rotation"))) * parseFloat(selection.style.getPropertyValue("--size"));
        // if(sideOffsetX < 0) offsetX += sideOffsetX;

        // let offsetY = parseFloat(selection.style.getPropertyValue("--offsetY"));
        // let sideOffsetY = Math.sin(parseFloat(selection.style.getPropertyValue("--rotation"))) * parseFloat(selection.style.getPropertyValue("--size"));
        // if(sideOffsetY < 0) offsetY += sideOffsetY;

        // selectionBox.style.setProperty("--offsetX", offsetX);
        // selectionBox.style.setProperty("--offsetY", offsetY);
        // selectionBox.style.setProperty("--width",   Math.abs(Math.cos(parseFloat(selection.style.getPropertyValue("--rotation"))) * parseFloat(selection.style.getPropertyValue("--size"))));
        // selectionBox.style.setProperty("--height",  Math.abs(Math.sin(parseFloat(selection.style.getPropertyValue("--rotation"))) * parseFloat(selection.style.getPropertyValue("--size"))));
    }

    if(markerSelected !== null) {
        let newKeyframes = objects[selection.dataset.index].keyframes;
        if(!newKeyframes) newKeyframes = [];

        newKeyframes[markerSelected.marker].data = {
            "x": selection.x,
            "y": selection.y,
            "width": selection.width,
            "height": selection.height
        };
    }

    updateObjectList();

    createObjects(objects);
}

// let selectionBoxDragRegions = document.querySelectorAll(".selectionBoxDragRegion");

function selectionBoxDragDown(element) {
    if(checkDraggingTextBorder()) return;

    clearSelection();

    updateObjectList();
    if(element === null) {
        selectionDraggingDirection = "selection";

        selectionDraggingStartX = mouseX;
        selectionDraggingStartY = mouseY;

        let selectionBox = document.getElementById("selectionBox");

        selectionElementStartX = parseFloat(getComputedStyle(selectionBox).getPropertyValue("--offsetX"));
        selectionElementStartY = parseFloat(getComputedStyle(selectionBox).getPropertyValue("--offsetY"));
        
        return;
    }

    let dragRegion = element.dataset.dragRegion;
    selectionDraggingDirection = dragRegion;

    selectionDraggingStartX = mouseX;
    selectionDraggingStartY = mouseY;

    selectionElementStartX = parseFloat(getComputedStyle(element).getPropertyValue("--offsetX"));
    selectionElementStartY = parseFloat(getComputedStyle(element).getPropertyValue("--offsetY"));

    selectionElementStartWidth  = parseFloat(getComputedStyle(element).getPropertyValue("--width"));
    selectionElementStartHeight = parseFloat(getComputedStyle(element).getPropertyValue("--height"));
}

function selectionBoxDragUp() {
    updateObjectList();
    selectionDraggingDirection = false;
}

function hideSelectionBox() {
    let customObjectSettings = document.getElementById("customObjectSettings");
    customObjectSettings.innerHTML = "";

    selectionDraggingDirection = false;
    let selectionBox = document.getElementById("selectionBox");
    selectionBox.classList.remove("shown");
    let keybindHints = document.getElementById("keybindHints");
    keybindHints.classList.remove("shown");

    selectedElement = false;

    updateObjectList();
    
    document.getElementById("keyframeEditor").classList.remove("open");
    document.querySelectorAll(".keyframe-option.selected").forEach(e => e.classList.remove("selected"));
    document.getElementById("keyframes").innerHTML = `<span class="keyframe-editor-select-property">Select a property to edit keyframes</span>`;
    
    document.getElementById("keyframeTiming").classList.remove("shown");
    selectedLine = null;
}

function checkDraggingTextBorder() {
    if (document.activeElement.tagName === "TEXTAREA") {
        // Check if we're clicking the border of the textarea
        let textarea = document.activeElement;
        let textareaRect = textarea.getBoundingClientRect();

        let borderSize = 10;
        
        if(    mouseX >= textareaRect.left   + borderSize 
            && mouseX <= textareaRect.right  - borderSize
            && mouseY >= textareaRect.top    + borderSize
            && mouseY <= textareaRect.bottom - borderSize) {
            return true;
        }
    };

    return false;
}

let oldElements = 0;
let oldIsolated = 0;
let oldIsolatedOn = 0;

function createObjects(objects) {
    if(oldElements === objects.length && !(isolationModeOn || oldIsolated !== isolatedObjects.length) && oldIsolatedOn === isolationModeOn) {
        for(let i = 0; i < objects.length; i++) {
            let object = document.querySelector(`.object[data-index="${i}"]`);
            if(object) {
                object.style.setProperty("--offsetX", objects[i].x);
                object.style.setProperty("--offsetY", objects[i].y);
                object.style.setProperty("--width",   objects[i].width);
                object.style.setProperty("--height",  objects[i].height);
            }
        }
        return;
    }
    oldElements = objects.length;
    oldIsolated = isolatedObjects.length;
    oldIsolatedOn = isolationModeOn;

    document.querySelectorAll(".object").forEach(object => object.remove());

    let frame = document.getElementById("frame");

    for (let i = 0; i < objects.length; i++) {
        if(isolationModeOn && isolatedObjects.indexOf(i) === -1) continue;

        const object = objects[i];

        const objectElementTypes = {
            "text": "textarea"
        };

        let type = objectElementTypes[object.type] || "div";

        const dataToProperty = {
            "size": { "property": "--size", "withPixels": true },
            "font": { "property": "font-family" },
            "bold": { "property": "font-weight", "value": "700" },
            "italic": { "property": "font-style", "value": "italic" },
            "textAlign": { "property": "text-align" },
            "lineHeight": { "property": "line-height", "withPixels": true },
        };

        frame.innerHTML += `
            <${type} class='object ${object.type} ${object.temp ? "temp" : ""}'
                data-index="${i}"
                ${object.type === "text" ? `placeholder="Text..."
                onchange="changeTextObject(this)"` : ""}5
                ${object.type === "polygon" ? `data-sides='${object.data.sides}'` : ""}
                ${object.type === "line" ? `style="--rotation: 0rad; --size: 0px"` : ""}
                style="--offsetX: ${object.x}; --offsetY: ${object.y}; --width: ${object.width}; --height: ${object.height}; --color: #${object.color || "ffffff"};"
            ></${type}>`;

        if(object.type === "text") {
            let textObject = frame.lastElementChild;
            textObject.innerText = object.data.text || "";
        }

        for(const data in dataToProperty) {
            if(object.data[data] !== undefined) {
                let property = dataToProperty[data].property || data;
                let value = object.data[data];
                if(dataToProperty[data].value) value = value ? dataToProperty[data].value : "";
                if(dataToProperty[data].withPixels) value += "px";

                frame.lastElementChild.style.setProperty(property, value);
            }
        }
    }
    
    updateObjectList();
    regenerateSelectedListeners();
}

function changeTextObject(element) {
    objects[element.dataset.index].data.text = element.value;
    updateObjectList();
}

function updateObjectColor(color) {
    if(selectedElement === false) return;

    selectedElement.style.setProperty("--color", color);
}

function clearSelection() {
    let selection;
    if((selection = document.selection) && selection.empty) {
        selection.empty();
    } else {
        if(window.getSelection) {
            window.getSelection().removeAllRanges();
        }
        if(document.activeElement) {
            var tagName = document.activeElement.nodeName.toLowerCase();
            if (tagName == "textarea" || (tagName == "input" && document.activeElement.type == "text")) {
                // Collapse the selection to the end
                document.activeElement.selectionStart = document.activeElement.selectionEnd;
            }
        }
    }
}