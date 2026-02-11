// LeetVision Content Script
console.log("LeetVision Extension Active");

const PLATFORMS = {
    'leetcode.com': {
        selector: 'span.text-title-large',
        name: 'leetcode'
    },
    'hackerrank.com': {
        selector: 'h1.ui-header',
        name: 'hackerrank'
    },
    'geeksforgeeks.org': {
        selector: 'h4.ui-problem-title',
        name: 'geeksforgeeks'
    },
    'codechef.com': {
        selector: 'h1#problem-title',
        name: 'codechef'
    }
};

const getProblemInfo = () => {
    const hostname = window.location.hostname.replace('www.', '');
    const platform = PLATFORMS[hostname];
    if (!platform) return null;

    let title = "";
    let url = window.location.href;

    if (hostname === 'leetcode.com') {
        const titleElement = document.querySelector(platform.selector);
        if (titleElement) {
            title = titleElement.innerText.trim();
        } else {
            // Fallback for solutions/submissions tab where layout differs
            const pathParts = window.location.pathname.split('/');
            const slugIndex = pathParts.indexOf('problems') + 1;
            if (slugIndex > 0 && pathParts[slugIndex]) {
                const slug = pathParts[slugIndex];
                title = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                const isSolutions = pathParts.includes('solutions');
                console.log(`LeetVision: Detected slug "${slug}" on ${isSolutions ? 'Solutions' : 'sub'} tab`);
            }
        }
    } else {
        const titleElement = document.querySelector(platform.selector);
        if (titleElement) title = titleElement.innerText.trim();
    }

    if (!title) return null;

    return {
        title: title,
        platform: platform.name,
        url: url
    };
};

const injectOverlay = (data) => {
    // Basic injection logic - will be expanded to a premium overlay
    const div = document.createElement('div');
    div.id = 'leetvision-overlay';
    div.innerHTML = `
        <div class="lv-header">
            <img src="${chrome.runtime.getURL('icon.png')}" width="20" />
            <span>LeetVision Insights</span>
            <button id="lv-close">×</button>
        </div>
        <div class="lv-content">
            <h3 id="lv-concept-title">Loading Concept...</h3>
            <p id="lv-intuition"></p>
            <div id="lv-tags"></div>
            <button id="lv-view-full">View Full Explanation</button>
        </div>
    `;
    document.body.appendChild(div);

    document.getElementById('lv-close').onclick = () => div.remove();
    document.getElementById('lv-view-full').onclick = () => {
        window.open(`https://leet-vision.vercel.app/concept/${data.concept._id}`, '_blank');
    };

    updateOverlayUI(data);
};

const updateOverlayUI = (data) => {
    if (data.status === 'pending') {
        document.getElementById('lv-concept-title').innerText = "Analyzing Problem...";
        document.getElementById('lv-intuition').innerText = "We're mapping this problem to our knowledge graph. Please wait.";
        // Trigger generation if allowed
        chrome.runtime.sendMessage({ action: 'generate', data: { title: data.title, platform: data.platform, url: data.url } });
    } else {
        document.getElementById('lv-concept-title').innerText = data.concept.concept_key.replace(/_/g, ' ');
        document.getElementById('lv-intuition').innerText = data.concept.intuition_text || (data.explanation && data.explanation.intuition);
        
        // Render Videos
        const videos = data.explanation && data.explanation.video_links;
        const contentDiv = document.querySelector('.lv-content');
        
        if (videos && videos.length > 0) {
            let videoHtml = `<div class="lv-videos-container">
                <h4>Video Solutions</h4>
                <div class="lv-video-list">`;
                
            videos.forEach(v => {
                videoHtml += `
                    <div class="lv-video-item" onclick="window.open('${v.url}', '_blank')">
                        <div class="lv-thumb" style="background-image: url('${v.thumbnail}')">
                            <span class="lv-duration">${v.duration}</span>
                        </div>
                        <div class="lv-video-info">
                            <div class="lv-v-title">${v.title}</div>
                            <div class="lv-v-meta">${v.views} views • ${v.channel}</div>
                        </div>
                    </div>
                `;
            });
            
            videoHtml += `</div></div>`;
            
            // Insert before the button
            const existingVideos = document.querySelector('.lv-videos-container');
            if (existingVideos) existingVideos.remove();
            
            const btn = document.getElementById('lv-view-full');
            const videoWrapper = document.createElement('div');
            videoWrapper.innerHTML = videoHtml;
            contentDiv.insertBefore(videoWrapper.firstChild, btn);
        }
    }
};

// Initial Resolve
const info = getProblemInfo();
if (info) {
    chrome.runtime.sendMessage({ action: 'resolve', data: info }, (response) => {
        if (response) {
            injectOverlay(response);
        }
    });
}
