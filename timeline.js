let timelineDragStart = null;
let timelineDragStartPosition = null;
let draggingTimeline = false;

function refreshTimeline(objects) {
    let timeline = document.getElementById("timeline");

    let times = "";
    let totalMinutes = 2;

    for (let i = 0; i < totalMinutes; i++) {
        let minutes = i;
        let seconds = 0;

        for(let j = i === 0 ? 1 : 0; j < 60; j++) {
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
                <div class="timeline-column-header-title">${i}</div>
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
                <div class="timeline-column-line-marker" style="--height: ${marker.time}"></div>
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
        
        let timelineMarker = document.getElementById("timelineMarker");
        timelineMarker.style.setProperty("--distance", distance + "px");
        
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
    if(e.key === "k") {
        console.log(e.key);
        // Add a keyframe to the currently selected element
        if(selectedElement !== null) {
            let currentKeyframes = selectedElement.dataset.keyframes;
            if(currentKeyframes === undefined) currentKeyframes = "[]";
            currentKeyframes = JSON.parse(currentKeyframes);

            let currentTime = (parseFloat(document.getElementById("timelineMarker").style.getPropertyValue("--distance")) - 20) / 19;
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
    }
});