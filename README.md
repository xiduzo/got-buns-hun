# Hand Tracking Gun Game

A web application that tracks your hand position using your camera and detects a "gun" gesture to shoot.

## Setup

1. Run a local HTTP server:
   ```bash
   npx http-server
   ```
2. Open the URL shown in the terminal (usually `http://localhost:8080`) in your browser

## Important Notes

- **You MUST use a local server** - Opening the HTML file directly (`file://`) will NOT work because browsers block camera access for security reasons
- Allow camera access when prompted by your browser
- Make sure you're in a well-lit area for best hand tracking results

## How to Use

1. Allow camera access when prompted
2. Show your hand to the camera
3. Form a "gun" gesture:
   - Extend your index finger
   - Raise your thumb
   - Keep other fingers (middle, ring, pinky) curled
4. The system will automatically detect the gesture and "shoot" every 300ms

## Troubleshooting

- **Camera permission denied**: Click the "Request Camera Access" button, or check your browser's camera permissions in settings
- **No camera found**: Make sure your camera is connected and not being used by another application
- **Hand tracking not working**: Ensure good lighting and that your hand is clearly visible to the camera
