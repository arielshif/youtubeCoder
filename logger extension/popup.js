document.addEventListener("DOMContentLoaded", () => {
    const coderInput = document.getElementById("coder");
    const pointButtons = document.querySelectorAll(".point-event");
    const intervalButtons = document.querySelectorAll(".interval-event");

    let activeIntervals = {}; // Track active intervals

    // Load and save coder input
    chrome.storage.local.get("coder", (data) => {
        if (data.coder) coderInput.value = data.coder;
    });

    chrome.storage.local.get("activeIntervals", (data) => {
        if (data.activeIntervals) {
            activeIntervals = data.activeIntervals;
            
            // Update UI for active intervals
            intervalButtons.forEach(button => {
                const code = button.getAttribute("data-code");
                if (activeIntervals[code]) {
                    button.setAttribute("data-original-text", button.textContent);
                    button.classList.add("recording");
                }
            });
        }
    });

    coderInput.addEventListener("input", () => {
        chrome.storage.local.set({ coder: coderInput.value });
    });

    // Function to get video timestamp
    function getYouTubeTimestamp(callback) {
        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
            if (!tab || !tab.url.includes("youtube.com/watch")) {
                alert("This extension only works on YouTube videos.");
                return;
            }

            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: () => {
                    const video = document.querySelector("video");
                    const urlParams = new URLSearchParams(window.location.search);
                    return {
                        timestamp: video ? Math.floor(video.currentTime) : null,
                        videoId: urlParams.get("v") || "Unknown"
                    };
                }
            }, (results) => {
                if (results && results[0] && results[0].result) {
                    callback(results[0].result);
                } else {
                    alert("Failed to get timestamp.");
                }
            });
        });
    }

    // Handle point event buttons
    pointButtons.forEach(button => {
        button.addEventListener("click", () => {
            getYouTubeTimestamp(({ timestamp, videoId }) => {
                const notes = document.getElementById("notes").value;
                const coder = coderInput.value || "Unknown Coder";
                const code = button.getAttribute("data-code");

                sendToGoogleSheet(coder, videoId, timestamp, "point", "", code, notes);
            });
        });
    });

    // Handle interval event buttons
    intervalButtons.forEach(button => {
        button.addEventListener("click", () => {
            const code = button.getAttribute("data-code");

            getYouTubeTimestamp(({ timestamp, videoId }) => {
                const coder = coderInput.value || "Unknown Coder";
                const notes = document.getElementById("notes").value;

                if (activeIntervals[code]) {
                    // Stop interval
                    const startTimestamp = activeIntervals[code].timestamp;
                    const duration = timestamp - startTimestamp;

                    delete activeIntervals[code]; // Remove tracking
                    button.classList.remove("recording");
                    button.textContent = button.getAttribute("data-original-text");
                    chrome.storage.local.set({ activeIntervals });

                    sendToGoogleSheet(coder, videoId, startTimestamp, "interval", duration, code, notes);
                } else {
                    // Start interval
                    activeIntervals[code] = { timestamp, videoId };
                    button.setAttribute("data-original-text", button.textContent);
                    // button.textContent = `Stop: ${button.textContent}`;
                    button.classList.add("recording");

                    chrome.storage.local.set({ activeIntervals });
                }
            });
        });
    });
});

// Function to send data to Google Sheets
function sendToGoogleSheet(coder, videoId, timestamp, type, duration, code, notes) {
    const scriptURL = "https://script.google.com/macros/s/{YOUR CODE HERE}]/exec";
    const payload = { 
        coder,
        videoId,
        timestamp,
        type,
        duration,
        code,
        notes
    };

    fetch(scriptURL, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        mode: "no-cors"
    })
    .then(() => {
        console.log("Data sent:", payload);
    })
    .catch(error => {
        console.error("Error sending data:", error);
    });
}
