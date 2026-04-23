// THIRD EYE Deepfake Detection - with 4-5 second scanning animation

// DOM Elements
const elements = {
    uploadArea: document.getElementById('uploadArea'),
    uploadText: document.getElementById('uploadText'),
    uploadHint: document.getElementById('uploadHint'),
    fileInput: document.getElementById('fileInput'),
    fileInfo: document.getElementById('fileInfo'),
    fileName: document.getElementById('fileName'),
    fileSize: document.getElementById('fileSize'),
    viewFile: document.getElementById('viewFile'),
    removeFile: document.getElementById('removeFile'),
    previewContainer: document.getElementById('previewContainer'),
    imagePreview: document.getElementById('imagePreview'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    resetBtn: document.getElementById('resetBtn'),
    analysisProgress: document.getElementById('analysisProgress'),
    progressBar: document.getElementById('progressBar'),
    progressPercentage: document.getElementById('progressPercentage'),
    resultContainer: document.getElementById('resultContainer'),
    initialInstruction: document.getElementById('initialInstruction'),
    resultDetails: document.getElementById('resultDetails'),
    verdictText: document.getElementById('verdictText'),
    confidenceValue: document.getElementById('confidenceValue'),
    confidenceFill: document.getElementById('confidenceFill'),
    confidenceLabel: document.getElementById('confidenceLabel'),
    analysisGrid: document.getElementById('analysisGrid'),
    ganList: document.getElementById('ganList'),
    testsList: document.getElementById('testsList'),
    noTestsMessage: document.getElementById('noTestsMessage'),
    refreshTests: document.getElementById('refreshTests'),
    clearAllTests: document.getElementById('clearAllTests'),
    step1: document.getElementById('step1'),
    step2: document.getElementById('step2'),
    step3: document.getElementById('step3'),
    step4: document.getElementById('step4'),
    modalImage: document.getElementById('modalImage'),
    imageModal: document.getElementById('imageModal')
};

// Application State
const state = {
    currentFile: null,
    recentAnalyses: [],
    isAnalyzing: false,
    totalScans: 0,
    abortController: null,
    apiUrl: window.location.origin + '/predict'
};

// Metric display config
const metricConfig = {
    facialSymmetry: { icon: 'fas fa-user', description: 'Checks facial proportions and symmetry patterns' },
    textureConsistency: { icon: 'fas fa-texture', description: 'Analyzes skin texture and pattern consistency' },
    frequencyAnalysis: { icon: 'fas fa-wave-square', description: 'Examines frequency domain for digital artifacts' },
    lightingConsistency: { icon: 'fas fa-sun', description: 'Verifies physical lighting and shadow consistency' },
    biologicalPlausibility: { icon: 'fas fa-dna', description: 'Validates anatomical and biological correctness' },
    ganFingerprints: { icon: 'fas fa-robot', description: 'Detects AI model-specific generation patterns' }
};

// Load stored data with quota handling
function loadStoredData() {
    try {
        const storedAnalyses = localStorage.getItem('thirdEyeAnalyses');
        if (storedAnalyses) {
            state.recentAnalyses = JSON.parse(storedAnalyses);
            state.recentAnalyses = state.recentAnalyses.filter(a => a.imageSrc && a.imageSrc.length < 500000);
        }
        state.totalScans = parseInt(localStorage.getItem('totalScans')) || 3142597;
    } catch (e) {
        state.recentAnalyses = [];
        state.totalScans = 3142597;
    }
}

function saveStoredData() {
    try {
        const toStore = state.recentAnalyses.slice(0, 5);
        localStorage.setItem('thirdEyeAnalyses', JSON.stringify(toStore));
        localStorage.setItem('totalScans', state.totalScans);
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            while (state.recentAnalyses.length > 2) {
                state.recentAnalyses.pop();
                try {
                    localStorage.setItem('thirdEyeAnalyses', JSON.stringify(state.recentAnalyses));
                    break;
                } catch (inner) {}
            }
        }
    }
}

function init() {
    loadStoredData();
    setupEventListeners();
    updateRecentTestsList();
    updateTotalScans();
    const steps = [elements.step1, elements.step2, elements.step3, elements.step4];
    steps.forEach(step => step && (step.style.opacity = '0.3'));
}

