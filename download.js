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

// Parse command line arguments
const args = process.argv.slice(2);
let quality = 'best'; // Default quality
let urls = [];
let cookiesFile = ''; // Path to cookies file
let browserName = ''; // Browser name for cookies extraction
let noCheckCertificate = false; // Flag for --no-check-certificate option

// Process command line arguments
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--quality' || args[i] === '-q') {
    if (i + 1 < args.length) {
      quality = args[i + 1];
      i++; // Skip the next argument as it's the quality value
    }
  } else if (args[i] === '--cookies' || args[i] === '-c') {
    if (i + 1 < args.length) {
      cookiesFile = args[i + 1];
      i++; // Skip the next argument as it's the cookies file
    }
  } else if (args[i] === '--browser' || args[i] === '-b') {
    if (i + 1 < args.length) {
      browserName = args[i + 1];
      i++; // Skip the next argument as it's the browser name
    }
  } else if (args[i] === '--no-check-certificate') {
    noCheckCertificate = true;
  } else if (args[i] === '--help' || args[i] === '-h') {
    showHelp();
    process.exit(0);
  } else {
    // Assume it's a URL
    urls.push(args[i]);
  }
}

// If no URLs provided, use the default ones
if (urls.length === 0) {
  urls = [
    'https://www.youtube.com/[watch?v=[ID]',
    'https://www.youtube.com/live/[ID]',
    'https://www.youtube.com/live/[ID]'
  ];
}

// Help function
function showHelp() {
  console.log(`
YouTube Downloader CLI

Usage:
  node download.js [options] [URLs...]

Options:
  -q, --quality <quality>  Set video quality (default: best)
                           Available options:
                           - best: Best quality
                           - 1080p: Full HD
                           - 720p: HD
                           - 480p: SD
                           - 360p: Low quality
                           - audio: Audio only (best quality)
  -c, --cookies <file>     Path to cookies file for authentication
  -b, --browser <browser>  Extract cookies from browser (chrome, firefox, edge, safari, opera)
  --no-check-certificate   Ignore SSL certificate validation (may help with some auth issues)
  -h, --help               Show this help message

Examples:
  node download.js -q 720p https://www.youtube.com/watch?v=VIDEOID
  node download.js -q audio -c cookies.txt https://www.youtube.com/watch?v=VIDEOID
  node download.js -q 1080p -b chrome https://www.youtube.com/watch?v=VIDEOID
  `);
}

// Optional: convert /live/ links to /watch?v=
function convertLiveURL(url) {
  const match = url.match(/youtube\.com\/live\/([a-zA-Z0-9_-]+)/);
  if (match) {
    return `https://www.youtube.com/watch?v=${match[1]}`;
  }
  return url;
}

// Get yt-dlp format string based on quality selection
function getFormatString(quality) {
  switch (quality) {
    case 'best':
      return 'bestvideo+bestaudio/best';
    case '1080p':
      return 'bestvideo[height<=1080]+bestaudio/best[height<=1080]';
    case '720p':
      return 'bestvideo[height<=720]+bestaudio/best[height<=720]';
    case '480p':
      return 'bestvideo[height<=480]+bestaudio/best[height<=480]';
    case '360p':
      return 'bestvideo[height<=360]+bestaudio/best[height<=360]';
    case 'audio':
      return 'bestaudio/best';
    default:
      console.log(`Unknown quality: ${quality}, using best quality instead.`);
      return 'bestvideo+bestaudio/best';
  }
}

// Process each URL sequentially using async/await
async function downloadVideos() {
  const formatString = getFormatString(quality);
  
  console.log(`Selected quality: ${quality}`);
  
  for (let i = 0; i < urls.length; i++) {
    // Limpieza más agresiva de la URL para eliminar cualquier carácter problemático
    const rawURL = urls[i].trim().replace(/`/g, '').replace(/\s/g, '');
    const videoURL = convertLiveURL(rawURL);
    const outputFile = `downloaded_video_${i + 1}.mp4`;

    console.log(`Downloading video ${i + 1} with yt-dlp...`);
    console.log(`URL: ${videoURL}`);

    try {
      await new Promise((resolve, reject) => {
        // Construir el comando base
        let command = `yt-dlp -f "${formatString}" -o "${outputFile}"`;
        
        // Añadir opciones de cookies si se proporcionaron
        if (cookiesFile) {
          command += ` --cookies "${cookiesFile}"`;
        } else if (browserName) {
          command += ` --cookies-from-browser ${browserName}`;
        }
        
        // Add no-check-certificate option if enabled
        if (noCheckCertificate) {
          command += ` --no-check-certificate`;
        }
        
        // Añadir la URL al final
        command += ` "${videoURL}"`;
        
        console.log(`Executing: ${command}`);
        
        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error downloading video ${i + 1}: ${error.message}`);
            if (stderr && stderr.includes("Sign in to confirm you")) {
              console.error(`
Authentication required! Please use one of the following methods:
1. Use --cookies-from-browser option: node download.js -b chrome "${videoURL}"
2. Export cookies from your browser and use --cookies option: node download.js -c cookies.txt "${videoURL}"

For more information on how to export cookies, visit:
https://github.com/yt-dlp/yt-dlp/wiki/FAQ#how-do-i-pass-cookies-to-yt-dlp
https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies
`);
            }
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