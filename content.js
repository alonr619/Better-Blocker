let settings = {
    exceptions: {},
    blockMessage: "This is not what you're supposed to be doing"
};

function loadSettings() {
    chrome.storage.sync.get(['exceptions', 'blockMessage'], function(result) {
        if (result.exceptions) settings.exceptions = result.exceptions;
        if (result.blockMessage) settings.blockMessage = result.blockMessage;
        checkUrl();
    });
}

function urlAllowed() {
    const url = window.location.href;
    const domain = url.split('/')[2];
    if (settings.exceptions[domain]) {
        return settings.exceptions[domain].some(path => url.includes(path));
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

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'reloadSettings') {
        loadSettings();
    }
});

loadSettings();
checkUrl();