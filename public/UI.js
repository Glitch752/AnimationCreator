let navigationTabSelected = "add";
let rightNavigationButtons = document.querySelectorAll(".rightNavigationButton");
rightNavigationButtons.forEach(button => { button.addEventListener("click", selectTab.bind(null, button)) });

let isolationModeOn = false;
let isolatedObjects = [];

function selectTab(button) {
    tab = button.dataset.tab;

    let oldTab = navigationTabSelected;
    navigationTabSelected = tab;

    let oldTabElement = document.querySelector(`.leftContainerTab[data-tab="${oldTab}"]`);
    let tabElement = document.querySelector(`.leftContainerTab[data-tab="${tab}"]`);

    let oldButtonElement = document.querySelector(`.rightNavigationButton[data-tab="${oldTab}"]`);

    oldTabElement.classList.remove("selected");
    tabElement.classList.add("selected");

    if(tab === "timeline") {
        let timeline = document.getElementById("timeline");
        timeline.style.setProperty("--width", timeline.scrollWidth + "px");
        timeline.style.setProperty("--height", timeline.scrollHeight + "px");
    }

    oldButtonElement.classList.remove("selected");
    button.classList.add("selected");
}


let addNavigationSubmenus = document.querySelectorAll(".leftTabListItem");
addNavigationSubmenus.forEach(addNavigationSubmenu => {
    addNavigationSubmenu.addEventListener("click", (e) => {
        let target = e.target;
        while(target.parentElement) {
            if(target.classList.contains("leftTabSubList")) {
                return;
            }
            target = target.parentElement;
        }

        addNavigationSubmenu.classList.toggle("open");
    })
});

let addNavigationSubmenuItems = document.querySelectorAll(".leftTabSubListItem");
addNavigationSubmenuItems.forEach(addNavigationSubmenuItem => {
    addNavigationSubmenuItem.addEventListener("click", (e) => {
        deselectAddObject()
        addNavigationSubmenuItem.classList.add("selected");
    });
});

function updateObjectList() {
    let objectsList = document.getElementById("objectsList");

    objectsList.innerHTML = `
        <div class="objectListHeader">
            <button class="objectListHeaderButton" onPointerUp="toggleIsolationMode(this)">${isolationModeOn ? "Do not isolate" : "Isolate"}</button>
        </div>`;

    const objectTypeNames = {
        "rectangle": "Rectangle",
        "circle": "Circle",
        "polygon": "Polygon",
        "image": "Image",
        "line": "Line",
        "text": "Text"
    };

    if(!objects) objects = [];

    for(let i = 0; i < objects.length; i++) {
        objectsList.innerHTML += `<div class="objectListItem 
                ${(selectionDraggingDirection !== false && selectedElement?.dataset?.index == objects[i]) ? "selected" : ""}
                ${isolationModeOn && isolatedObjects.includes(i) ? "isolating" : ""}"
            " 
            onmouseenter ="mouseEnterObjectList(${i})" 
            onmouseleave ="mouseLeaveObjectList(${i})"
            onpointerdown="mouseClickObjectList(${i})">
                ${objectTypeNames[objects[i].type] || "Unknown"}
                <span class="objectListRemove" onpointerdown="deleteObject(${i})">X</span>
        </div>`;
    }

    localStorage.setItem("objects", JSON.stringify(objects));

    refreshTimeline();
}

function deleteObject(index) {
    let originalObject = document.querySelector(`.object[data-index="${index}"]`);

    objects.splice(index, 1);

    createObjects(objects);

    if(!originalObject) return;

    originalObject.remove();

    hideSelectionBox();

    mouseLeaveObjectList();

    // Weird fix
    // TODO: Make this less timing dependent
    setTimeout(() => {
        hideSelectionBox();

        mouseLeaveObjectList();
    }, 1);
}

function mouseEnterObjectList(index) {
    let outline = document.getElementById("outline");
    outline.classList.add("shown");

    outline.style.setProperty("--offsetX", objects[index].x     );
    outline.style.setProperty("--offsetY", objects[index].y     );
    outline.style.setProperty("--width",   objects[index].width );
    outline.style.setProperty("--height",  objects[index].height);
}

function mouseLeaveObjectList() {
    let outline = document.getElementById("outline");
    outline.classList.remove("shown");
}

function mouseClickObjectList(index) {
    if(isolationModeOn) {
        if(isolatedObjects.includes(index)) {
            isolatedObjects.splice(isolatedObjects.indexOf(index), 1);
            console.log("Removing");
        } else {
            isolatedObjects.push(index);
            console.log("Adding");
        }

        createObjects(objects);
    }

    let originalObject = document.querySelector(`.object[data-index="${index}"]`);
    if(!originalObject) return;
    clickSelection({target: originalObject});
}

function shareAnimation() {
    // TODO: add sharing menu
}

let idShown = null;

let options = document.querySelectorAll(".option");
options.forEach(option => {
    option.addEventListener("click", (e) => {
        let siblingElements = option.parentElement.children;
        for(var i = 0; i < siblingElements.length; i++) {
            let siblingElement = siblingElements[i];
            siblingElement.classList.remove("selected");
        }
        option.classList.add("selected");

        if(idShown) {
            document.getElementById(idShown).classList.remove("shown");
            idShown = null;
        }

        if(option.dataset.showId) {
            idShown = option.dataset.showId;
            let element = document.getElementById(idShown);
            element.classList.add("shown");
        }
    });
});

function exportAnimation() {
    let exportPopup = document.getElementById("exportPopup");
    exportPopup.classList.toggle("shown");
}

// Settings menu
function updateBackgroundColor(color) {
    document.documentElement.style.setProperty("--background-color", color);
    localStorage.setItem("backgroundColor", color);
}

let color = window.localStorage.getItem("backgroundColor");
if(color) {
    let colorInput = document.getElementById("backgroundColor");
    colorInput.value = color;
    updateBackgroundColor(color);
}

let duration = window.localStorage.getItem("duration");
if(duration) {
    let durationInput = document.getElementById("duration");
    durationInput.value = duration * 60 - 1;
}

function copyJSON() {
    let json = {
        backgroundColor: localStorage.getItem("backgroundColor"),
        duration: localStorage.getItem("duration"),
        objects: JSON.parse(localStorage.getItem("objects"))
    };

    let JSONText = JSON.stringify(json);

    let textArea = document.createElement("textarea");
    textArea.value = JSONText;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
}

function loadJSON() {
    let JSONText = document.getElementById("JSONInput").value;
    let JSONData = null;

    try {
        JSONData = JSON.parse(JSONText);
    } catch(e) {
        console.error("Invalid JSON", e);
        exportAnimation();
        return;
    }

    if(!JSONData.backgroundColor || !JSONData.duration || !JSONData.objects) {
        console.error("Invalid JSON");
        exportAnimation();
        return;
    }

    localStorage.setItem("backgroundColor", JSONData.backgroundColor);
    localStorage.setItem("duration", JSONData.duration);
    localStorage.setItem("objects", JSON.stringify(JSONData.objects));

    location.reload();
}

function toggleIsolationMode(button) {
    isolationModeOn = !isolationModeOn;
    button.textContent = isolationModeOn ? "Do not isolate" : "Isolate";

    // if(!isolationModeOn) {
    //     isolatedObjects = [];
    // }

    createObjects(objects);
}