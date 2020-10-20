/* ----- BEGIN: Application Dependency and Variable setup ----- */
require('dotenv').config();
require('isomorphic-fetch');
const Dropbox = require('dropbox').Dropbox;
const dbx = new Dropbox({ accessToken: process.env.API_KEY, fetch });

// Assigns current date to variable - formatted yyyy-mm-dd
const date = new Date().toISOString().slice(0, 10);

// Loads file system modile, converts text file data to an array
const fs = require('fs');
let productArray = fs.readFileSync('data/search.txt').toString().split('\n');

// Updates array with _A.jpg after each item to narrow down search
for (var i = 0; i < productArray.length; i++) {
    productArray[i] = productArray[i] + '_C.jpg';
}

let requestedBy, originalPath, fileName, username,
    found = 0,
    notFound = 0;

/* ----- End: Application Dependency and Variable setup ----- */

/* ----- BEGIN: Form Check Functions ----- */

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

/* ----- END: Form Check Functions ----- */

/* ******************************************************************************************************* */

/* ----- BEGIN: Result Data Logging Operations ----- */

// Creates log to record files that can or can't be found
function createLog(fileName, textHeader) {
    fs.writeFile(`results/${fileName}.txt`, textHeader, function (err) {
        if (err) return console.log(err);
    });
}

createLog('missing_files', missingLogHeader);
createLog('found_files', foundLogHeader);

// Logs result to correspoinding log file
function logResult(logName, searchQuery) {
    fs.appendFile(`results/${logName}.txt`, `${searchQuery}\n`, function (err) {
        if (err) return console.log(err);
    })
}

/* ----- END: Result Data Logging Operations ----- */

/* ******************************************************************************************************* */

/* ----- BEGIN: Dropbox API Operations - Handles operations during application run ----- */

// Takes product array and name of person requesting to begin api calls for search
function dropboxSearch(searchQuery, requestedWho) {
    requestedBy = requestedWho;

    dbx.shareFolder({requestedBy:"Henry Sa"})
    // Search begins at path defined, takes the first search result 
    dbx.filesSearch({ path: '', mode: 'filename_and_content', max_results: 4, query: searchQuery })
        // If result is found - copyFile function is called 
        .then(function (res) {
            originalPath = res.matches[0].metadata.path_lower;
            fileName = res.matches[0].metadata.name;
            copyFile(originalPath, requestedBy, fileName);
            // Updates count for total files found
            found++;
        })
        // If product is not found - conosle logs the item that is missing
        .catch(function (error) {
            // Updates count for total files not found
            notFound++;
            // Logs name of files that can't be found to missing_files.txt
            logResult('missing_files', searchQuery);
        });
}

// Takes query result data and creates a copy in folder named after user who requested files under the current data
function copyFile(originalPath, requestedBy, fileName) {
    dbx.filesCopy({ allow_shared_folder: true, autorename: true, from_path: originalPath, to_path: `/requested-files/${requestedBy}/${date}/${fileName}` })
        // Confirms file has been copied
        .then(function (res) {
            // Logs name of files that can be found to found.txt
            logResult('found_files', fileName);
        })
        // Console logs if file is unable to be copied
        .catch(function (error) {
            console.log('------------------------Error------------------------')
            console.log('Failed to copy: ' + fileName);
            console.log(error);
            console.log('------------------------Error------------------------')
        });
}

// Work in progress - DNU - Automatically creates share link to folder where data was saved.
function shareFolder(requestedBy) {
    dbx.sharingShareFolder({ path: `/requested-files/${requestedBy}/${date}/` })
        .then(function (res) {
            console.log('share success for ' + requestedBy);
        })
        .catch(function (error) {
            console.log('share fail');
        });
}

// Calls search function 
function beginSearch() {

    // Loops through product array to search for each item and copy as they are found
    for (let i = 0; i <= productArray.length; i++) {
        // setTimeout triggered as an Immdiately Invoked Function Expression (IIFE)
        // Must be done as IIFE because setTimeout is nonblocking and returns immidiately - no delay seen inside for loop if done normally
        (function (i) {
            setTimeout(function () {
                if (i == (productArray.length)) {
                    console.log('\n-------------------------------------------------------\n');
                    console.log('\nMission Complete! --> Please check the log files in the results folder for final confirmation.\n');
                } else if (i < productArray.length) {
                    dropboxSearch(productArray[i], username);
                }
            }, 1500 * i);
        })(i);
    };
}

/* ----- END: Dropbox API Operations - Handles operations during application run ----- */