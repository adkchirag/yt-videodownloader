const express = require('express');
const readline = require('readline');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const ytdl = require('ytdl-core');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post("/", (req, res) => {
    const videoLink = req.body.link;
    console.log(videoLink);
    download(videoLink, res); // Call the download function here
});

const port = 5000;
app.listen(port, () => console.log('Server Listen to 127.0.0.1:', port));

const downloadFolder = path.resolve(__dirname, "downloads");

async function download(videoLink, res) {
    let n = Math.floor(Math.random() * 10000);
    let url = videoLink;
    let videoId = ytdl.getURLVideoID(url);

    const output = path.resolve(downloadFolder, "video-" + n + ".mp4");
    const video = ytdl(url, { filter: 'audioandvideo' }); // Specify the filter option to download both audio and video

    ytdl.getInfo(videoId).then(info => {
        console.log('title: ', info.videoDetails.title);
    });

    video.pipe(fs.createWriteStream(output));
    let starttime;
    video.once('response', () => {
        starttime = Date.now();
    });

    video.on('progress', (chunklength, downloaded, total) => {
        const percent = downloaded / total;
        const downloadMinutes = (Date.now() - starttime) / 1000 / 60;
        const estimateDownloadTime = (downloadMinutes / percent) - downloadMinutes;
        readline.cursorTo(process.stdout, 0);
        process.stdout.write(`${(percent * 100).toFixed(2)}% downloaded`);
        process.stdout.write(`${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(total / 1024 / 1024).toFixed(2)}MB\n`);
        process.stdout.write(`running for: ${downloadMinutes.toFixed(2)}minutes`);
        process.stdout.write(`, estimate time left: ${estimateDownloadTime.toFixed(2)}minutes`);
        readline.moveCursor(process.stdout, 0, -1);
    });

    video.on('end', () => {
        process.stdout.write('\n\n');
        console.log('Download Completed!');
        res.sendFile(__dirname + '/index.html');
    });
}