function setupEventListeners() {
    elements.uploadArea.addEventListener('click', () => {
        if (!state.currentFile && !state.isAnalyzing) elements.fileInput.click();
    });
    elements.fileInput.addEventListener('change', handleFileSelect);
    elements.uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (!state.currentFile && !state.isAnalyzing) elements.uploadArea.classList.add('active');
    });
    elements.uploadArea.addEventListener('dragleave', () => {
        elements.uploadArea.classList.remove('active');
    });
    elements.uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.uploadArea.classList.remove('active');
        if (!state.currentFile && !state.isAnalyzing && e.dataTransfer.files.length) {
            handleFileSelect({ target: { files: e.dataTransfer.files } });
        }
    });
    elements.removeFile.addEventListener('click', resetUpload);
    elements.viewFile.addEventListener('click', viewFullImage);
    elements.analyzeBtn.addEventListener('click', startAnalysis);
    elements.resetBtn.addEventListener('click', resetUpload);
    elements.refreshTests.addEventListener('click', updateRecentTestsList);
    elements.clearAllTests.addEventListener('click', clearAllTests);
    elements.imageModal.addEventListener('click', (e) => {
        if (e.target === elements.imageModal) closeModal();
    });
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPG, PNG, WEBP, etc.)');
        return;
    }
    if (file.size > 15 * 1024 * 1024) {
        alert('File size must be less than 15MB');
        return;
    }
    state.currentFile = file;
    elements.fileName.textContent = file.name.length > 30 ? file.name.substring(0, 27) + '...' : file.name;
    elements.fileSize.textContent = formatFileSize(file.size);
    elements.fileInfo.classList.add('active');
    elements.uploadText.textContent = 'Image ready for THIRD EYE analysis';
    elements.uploadHint.textContent = 'Click "Analyze with THIRD EYE" to begin scan';
    elements.uploadArea.classList.add('active');
    const reader = new FileReader();
    reader.onload = (e) => {
        elements.imagePreview.src = e.target.result;
        elements.imagePreview.style.display = 'block';
        elements.previewContainer.style.display = 'block';
        elements.modalImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
    elements.analyzeBtn.disabled = false;
    elements.resultDetails.style.display = 'none';
    elements.initialInstruction.style.display = 'block';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function resetUpload() {
    if (state.isAnalyzing && state.abortController) {
        state.abortController.abort();
        state.isAnalyzing = false;
        state.abortController = null;
    }
    state.currentFile = null;
    elements.fileInput.value = '';
    elements.fileInfo.classList.remove('active');
    elements.uploadArea.classList.remove('active');
    elements.previewContainer.style.display = 'none';
    elements.analyzeBtn.disabled = true;
    elements.resetBtn.style.display = 'none';
    elements.uploadText.textContent = 'Drop image here or click to browse';
    elements.uploadHint.textContent = 'JPG, PNG, WEBP up to 15MB';
    elements.resultDetails.style.display = 'none';
    elements.initialInstruction.style.display = 'block';
    elements.analysisProgress.style.display = 'none';
    elements.progressBar.style.width = '0%';
    elements.progressPercentage.textContent = '0%';
}

function viewFullImage() {
    elements.imageModal.style.display = 'flex';
}
window.closeModal = function() { elements.imageModal.style.display = 'none'; };

async function startAnalysis() {
    if (!state.currentFile || state.isAnalyzing) return;
    state.isAnalyzing = true;
    elements.analyzeBtn.disabled = true;
    elements.resetBtn.disabled = true;
    elements.resetBtn.style.opacity = '0.5';

    elements.analysisProgress.style.display = 'block';
    elements.initialInstruction.style.display = 'none';
    elements.resultDetails.style.display = 'none';

    // --- Scanning Animation (4-5 seconds) ---
    const MIN_ANIMATION_MS = 4000;   // 4 seconds minimum
    const MAX_ANIMATION_MS = 5000;   // 5 seconds maximum (random)
    const targetDuration = MIN_ANIMATION_MS + Math.random() * (MAX_ANIMATION_MS - MIN_ANIMATION_MS);
    
    let startTime = performance.now();
    let progress = 0;
    const interval = setInterval(() => {
        const elapsed = performance.now() - startTime;
        // Progress increases linearly with time, capped at 98% until actual completion
        let targetProgress = Math.min(98, (elapsed / targetDuration) * 100);
        // Smooth current progress towards target
        progress = progress + (targetProgress - progress) * 0.1;
        if (progress > 99.5) progress = 99.5;
        elements.progressBar.style.width = progress + '%';
        elements.progressPercentage.textContent = Math.floor(progress) + '%';
        
        // Update step indicators based on progress
        if (progress >= 15) elements.step1.classList.add('active');
        if (progress >= 35) elements.step2.classList.add('active');
        if (progress >= 65) elements.step3.classList.add('active');
        if (progress >= 85) elements.step4.classList.add('active');
    }, 50);

    // Prepare and send request
    const formData = new FormData();
    formData.append('image', state.currentFile);
    state.abortController = new AbortController();
    
    let result = null;
    let backendError = null;
    
    try {
        const response = await fetch(state.apiUrl, {
            method: 'POST',
            body: formData,
            signal: state.abortController.signal
        });
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        result = await response.json();
    } catch (error) {
        backendError = error;
    }
    
    // Wait until minimum animation time has passed
    const elapsed = performance.now() - startTime;
    const remaining = targetDuration - elapsed;
    if (remaining > 0) {
        await new Promise(resolve => setTimeout(resolve, remaining));
    }
    
    clearInterval(interval);
    
    if (backendError) {
        elements.analysisProgress.style.display = 'none';
        alert('Could not connect to AI backend. Please ensure Flask server is running.');
        elements.initialInstruction.style.display = 'block';
        state.isAnalyzing = false;
        state.abortController = null;
        elements.analyzeBtn.disabled = false;
        elements.resetBtn.disabled = false;
        elements.resetBtn.style.opacity = '1';
        return;
    }
    
    // Complete progress to 100% and show results
    elements.progressBar.style.width = '100%';
    elements.progressPercentage.textContent = '100%';
    setTimeout(() => {
        elements.analysisProgress.style.display = 'none';
    }, 300);
    
    displayResults(result);
    saveAnalysis(result);
    
    state.isAnalyzing = false;
    state.abortController = null;
    elements.analyzeBtn.disabled = false;
    elements.resetBtn.disabled = false;
    elements.resetBtn.style.opacity = '1';
    elements.resetBtn.style.display = 'block';
    elements.resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function displayResults(result) {
    const isReal = result.isReal;
    const confidence = typeof result.confidence === 'number' ? result.confidence : 50;
    const finalVerdict = result.finalVerdict || (isReal ? 'AUTHENTIC' : 'DEEPFAKE');
    const scores = result.scores || {};
    const ganProbabilities = result.ganProbabilities || [];
    
    elements.verdictText.textContent = finalVerdict;
    elements.verdictText.className = `verdict-text ${isReal ? 'verdict-real' : 'verdict-fake'}`;
    elements.confidenceValue.textContent = `${confidence}%`;
    elements.confidenceFill.style.width = `${Math.min(100, Math.max(0, confidence))}%`;
    
    let label = 'Low Confidence';
    if (confidence >= 85) label = 'Very High Confidence';
    else if (confidence >= 75) label = 'High Confidence';
    else if (confidence >= 65) label = 'Moderate Confidence';
    elements.confidenceLabel.textContent = label;
    
    const defaultScores = {
        facialSymmetry: isReal ? 85 : 60,
        textureConsistency: isReal ? 82 : 55,
        frequencyAnalysis: isReal ? 80 : 50,
        lightingConsistency: isReal ? 83 : 58,
        biologicalPlausibility: isReal ? 88 : 52,
        ganFingerprints: isReal ? 12 : 75
    };
    
    elements.analysisGrid.innerHTML = '';
    for (const [metric, config] of Object.entries(metricConfig)) {
        let score = scores[metric];
        if (typeof score !== 'number') score = defaultScores[metric] || 50;
        const metricName = metric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        const item = document.createElement('div');
        item.className = 'analysis-item';
        item.innerHTML = `
            <div class="analysis-item-header">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <i class="${config.icon}" style="color: var(--primary);"></i>
                    <span class="analysis-item-title">${metricName}</span>
                </div>
                <span class="analysis-item-score" style="color: ${getScoreColor(score)};">${score}%</span>
            </div>
            <div class="analysis-item-bar">
                <div class="analysis-item-fill" style="width: ${score}%; background: ${getScoreColor(score)};"></div>
            </div>
            <div style="font-size: 0.85rem; color: var(--gray); margin-top: 12px; line-height: 1.4;">${config.description}</div>
        `;
        elements.analysisGrid.appendChild(item);
    }
    
    elements.ganList.innerHTML = '';
    const significantGANs = ganProbabilities.filter(gan => gan.probability > 8);
    if (significantGANs.length > 0) {
        significantGANs.forEach(gan => {
            const item = document.createElement('div');
            item.className = 'gan-item';
            item.innerHTML = `
                <div class="gan-name">
                    <i class="${gan.icon || 'fas fa-microchip'}"></i>
                    <div>
                        <div style="font-weight: 600;">${gan.name || 'Unknown GAN'}</div>
                        <div style="font-size: 0.8rem; color: var(--gray);">${gan.fingerprint || 'No data'}</div>
                    </div>
                </div>
                <div class="gan-probability" style="color: ${gan.probability > 30 ? '#ef4444' : '#f59e0b'};">${gan.probability.toFixed(1)}%</div>
            `;
            elements.ganList.appendChild(item);
        });
    } else {
        elements.ganList.innerHTML = `<div style="text-align: center; padding: 20px; color: var(--gray);"><i class="fas fa-check-circle" style="font-size: 24px; margin-bottom: 10px; color: #10b981;"></i><p>No significant AI model fingerprints detected</p></div>`;
    }
    elements.resultDetails.style.display = 'block';
}

function getScoreColor(score) {
    if (score >= 85) return '#10b981';
    if (score >= 70) return '#f59e0b';
    if (score >= 55) return '#f97316';
    return '#ef4444';
}

function saveAnalysis(result) {
    const compressImage = (dataUrl, maxWidth = 200, quality = 0.5) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.src = dataUrl;
        });
    };
    compressImage(elements.imagePreview.src).then(thumbSrc => {
        const analysis = {
            id: Date.now(),
            name: state.currentFile.name,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date().toLocaleDateString(),
            verdict: result.finalVerdict || (result.isReal ? 'AUTHENTIC' : 'DEEPFAKE'),
            confidence: result.confidence,
            imageSrc: thumbSrc,
            isReal: result.isReal,
            analysisTime: result.analysisTime || Math.round(Math.random() * 20 + 10)
        };
        state.recentAnalyses.unshift(analysis);
        if (state.recentAnalyses.length > 8) state.recentAnalyses.pop();
        state.totalScans++;
        updateTotalScans();
        saveStoredData();
        updateRecentTestsList();
    });
}

