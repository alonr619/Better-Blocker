const defaultSettings = {
    exceptions: {},
    blockMessage: "This is not what you're supposed to be doing"
};

let exceptions = {};

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

        const header = document.createElement('div');
        header.className = 'domain-header';
        const domainSpan = document.createElement('span');
        domainSpan.textContent = domain;
        header.appendChild(domainSpan);

        const dropdownBtn = document.createElement('button');
        dropdownBtn.textContent = '▽';
        dropdownBtn.className = 'dropdown-btn';
        header.appendChild(dropdownBtn);

        li.appendChild(header);

        const section = document.createElement('div');
        section.className = 'domain-section';

        header.onclick = function() {
            section.classList.toggle('open');
            dropdownBtn.classList.toggle('open');
        };

        const exList = exceptions[domain];
        if (!exList || exList.length === 0) {
            const noEx = document.createElement('p');
            noEx.textContent = 'No Exceptions';
            section.appendChild(noEx);
        } else {
            const exDiv = document.createElement('div');
            exDiv.className = 'exception-list';
            exList.forEach((ex, idx) => {
                const exBtn = document.createElement('button');
                exBtn.className = 'exception-btn';
                exBtn.textContent = ex;
                exBtn.onclick = function() {
                    exceptions[domain].splice(idx, 1);
                    updateDomainSection(domain, li, section);
                    saveExceptionsAndNotify();
                };
                exDiv.appendChild(exBtn);
            });
            section.appendChild(exDiv);
        }

        const addExDiv = document.createElement('div');
        addExDiv.style.marginTop = '12px';
        const addExInput = document.createElement('input');
        addExInput.type = 'text';
        addExInput.placeholder = 'Add exception path...';
        addExInput.style.width = '180px';
        addExInput.style.marginRight = '8px';
        addExInput.style.fontSize = '1.08rem';
        const addExBtn = document.createElement('button');
        addExBtn.textContent = 'Add';
        addExBtn.onclick = function() {
            const val = addExInput.value.trim();
            if (val && !exceptions[domain].includes(val)) {
                exceptions[domain].push(val);
                updateDomainSection(domain, li, section);
                saveExceptionsAndNotify();
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

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete Domain';
        deleteBtn.className = 'delete-btn';
        deleteBtn.onclick = function() {
            delete exceptions[domain];
            renderDomainList();
            saveExceptionsAndNotify();
        }
        section.appendChild(deleteBtn);

        li.appendChild(section);
        list.appendChild(li);
    });
}

function updateDomainSection(domain, li, section) {
    section.innerHTML = '';
    
    const exList = exceptions[domain];
    if (!exList || exList.length === 0) {
        const noEx = document.createElement('p');
        noEx.textContent = 'No Exceptions';
        section.appendChild(noEx);
    } else {
        const exDiv = document.createElement('div');
        exDiv.className = 'exception-list';
        exList.forEach((ex, idx) => {
            const exBtn = document.createElement('button');
            exBtn.className = 'exception-btn';
            exBtn.textContent = ex;
            exBtn.onclick = function() {
                exceptions[domain].splice(idx, 1);
                updateDomainSection(domain, li, section);
                saveExceptionsAndNotify();
            };
            exDiv.appendChild(exBtn);
        });
        section.appendChild(exDiv);
    }

    const addExDiv = document.createElement('div');
    addExDiv.style.marginTop = '12px';
    const addExInput = document.createElement('input');
    addExInput.type = 'text';
    addExInput.placeholder = 'Add exception path...';
    addExInput.style.width = '180px';
    addExInput.style.marginRight = '8px';
    addExInput.style.fontSize = '1.08rem';
    const addExBtn = document.createElement('button');
    addExBtn.textContent = 'Add';
    addExBtn.onclick = function() {
        const val = addExInput.value.trim();
        if (val && !exceptions[domain].includes(val)) {
            exceptions[domain].push(val);
            updateDomainSection(domain, li, section);
            saveExceptionsAndNotify();
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

    const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete Domain';
        deleteBtn.className = 'delete-btn';
        deleteBtn.onclick = function() {
            delete exceptions[domain];
            renderDomainList();
            saveExceptionsAndNotify();
        }
        section.appendChild(deleteBtn);
}

function saveExceptionsAndNotify() {
    chrome.storage.sync.set({ exceptions: exceptions }, function() {
        showStatus('Exceptions updated!', 'success');
        notifyContentScript();
    });
}

function loadSettings() {
    chrome.storage.sync.get(['exceptions', 'blockMessage'], function(result) {
        exceptions = result.exceptions || defaultSettings.exceptions;
        renderDomainList();

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
