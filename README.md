## YouTube Coder

A simple tool for logging point and interval events in YouTube videos.

### Setup:

- Create a Google Sheet from the provided `Video Codes Template.csv` file so that your column headers are correct
- Create a Google AppsScript project
    - Copy the code from `Code.gs` into your project
    - Replace the placeholder in the code with your spreadsheet ID
    - Deploy the project and copy your API URL into the placeholder in `logger extension/popup.js`
- Set the code options in `logger extension/popup.html`
    - Uncomment the commented button field if you want point events
    - Change the text of the buttons to the user-facing text you would like and the `data-code` field to the code you would like logged in your sheet
- In your Chromium browser (Chrome, Edge, Arc, etc.), open your extension manager
    - Enable Developer Mode, select "Load Unpacked," and find the `logger extension` folder
- Recommended: Pin the extension to your toolbar