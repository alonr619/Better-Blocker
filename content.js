// Default settings (fallback)
let settings = {
    universal: [],
    exceptions: {},
    blockMessage: "This is not what you're supposed to be doing"
};

// Load settings from storage
function loadSettings() {
    chrome.storage.sync.get(['universal', 'exceptions', 'blockMessage'], function(result) {
        if (result.universal) settings.universal = result.universal;
        if (result.exceptions) settings.exceptions = result.exceptions;
        if (result.blockMessage) settings.blockMessage = result.blockMessage;
        
        // Check URL after loading settings
        checkUrl();
    });
}

function urlAllowed() {
    const url = window.location.href;
    const domain = url.split('/')[2];
    
    if (settings.universal.includes(domain)) {
        return false;
    }
    if (settings.exceptions[domain]) {
        return settings.exceptions[domain].some(path => url.includes(path))
    }
    return true;
}

function checkUrl() {
    if (!urlAllowed()) {
        document.documentElement.innerHTML = '';
        
        const h1 = document.createElement('h1');
        h1.textContent = settings.blockMessage;
        h1.style.fontSize = '48px';
        h1.style.textAlign = 'center';
        h1.style.marginTop = '100px';
        h1.style.fontFamily = 'Arial, sans-serif';
        h1.style.color = '#333';
        
        document.body.appendChild(h1);
        document.body.style.margin = '0';
        document.body.style.padding = '20px';
        document.body.style.backgroundColor = '#f5f5f5';
    }
}

// Listen for settings updates from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'reloadSettings') {
        loadSettings();
    }
});

// Load settings and check URL
loadSettings();
checkUrl();