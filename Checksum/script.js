// Global Variables
let originalData = [];
let checksum = '';
let transmittedData = [];
let receivedData = [];
let segmentSize = 8;

// DOM Elements
const dataInput = document.getElementById('dataInput');
const segmentSizeSelect = document.getElementById('segmentSize');
const numSegmentsInput = document.getElementById('numSegments');
const generateBtn = document.getElementById('generateBtn');
const calculateBtn = document.getElementById('calculateBtn');
const resetBtn = document.getElementById('resetBtn');
const transmitBtn = document.getElementById('transmitBtn');
const injectErrorCheckbox = document.getElementById('injectError');
const errorPositionDiv = document.getElementById('errorPositionDiv');
const errorSegmentInput = document.getElementById('errorSegment');
const errorBitInput = document.getElementById('errorBit');
const dataError = document.getElementById('dataError');

// Section Elements
const senderSection = document.getElementById('senderSection');
const transmissionSection = document.getElementById('transmissionSection');
const receiverSection = document.getElementById('receiverSection');
const summarySection = document.getElementById('summarySection');

// Event Listeners
generateBtn.addEventListener('click', generateRandomData);
calculateBtn.addEventListener('click', calculateChecksum);
resetBtn.addEventListener('click', resetAll);
transmitBtn.addEventListener('click', transmitData);
injectErrorCheckbox.addEventListener('change', toggleErrorPosition);
dataInput.addEventListener('input', validateInput);
segmentSizeSelect.addEventListener('change', () => {
    segmentSize = parseInt(segmentSizeSelect.value);
    validateInput();
});

// Input Validation
function validateInput() {
    const value = dataInput.value.trim();
    dataError.textContent = '';
    dataInput.classList.remove('error');
    
    if (!value) {
        return false;
    }
    
    const segments = value.split(/\s+/);
    segmentSize = parseInt(segmentSizeSelect.value);
    
    for (let i = 0; i < segments.length; i++) {
        // Check if segment contains only 0s and 1s
        if (!/^[01]+$/.test(segments[i])) {
            dataError.textContent = `Error: Segment ${i + 1} contains invalid characters. Only 0 and 1 are allowed.`;
            dataInput.classList.add('error');
            return false;
        }
        
        // Check segment size
        if (segments[i].length !== segmentSize) {
            dataError.textContent = `Error: Segment ${i + 1} has ${segments[i].length} bits. Expected ${segmentSize} bits.`;
            dataInput.classList.add('error');
            return false;
        }
    }
    
    if (segments.length < 2) {
        dataError.textContent = 'Error: At least 2 segments are required.';
        dataInput.classList.add('error');
        return false;
    }
    
    return true;
}

// Generate Random Binary Data
function generateRandomData() {
    const numSegments = parseInt(numSegmentsInput.value) || 4;
    segmentSize = parseInt(segmentSizeSelect.value);
    
    if (numSegments < 2 || numSegments > 8) {
        alert('Number of segments must be between 2 and 8');
        return;
    }
    
    const segments = [];
    for (let i = 0; i < numSegments; i++) {
        let segment = '';
        for (let j = 0; j < segmentSize; j++) {
            segment += Math.random() < 0.5 ? '0' : '1';
        }
        segments.push(segment);
    }
    
    dataInput.value = segments.join(' ');
    validateInput();
    
    // Visual feedback
    dataInput.style.animation = 'none';
    setTimeout(() => {
        dataInput.style.animation = 'pulse 0.5s ease';
    }, 10);
}

// Toggle Error Position Input
function toggleErrorPosition() {
    errorPositionDiv.style.display = injectErrorCheckbox.checked ? 'flex' : 'none';
}

// Calculate Checksum (Sender Side)
function calculateChecksum() {
    if (!validateInput()) {
        return;
    }
    
    segmentSize = parseInt(segmentSizeSelect.value);
    originalData = dataInput.value.trim().split(/\s+/);
    
    // Show sender section
    senderSection.classList.add('show');
    
    // Display original segments
    displaySegments('senderSegments', originalData);
    
    // Calculate and display steps
    const result = performChecksumCalculation(originalData, 'senderStepsContainer', 'Sender');
    
    // Display results
    document.getElementById('senderSum').textContent = result.sum;
    checksum = result.checksum;
    document.getElementById('checksumValue').textContent = checksum;
    
    // Create transmitted data
    transmittedData = [...originalData, checksum];
    displayTransmittedData();
    
    // Show transmission section
    setTimeout(() => {
        transmissionSection.classList.add('show');
        transmitBtn.disabled = false;
        
        // Update error position limits
        errorSegmentInput.max = transmittedData.length - 1;
        errorBitInput.max = segmentSize - 1;
    }, 500);
}