function updateTotalScans() {
    const statValueElements = document.querySelectorAll('.stat-value');
    if (statValueElements.length >= 2) {
        const totalScans = Math.floor(state.totalScans / 1000) + '.' + (state.totalScans % 1000).toString().padStart(3, '0').substring(0, 1);
        statValueElements[1].textContent = totalScans + 'M';
    }
}

function updateRecentTestsList() {
    if (!elements.testsList) return;
    elements.testsList.innerHTML = '';
    if (state.recentAnalyses.length === 0) {
        if (elements.noTestsMessage) elements.noTestsMessage.style.display = 'block';
        return;
    }
    if (elements.noTestsMessage) elements.noTestsMessage.style.display = 'none';
    state.recentAnalyses.forEach(analysis => {
        const testItem = document.createElement('div');
        testItem.className = 'test-item';
        testItem.innerHTML = `
            <img src="${analysis.imageSrc}" class="test-image" alt="${analysis.name}">
            <div class="test-details">
                <div class="test-name">${analysis.name.length > 20 ? analysis.name.substring(0, 18) + '...' : analysis.name}</div>
                <div class="test-result ${analysis.isReal ? 'test-real' : 'test-fake'}">${analysis.verdict} • ${analysis.confidence}%</div>
                <div style="font-size: 0.8rem; color: var(--gray); margin-top: 4px; display: flex; justify-content: space-between;"><span>${analysis.timestamp}</span><span>${analysis.analysisTime}ms</span></div>
            </div>
            <div class="test-actions"><button class="btn-icon" onclick="deleteTest(${analysis.id})" title="Delete scan"><i class="fas fa-trash"></i></button></div>
        `;
        elements.testsList.appendChild(testItem);
    });
}

window.deleteTest = function(id) {
    state.recentAnalyses = state.recentAnalyses.filter(test => test.id !== id);
    saveStoredData();
    updateRecentTestsList();
};

function clearAllTests() {
    if (state.recentAnalyses.length === 0) return;
    if (confirm('Clear all recent scan history? This action cannot be undone.')) {
        state.recentAnalyses = [];
        localStorage.removeItem('thirdEyeAnalyses');
        updateRecentTestsList();
    }
}

document.addEventListener('DOMContentLoaded', init);