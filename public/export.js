let capturer = null;
let exportType = null;

function runExport() {
    exportType = document.querySelector(".select#exportType .selected")?.dataset?.exportType;
    let resolutionElement = document.querySelector(".select#resolution .selected");

    let width = null, height = null;

    if(resolutionElement?.dataset?.custom === "true") {
        width = document.getElementById("customWidth").value;
        height = document.getElementById("customHeight").value;
    } else {
        width = resolutionElement?.dataset?.width;
        height = resolutionElement?.dataset?.height;
    }

    let fpsElement = document.querySelector(".select#frameRate .selected");

    let fps = null;

    if(fpsElement?.dataset?.custom === "true") {
        fps = document.getElementById("customFrameRateInput").value;
    } else {
        fps = fpsElement?.dataset?.framerate;
    }
    
    if(!width || !height || !fps || !exportType) {
        let errorBox = document.getElementById("errorBox");
        errorBox.classList.add("shown");

        if(!width || !height) {
            errorBox.innerHTML = "Please select a resolution";
        } else if(!fps) {
            errorBox.innerHTML = "Please select a frame rate";
        } else if(!exportType) {
            errorBox.innerHTML = "Please select an export type";
        }

        return;
    }
    
    exportAnimation();

    framerate = fps;

    createExportCanvas(width, height);

    capturer = new CCapture({
        format: exportType,
        framerate: fps,
        verbose: false,
        name: "animation",
        quality: 100,
        // workersPath: "js/",
    });

    frame = 0;

    capturer.start();
	renderFrame(0);
}

let frame = 0;

