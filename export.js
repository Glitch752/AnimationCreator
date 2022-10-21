let capturer = null;

function runExport() {
    let exportType = document.querySelector(".select#exportType .selected").dataset.exportType;
    let resolutionElement = document.querySelector(".select#resolution .selected");

    let width = null, height = null;

    if(resolutionElement.dataset.custom === "true") {
        width = document.getElementById("customWidth").value;
        height = document.getElementById("customHeight").value;
    } else {
        width = resolutionElement.dataset.width;
        height = resolutionElement.dataset.height;
    }

    let fpsElement = document.querySelector(".select#frameRate .selected");

    let fps = null;

    if(fpsElement.dataset.custom === "true") {
        fps = document.getElementById("customFrameRateInput").value;
    } else {
        fps = fpsElement.dataset.framerate;
    }

    // alert(`Exporting animation with the following settings:
    // Export Type: ${exportType}
    // Resolution: ${width}x${height}
    // Frame Rate: ${fps}`);

    createExportCanvas(width, height);

    capturer = new CCapture({
        format: exportType,
        framerate: fps,
        verbose: true,
        name: "animation",
        quality: 100,
        // workersPath: "js/",
    });

    frame = 0;

    capturer.start();
	renderFrame(0);

    exportAnimation();
}

let frame = 0;

function renderFrame(time) {
    requestAnimationFrame(renderFrame);

    let canvas = document.getElementById("exportCanvas");
    let ctx = canvas.getContext("2d");

    let widthMultiplier = canvas.width / parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--current-width"));
    let heightMultiplier = canvas.height / parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--current-height"));

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.fillStyle = `${getComputedStyle(document.documentElement).getPropertyValue("--background-color")}`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.setTransform(widthMultiplier, 0, 0, heightMultiplier, 0, 0);

    // Update the animation
    let seconds = time / 1000;

    // console.log(seconds);
    
    let objects = JSON.parse(localStorage.getItem("objects"));
    for (let i = 0; i < objects.length; i++) {
        const object = objects[i];
        
        ctx.fillStyle = "white";

        switch(object.type) {
            case "rectangle":
                ctx.fillRect(
                    parseFloat(object.x),
                    parseFloat(object.y),
                    parseFloat(object.width),
                    parseFloat(object.height));
                break;
            case "circle":
                let { x, y, width, height } = object;

                ctx.beginPath();
                ctx.ellipse(
                    parseFloat(x) + parseFloat(width) / 2,
                    parseFloat(y) + parseFloat(height) / 2,
                    parseFloat(width) / 2,
                    parseFloat(height) / 2,
                    0, 0, 2 * Math.PI);
                ctx.fill();
                break;
        }
    }
    
    frame++;
    if(frame > 60) {
        stopCapture();
        return;
    }
    
    capturer.capture( canvas );
}

function stopCapture() {
    capturer.stop();
    capturer.save();
}

function createExportCanvas(width, height) {
    let canvas = document.createElement("canvas");

    canvas.id = "exportCanvas";
    canvas.className = "exportCanvas";
    canvas.width = width;
    canvas.height = height;
    document.body.appendChild(canvas);

    return canvas;
}