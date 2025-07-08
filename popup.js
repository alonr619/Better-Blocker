// Default settings
const defaultSettings = {
    universal: [],
    exceptions: {},
    blockMessage: "This is not what you're supposed to be doing"
};

// Load settings when popup opens
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    
    // Add event listeners
    document.getElementById('save').addEventListener('click', saveSettings);
    document.getElementById('reset').addEventListener('click', resetSettings);
});

function loadSettings() {
    chrome.storage.sync.get(['universal', 'exceptions', 'blockMessage'], function(result) {
        // Load universal domains
        const universal = result.universal || defaultSettings.universal;
        document.getElementById('universal').value = universal.join('\n');
        
        // Load exceptions
        const exceptions = result.exceptions || defaultSettings.exceptions;
        document.getElementById('exceptions').value = JSON.stringify(exceptions, null, 2);
        
        // Load block message
        const blockMessage = result.blockMessage || defaultSettings.blockMessage;
        document.getElementById('blockMessage').value = blockMessage;
    });
}

function saveSettings() {
    try {
        // Parse universal domains
        const universalText = document.getElementById('universal').value;
        const universal = universalText.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
        
        // Parse exceptions
        const exceptionsText = document.getElementById('exceptions').value;
        const exceptions = JSON.parse(exceptionsText);
        
        // Get block message
        const blockMessage = document.getElementById('blockMessage').value.trim();
        
        // Save to Chrome storage
        chrome.storage.sync.set({
            universal: universal,
            exceptions: exceptions,
            blockMessage: blockMessage
        }, function() {
            showStatus('Settings saved successfully!', 'success');
            
            // Notify content scripts to reload settings
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, {action: 'reloadSettings'});
                }
            });
        });
        
    } catch (error) {
        showStatus('Error saving settings: ' + error.message, 'error');
    }
}

function resetSettings() {
    // Reset to default values
    document.getElementById('universal').value = defaultSettings.universal.join('\n');
    document.getElementById('exceptions').value = JSON.stringify(defaultSettings.exceptions, null, 2);
    document.getElementById('blockMessage').value = defaultSettings.blockMessage;
    
    // Save the default settings
    chrome.storage.sync.set(defaultSettings, function() {
        showStatus('Settings reset to default!', 'success');
    });
}

function showStatus(message, type) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = 'status ' + type;
    status.style.display = 'block';
    
    // Hide after 3 seconds
    setTimeout(() => {
        status.style.display = 'none';
    }, 3000);
}