function renderFrame() {
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
    let seconds = frame / framerate;
    
    let objects = JSON.parse(localStorage.getItem("objects"));
    objects = getPositionsFromKeyframes(objects, seconds);

    for (let i = 0; i < objects.length; i++) {
        const object = objects[i];
        
        ctx.fillStyle = object.color || "#ffffff";
        ctx.strokeStyle = object.color || "#ffffff";

        switch(object.type) {
            default: {
                ctx.fillRect(
                    parseFloat(object.x),
                    parseFloat(object.y),
                    parseFloat(object.width),
                    parseFloat(object.height));
                break;
            }
            case "circle": {
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
            case "polygon": {
                let { x, y, width, height, data } = object;

                let points = {
                    3: [
                        [0.5, 0],
                        [0, 1],
                        [1, 1],
                    ],
                    4: [
                        [0, 0],
                        [1, 0],
                        [1, 1],
                        [0, 1],
                    ],
                    5: [
                        [0.5, 0],
                        [1, 0.38],
                        [0.82, 1],
                        [0.18, 1],
                        [0, 0.38],
                    ],
                    6: [
                        [0.25, 0],
                        [0.75, 0],
                        [1, 0.5],
                        [0.75, 1],
                        [0.25, 1],
                        [0, 0.5],
                    ],
                    7: [
                        [0.5, 0],
                        [0.9, 0.2],
                        [1, 0.6],
                        [0.75, 1],
                        [0.25, 1],
                        [0, 0.6],
                        [0.1, 0.2],
                    ],
                    8: [
                        [0.3, 0],
                        [0.7, 0],
                        [1, 0.3],
                        [1, 0.7],
                        [0.7, 1],
                        [0.3, 1],
                        [0, 0.7],
                        [0, 0.3],
                    ],
                    9: [
                        [0.5, 0],
                        [0.83, 0.12],
                        [1, 0.43],
                        [0.94, 0.78],
                        [0.68, 1],
                        [0.32, 1],
                        [0.06, 0.78],
                        [0, 0.43],
                        [0.17, 0.12],
                    ],
                    10: [
                        [0.5, 0],
                        [0.8, 0.1],
                        [1, 0.35],
                        [1, 0.7],
                        [0.8, 0.9],
                        [0.5, 1],
                        [0.2, 0.9],
                        [0, 0.7],
                        [0, 0.35],
                        [0.2, 0.1],
                    ]
                };

                let pointsToDraw = points[data.sides];

                ctx.beginPath();
                for(let i = 0; i < pointsToDraw.length; i++) {
                    let point = pointsToDraw[i];

                    let nX = parseFloat(x) + parseFloat(width)  * point[0];
                    let nY = parseFloat(y) + parseFloat(height) * point[1];

                    if(i === 0) {
                        ctx.moveTo(nX, nY);
                    } else {
                        ctx.lineTo(nX, nY);
                    }
                }
                ctx.closePath();
                ctx.fill();
                break;
            }
            case "imageClipboard": {
                ctx.fillRect(
                    parseFloat(object.x),
                    parseFloat(object.y),
                    parseFloat(object.width),
                    parseFloat(object.height));
                break;
            }
            case "text": {
                let { x, y, width, height, data } = object;

                x = parseFloat(x);
                y = parseFloat(y);
                width = parseFloat(width);
                height = parseFloat(height);

                let fontSize = data.size || 50;
                let lineHeight = data.lineHeight || 50;
                let font = `${fontSize}px ${data.font || "monospace"}`;

                ctx.textAlign = data.textAlign || "left";

                if(data.italic) {
                    font = `italic ${font}`;
                }
                if(data.bold) {
                    font = `bold ${font}`;
                }

                // TODO: Fix lineHeight either here or in CSS so they behave the same:
                // Currently CSS basically centers the text in the middle of a box with size lineHeight.

                ctx.font = `${font}`;
                
                // Break the text into multiple lines and word wrap whenever necessary. If the word is too long to fit on a line, it will be split up.
                let lines = [];
                let words = data.text.split("\n").join(" \n ").split(" ");
                let currentLine = "";

                for(let i = 0; i < words.length; i++) {
                    let word = words[i];

                    if(word === "\n") {
                        lines.push(currentLine);
                        currentLine = "";
                        continue;
                    }
                    
                    if(ctx.measureText(word).width > width) {
                        let splitWord = word.split("");
                        let currentWord = "";
                        for(let i = 0; i < splitWord.length; i++) {
                            let letter = splitWord[i];
                            if(ctx.measureText(currentWord + letter).width > width) {
                                lines.push(currentWord);
                                currentWord = "";
                            }
                            currentWord += letter;
                        }
                        lines.push(currentWord);
                    }

                    if(ctx.measureText(currentLine + word).width > width) {
                        lines.push(currentLine);
                        currentLine = word + " ";
                    } else {
                        currentLine += word + " ";
                    }
                }

                lines.push(currentLine);

                // If the text is higher than the object, remove lines from the bottom until it fits. If the height ends up on a portion of text, clip the text.
                while((lines.length - 2) * lineHeight + fontSize > height) {
                    lines.pop();
                }

                let xOffset = 0;
                if(data.textAlign === "center") {
                    xOffset = width / 2;
                } else if(data.textAlign === "right") {
                    xOffset = width;
                }

                // Draw the text
                for(let i = 0; i < lines.length; i++) {
                    let line = lines[i];
                    if((i * lineHeight + fontSize) > height) {
                        // let offset = (i * lineHeight) - height;
                        // Clip the text
                        ctx.save();
                        ctx.beginPath();
                        ctx.rect(x, y, width, height);
                        ctx.clip();
                        ctx.fillText(line, x + xOffset, y + (i + 1) * lineHeight);
                        ctx.restore();
                    } else {
                        ctx.fillText(line, x + xOffset, y + (i + 1) * lineHeight);
                    }
                }
                break;
            }
        }
    }
    
    frame++;
    if(frame > (duration * 60 - 1) * framerate) {
        stopCapture();
        return;
    }
    
    capturer.capture( canvas );
}

function stopCapture() {
    capturer.stop();
    // Check if the export type is webm
    if(exportType === "webm") {
        // Instead of saving, get the video as a blob and send it to the server.
        capturer.save( function( blob ) {
            console.log("Saving WEBM");
            let audioBlob = getAudio();
            // Send the video to the server with an XMLHttpRequest.
            let xhr = new XMLHttpRequest();
            xhr.responseType = "blob";
            let formData = new FormData();
            formData.append("video", blob);
            formData.append("audio", audioBlob);
            xhr.open("POST", "/upload");
            xhr.send(formData);

            // If we get no response or an error, simply download the video.
            xhr.onload = function() {
                console.log("XHR request finished.");
                if(xhr.status !== 200) {
                    capturer.save();
                } else {
                    let blob = xhr.response;

                    // Download the blob
                    download(blob, "animation.webm", "video/webm");
                }
            }

            return false;
        });
    } else {
        capturer.save();
    }

    let canvas = document.getElementById("exportCanvas");
    canvas.remove();
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

function getPositionsFromKeyframes(objects, time) {
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
            object.x =      previousKeyframe.data.x;
            object.y =      previousKeyframe.data.y;
            object.width =  previousKeyframe.data.width;
            object.height = previousKeyframe.data.height;
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
    }

    return objects;
}

// getAudio() returns a wav blob of the audio.
// For now, we don't have any audio, so we just return a blob of a 3khz sine wave.
function getAudio() {
    // First, define our basic sine wave.
    let sampleRate = 44100;
    let frequency = 3000;
    let length = duration * 60;
    let amplitude = 0.1;

    // Next, create an array of samples.
    let samples = new Float32Array(sampleRate * length);
    // For each sample we need, calculate the value of the sine wave.
    for(let i = 0; i < samples.length; i++) {
        samples[i] = amplitude * Math.sin(2 * Math.PI * frequency * i / sampleRate);
    }

    return new Blob([encodeWAV(samples, sampleRate)], {type: "audio/wav"});
}

// This function takes a Float32Array of samples and a sample rate and returns a wav file stored as a Blob.
function encodeWAV(samples, sampleRate) {
    let buffer = new ArrayBuffer(44 + samples.length * 2);
    let view = new DataView(buffer);

    // RIFF identifier
    writeString(view, 0, "RIFF");
    // file length
    view.setUint32(4, 32 + samples.length * 2, true);
    // RIFF type
    writeString(view, 8, "WAVE");
    // format chunk identifier
    writeString(view, 12, "fmt ");
    // format chunk length
    view.setUint32(16, 16, true);
    // sample format (raw)
    view.setUint16(20, 1, true);
    // channel count
    view.setUint16(22, 1, true);
    // sample rate
    view.setUint16(24, sampleRate, true);
    // byte rate (sample rate * block align)
    view.setUint32(28, sampleRate * 2, true);
    // block align (channel count * bytes per sample)
    view.setUint16(32, 2, true);
    // bits per sample
    view.setUint16(34, 16, true);
    // data chunk identifier
    writeString(view, 36, "data");
    // data chunk length
    view.setUint32(40, samples.length * 2, true);
    // write the PCM samples
    let offset = 44;
    for(let i = 0; i < samples.length; i++, offset += 2) {
        let sample = Math.max(-1, Math.min(1, samples[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
    }

    let blob = new Blob([view], {type: "audio/wav"});
    return blob;
}

// This function writes a string to a DataView at a given offset.
function writeString(view, offset, string) {
    for(let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}