// your code here, it may be worth it to ensure this file only runs AFTER the dom has loaded.

function fetchData() {
    fetch('http://localhost:3000/api/v1/calorie-entries')
        .then(data => data.json())
        .then(console.log)
        .catch(console.error);
}



document.addEventListener("DOMContentLoaded", () => {

});