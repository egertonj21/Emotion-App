function editTriggers(emotionId) {
    document.getElementById(`triggers_${emotionId}`).style.display = 'none';
    document.getElementById(`editTriggers_${emotionId}`).style.display = 'inline-block';
    document.querySelector(`button[onclick="editTriggers('${emotionId}')"]`).style.display = 'none';
    document.querySelector(`button[onclick="saveTriggers('${emotionId}')"]`).style.display = 'inline-block';
}

function saveTriggers(emotionId) {
    const newValue = document.getElementById(`editTriggers_${emotionId}`).value;

     // Update the triggers on the client side
    document.getElementById(`triggers_${emotionId}`).innerText = newValue;
    document.getElementById(`triggers_${emotionId}`).style.display = 'inline-block';
    document.getElementById(`editTriggers_${emotionId}`).style.display = 'none';
    document.querySelector(`button[onclick="editTriggers('${emotionId}')"]`).style.display = 'inline-block';
    document.querySelector(`button[onclick="saveTriggers('${emotionId}')"]`).style.display = 'none';
    // Send a POST request to update triggers on the server side
    fetch('/auth/updateTriggers', {
        method: 'POST',
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
        // Handle success if needed
        console.log('Triggers updated successfully:', data);
    })
    .catch(error => {
        console.error('Error updating triggers:', error);
    });
    res.redirect('/auth/trace');
}