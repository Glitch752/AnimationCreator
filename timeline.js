let timelineDragStart = null;
let timelineDragStartPosition = null;
let draggingTimeline = false;

let totalMinutes = localStorage.getItem("duration") || 2;

let markerSelected = null;

let playingTimeline = false;

function refreshTimeline() {
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

                    ${selectedElement ? `<svg class="keyframe-editor-button" onpointerdown="openKeyrameEditor()" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
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
        
        let keyframes = object.keyframes || [];

        for(let j = 0; j < keyframes.length; j++) {
            const marker = keyframes[j];

            markers += `
                <div class="timeline-column-line-marker ${(markerSelected !== null && i === markerSelected.object && j === markerSelected.marker) ? "selected" : ""}" style="--height: ${marker.time}" onpointerdown="mouseDownMarker(${i}, ${j}, ${marker.time})"></div>
            `;
        }
        
        timeline.innerHTML += `
            <div class="timeline-column">
                <div class="timeline-column-line ${(parseInt(selectedElement?.dataset?.index) === i) ? "selected" : ""}">
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
            refreshTimeline();
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
                let currentKeyframes = objects[selectedElement.dataset.index].keyframes;
                if(!currentKeyframes) currentKeyframes = [];

                let currentTime = (parseFloat(document.getElementById("timelineMarker").style.getPropertyValue("--distance"))) / 19;
                if(!currentTime) currentTime = 0;

                currentKeyframes.push({
                    time: currentTime,
                    data: {
                        x: selectedElement.style.getPropertyValue("--offsetX"),
                        y: selectedElement.style.getPropertyValue("--offsetY"),
                        width: selectedElement.style.getPropertyValue("--width"),
                        height: selectedElement.style.getPropertyValue("--height")
                    },
                    timingFunction: "easeInOut"
                });

                objects[selectedElement.dataset.index].keyframes = currentKeyframes;

                updateObjectList();
            }
            break;
        }
        case "Delete":
        case "Backspace": {
            if(markerSelected !== null) {
                let currentKeyframes = objects[markerSelected.object].keyframes;
                if(currentKeyframes === undefined) currentKeyframes = "[]";
                currentKeyframes = JSON.parse(currentKeyframes);

                currentKeyframes.splice(markerSelected.marker, 1);

                objects[markerSelected.object].keyframes = JSON.stringify(currentKeyframes);

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
    for(let i = 0; i < objects.length; i++) {
        const object = objects[i];
        let keyframes = object.keyframes || [];

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
                },
                timingFunction: "easeInOut"
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

            let timing = previousKeyframe.timingFunction || "easeInOut";

            let data = previousKeyframe.data;

            let x = interpolate(parseFloat(previousKeyframe.data.x), parseFloat(nextKeyframe.data.x), progress, timing, data);
            let y = interpolate(parseFloat(previousKeyframe.data.y), parseFloat(nextKeyframe.data.y), progress, timing, data);
            let width = interpolate(parseFloat(previousKeyframe.data.width), parseFloat(nextKeyframe.data.width), progress, timing, data);
            let height = interpolate(parseFloat(previousKeyframe.data.height), parseFloat(nextKeyframe.data.height), progress, timing, data);

            object.x = x;
            object.y = y;
            object.width = width;
            object.height = height;
        }

        let element = document.querySelector(`.object[data-index="${i}"]`);
        element.style.setProperty("--offsetX", object.x);
        element.style.setProperty("--offsetY", object.y);
        element.style.setProperty("--width", object.width);
        element.style.setProperty("--height", object.height);
    }

    if(selectedElement === false) return;
    setSelectionPosition(objects[selectedElement.dataset.index]);
}

