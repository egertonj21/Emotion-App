


document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM Content Loaded');
    // Set up event listeners for emotion ranges
    setupRangeInput('enjoymentRange', 'enjoymentValue');
    setupRangeInput('sadnessRange', 'sadnessValue');
    setupRangeInput('angerRange', 'angerValue');
    setupRangeInput('contemptRange', 'contemptValue');
    setupRangeInput('disgustRange', 'disgustValue');
    setupRangeInput('fearRange', 'fearValue');
    setupRangeInput('surpriseRange', 'surpriseValue');
});

function setupRangeInput(inputId, valueSpanId) {
    console.log('Setting up range input:', inputId);
    const rangeInput = document.getElementById(inputId);
    const valueSpan = document.getElementById(valueSpanId);

    console.log('Range Input:', rangeInput);
    console.log('Value Span:', valueSpan);

    rangeInput.addEventListener('input', function () {
        console.log('Input event triggered for:', inputId);
        valueSpan.textContent = rangeInput.value;
    });
}

