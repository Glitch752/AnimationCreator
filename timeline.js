let timelineDragStart = null;
let timelineDragStartPosition = null;
let draggingTimeline = false;

let totalMinutes = localStorage.getItem("duration") || 2;

let markerSelected = null;

let lastObjects = [];

function refreshTimeline(objects) {
    lastObjects = objects;

    let timeline = document.getElementById("timeline");

    let times = "";

    for (let i = 0; i < totalMinutes; i++) {
        let seconds = 60;
        if(i === Math.ceil(totalMinutes) - 1) {
            seconds = (totalMinutes - i) * 60;
        }

        for(let j = i === 0 ? 1 : 0; j < seconds; j++) {
            if(j % 2 === 1) {
                times += `
                    <div class="timeline-column-body-time">
                        <div class="timeline-column-dark-row"></div>
                        <span class="timeline-text">${getformattedTime(i, j)}</span>
                    </div>`;
            } else {
                times += `
                    <div class="timeline-column-body-time timeline-text">${getformattedTime(i, j)}</div>`;
            }
        }
    }

    let headers = ``;
    for(let i = 0; i < objects.length; i++) {
        headers += `
            <div class="timeline-column-header">
                <div class="timeline-column-header-title" onpointerdown="clickObjectHeader(${i})">${i}</div>
            </div>
        `;
    }

    timeline.innerHTML = `
        <div class="timeline-headers">
            <div class="timeline-column-header timeline-column-header-time">
                <div class="timeline-column-header-title">Time</div>
            </div>
            ${headers}
        </div>
        <!-- Time column -->
        <div class="timeline-column timeline-column-time">
            <div class="timeline-column-body" id="timelineColumnTimes">
                ${times}
            </div>
        </div>
    `;

    for (let i = 0; i < objects.length; i++) {
        const object = objects[i];

        let markers = ``;

        let keyframes = JSON.parse(object.dataset.keyframes || "[]");

        for(let j = 0; j < keyframes.length; j++) {
            const marker = keyframes[j];

            markers += `
                <div class="timeline-column-line-marker ${(markerSelected !== null && i === markerSelected.object && j === markerSelected.marker) ? "selected" : ""}" style="--height: ${marker.time}" onpointerdown="mouseDownMarker(${i}, ${j}, ${marker.time})"></div>
            `;
        }
        
        timeline.innerHTML += `
            <div class="timeline-column">
                <div class="timeline-column-line ${(selectionDraggingDirection !== false && selectedElement == object) ? "selected" : ""}">
                    ${markers}
                </div>
            </div>
        `;
    }

    timeline.style.setProperty("--width", timeline.scrollWidth + "px");
    timeline.style.setProperty("--height", timeline.scrollHeight + "px");
}

let timelineDrag = document.getElementById("timelineDrag");
timelineDrag.addEventListener("pointerdown", mouseDownTimeline);

function mouseDownTimeline(e) {
    timelineDragStart = e.clientY;
    draggingTimeline = true;

    let timelineMarker = document.getElementById("timelineMarker");
    timelineDragStartPosition = parseFloat(timelineMarker.style.getPropertyValue("--distance")) || 0;

    e.preventDefault();
}

addGlobalListener("mousemove", function(e) {
    if(draggingTimeline) {
        let currentY = e.clientY;
        let difference = currentY - timelineDragStart;
        let distance = timelineDragStartPosition + difference;

        distance = Math.max(0, distance);
        let timelineHeight = document.getElementById("timelineColumnTimes").scrollHeight;
        distance = Math.min(timelineHeight, distance);
        
        let timelineMarker = document.getElementById("timelineMarker");
        timelineMarker.style.setProperty("--distance", distance + "px");

        updateElementPositions(distance / 19);
        
        e.preventDefault();
    }
});

addGlobalListener("mouseup", function(e) {
    timelineDragStart = null;
    draggingTimeline = false;
});

function updateTimelineScroll() {
    let timelineMarker = document.getElementById("timelineMarker");
    timelineMarker.style.setProperty("--scroll", document.getElementById("timeline").scrollTop + "px");
}