// Display Segments
function displaySegments(containerId, segments, highlightLast = false, corruptedIndex = -1) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    segments.forEach((segment, index) => {
        const segmentDiv = document.createElement('div');
        segmentDiv.className = 'segment';
        
        if (highlightLast && index === segments.length - 1) {
            segmentDiv.classList.add('checksum');
        }
        
        if (index === corruptedIndex) {
            segmentDiv.classList.add('corrupted');
        }
        
        const label = document.createElement('span');
        label.className = 'segment-label';
        if (highlightLast && index === segments.length - 1) {
            label.textContent = 'Checksum';
        } else {
            label.textContent = `Seg ${index + 1}`;
        }
        
        segmentDiv.appendChild(label);
        segmentDiv.innerHTML += formatBinary(segment);
        segmentDiv.style.animationDelay = `${index * 0.1}s`;
        
        container.appendChild(segmentDiv);
    });
}

// Display Transmitted Data
function displayTransmittedData() {
    const container = document.getElementById('transmittedContainer');
    container.innerHTML = '';
    
    transmittedData.forEach((segment, index) => {
        const segmentDiv = document.createElement('div');
        segmentDiv.className = 'segment';
        
        if (index === transmittedData.length - 1) {
            segmentDiv.classList.add('checksum');
        }
        
        const label = document.createElement('span');
        label.className = 'segment-label';
        label.textContent = index === transmittedData.length - 1 ? 'Checksum' : `D${index + 1}`;
        
        segmentDiv.appendChild(label);
        segmentDiv.innerHTML += segment;
        segmentDiv.style.animationDelay = `${index * 0.1}s`;
        
        container.appendChild(segmentDiv);
    });
}

// Perform Checksum Calculation
function performChecksumCalculation(segments, containerId, side) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    let stepNumber = 1;
    let currentSum = segments[0];
    
    // Step 1: Show initial segment
    addStep(container, stepNumber++, 
        `Starting with first segment: <span class="binary-value">${formatBinary(currentSum)}</span>`,
        `Initial value`
    );
    
    // Add each segment
    for (let i = 1; i < segments.length; i++) {
        const operand = segments[i];
        const additionResult = binaryAdd(currentSum, operand);
        
        // Show addition step with visualization
        const additionHTML = createAdditionVisualization(currentSum, operand, additionResult);
        addStepWithHTML(container, stepNumber++, additionHTML, 
            `Adding segment ${i + 1}${i === segments.length - 1 && side === 'Receiver' ? ' (Checksum)' : ''}`
        );
        
        // Handle carry if exists
        if (additionResult.carry) {
            const carrySum = binaryAdd(additionResult.sum, '1'.padStart(segmentSize, '0'));
            addStep(container, stepNumber++,
                `Wrap around carry: <span class="binary-value">${formatBinary(additionResult.sum)}</span> + <span class="carry-value">1</span> = <span class="result-highlight">${formatBinary(carrySum.sum)}</span>`,
                `Adding carry bit back to the sum (1's complement addition)`
            );
            currentSum = carrySum.sum;
        } else {
            currentSum = additionResult.sum;
        }
    }
    
    // Calculate 1's complement
    const complement = onesComplement(currentSum);
    addStep(container, stepNumber++,
        `1's Complement of <span class="binary-value">${formatBinary(currentSum)}</span> = <span class="result-highlight">${formatBinary(complement)}</span>`,
        `Inverting all bits (0→1, 1→0)`
    );
    
    return {
        sum: currentSum,
        checksum: complement
    };
}

