document.addEventListener('DOMContentLoaded', function() {
    // Attach input event listeners to trigger password strength and match checks
    document.getElementById('password').addEventListener('input', function() {
        var strengthText = document.getElementById('password-strength');
        // Unhide the strength indicator when the user starts typing
        strengthText.style.display = 'block';
        checkPasswordStrength(this.value);
    });

    document.getElementById('passwordCheck').addEventListener('input', function() {
        var matchText = document.getElementById('password-match');
        // Unhide the match indicator when the user starts typing
        matchText.style.display = 'block';
        checkPasswordMatch(this.value);
    });

    // Get the initial password strength and match values from EJS placeholders
    var initialPasswordStrength = '<%= passwordStrength %>';
    var initialPasswordMatch = '<%= passwordMatch %>';

    // Update the placeholders with the initial values
    var strengthText = document.getElementById('password-strength');
    var matchText = document.getElementById('password-match');

    
});

// Function to check password strength and update the placeholder
function checkPasswordStrength(password) {
    var strengthText = document.getElementById('password-strength');
    var strength = 0;
    if (password.match(/[a-zA-Z0-9][a-zA-Z0-9]+/)) {
        strength += 1;
    }
    if (password.match(/[~<>?]+/)) {
        strength += 1;
    }
    if (password.match(/[!@£$%^&*()]+/)) {
        strength += 1;
    }
    if (password.length > 5) {
        strength += 1;
    }

    // Set color based on strength
    switch (strength) {
        case 0:
        case 1:
            strengthText.innerHTML = 'Weak';
            strengthText.style.color = 'red';
            break;
        case 2:
        case 3:
            strengthText.innerHTML = 'Medium';
            strengthText.style.color = 'orange';
            break;
        case 4:
            strengthText.innerHTML = 'Strong';
            strengthText.style.color = 'green';
            break;
        default:
            strengthText.innerHTML = '';
    }
}

// Function to check password match and update the placeholder
function checkPasswordMatch(confirmPassword) {
    var password = document.getElementById('password').value;
    var matchText = document.getElementById('password-match');
    if (password === confirmPassword) {
        matchText.innerHTML = 'Passwords Match';
        matchText.style.color = 'green';
    } else {
        matchText.innerHTML = 'Passwords Do Not Match';
        matchText.style.color = 'red';
    }
}
