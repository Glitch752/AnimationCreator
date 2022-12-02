// TODO: Create client-side code to combine video and audio into webm so we don't have to do it on the server

// Setup basic express.js server, hosting /public folder
var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));

var ffmpeg = require('ffmpeg');
var fs = require('fs');

var multer = require('multer');
var upload = multer({ dest: 'uploads/' });

// Listen to /upload route
app.post('/upload', upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'audio', maxCount: 1 }
]), function(req, res) {
    console.log("Processing upload");
    try {
        let video = req.files.video[0];
        let audio = req.files.audio[0];

        let videoPath = video.path;
        let audioPath = audio.path;

        console.log("Video path: " + videoPath);
        console.log("Audio path: " + audioPath);

        let process = new ffmpeg(videoPath);
        process.then(function (video) {
            console.log("Video loaded");
            // Add the audio blob to the video
            video.addCommand('-i', audioPath);
            // Get the video as a webm blob
            video.save('output.webm', function (error, file) {
                console.log("Video saved");
                if (!error) {
                    // Load the video as a buffer
                    let videoBuffer = fs.readFileSync(file);
                    // Send the video blob to the client
                    res.send(videoBuffer);
                    res.end();

                    // Delete the video file
                    fs.unlink(file, function(err) {
                        if(err) console.log("Error deleting output file");
                    });
                }
                
                // Delete the video and audio files
                fs.unlink(videoPath, function(err) {
                    if(err) console.log("Error deleting video file");
                });
                fs.unlink(audioPath, function(err) {
                    if(err) console.log("Error deleting audio file");
                });
            });
        })
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

// Listen to port 5500
app.listen(5500, function() {
    console.log('Listening on port 5500');
});