function interpolate(a, b, t, ease = "easeInOut", data = {}) {
    if(ease === "linear") {
        return a + (b - a) * t;
    } else if(ease === "easeInOut") {
        return a + (b - a) * easeInOut(t);
    } else if(ease === "easeIn") {
        return a + (b - a) * easeIn(t);
    } else if(ease === "easeOut") {
        return a + (b - a) * easeOut(t);
    } else if(ease === "bounce") {
        return a + (b - a) * bounce(t);
    } else if(ease === "elastic") {
        return a + (b - a) * elastic(t); 
    } else if(ease === "bounceReversed") {
        return a + (b - a) * bounceReversed(t);
    } else if(ease === "elasticReversed") {
        return a + (b - a) * elasticReversed(t);
    } else if(ease === "step") {
        return a + (b - a) * step(t, data.steps || 10);
    } else if(ease === "bezier") {
        // FIXME: Currently creates infinite loops, temporarily disabled.
        return a + (b - a) * bezier(t, 0.25, 0.1, 0.25, 1);
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

function bounce(time) {
    for(let a = 0, b = 1; 1; a += b, b /= 2) {
        if(time >= (7 - 4 * a) / 11) {
            return -Math.pow((11 - 6 * a - 11 * time) / 4, 2) + Math.pow(b, 2);
        }
    }
}

function elastic(time) {
    return Math.pow(2, 10 * (time - 1)) * Math.cos(20 * Math.PI * 1.5 / 3 * time);
}

function step(time, steps) {
    return Math.floor(time * steps) / steps;
}

function bounceReversed(time) {
    return 1 - bounce(1 - time);
}

function elasticReversed(time) {
    return 1 - elastic(1 - time);
}


// Currently creates infinite loops, temporarily disabled.
// function bezier(t, x1, y1, x2, y2, duration = 50) {
//     // For a certain time from 0 to 1 in a cubic bezier curve, find a single y value.
//     // This function should mimic the result of CSS bezier curve timings.
//     let epsilon = (1000 / 60 / duration) / 4;

//     const curveX = (t) => {
// 		let v = 1 - t;
// 		return 3 * v * v * t * x1 + 3 * v * t * t * x2 + t * t * t;
// 	};

// 	const curveY = (t) => {
// 		let v = 1 - t;
// 		return 3 * v * v * t * y1 + 3 * v * t * t * y2 + t * t * t;
// 	};

// 	const derivativeCurveX = (t) => {
// 		let v = 1 - t;
// 		return 3 * (2 * (t - 1) * t + v * v) * x1 + 3 * (- t * t * t + 2 * v * t) * x2;
// 	};

//     var x = t, t0, t1, t2, x2, d2, i;

//     // Try Newton's method
//     for (t2 = x, i = 0; i < 8; i++) {
//         x2 = curveX(t2) - x;
//         if (Math.abs(x2) < epsilon) return curveY(t2);

//         d2 = derivativeCurveX(t2);
//         if (Math.abs(d2) < 1e-6) break;

//         t2 = t2 - x2 / d2;
//     }

//     t0 = 0, t1 = 1, t2 = x;

//     if (t2 < t0) return curveY(t0);
//     if (t2 > t1) return curveY(t1);

//     // Use the bisection method if necessary
//     while (t0 < t1) {
//         x2 = curveX(t2);
//         if (Math.abs(x2 - x) < epsilon) return curveY(t2);

//         if (x > x2) {
//             t0 = t2;
//         } else {
//             t1 = t2;
//         }

//         t2 = (t1 - t0) * 0.5 + t0;
//     }

//     // If we got here, we didn't find a solution
//     return curveY(t2);
// }

function mouseDownMarker(object, marker, time) {
    markerSelected = {
        object: object,
        marker: marker
    };

    let timelineMarker = document.getElementById("timelineMarker");
    timelineMarker.style.setProperty("--distance", (time * 19) + "px");

    updateElementPositions(time);
    clickSelection({target: document.querySelector(`.object[data-index="${object}"]`)});
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
    
    document.getElementById("keyframeTiming").classList.remove("shown");

    let objectData = objects[selectedElement.dataset.index];
    let keyframeData = objectData?.keyframes?.map(k => {
        return {time: k.time, data: k.data[keyframe]};
    });

    if(!keyframeData) keyframeData = [];

    let maxValue = 0, minValue = 0;
    for(let i = 0; i < keyframeData.length; i++) {
        const value = keyframeData[i].data;
        if(parseFloat(value) > maxValue) maxValue = parseFloat(value);
        if(parseFloat(value) < minValue) minValue = parseFloat(value);
    }

    let range = maxValue - minValue;

    let keyframes = document.getElementById("keyframes");

    let times = ``, markers = ``, lines = ``, values = ``;

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
            <div class="keyframe-editor-marker" data-keyframe="${i}" style="--distance: ${time}; --height: ${(parseFloat(data) - minValue) / range};"></div>
        `;

        if(nextKeyframe === null) continue;

        let yMultiplier = parseFloat(getComputedStyle(document.getElementById("keyframes")).getPropertyValue("height")) - 45;

        let xDifference = (nextKeyframe.time - keyframe.time) * 100;
        let yDifference = (((parseFloat(nextKeyframe.data) - minValue) - (parseFloat(keyframe.data) - minValue)) / range) * yMultiplier;

        let rotation = -Math.atan2(yDifference, xDifference) * 180 / Math.PI;
        let length = Math.sqrt(Math.pow(xDifference, 2) + Math.pow(yDifference, 2));

        lines += `
            <div class="keyframe-editor-line" onpointerdown="clickKeyframeLine(this)" data-keyframe="${i}" style="--x: ${time}; --y: ${(parseFloat(data) - minValue) / range}; --rotation: ${rotation}deg; --length: ${length}px;"></div>
        `;
    }

    let valueMarks = 10;

    for(let i = 0; i <= valueMarks; i++) {
        values += `
        <div class="keyframe-editor-value" style="--height: ${i / valueMarks};">
            <span class="keyframe-editor-value-text">${Math.round(minValue + (maxValue - minValue) * (i / valueMarks))}</span>
            <div class="keyframe-editor-value-line"></div>
        </div>`;
    }

    keyframes.innerHTML = `
        <div class="keyframe-editor-times">
            <div class="keyframe-editor-values">
                ${values}
            </div>
            ${times}
            ${lines}
            ${markers}
        </div>
    `;
}

let selectedLine = null;

function clickKeyframeLine(element) {
    let currentSelected = document.querySelectorAll(".keyframe-editor-line.selected");
    currentSelected.forEach(e => e.classList.remove("selected"));

    element.classList.add("selected");

    let keyframeTiming = document.getElementById("keyframeTiming");
    keyframeTiming.classList.add("shown");

    selectedLine = {
        index: parseInt(element.dataset.keyframe)
    };

    let timingFunction = objects[selectedElement.dataset.index].keyframes[selectedLine.index]?.timingFunction || "easeInOut";
    document.getElementById("keyframeTimingFunction").value = timingFunction;
    
    document.querySelectorAll(".keyframe-timing-custom.shown").forEach(e => e.classList.remove("shown"));

    let keyframeTimingFunction = document.getElementById("keyframeTimingFunction");
    let selected = keyframeTimingFunction.children[keyframeTimingFunction.selectedIndex];
    let custom = selected.dataset.custom === "true";
    if(custom) {
        let showID = selected.dataset.showId;
        document.getElementById(showID).classList.add("shown");

        let dataIDs = {
            "step": [
                {
                    id: "stepCountInput",
                    value: "steps"
                }
            ]
        };

        if(dataIDs[timingFunction]) {
            dataIDs[timingFunction].forEach(data => {
                document.getElementById(data.id).value = objects[selectedElement.dataset.index].keyframes[selectedLine.index]?.data?.[data.value] || 1;
            });
        }
    }
}

function changeKeyframeTimingFunction(element) {    
    let selected = element.children[element.selectedIndex];
    
    document.querySelectorAll(".keyframe-timing-custom.shown").forEach(e => e.classList.remove("shown"));

    let custom = selected.dataset.custom === "true";
    if(custom) {
        let showID = selected.dataset.showId;
        document.getElementById(showID).classList.add("shown");
    }

    // Get the selected element's data
    let selectedELement = objects[selectedElement.dataset.index];
    let selectedKeyframe = selectedELement.keyframes[selectedLine.index];

    selectedKeyframe.timingFunction = element.value;
}

function changeKeyframeSteps(element) {
    // Get the selected element's data
    let selectedELement = objects[selectedElement.dataset.index];
    let selectedKeyframe = selectedELement.keyframes[selectedLine.index];

    selectedKeyframe.data.steps = element.value;
}