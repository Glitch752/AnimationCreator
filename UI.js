let navigationTabSelected = "add";
let rightNavigationButtons = document.querySelectorAll(".rightNavigationButton");
rightNavigationButtons.forEach(button => { button.addEventListener("click", selectTab.bind(null, button)) });

function selectTab(button) {
    tab = button.dataset.tab;

    let oldTab = navigationTabSelected;
    navigationTabSelected = tab;

    let oldTabElement = document.querySelector(`.leftContainerTab[data-tab="${oldTab}"]`);
    let tabElement = document.querySelector(`.leftContainerTab[data-tab="${tab}"]`);

    let oldButtonElement = document.querySelector(`.rightNavigationButton[data-tab="${oldTab}"]`);

    oldTabElement.classList.remove("selected");
    tabElement.classList.add("selected");

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

    let objects = document.querySelectorAll(".object");

    objectsList.innerHTML = "";

    const objectTypeNames = {
        "rectangle": "Rectangle",
        "circle": "Circle",
        "polygon": "Polygon",
        "imageClipboard": "Image",
        "line": "Line"
    };

    let objectList = [];

    for(let i = 0; i < objects.length; i++) {
        let object = objects[i];
        object.setAttribute("data-index", i)
        let objectType = object.dataset.objectType;
        objectsList.innerHTML += `<div class="objectListItem ${(selectionDraggingDirection !== false && selectedElement == object) ? "selected" : ""}" 
            onmouseenter="mouseEnterObjectList(this)" 
            onmouseleave="mouseLeaveObjectList(this)"
            onmousedown="mouseClickObjectList(this)"
            data-index="${i}">
                ${objectTypeNames[objectType] || "Unknown"}
                ${/*<span class="objectListRemove" onmousedown="deleteObject(${i})">X</span>*/""}
        </div>`;

        objectList.push({
            type:   objectType,
            x:      getComputedStyle(object).getPropertyValue("--offsetX"),
            y:      getComputedStyle(object).getPropertyValue("--offsetY"),
            width:  getComputedStyle(object).getPropertyValue("--width"  ),
            height: getComputedStyle(object).getPropertyValue("--height" ),
            data:   object.getAttribute("data-object-data")
        });
    }

    localStorage.setItem("objects", JSON.stringify(objectList));
}

function deleteObject(index) {
    let originalObject = document.querySelector(`.object[data-index="${index}"]`);

    originalObject.remove();

    deselectAddObject();
}

function mouseEnterObjectList(e) {
    let outline = document.getElementById("outline");
    outline.classList.add("shown");

    let originalObject = document.querySelector(`.object[data-index="${e.dataset.index}"]`);

    outline.style.setProperty("--offsetX", getComputedStyle(originalObject).getPropertyValue("--offsetX"));
    outline.style.setProperty("--offsetY", getComputedStyle(originalObject).getPropertyValue("--offsetY"));
    outline.style.setProperty("--width",   getComputedStyle(originalObject).getPropertyValue("--width")  );
    outline.style.setProperty("--height",  getComputedStyle(originalObject).getPropertyValue("--height") );
}

function mouseLeaveObjectList(e) {
    let outline = document.getElementById("outline");
    outline.classList.remove("shown");
}
function mouseClickObjectList(e) {
    let originalObject = document.querySelector(`.object[data-index="${e.dataset.index}"]`);
    clickSelection({target: originalObject});
}