function getformattedTime(minutes, seconds) {
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`.trim();
}

addGlobalListener("keydown", function(e) {
    switch(e.key) {
        case "k": {
            // Add a keyframe to the currently selected element
            if(selectedElement !== null) {
                let currentKeyframes = selectedElement.dataset.keyframes;
                if(currentKeyframes === undefined) currentKeyframes = "[]";
                currentKeyframes = JSON.parse(currentKeyframes);

                let currentTime = (parseFloat(document.getElementById("timelineMarker").style.getPropertyValue("--distance"))) / 19;
                if(!currentTime) currentTime = 0;

                currentKeyframes.push({
                    time: currentTime,
                    data: {
                        x: selectedElement.style.getPropertyValue("--offsetX"),
                        y: selectedElement.style.getPropertyValue("--offsetY"),
                        width: selectedElement.style.getPropertyValue("--width"),
                        height: selectedElement.style.getPropertyValue("--height")
                    }
                });

                selectedElement.dataset.keyframes = JSON.stringify(currentKeyframes);

                updateObjectList();
            }
            break;
        }
        case "Delete":
        case "Backspace": {
            if(markerSelected !== null) {
                let currentKeyframes = lastObjects[markerSelected.object].dataset.keyframes;
                if(currentKeyframes === undefined) currentKeyframes = "[]";
                currentKeyframes = JSON.parse(currentKeyframes);

                currentKeyframes.splice(markerSelected.marker, 1);

                lastObjects[markerSelected.object].dataset.keyframes = JSON.stringify(currentKeyframes);

                markerSelected = null;
                updateObjectList();
            }
            break;
        }
    }
});

function clickObjectHeader(index) {
    let originalObject = document.querySelector(`.object[data-index="${index}"]`);
    if(!originalObject) return;
    clickSelection({target: originalObject});
}

function updateDuration() {
    let duration = document.getElementById("duration");
    totalMinutes = (parseFloat(duration.value) + 1) / 60;
    updateObjectList();

    localStorage.setItem("duration", totalMinutes);
}

function updateElementPositions(time) {
    let elements = document.getElementsByClassName("object");
    for(let i = 0; i < elements.length; i++) {
        const element = elements[i];
        let keyframes = JSON.parse(element.dataset.keyframes || "[]");

        let previousKeyframe = null;
        let nextKeyframe = null;

        for(let j = 0; j < keyframes.length; j++) {
            const keyframe = keyframes[j];
            if(keyframe.time <= time) {
                previousKeyframe = keyframe;
            } else {
                nextKeyframe = keyframe;
                break;
            }
        }

        if(previousKeyframe === null) {
            previousKeyframe = {
                time: 0,
                data: { 
                    x: getComputedStyle(element).getPropertyValue("--offsetX"),
                    y: getComputedStyle(element).getPropertyValue("--offsetY"),
                    width: getComputedStyle(element).getPropertyValue("--width"),
                    height: getComputedStyle(element).getPropertyValue("--height")
                }
            }
        }
        
        if(nextKeyframe === null) {
            element.style.setProperty("--offsetX", previousKeyframe.data.x);
            element.style.setProperty("--offsetY", previousKeyframe.data.y);
            element.style.setProperty("--width", previousKeyframe.data.width);
            element.style.setProperty("--height", previousKeyframe.data.height);
        } else {
            let difference = nextKeyframe.time - previousKeyframe.time;
            let progress = (time - previousKeyframe.time) / difference;

            let x = interpolate(parseFloat(previousKeyframe.data.x), parseFloat(nextKeyframe.data.x), progress);
            let y = interpolate(parseFloat(previousKeyframe.data.y), parseFloat(nextKeyframe.data.y), progress);
            let width = interpolate(parseFloat(previousKeyframe.data.width), parseFloat(nextKeyframe.data.width), progress);
            let height = interpolate(parseFloat(previousKeyframe.data.height), parseFloat(nextKeyframe.data.height), progress);

            element.style.setProperty("--offsetX", x + "px");
            element.style.setProperty("--offsetY", y + "px");
            element.style.setProperty("--width", width + "px");
            element.style.setProperty("--height", height + "px");
        }
    }
}

function interpolate(a, b, t, ease = "ease-in-out") {
    if(ease === "linear") {
        return a + (b - a) * t;
    } else if(ease === "ease-in-out") {
        return a + (b - a) * easeInOut(t);
    } else if(ease === "ease-in") {
        return a + (b - a) * easeIn(t);
    } else if(ease === "ease-out") {
        return a + (b - a) * easeOut(t);
    }
}

function easeInOut(time) {
    return time < 0.5 ? 2 * time * time : -1 + (4 - 2 * time) * time;
}
function easeIn(time) {
    return time * time;
}
function easeOut(time) {
    return time * (2 - time);
}

function mouseDownMarker(object, marker, time) {
    markerSelected = {
        object: object,
        marker: marker
    };

    let timelineMarker = document.getElementById("timelineMarker");
    timelineMarker.style.setProperty("--distance", (time * 19) + "px");

    updateElementPositions(time);
}