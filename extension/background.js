const API_BASE = "https://leet-vision.com/api";

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function getCompanyDomain(name) {
    const domains = {
        'google': 'google.com',
        'microsoft': 'microsoft.com',
        'meta': 'meta.com',
        'facebook': 'meta.com',
        'amazon': 'amazon.com',
        'netflix': 'netflix.com',
        'apple': 'apple.com',
        'uber': 'uber.com',
        'lyft': 'lyft.com',
        'airbnb': 'airbnb.com',
        'salesforce': 'salesforce.com',
        'twitter': 'twitter.com',
        'linkedin': 'linkedin.com',
        'goldman sachs': 'goldmansachs.com',
        'morgan stanley': 'morganstanley.com',
        'bloomberg': 'bloomberg.com',
        'adobe': 'adobe.com',
        'oracle': 'oracle.com',
        'cisco': 'cisco.com',
        'intel': 'intel.com',
        'nvidia': 'nvidia.com',
        'amd': 'amd.com',
        'tiktok': 'tiktok.com',
        'bytedance': 'bytedance.com'
    };
    const cleanName = name.toLowerCase().trim();
    return domains[cleanName] || `${cleanName.replace(/[^a-z0-9]/g, '')}.com`;
}

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
            console.log("Generation Complete", data);
        })
        .catch(err => console.error("Generation Error:", err));
    }

    if (request.action === 'get-companies-with-logos') {
        const questionId = request.questionId;
        fetch(`${API_BASE}/question/${questionId}/companies`)
        .then(res => res.json())
        .then(async (companies) => {
            if (!Array.isArray(companies)) {
                sendResponse({ success: false, error: 'Invalid response' });
                return;
            }

            // Map each company to its Base64 logo in parallel
            const companyPromises = companies.map(async (companyName) => {
                const domain = getCompanyDomain(companyName);
                try {
                    const logoRes = await fetch(`${API_BASE}/logo/${domain}`);
                    if (!logoRes.ok) throw new Error('Logo fetch failed');
                    const contentType = logoRes.headers.get('content-type') || 'image/png';
                    const buffer = await logoRes.arrayBuffer();
                    const base64 = arrayBufferToBase64(buffer);
                    return {
                        name: companyName,
                        logo: `data:${contentType};base64,${base64}`
                    };
                } catch (err) {
                    console.warn(`Failed to fetch logo for ${companyName}:`, err.message);
                    return {
                        name: companyName,
                        logo: null
                    };
                }
            });

            const resolvedCompanies = await Promise.all(companyPromises);
            sendResponse({ success: true, companies: resolvedCompanies });
        })
        .catch(err => {
            console.error("Get companies with logos error:", err);
            sendResponse({ success: false, error: err.message });
        });
        return true; // Keep channel open for async response
    }
});
