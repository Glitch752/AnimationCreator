function refreshTimeline(objects) {
    let timeline = document.getElementById("timeline");

    timeline.innerHTML = `
        <div class="timeline-marker" id="timelineMarker" onpointerdown="mouseDownTimeline()"></div>
        <!-- Time column -->
        <div class="timeline-column">
            <div class="timeline-column-header">
                <div class="timeline-column-header-title">Time</div>
            </div>
            <div class="timeline-column-body" id="timelineColumnTimes">
                <!-- <div class="timeline-column-body-time">0</div> -->
                <div class="timeline-column-body-time">0:01</div>
                <div class="timeline-column-body-time">0:02</div>
                <div class="timeline-column-body-time">0:03</div>
                <div class="timeline-column-body-time">0:04</div>
                <div class="timeline-column-body-time">0:05</div>
                <div class="timeline-column-body-time">0:06</div>
                <div class="timeline-column-body-time">0:07</div>
                <div class="timeline-column-body-time">0:08</div>
                <div class="timeline-column-body-time">0:09</div>
                <div class="timeline-column-body-time">0:10</div>
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