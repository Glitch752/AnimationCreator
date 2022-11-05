let timelineDragStart = null;
let timelineDragStartPosition = null;
let draggingTimeline = false;

let totalMinutes = localStorage.getItem("duration") || 2;

let markerSelected = null;

let lastObjects = [];
let lastObjectList = [];

let playingTimeline = false;

// FIXME: This code creates a lot of forced reflows, which is bad for performance

function refreshTimeline(objects, objectList) {
    lastObjects = objects;
    lastObjectList = objectList;

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

                    ${Array.from(objects).includes(selectedElement) ? `<svg class="keyframe-editor-button" onpointerdown="openKeyrameEditor()" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                        <!--! Font Awesome Pro 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
                        <path d="M64 64c0-17.7-14.3-32-32-32S0 46.3 0 64V400c0 44.2 35.8 80 80 80H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H80c-8.8 0-16-7.2-16-16V64zm406.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L320 210.7l-57.4-57.4c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L240 221.3l57.4 57.4c12.5 12.5 32.8 12.5 45.3 0l128-128z"/>
                    </svg>` : ""}
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
                <div class="timeline-column-line ${(selectedElement == object) ? "selected" : ""}">
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
        
        let oldMarkerSelected = markerSelected;
        markerSelected = null;
        if(oldMarkerSelected !== null) {
            refreshTimeline(lastObjects, lastObjectList);
        }

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
    for(let i = 0; i < lastObjectList.length; i++) {
        const object = lastObjectList[i];
        let keyframes = object.keyframes;

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
                    x: object.x,
                    y: object.y,
                    width: object.width,
                    height: object.height
                }
            }
        }
        
        if(nextKeyframe === null) {
            object.x = parseFloat(previousKeyframe.data.x);
            object.y = parseFloat(previousKeyframe.data.y);
            object.width = parseFloat(previousKeyframe.data.width);
            object.height = parseFloat(previousKeyframe.data.height);
        } else {
            let difference = nextKeyframe.time - previousKeyframe.time;
            let progress = (time - previousKeyframe.time) / difference;

            let x = interpolate(parseFloat(previousKeyframe.data.x), parseFloat(nextKeyframe.data.x), progress);
            let y = interpolate(parseFloat(previousKeyframe.data.y), parseFloat(nextKeyframe.data.y), progress);
            let width = interpolate(parseFloat(previousKeyframe.data.width), parseFloat(nextKeyframe.data.width), progress);
            let height = interpolate(parseFloat(previousKeyframe.data.height), parseFloat(nextKeyframe.data.height), progress);

            object.x = x;
            object.y = y;
            object.width = width;
            object.height = height;
        }

        let element = document.querySelector(`.object[data-index="${i}"]`);
        element.style.setProperty("--offsetX", object.x + "px");
        element.style.setProperty("--offsetY", object.y + "px");
        element.style.setProperty("--width", object.width + "px");
        element.style.setProperty("--height", object.height + "px");
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
        if(draggingTimeline) return;

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

function openKeyrameEditor() {
    document.getElementById("keyframeEditor").classList.toggle("open");
}

function selectKeyframeOption(element) {
    document.querySelectorAll(".keyframe-option.selected").forEach(e => e.classList.remove("selected"));
    element.classList.add("selected");

    refreshKeyframeEditor();
}

function refreshKeyframeEditor() {
    let selected = document.querySelector(".keyframe-option.selected");
    let keyframe = selected.dataset.keyframeOption;

    let objectData = lastObjectList[selectedElement.dataset.index];
    let keyframeData = objectData.keyframes.map(k => {
        return {time: k.time, data: k.data[keyframe]};
    });

    let maxValue = 1;
    for(let i = 0; i < keyframeData.length; i++) {
        const value = keyframeData[i].data;
        if(parseFloat(value) > maxValue) maxValue = parseFloat(value);
    }

    let keyframes = document.getElementById("keyframes");

    let times = ``, markers = ``, lines = ``;

    for (let i = 0; i < totalMinutes; i++) {
        let seconds = 60;
        if(i === Math.ceil(totalMinutes) - 1) {
            seconds = (totalMinutes - i) * 60;
        }

        for(let j = i === 0 ? 1 : 0; j < seconds; j++) {
            times += `
                <div class="keyframe-editor-time">
                    <span class="keyframe-editor-time-text">${getformattedTime(i, j)}</span>
                    <div class="keyframe-editor-time-line"></div>
                </div>`;
        }
    }

    times += `
        <div class="keyframe-editor-time">
            <div class="keyframe-editor-time-line"></div>
        </div>`;

    for(let i = 0; i < keyframeData.length; i++) {
        let keyframe = keyframeData[i];
        let nextKeyframe = keyframeData[i + 1] || null;
        let time = keyframe.time;
        let data = keyframe.data;

        markers += `
            <div class="keyframe-editor-marker" data-keyframe="${i}" style="--distance: ${time}; --height: ${parseFloat(data) / maxValue};"></div>
        `;

        if(nextKeyframe === null) continue;

        let yMultiplier = parseFloat(getComputedStyle(document.getElementById("keyframes")).getPropertyValue("height")) - 10;

        let xDifference = (nextKeyframe.time - keyframe.time) * 100;
        let yDifference = (parseFloat(nextKeyframe.data) - parseFloat(keyframe.data)) / maxValue * yMultiplier;

        console.log(xDifference, yDifference);

        let rotation = -Math.atan2(yDifference, xDifference) * 180 / Math.PI;
        let length = Math.sqrt(Math.pow(xDifference, 2) + Math.pow(yDifference, 2));

        lines += `
            <div class="keyframe-editor-line" data-keyframe="${i}" style="--x: ${time}; --y: ${parseFloat(data) / maxValue}; --rotation: ${rotation}deg; --length: ${length}px;"></div>
        `;
    }

    keyframes.innerHTML = `
        <div class="keyframe-editor-times">
            ${times}
            ${lines}
            ${markers}
        </div>
    `;
}