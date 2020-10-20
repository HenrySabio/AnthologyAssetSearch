const form = document.getElementById('form');
const formData = {
    email: document.getElementById('email'),
    searchOption: document.getElementById('search-option'),
    searchQuery: document.getElementById('search-query')
}

//Show Input Error Message
const showError = (input, message) => {
    const formControl = input.parentElement;
    formControl.className = 'form-control error';
    const small = formControl.querySelector('small')
    small.innerText = message;
}

const showSuccess = input => {
    const formControl = input.parentElement;
    formControl.className = 'form-control success';
}

// Check for valid email
function checkEmail(email) {
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; 

    if(regEx.test(email.value.trim())) {
        showSuccess(email);
    } else {
        showError(email, 'Email is not valid')
    }
}

function checkRequired(inputObj) {
    const keys = Object.values(formData)
    for (const input of keys) {
        if(input.value.trim() === '') {
            showError(input, ` ${getFieldName(input)} is required`)
        } else {
            showSuccess(input);
        }
    }
}


function getFieldName(input) {
    return input.id.charAt(0).toUpperCase() + input.id.slice(1)
}

//Event listeners
form.addEventListener('submit', function (event) {
    event.preventDefault();

    checkRequired(Object.keys(formData));
    checkEmail(formData.email);
})