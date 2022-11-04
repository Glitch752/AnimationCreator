let timelineDragStart = null;
let timelineDragStartPosition = null;
let draggingTimeline = false;

let totalMinutes = localStorage.getItem("duration") || 2;

let markerSelected = null;

let lastObjects = [];

let playingTimeline = false;

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
                <div class="timeline-column-header-title">
                    <div id="playButton" class="play-button ${playingTimeline === true ? "hidden" : ""}" onpointerdown="playTimeline()">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                            <!--! Font Awesome Pro 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
                            <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/>
                        </svg>
                    </div>
                    <div id="pauseButton" class="pause-button ${playingTimeline === false ? "hidden" : ""}" onpointerdown="pauseTimeline()">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                            <!--! Font Awesome Pro 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
                            <path d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"/>
                        </svg>
                    </div>
                </div>
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
        
        markerSelected = null;
        refreshTimeline(lastObjects);

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
        case " ": {
            if(!playingTimeline) {
                playTimeline();
            } else {
                pauseTimeline();
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

    if(selectedElement === false) return;
    setSelectionPosition(selectedElement);
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
    clickSelection({target: lastObjects[object]});
}

let playingInterval = null;

function playTimeline() {
    playingTimeline = true;
    document.getElementById("playButton").style.display = "none";
    document.getElementById("pauseButton").style.display = "block";

    playingInterval = setInterval(() => {
        let timelineMarker = document.getElementById("timelineMarker");
        let distance = parseFloat(timelineMarker.style.getPropertyValue("--distance")) || 0;
        if(distance >= (totalMinutes * 60 - 1) * 19) {
            pauseTimeline();
            return;
        }

        markerSelected = null;

        timelineMarker.style.setProperty("--distance", (distance + (19 / 60)) + "px");
        updateElementPositions(distance / 19);
    }, 1000 / 60);
}
function pauseTimeline() {
    playingTimeline = false;
    document.getElementById("playButton").style.display = "block";
    document.getElementById("pauseButton").style.display = "none";

    clearInterval(playingInterval);
}