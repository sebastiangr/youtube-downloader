# YouTube Downloader

A simple Node.js application to download YouTube videos and audio in various formats.

## Features

- Download YouTube videos in different quality formats
- TODO: Extract audio from YouTube videos
- TODO: Support for multiple video formats (mp4, webm)
- TODO: Support for multiple audio formats (mp3, m4a)
- TODO: Progress bar during download
- TODO: Simple command-line interface

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- Python (v3.6 or higher)
- pip (Python Package Manager)

## Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/sebastiangr/youtube-downloader.git
   cd youtube-downloader
   ```

2. Install dependencies:
   ```bash
   npm install
   pip install -r requirements.txt
   ```

3. Configure the application:
   - Open `download.js` in your preferred text editor
   - Replace the default URLs with your desired YouTube video URLs:
     ```javascript
     // Example:
  
     const rawUrls = [
       'https://www.youtube.com/watch?v=YOUR_VIDEO_ID',
       'https://youtu.be/ANOTHER_VIDEO_ID'
     ];
     ```

4. Run the application:
   ```bash
   node download.js
   ```
   The application will start downloading your videos to the `downloads` folder.
