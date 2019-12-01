// your code here, it may be worth it to ensure this file only runs AFTER the dom has loaded.
const BASE_LINK = "http://localhost:3000"
const CALORIES_ENTRIES_LINK = `${BASE_LINK}/api/v1/calorie_entries`
const caloriesList = document.getElementById('calories-list')
let totalcaloriesCount = 0;
const progressBar = document.querySelector('progress');
const editForm = document.getElementById('edit-calorie-form')
const newCalorieForm = document.getElementById('new-calorie-form')
const bmrCalulator = document.getElementById('bmr-calulator')
const lowBmr = document.getElementById('lower-bmr-range')
const highBmr = document.getElementById('higher-bmr-range')

lowBmr.innerText = 1200
highBmr.innerText = 1400
progressBar.max = (1200+1400)/2

//BMR = 655 + (4.35 x weight in pounds) + (4.7 x height in inches) - (4.7 x age in years) lower
// BMR = 66 + (6.23 x weight in pounds) + (12.7 x height in inches) - (6.8 x age in years) higher
//0 - lbs, 1 - inch, 2 - age
bmrCalulator.addEventListener('submit', e =>{
    e.preventDefault()
    const inputs = bmrCalulator.querySelectorAll('input')
    console.log(inputs[0].value === "")
    if(!(inputs[0].value === "") && !(inputs[1].value === "") && !(inputs[2].value === "")){
        const low = parseInt(655 + (4.35 * inputs[0].value) + (4.7 * inputs[1].value) - (4.7 * inputs[2].value))
        const high = parseInt(66 + (6.23 * inputs[0].value) + (12.7 * inputs[1].value) - (6.8 * inputs[2].value))
        lowBmr.innerText = low
        highBmr.innerText = high
        progressBar.max = (low+high)/2
    }
    bmrCalulator.reset()
})
const updateCaloriesGoal = calories =>{
    totalcaloriesCount += calories
    progressBar.value = totalcaloriesCount
}

function getCaloriesEntries(){
    fetch(CALORIES_ENTRIES_LINK)
        .then(res => res.json())
        .then(json =>{
            json.forEach(addCaloriesEntry);
        })
}

const addCaloriesEntry = entry =>{
    //Increase CaloriesCounter
    updateCaloriesGoal(entry.calorie)

    //creating each entry HTML and appending to container
    const entryCalorieHTML =  `<li class="calories-list-item" data-entry-id=${entry.id}>
    <div class="uk-grid">
      <div class="uk-width-1-6">
    <strong>${entry.calorie}</strong>
        <span>kcal</span>
      </div>
      <div class="uk-width-4-5">
        <em class="uk-text-meta" data-note-id=${entry.id}> ${entry.note}</em>
      </div>
    </div>
    <div class="list-item-menu" data-entry-id=${entry.id}>
      <a class="edit-button" uk-toggle="target: #edit-form-container" uk-icon="icon: pencil"></a>
      <a class="delete-button" uk-icon="icon: trash"></a>
    </div>
    </li>`
    caloriesList.innerHTML += entryCalorieHTML
}

const calorieEntryFetch = (entryId,fn, methodx ="GET") =>{
    fetch(CALORIES_ENTRIES_LINK+ `/${entryId}`,{
       method: methodx,
       headers:{
        'Content-Type': 'application/json',
           Accept:'application/json'
       }})
        .then(resp => resp.json())
        .then(json =>{
            fn(json)
        })
        .catch(err => console.log(err))
}

const entryEditForm = entry =>{
    editForm.dataset.entryId = entry.id
    editForm.innerHTML = ` <h3>Edit calorie intake:</h3>
    
    <div>
      <div class="uk-margin-small">
        <input type="number" data-input="true" class="uk-input" value=${entry.calorie} min="0" placeholder="Calories (kcal)">
      </div>
      <div class="uk-margin-small">
        <textarea type="text" data-input="true" class="uk-textarea" placeholder="Notes" style="resize:none">${entry.note}</textarea>
      </div>
      <button class="uk-button uk-button-default">Update Entry</button>
    </div> `
}

const deleteEntry = entry => {
    updateCaloriesGoal(-entry.calorie)
    document.querySelector(`li.calories-list-item[data-entry-id="${entry.id}"]`)
        .remove()
}

// event listener for calories list
caloriesList.addEventListener('click', e=>{
    if(e.target.tagName === 'svg'){
        if(e.target.dataset.svg === 'trash'){
            calorieEntryFetch(e.target.closest('li').dataset.entryId, deleteEntry,'DELETE')
        }
        else{
            calorieEntryFetch(e.target.closest('li').dataset.entryId,entryEditForm)
        }
    }
})

// event listener for new entry
newCalorieForm.addEventListener('submit',e =>{
    e.preventDefault()
    const inputs = e.target.querySelectorAll('[data-set-input="true"]')
        fetch(CALORIES_ENTRIES_LINK,{
            method: 'POST',
            headers:{
             'Content-Type': 'application/json',
                Accept:'application/json'
            },
            body:JSON.stringify({calorie: inputs[0].value, note: inputs[1].value})})
             .then(resp => resp.json())
             .then(json =>{
                addCaloriesEntry(json)
                newCalorieForm.reset()
             })
             .catch(err => console.log(err))
})

editForm.addEventListener('submit',e =>{
    e.preventDefault()
    const formContainer = e.target.closest('#edit-form-container')
    const inputs = editForm.querySelectorAll('[data-input="true"]')
    console.log(inputs)
    formContainer.style = ""
    formContainer.className = "uk-modal"
    fetch(CALORIES_ENTRIES_LINK +`/${editForm.dataset.entryId}`,{
        method: 'PATCH',
        headers:{
         'Content-Type': 'application/json',
            Accept:'application/json'
        },
        body:JSON.stringify({calorie: inputs[0].value, note: inputs[1].value})})
         .then(resp => resp.json())
         .then(json =>{
            //addCaloriesEntry(json)
            caloriesList.innerHTML =""
            getCaloriesEntries()
            editForm.reset()
         })
         .catch(err => console.log(err))
})


// Functions being called
getCaloriesEntries()