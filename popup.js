// Default settings
const defaultSettings = {
    exceptions: {},
    blockMessage: "This is not what you're supposed to be doing"
};

let exceptions = {};

// Load settings when popup opens
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    document.getElementById('reset').addEventListener('click', resetSettings);
    document.getElementById('addDomainBtn').addEventListener('click', addDomain);
    document.getElementById('addDomainInput').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            addDomain();
        }
    });
    document.getElementById('saveBlockMessageBtn').addEventListener('click', saveBlockMessage);
});

function renderDomainList() {
    const list = document.getElementById('domainList');
    list.innerHTML = '';
    Object.keys(exceptions).forEach(domain => {
        const li = document.createElement('li');
        li.className = 'domain-item';

        // Header with domain and dropdown button
        const header = document.createElement('div');
        header.className = 'domain-header';
        header.textContent = domain;

        const dropdownBtn = document.createElement('button');
        dropdownBtn.textContent = '▼';
        dropdownBtn.className = 'dropdown-btn';
        dropdownBtn.onclick = function() {
            section.classList.toggle('open');
            dropdownBtn.classList.toggle('open');
        };
        header.appendChild(dropdownBtn);
        li.appendChild(header);

        // Section (hidden by default)
        const section = document.createElement('div');
        section.className = 'domain-section';

        // Exception list or 'No Exceptions'
        const exList = exceptions[domain];
        if (!exList || exList.length === 0) {
            const noEx = document.createElement('p');
            noEx.textContent = 'No Exceptions';
            section.appendChild(noEx);
        } else {
            const ul = document.createElement('ul');
            ul.style.listStyle = 'disc inside';
            exList.forEach((ex, idx) => {
                const exLi = document.createElement('li');
                exLi.textContent = ex;
                const delBtn = document.createElement('button');
                delBtn.textContent = 'Delete';
                delBtn.className = 'remove-btn';
                delBtn.onclick = function() {
                    exceptions[domain].splice(idx, 1);
                    saveExceptionsAndRerender();
                };
                exLi.appendChild(delBtn);
                ul.appendChild(exLi);
            });
            section.appendChild(ul);
        }

        // Add exception input/button
        const addExDiv = document.createElement('div');
        addExDiv.style.marginTop = '8px';
        const addExInput = document.createElement('input');
        addExInput.type = 'text';
        addExInput.placeholder = 'Add exception path...';
        addExInput.style.width = '160px';
        addExInput.style.marginRight = '6px';
        const addExBtn = document.createElement('button');
        addExBtn.textContent = 'Add';
        addExBtn.onclick = function() {
            const val = addExInput.value.trim();
            if (val && !exceptions[domain].includes(val)) {
                exceptions[domain].push(val);
                saveExceptionsAndRerender();
                addExInput.value = '';
            }
        };
        addExInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                addExBtn.click();
            }
        });
        addExDiv.appendChild(addExInput);
        addExDiv.appendChild(addExBtn);
        section.appendChild(addExDiv);

        li.appendChild(section);
        list.appendChild(li);
    });
}

function saveExceptionsAndRerender() {
    chrome.storage.sync.set({ exceptions: exceptions }, function() {
        renderDomainList();
        showStatus('Exceptions updated!', 'success');
        notifyContentScript();
    });
}

function loadSettings() {
    chrome.storage.sync.get(['exceptions', 'blockMessage'], function(result) {
        exceptions = result.exceptions || defaultSettings.exceptions;
        renderDomainList();
        // Load block message
        const blockMessage = result.blockMessage || defaultSettings.blockMessage;
        document.getElementById('blockMessage').value = blockMessage;
    });
}

function addDomain() {
    const input = document.getElementById('addDomainInput');
    const value = input.value.trim();
    if (value && !(value in exceptions)) {
        exceptions[value] = [];
        chrome.storage.sync.set({ exceptions: exceptions }, function() {
            renderDomainList();
            showStatus('Domain added!', 'success');
            notifyContentScript();
        });
        input.value = '';
    }
}

function saveBlockMessage() {
    const blockMessage = document.getElementById('blockMessage').value.trim();
    chrome.storage.sync.set({ blockMessage: blockMessage }, function() {
        showStatus('Block message saved!', 'success');
        notifyContentScript();
    });
}

function resetSettings() {
    exceptions = defaultSettings.exceptions;
    renderDomainList();
    document.getElementById('blockMessage').value = defaultSettings.blockMessage;
    chrome.storage.sync.set(defaultSettings, function() {
        showStatus('Settings reset to default!', 'success');
        notifyContentScript();
    });
}

function showStatus(message, type) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = 'status ' + type;
    status.style.display = 'block';
    setTimeout(() => {
        status.style.display = 'none';
    }, 3000);
}

function notifyContentScript() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {action: 'reloadSettings'});
        }
    });
}
