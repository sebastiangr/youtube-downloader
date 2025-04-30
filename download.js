/**
 * Dependencies:
 * 1. Node.js built-in modules:
 *    - child_process: For executing shell commands
 *    - path: For handling file paths
 * 
 * 2. External dependency - yt-dlp:
 *    Installation steps:
 *    - Windows (using winget): winget install yt-dlp
 *    - Windows (using chocolatey): choco install yt-dlp
 *    - MacOS: brew install yt-dlp
 *    - Linux: 
 *      sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
 *      sudo chmod a+rx /usr/local/bin/yt-dlp
 *    - Python pip: pip install yt-dlp
 */

const { exec } = require('child_process');
const path = require('path');

// Input URLs (works for both /watch?v= and /live/)
const rawURLs = [
  'https://www.youtube.com/[watch?v=[ID]',
  'https://www.youtube.com/live/[ID]',
  'https://www.youtube.com/live/[ID]'
];

// Optional: convert /live/ links to /watch?v=
function convertLiveURL(url) {
  const match = url.match(/youtube\.com\/live\/([a-zA-Z0-9_-]+)/);
  if (match) {
    return `https://www.youtube.com/watch?v=${match[1]}`;
  }
  return url;
}

// Process each URL sequentially using async/await
async function downloadVideos() {
  for (let i = 0; i < rawURLs.length; i++) {
    const videoURL = convertLiveURL(rawURLs[i]);
    const outputFile = `downloaded_video_${i + 1}.mp4`;

    console.log(`Downloading video ${i + 1} with yt-dlp...`);

    try {
      await new Promise((resolve, reject) => {
        exec(`yt-dlp -o ${outputFile} "${videoURL}"`, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error downloading video ${i + 1}: ${error.message}`);
            reject(error);
            return;
          }
          if (stderr) {
            console.error(`stderr for video ${i + 1}: ${stderr}`);
          }
          console.log(`stdout for video ${i + 1}: ${stdout}`);
          console.log(`✅ Download complete for video ${i + 1}`);
          resolve();
        });
      });
    } catch (error) {
      console.error(`Failed to download video ${i + 1}`);
    }
  }
}

// Start the download process
downloadVideos();