// Create Addition Visualization
function createAdditionVisualization(a, b, result) {
    const carryBits = calculateCarryBits(a, b);
    
    let html = `<div class="addition-box">`;
    
    // Carry row
    if (carryBits.some(c => c === '1')) {
        html += `<div class="carry-row">Carry: ${carryBits.join('')}</div>`;
    }
    
    // First operand
    html += `<div class="addition-row operand1">`;
    html += `<span class="addition-operator">&nbsp;&nbsp;</span>`;
    for (let bit of a) {
        html += `<span class="bit">${bit}</span>`;
    }
    html += `</div>`;
    
    // Second operand with + sign
    html += `<div class="addition-row operand2">`;
    html += `<span class="addition-operator">+</span>`;
    for (let bit of b) {
        html += `<span class="bit">${bit}</span>`;
    }
    html += `</div>`;
    
    // Result
    html += `<div class="addition-row result">`;
    html += `<span class="addition-operator">=</span>`;
    if (result.carry) {
        html += `<span class="bit highlight">${result.carry}</span>`;
    }
    for (let bit of result.sum) {
        html += `<span class="bit">${bit}</span>`;
    }
    html += `</div>`;
    
    if (result.carry) {
        html += `<div class="carry-row" style="color: #f59e0b; margin-top: 10px;">↑ Carry out (will be wrapped around)</div>`;
    }
    
    html += `</div>`;
    
    return html;
}

// Calculate Carry Bits for Visualization
function calculateCarryBits(a, b) {
    const carries = [];
    let carry = 0;
    
    for (let i = a.length - 1; i >= 0; i--) {
        const sum = parseInt(a[i]) + parseInt(b[i]) + carry;
        carry = sum >= 2 ? 1 : 0;
        carries.unshift(carry.toString());
    }
    
    // Shift carries left by one position
    carries.pop();
    carries.unshift(' ');
    
    return carries;
}

// Binary Addition
function binaryAdd(a, b) {
    // Ensure both have same length
    const maxLen = Math.max(a.length, b.length);
    a = a.padStart(maxLen, '0');
    b = b.padStart(maxLen, '0');
    
    let result = '';
    let carry = 0;
    
    for (let i = maxLen - 1; i >= 0; i--) {
        const sum = parseInt(a[i]) + parseInt(b[i]) + carry;
        result = (sum % 2) + result;
        carry = Math.floor(sum / 2);
    }
    
    return {
        sum: result,
        carry: carry ? '1' : null
    };
}

// 1's Complement
function onesComplement(binary) {
    let result = '';
    for (let bit of binary) {
        result += bit === '0' ? '1' : '0';
    }
    return result;
}

// Add Step to Container
function addStep(container, number, content, description) {
    const stepDiv = document.createElement('div');
    stepDiv.className = 'step';
    stepDiv.innerHTML = `
        <div class="step-number">${number}</div>
        <div class="step-content">
            <div>${content}</div>
            <div class="step-description">${description}</div>
        </div>
    `;
    container.appendChild(stepDiv);
}

// Add Step with HTML content
function addStepWithHTML(container, number, htmlContent, description) {
    const stepDiv = document.createElement('div');
    stepDiv.className = 'step';
    stepDiv.innerHTML = `
        <div class="step-number">${number}</div>
        <div class="step-content">
            ${htmlContent}
            <div class="step-description">${description}</div>
        </div>
    `;
    container.appendChild(stepDiv);
}

// Format Binary for Display
function formatBinary(binary) {
    if (binary.length <= 4) return binary;
    
    let formatted = '';
    for (let i = 0; i < binary.length; i++) {
        if (i > 0 && i % 4 === 0) {
            formatted += ' ';
        }
        formatted += binary[i];
    }
    return formatted;
}

// Transmit Data
function transmitData() {
    // Clone transmitted data
    receivedData = [...transmittedData];
    
    // Inject error if checkbox is checked
    let corruptedIndex = -1;
    if (injectErrorCheckbox.checked) {
        const segmentIndex = parseInt(errorSegmentInput.value);
        const bitIndex = parseInt(errorBitInput.value);
        
        if (segmentIndex >= 0 && segmentIndex < receivedData.length) {
            corruptedIndex = segmentIndex;
            receivedData[segmentIndex] = flipBit(receivedData[segmentIndex], bitIndex);
        }
    }
    
    // Animate transmission
    const signal = document.getElementById('signal');
    signal.classList.add('animate');
    
    setTimeout(() => {
        signal.classList.remove('animate');
        
        // Show receiver section
        receiverSection.classList.add('show');
        
        // Display received segments
        displaySegments('receiverSegments', receivedData, true, corruptedIndex);
        
        // Verify checksum
        verifyChecksum(corruptedIndex);
        
        // Show summary
        setTimeout(() => {
            showSummary(corruptedIndex);
        }, 500);
    }, 2000);
}

