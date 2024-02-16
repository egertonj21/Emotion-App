// emotionLog.js

function editTriggers(emotionId) {
    const triggersSpan = document.getElementById(`triggers_${emotionId}`);
    const editTriggersInput = document.getElementById(`editTriggers_${emotionId}`);
    const editButton = document.querySelector(`button[data-action="edit"][data-emotion-id="${emotionId}"]`);
    const saveButton = document.querySelector(`button[data-action="save"][data-emotion-id="${emotionId}"]`);

    triggersSpan.style.display = 'none';
    editTriggersInput.style.display = 'inline-block';
    editButton.style.display = 'none';
    saveButton.style.display = 'inline-block';
}
function saveTriggers(emotionId) {
    const newValue = document.getElementById(`editTriggers_${emotionId}`).value;

    // Update the triggers on the client side
    updateTriggersDisplay(emotionId, newValue);

    // Send a PUT request to update triggers on the server side
    sendUpdateRequest(emotionId, newValue);
}

function updateTriggersDisplay(emotionId, newValue) {
    const triggersSpan = document.getElementById(`triggers_${emotionId}`);
    const editTriggersInput = document.getElementById(`editTriggers_${emotionId}`);
    const editButton = document.querySelector(`button[onclick="editTriggers('${emotionId}')"]`);
    const saveButton = document.querySelector(`button[onclick="saveTriggers('${emotionId}')"]`);

    triggersSpan.innerText = newValue;
    triggersSpan.style.display = 'inline-block';
    editTriggersInput.style.display = 'none';
    editButton.style.display = 'inline-block';
    saveButton.style.display = 'none';
}

function sendUpdateRequest(emotionId, newValue) {
    fetch('/putTriggers/', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emotionId, newTriggers: newValue }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Triggers updated successfully:', data);
    })
    .catch(error => {
        console.error('Error updating triggers:', error);
    });
}


// This event listener ensures that the DOM is fully loaded before attaching the click event handlers
document.addEventListener('DOMContentLoaded', function() {
    // Get all edit buttons and attach event listeners to them
    const editButtons = document.querySelectorAll('button[data-action="edit"]');
    editButtons.forEach(function(button) {
        button.addEventListener('click', function(event) {
            const emotionId = event.target.dataset.emotionId;
            editTriggers(emotionId);
        });
    });
});


// Retrieve emotion data from the server and format it for the chart
const emotions = emotionsData;
console.log('Emotion data:', emotions);
const timestamps = emotions.map(emotion => emotion.timestamp);
const enjoymentValues = emotions.map(emotion => emotion.enjoyment);
const sadnessValues = emotions.map(emotion => emotion.sadness);
const angerValues = emotions.map(emotion => emotion.anger);
const contemptValues = emotions.map(emotion => emotion.contempt);
const disgustValues = emotions.map(emotion => emotion.disgust);
const fearValues = emotions.map(emotion => emotion.fear);
const surpriseValues = emotions.map(emotion => emotion.surprise);

// Create a line chart using Chart.js
const ctx = document.getElementById('lineChart').getContext('2d');
console.log('Chart context:', ctx);
const lineChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: timestamps,
        datasets: [
            {
                label: 'Enjoyment',
                data: enjoymentValues,
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1
            },
            {
                label: 'Sadness',
                data: sadnessValues,
                borderColor: 'rgb(54, 162, 235)',
                tension: 0.1
            },
            {
                label: 'Anger',
                data: angerValues,
                borderColor: 'rgb(255, 205, 86)',
                tension: 0.1
            },
            {
                label: 'Contempt',
                data: contemptValues,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            },
            {
                label: 'Disgust',
                data: disgustValues,
                borderColor: 'rgb(153, 102, 255)',
                tension: 0.1
            },
            {
                label: 'Fear',
                data: fearValues,
                borderColor: 'rgb(255, 159, 64)',
                tension: 0.1
            },
            {
                label: 'Surprise',
                data: surpriseValues,
                borderColor: 'rgb(201, 203, 207)',
                tension: 0.1
            }
        ]
    },
    options: {
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'day'
                }
            },
            y: {
                min: 0,
                max: 10
            }
        }
    }
});
console.log('Chart instance:', lineChart);
