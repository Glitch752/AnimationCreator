let mouseClicked = false;
let mouseX = 0, mouseY = 0;

let startMouseX = 0, startMouseY = 0;

let startclientX = 0, startclientY = 0;

let selectionDraggingDirection = false;
let selectionDraggingStartX = 0, selectionDraggingStartY = 0;
let selectionElementStartX = 0, selectionElementStartY = 0;
let selectionElementStartWidth = 0, selectionElementStartHeight = 0;

const arrowChange = 100;

// TODO: Refactor so the data isn't stored in the DOM 

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
        draggingObjectStartY = (mouseY - frame.getBoundingClientRect().top) / parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--current-scale"));
        
        // alert(`${draggingObjectStartX} ${draggingObjectStartY}`);

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
        draggingObject = false;
    }

    selectionBoxDragUp(e.target);
});

addGlobalListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if(selectionDraggingDirection !== false) {
        let frame = document.getElementById("frame");
        if(selectedElement.dataset.objectType === "line") {
            switch(selectionDraggingDirection) {
                case "left":
                    break;
            }
        } else {
            let changeLeft = () => {
                let change = (mouseX - selectionDraggingStartX) / parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--current-scale"));
                selectedElement.style.setProperty("--offsetX", selectionElementStartX + change + "px");
                selectedElement.style.setProperty("--width"  , selectionElementStartWidth - change + "px");
                
                if(keysHeld["Shift"]) {
                    selectedElement.style.setProperty("--height" , selectionElementStartWidth - change + "px");
                }
            }
            let changeTop = () => {
                let change = (mouseY - selectionDraggingStartY) / parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--current-scale"));
                selectedElement.style.setProperty("--offsetY", selectionElementStartY + change + "px");
                selectedElement.style.setProperty("--height" , selectionElementStartHeight - change + "px");
            
                if(keysHeld["Shift"]) {
                    selectedElement.style.setProperty("--width" , selectionElementStartHeight - change + "px");
                }
            }
            let changeRight = () => {
                let change = (mouseX - selectionDraggingStartX) / parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--current-scale"));
                selectedElement.style.setProperty("--width"  , selectionElementStartWidth + change + "px");
                
                if(keysHeld["Shift"]) {
                    selectedElement.style.setProperty("--height" , selectionElementStartWidth + change + "px");
                }
            }
            let changeBottom = () => {
                let change = (mouseY - selectionDraggingStartY) / parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--current-scale"));
                selectedElement.style.setProperty("--height" , selectionElementStartHeight + change + "px");

                if(keysHeld["Shift"]) {
                    selectedElement.style.setProperty("--width" , selectionElementStartHeight + change + "px");
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
                    selectedElement.style.setProperty("--offsetY", selectionElementStartY + changeY + "px");
                
                    let changeX = (mouseX - selectionDraggingStartX) / parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--current-scale"));
                    selectedElement.style.setProperty("--offsetX", selectionElementStartX + changeX + "px");
                    break;
            }
            
            setSelectionPosition(selectedElement);
        }
    } else if(mouseClicked) {
        if(checkDraggingTextBorder()) return;

        let mouseMovedX = startMouseX - mouseX;
        let mouseMovedY = startMouseY - mouseY;

        let offsetChangeX = startclientX - mouseMovedX;
        let offsetChangeY = startclientY - mouseMovedY;

        // console.log(mouseX);

        document.documentElement.style.setProperty("--current-offset-x", offsetChangeX + "px");
        document.documentElement.style.setProperty("--current-offset-y", offsetChangeY + "px");
    } else if(draggingObject !== false) {
        // <div class="object circle temp"
        //      style="--offsetX: 500px; --offsetY: 200px; --width: 150px; --height: 100px"></div>
        let currentTemp = document.querySelector(".object.temp");
        if(currentTemp) {
            let frame = document.getElementById("frame");
            let width  = ((mouseX - frame.getBoundingClientRect().left) / parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--current-scale")) - draggingObjectStartX);
            let height = ((mouseY - frame.getBoundingClientRect().top)  / parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--current-scale")) - draggingObjectStartY);
            
            if(draggingObject !== "line") {
                if(width < 0) {
                    currentTemp.style.setProperty("--offsetX", draggingObjectStartX + width + "px");
                    width *= -1;
                } else {
                    currentTemp.style.setProperty("--offsetX", draggingObjectStartX + "px");
                }
    
                if(height < 0) {
                    currentTemp.style.setProperty("--offsetY", draggingObjectStartY + height + "px");
                    height *= -1;
                } else {
                    currentTemp.style.setProperty("--offsetY", draggingObjectStartY + "px");
                }
            } else {
                currentTemp.style.setProperty("--offsetX", draggingObjectStartX + "px");
                currentTemp.style.setProperty("--offsetY", draggingObjectStartY + "px");
            }

            currentTemp.style.setProperty("--width",  width  + "px");
            currentTemp.style.setProperty("--height", height + "px");

            if(draggingObject === "line") {
                currentTemp.style.setProperty("--size", `${distance(draggingObjectStartX, draggingObjectStartY, draggingObjectStartX + width, draggingObjectStartY + height)}px`);
                currentTemp.style.setProperty("--rotation", `${Math.atan2(height, width)}rad`);
            }
        } else {
            let frame = document.getElementById("frame");

            // let lineSide = "bottomleft"
            let type = objectElementTypes[draggingObject] || "div";

            frame.innerHTML += `
                <${type} class='object ${draggingObject} temp'
                    data-object-type="${draggingObject}"
                    ${draggingObject === "text" ? `placeholder="Text..."
                    onchange="changeTextObject(this)"` : ""}
                    data-object-data='${draggingObject === "polygon" ? `${JSON.stringify(draggingObjectData)}` : ""}'
                    ${draggingObject === "polygon" ? `data-${draggingObjectData.sides}-sides ` : ""}
                    ${draggingObject === "line" ? `style="--rotation: 0rad; --size: 0px"` : ""}
                ></${type}>`;

            regenerateSelectedListeners();
            updateObjectList();

            currentTemp = document.querySelector(".object.temp");

            currentTemp.style.setProperty("--offsetX", draggingObjectStartX + "px");
            currentTemp.style.setProperty("--offsetY", draggingObjectStartY + "px");
            currentTemp.style.setProperty("--width", "0px");
            currentTemp.style.setProperty("--height", "0px");
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
                let currentY = parseFloat(getComputedStyle(selectedElement).getPropertyValue("--offsetY"));
                selectedElement.style.setProperty("--offsetY", currentY - arrowChange + "px");
                setSelectionPosition(selectedElement);
            }
            break;
        case "ArrowDown":
            if(selectedElement !== false) {
                let currentY = parseFloat(getComputedStyle(selectedElement).getPropertyValue("--offsetY"));
                selectedElement.style.setProperty("--offsetY", currentY + arrowChange + "px");
                setSelectionPosition(selectedElement);
            }
            break;
        case "ArrowLeft":
            if(selectedElement !== false) {
                let currentX = parseFloat(getComputedStyle(selectedElement).getPropertyValue("--offsetX"));
                selectedElement.style.setProperty("--offsetX", currentX - arrowChange + "px");
                setSelectionPosition(selectedElement);
            }
            break;
        case "ArrowRight":
            if(selectedElement !== false) {
                let currentX = parseFloat(getComputedStyle(selectedElement).getPropertyValue("--offsetX"));
                selectedElement.style.setProperty("--offsetX", currentX + arrowChange + "px");
                setSelectionPosition(selectedElement);
            }
            break;
        case "Backspace":
        case "Delete":
            if(selectedElement !== false) {
                selectedElement.remove();
                selectedElement = false;
                hideSelectionBox();
                updateObjectList();
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
        currentSelectedListeners[i].removeEventListener("mousedown", clickSelection)
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

    setSelectionPosition(selection);
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
        ]
    };

    let customSettings = objectTypeCustomSettings[selection.dataset.objectType] || [];
    for(let i = 0; i < customSettings.length; i++) {
        let setting = customSettings[i];
        let settingElement = document.createElement("div");
        settingElement.classList.add("customObjectSetting");

        switch(setting.type) {
            case "number": {
                let objectData = JSON.parse(selection.dataset.objectData || "{}");

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

                        selection.style.setProperty(setting.setProperty.property, propertyValue);
                    }
                });

                numberInput.id = "objectSetting_" + setting.value;
                settingElement.appendChild(numberInput);
                break;
            }
            case "text": {
                let objectData = JSON.parse(selection.dataset.objectData || "{}");

                let textInput = document.createElement("input");
                textInput.type = "text";
                textInput.value = objectData[setting.value] || "";
                textInput.addEventListener("change", (e) => {
                    objectData[setting.value] = e.target.value;
                    selection.dataset.objectData = JSON.stringify(objectData);
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
                let objectData = JSON.parse(selection.dataset.objectData || "{}");

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
                let objectData = JSON.parse(selection.dataset.objectData || "{}");

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

    if(selection.dataset.objectType !== "line") {
        selectionBox.style.setProperty("--offsetX", selection.style.getPropertyValue("--offsetX"));
        selectionBox.style.setProperty("--offsetY", selection.style.getPropertyValue("--offsetY"));
        selectionBox.style.setProperty("--width",   selection.style.getPropertyValue("--width")  );
        selectionBox.style.setProperty("--height",  selection.style.getPropertyValue("--height") );
    } else {
        let offsetX = parseFloat(selection.style.getPropertyValue("--offsetX"));
        let sideOffsetX = Math.cos(parseFloat(selection.style.getPropertyValue("--rotation"))) * parseFloat(selection.style.getPropertyValue("--size"));
        if(sideOffsetX < 0) offsetX += sideOffsetX;

        let offsetY = parseFloat(selection.style.getPropertyValue("--offsetY"));
        let sideOffsetY = Math.sin(parseFloat(selection.style.getPropertyValue("--rotation"))) * parseFloat(selection.style.getPropertyValue("--size"));
        if(sideOffsetY < 0) offsetY += sideOffsetY;

        selectionBox.style.setProperty("--offsetX", offsetX + "px");
        selectionBox.style.setProperty("--offsetY", offsetY + "px");
        selectionBox.style.setProperty("--width",   Math.abs(Math.cos(parseFloat(selection.style.getPropertyValue("--rotation"))) * parseFloat(selection.style.getPropertyValue("--size"))) + "px");
        selectionBox.style.setProperty("--height",  Math.abs(Math.sin(parseFloat(selection.style.getPropertyValue("--rotation"))) * parseFloat(selection.style.getPropertyValue("--size"))) + "px");
    }

    if(markerSelected !== null) {
        let newKeyframes = selection.dataset.keyframes || "[]";
        newKeyframes = JSON.parse(newKeyframes);

        newKeyframes[markerSelected.marker].data = {
            "x": selection.style.getPropertyValue("--offsetX"),
            "y": selection.style.getPropertyValue("--offsetY"),
            "width": selection.style.getPropertyValue("--width"),
            "height": selection.style.getPropertyValue("--height")
        };

        selection.dataset.keyframes = JSON.stringify(newKeyframes);
    }
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

function loadObjects(objects) {
    document.querySelectorAll(".object").forEach(object => object.remove());

    let frame = document.getElementById("frame");

    for (let i = 0; i < objects.length; i++) {
        const object = objects[i];

        const objectElementTypes = {
            "text": "textarea"
        };

        let type = objectElementTypes[object.type] || "div";
        
        frame.innerHTML += `
            <${type} class='object ${object.type}'
                data-object-type="${object.type}"
                data-object-data='${object.type === "polygon" || object.type === "text" ? `${JSON.stringify(object.data)}` : ""}'
                data-keyframes='${JSON.stringify(object.keyframes) || "[]"}'
                ${object.type === "text" ? `placeholder="Text..."
                onchange="changeTextObject(this)"` : ""}
                ${object.type === "polygon" ? `data-${object.data.sides}-sides` : ""}
                ${object.type === "line" ? `style="--rotation: 0rad; --size: 0px"` : ""}
                style="--offsetX: ${object.x}; --offsetY: ${object.y}; --width: ${object.width}; --height: ${object.height}; --color: ${object.color || "#ffffff"};"
            ></${type}>`;

        if(object.type === "text") {
            let textObject = frame.lastElementChild;
            textObject.value = object.data.text || "";
        }
    }
    
    regenerateSelectedListeners();
}

function changeTextObject(element) {
    lastObjectList[element.dataset.index].data.text = element.value;
    element.dataset.objectData = JSON.stringify(lastObjectList[element.dataset.index].data);
    updateObjectList();
}

let objects = JSON.parse(localStorage.getItem("objects"));

if(objects !== null) {
    loadObjects(objects);
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