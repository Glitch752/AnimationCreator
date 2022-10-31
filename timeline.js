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
                    <div class="timeline-column-body-time">${getformattedTime(i, j)}</div>`;
            }
        }
    }

    timeline.innerHTML = `
        <div class="timeline-marker" id="timelineMarker" onpointerdown="mouseDownTimeline()"></div>
        <!-- Time column -->
        <div class="timeline-column timeline-column-time">
            <div class="timeline-column-header">
                <div class="timeline-column-header-title">Time</div>
            </div>
            <div class="timeline-column-body" id="timelineColumnTimes">
                <br />
                ${times}
            </div>
        </div>
    `;

    for (let i = 0; i < objects.length; i++) {
        const object = objects[i];
        
        timeline.innerHTML += `
            <div class="timeline-column">
                <div class="timeline-column-header">
                    <div class="timeline-column-header-title">${i}</div>
                </div>
                <div class="timeline-column-line">
                    <div class="timeline-column-line-marker" style="--height: 3"></div>
                    <div class="timeline-column-line-marker" style="--height: 1"></div>
                    <div class="timeline-column-line-marker" style="--height: 4"></div>
                </div>
            </div>
        `;
    }
}

function mouseDownTimeline() {
    
}

function getformattedTime(minutes, seconds) {
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`.trim();
}