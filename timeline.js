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
        
        timeline.innerHTML += `
            <div class="timeline-column">
                <div class="timeline-column-line ${(selectionDraggingDirection !== false && selectedElement == object) ? "selected" : ""}">
                    <div class="timeline-column-line-marker" style="--height: 1"></div>
                    <div class="timeline-column-line-marker" style="--height: 3"></div>
                    <div class="timeline-column-line-marker" style="--height: 7"></div>
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

        console.log(distance);
        
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