// Flip a bit in binary string
function flipBit(binary, position) {
    if (position < 0 || position >= binary.length) {
        position = 0;
    }
    
    const binaryArray = binary.split('');
    binaryArray[position] = binaryArray[position] === '0' ? '1' : '0';
    return binaryArray.join('');
}

// Verify Checksum (Receiver Side)
function verifyChecksum(corruptedIndex) {
    // Perform calculation on received data
    const result = performChecksumCalculation(receivedData, 'receiverStepsContainer', 'Receiver');
    
    // Display results
    document.getElementById('receiverSum').textContent = result.sum;
    document.getElementById('receiverComplement').textContent = result.checksum;
    
    // Check if result is all zeros
    const isValid = result.checksum === '0'.repeat(segmentSize);
    
    const statusElement = document.getElementById('verificationStatus');
    if (isValid) {
        statusElement.textContent = '✅ Data is VALID (No errors detected)';
        statusElement.className = 'result-value success';
    } else {
        statusElement.textContent = '❌ Error DETECTED in transmission';
        statusElement.className = 'result-value error';
    }
}

// Show Summary
function showSummary(corruptedIndex) {
    summarySection.classList.add('show');
    
    const isValid = document.getElementById('receiverComplement').textContent === '0'.repeat(segmentSize);
    
    const summaryContent = document.getElementById('summaryContent');
    summaryContent.innerHTML = `
        <div class="summary-card">
            <div class="icon">📊</div>
            <h4>Total Segments</h4>
            <div class="value">${originalData.length}</div>
        </div>
        <div class="summary-card">
            <div class="icon">📏</div>
            <h4>Segment Size</h4>
            <div class="value">${segmentSize} bits</div>
        </div>
        <div class="summary-card">
            <div class="icon">🔢</div>
            <h4>Checksum</h4>
            <div class="value">${checksum}</div>
        </div>
        <div class="summary-card ${isValid ? 'success' : 'error'}">
            <div class="icon">${isValid ? '✅' : '❌'}</div>
            <h4>Transmission Status</h4>
            <div class="value">${isValid ? 'SUCCESS' : 'ERROR DETECTED'}</div>
        </div>
        ${corruptedIndex >= 0 ? `
        <div class="summary-card error">
            <div class="icon">🔧</div>
            <h4>Error Injected At</h4>
            <div class="value">Segment ${corruptedIndex + 1}, Bit ${errorBitInput.value}</div>
        </div>
        ` : ''}
        <div class="summary-card">
            <div class="icon">📡</div>
            <h4>Total Bits Transmitted</h4>
            <div class="value">${transmittedData.length * segmentSize}</div>
        </div>
    `;
}

// Reset All
function resetAll() {
    // Clear inputs
    dataInput.value = '';
    dataError.textContent = '';
    dataInput.classList.remove('error');
    injectErrorCheckbox.checked = false;
    errorPositionDiv.style.display = 'none';
    errorSegmentInput.value = 0;
    errorBitInput.value = 0;
    
    // Hide sections
    senderSection.classList.remove('show');
    transmissionSection.classList.remove('show');
    receiverSection.classList.remove('show');
    summarySection.classList.remove('show');
    
    // Reset buttons
    transmitBtn.disabled = true;
    
    // Clear global variables
    originalData = [];
    checksum = '';
    transmittedData = [];
    receivedData = [];
    
    // Clear containers
    document.getElementById('senderSegments').innerHTML = '';
    document.getElementById('senderStepsContainer').innerHTML = '';
    document.getElementById('transmittedContainer').innerHTML = '';
    document.getElementById('receiverSegments').innerHTML = '';
    document.getElementById('receiverStepsContainer').innerHTML = '';
    document.getElementById('summaryContent').innerHTML = '';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    segmentSize = parseInt(segmentSizeSelect.value);
    
    // Add example placeholder
    dataInput.placeholder = `e.g., ${'10101010 11001100 11110000 00001111'.substring(0, segmentSize * 4 + 3)}`;
});

// Console output for debugging
function logToConsole(message, data = null) {
    console.log('%c' + message, 'color: #4f46e5; font-weight: bold;');
    if (data) {
        console.table(data);
    }
}