//call functions to get the ball rolling
fetchData();
calorineFormListener();
setTimeout(function() {deleteFoodListener();}, 1000);
calculateBMRListener();

let progressBarValue = 0;

function fetchData() {
    fetch("http://localhost:3000/api/v1/calorie_entries")
        .then(function(resp){
            return resp.json();
        })
        .then(function(data){
            data.forEach(renderFood);
        })
}

function renderFood(food) {
    const progressBar = document.querySelector(".uk-progress");
    const caloriesList = document.querySelector("#calories-list");
    let item = `
        <li id=${food.id} class="calories-list-item">
            <div class="uk-grid">
            <div class="uk-width-1-6">
                <strong>${food.calorie}</strong>
                <span>kcal</span>
            </div>
            <div class="uk-width-4-5">
                <em class="uk-text-meta">${food.note}</em>
            </div>
            </div>
            <div class="list-item-menu">
            <a class="edit-button" uk-toggle="target: #edit-form-container" uk-icon="icon: pencil"></a>
            <a class="delete-button" uk-icon="icon: trash"></a>
            </div>
        </li>`;
    caloriesList.innerHTML += item;
    progressBarValue += food.calorie;
    progressBar.value = progressBarValue;
}

function calorineFormListener() {
    const newCalorieForm = document.querySelector("#new-calorie-form");
    newCalorieForm.addEventListener("submit", function(event){
        event.preventDefault();
        let caloriesNum = document.querySelector("#calorie-num").value;
        let calorieNotes = document.querySelector("#calorie-note").value;
        postData(caloriesNum, calorieNotes);
        newCalorieForm.reset();
    })    
}

function postData(calories, notes) {
    fetch("http://localhost:3000/api/v1/calorie_entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            calorie : calories,
            note : notes
        })
    })
    .then(function(resp){
        return resp.json();
    })
    .then(function(data){
        const progressBar = document.querySelector(".uk-progress");
        progressBar.value = (progressBarValue + data.calorie);
        return renderFood(data);
    })
}

function deleteFoodListener() {
    let deleteButtons = document.querySelectorAll(".delete-button");
    deleteButtons.forEach(function(btn) {
        btn.addEventListener("click", function(event) {
            deleteItem(event.target.closest("li"));
            //console.log(event.target.closest("li"))
        })
    })
}

function deleteItem(item){
    let listItem = item;
    return fetch(`http://localhost:3000/api/v1/calorie_entries/${item.id}`, {
        method: "DELETE",
    })
    .then(function(resp){
        return resp.json();
    })
    .then(function(food){
        const progressBar = document.querySelector(".uk-progress");
        progressBar.value = (progressBarValue - food.calorie);
        listItem.remove();
    })
}

function calculateBMRListener(){
    let bmrForm = document.querySelector("#bmr-calulator");
    let weight = document.querySelector("#weight");
    let height = document.querySelector("#height");
    let age = document.querySelector("#age");
    let upperRange = document.querySelector("#higher-bmr-range");
    let lowerRange = document.querySelector("#lower-bmr-range");
    const progressBar = document.querySelector(".uk-progress");
    bmrForm.addEventListener("submit", function(event){
        event.preventDefault();
        lowerRange.innerText = lowerRangeValue(weight.value, height.value, age.value);
        upperRange.innerText = upperRangeValue(weight.value, height.value, age.value);
        let maxValue = parseInt(lowerRange.innerText)+ parseInt(upperRange.innerText);
        progressBar.setAttribute("max", maxValue/2)
    })
}

function lowerRangeValue(weight, height, age) {
    let result = 655 + (4.35 * weight) + (4.7 * height) - (4.7 * age);
    return Math.round(result)
}

function upperRangeValue(weight, height, age) {
    let result = 66 + (6.23 * weight) + (12.7 * height) - (6.8 * age);
    return Math.round(result)
}


