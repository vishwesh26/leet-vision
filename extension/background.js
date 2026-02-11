const API_BASE = "https://leet-vision.vercel.app/api";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'resolve') {
        fetch(`${API_BASE}/resolve-problem`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request.data)
        })
        .then(res => res.json())
        .then(data => sendResponse(data))
        .catch(err => console.error("Resolve Error:", err));
        return true; // Keep channel open
    }

    if (request.action === 'generate') {
        fetch(`${API_BASE}/generate-concept`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request.data)
        })
        .then(res => res.json())
        .then(data => {
            // Content script should ideally refresh or the background should notify
            console.log("Generation Complete", data);
        })
        .catch(err => console.error("Generation Error:", err));
    }
});
