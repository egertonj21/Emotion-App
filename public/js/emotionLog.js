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
