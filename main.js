// your code here, it may be worth it to ensure this file only runs AFTER the dom has loaded.

const calorieUrl = "http://localhost:3000/api/v1/calorie_entries";
const caloriesList = document.querySelector('#calories-list');
const newCalForm = document.querySelector('#new-calorie-form')
const progressBar = document.querySelector('progress.uk-progress');
const bmrResult = document.querySelector('#bmr-calculation-result');
const bmrMinSpan = bmrResult.querySelector('#lower-bmr-range'),
    bmrMaxSpan = bmrResult.querySelector('#higher-bmr-range');
const bmrCalculator = document.querySelector('#bmr-calculator');
const editCalForm = document.querySelector('#edit-calorie-form')
let editCalId;

function fetchCalorieList() {
    fetch(calorieUrl)
        .then(resp => resp.json())
        .then(function(data) {
            data.forEach(function(datum) {
               caloriesList.insertAdjacentHTML('afterbegin', calorieListItemHTML(datum)) 
            })
            updateProgressBar();
            updateProgressMax();
        });
};

function calorieListItemHTML(calItem) {
    const calItemHTML = `
    <li class="calories-list-item" data-item="${calItem.id}">
        <div class="uk-grid">
        <div class="uk-width-1-6">
            <strong class="cal-num">${calItem.calorie}</strong>
            <span>kcal</span>
        </div>
        <div class="uk-width-4-5">
            <em class="cal-note uk-text-meta">${calItem.note}</em>
        </div>
        </div>
        <div class="list-item-menu">
        <a class="edit-button" uk-toggle="target: #edit-form-container" uk-icon="icon: pencil"></a>
        <a class="delete-button" uk-icon="icon: trash"></a>
        </div>
    </li>
    `;
    return calItemHTML;
};

function addCalorieItemListener() {
    newCalForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (e.target.querySelector('#calorie-num').value === "") {
            alert("Calorie can't be empty!")
        } else {
            let calParams = {
                calorie: parseInt(e.target.querySelector('#calorie-num').value),
                note: e.target.querySelector('#calorie-note').value
            }    
            addCalorieItem(calParams);
        }
    })
};

function addCalorieItem(calParams) {
    const calorieObj = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify(calParams)
    }
    fetch(calorieUrl, calorieObj)
        .then(resp => resp.json())
        .then(function(data) {
            newCalForm.reset();
            caloriesList.insertAdjacentHTML('afterbegin', calorieListItemHTML(data))
            updateProgressBar();
        })
};

function editCalorieItemListener() {
    editCalForm.addEventListener('click', updateCalorie);
};

function updateCalorie(e) {
    if (e.target.innerText === "UPDATE ENTRY") {
        let calParams = {
            calorie: parseInt(editCalForm.querySelector('#edit-calorie-num').value),
            note: editCalForm.querySelector('#edit-calorie-note').value
        }
        editCalorieItem(calParams);
    }
}

function editCalorieItem(calParams) {
    const calorieObj = {
        method: "PATCH",
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify(calParams)
    }
    fetch(calorieUrl + `/${editCalId}`, calorieObj)
        .then(resp => resp.json())
        .then(function(data) {
            let calItem = caloriesList.querySelector(`[data-item="${data.id}"]`)
            let calItemDiv = document.createElement('div');
            calItemDiv.innerHTML = calorieListItemHTML(data);
            calItemDiv = calItemDiv.querySelector('li');

            // calItem.innerHTML = calorieListItemHTML(data);
            calItem.parentNode.replaceChild(calItemDiv, calItem);
            updateProgressBar();
            editCalForm.removeEventListener('click', updateCalorie);
        })
};



function bmrCalculatorListener() {
    bmrCalculator.addEventListener('submit', function(e) {
        e.preventDefault();
        const bmrWeight = bmrCalculator.querySelector('#bmr-weight').value,      bmrHeight = bmrCalculator.querySelector('#bmr-height').value,
              bmrAge = bmrCalculator.querySelector('#bmr-age').value;
        bmrMinSpan.innerText = 655 + (4.35 * bmrWeight) + (4.7 * bmrHeight) - (4.7 * bmrAge);
        bmrMaxSpan.innerText = 66 + (6.23 * bmrWeight) + (12.7 * bmrHeight) - (6.8 * bmrAge);
        updateProgressMax();
    })
}

function updateProgressBar() {
    let sum = 0;
    const caloriesListItems = caloriesList.querySelectorAll('li.calories-list-item')
    caloriesListItems.forEach(function(calItem) {
        let calNum = parseInt(calItem.querySelector('.cal-num').innerText);
        sum += calNum;
    })
    progressBar.value = sum;
}

function updateProgressMax() {
    let bmrMin = parseInt(bmrMinSpan.innerText),
        bmrMax = parseInt(bmrMaxSpan.innerText);
    progressBar.max =  (bmrMin + bmrMax) / 2;
}

function buttonListeners() {
    caloriesList.addEventListener('click', function(e) {
        let closestLink = e.target.closest('a')
        if (closestLink && closestLink.classList.contains('edit-button')) {
            e.preventDefault();
            const calorieItem = e.target.closest('li');
            const editCalNum = editCalForm.querySelector('#edit-calorie-num');
            editCalNum.value = calorieItem.querySelector('strong.cal-num').innerText;
            const editCalNote = editCalForm.querySelector('#edit-calorie-note');
            editCalNote.value = calorieItem.querySelector('em.cal-note').innerText
            editCalId = calorieItem.dataset.item;
            editCalorieItemListener();
        } else if (closestLink && closestLink.classList.contains('delete-button')) {
            const calItem = e.target.closest('li');
            deleteCalorieItem(calItem);
        }
    })
}


function deleteCalorieItem(calItem) {
    const calId = parseInt(calItem.dataset.item)
    const delCalObj = {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        }
    }
    fetch(calorieUrl + `/${calId}`, delCalObj)
        .then(resp => {
            return resp.json()
        })
        .then(function(data) {
            if (data.id === calId) {
                calItem.remove();
                updateProgressBar();
            }
        })
}

fetchCalorieList();
addCalorieItemListener();
buttonListeners();
bmrCalculatorListener();
