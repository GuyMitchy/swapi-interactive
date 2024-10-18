
// TEACHING MYSELF API CALLING BY BUILDING THIS INTERACTIVE STAR WARS DATABASE USING LIVE DATA FROM SWAPI - I WILL BE USING THIS CODE AS A TEMPLATE FOR OTHER APIS - HENCE THE COMMENTS
// AI ASSISTED BUT NO CODE WRITTEN BY AI, JUST USED AS A GUIDE TO HELP ME UNDERSTAND THE API CALLING PROCESS.




const starWarsData = { };  //only getting 10 results from each category, need to fix - due to pagination




/**
 * Fetches data from the Star Wars API and stores it in the starWarsData object
 * 
 */
function fetchData() {
    const categories = ['people', 'planets', 'films', 'species', 'vehicles', 'starships']; //array of categories to use to fetch diffrent endpoints.
    const baseUrl = 'https://swapi.dev/api/'; //base url of api
    let promises = [];

    
    console.log('Starting to fetch data...');


    for (let category of categories) { //for each category in the categories array
            let promise = fetch(`${baseUrl}${category}/`) // store the promise so that we can add it to an array, and return the complete promise array once all promises are fulfilled
            .then(response => response.json()) //convert the response to json
            .then(data => {
                starWarsData[category] = data.results; //store the data in the starWarsData object
                console.log(starWarsData[category]); //log the data to the console
            })
            .catch((e) => {
                console.error(`Error: ${e}`); //log the error to the console
            })
            promises.push(promise); //push the promise to the promises array
    }
    return Promise.all(promises).then(() => { // Wait for all promises to resolve then return all the data
    console.log('All fetch operations completed.'); //log message when all promises are resolved
    console.log('Final starWarsData:', JSON.stringify(starWarsData, null, 2)); //log the starWarsData object to the console
}
)}


/**
 * 
 * 
 */
function createCategoryButtons(data) {
    const centerContent = document.getElementById('centerContent');
    centerContent.innerHTML = '';

    for (let category in data) {
        const button = document.createElement('button'); 
        button.textContent = category; 
        button.addEventListener('click', () => clickCategoryButtons(category));
        centerContent.appendChild(button);
    }
    
}
function clickCategoryButtons(category) {
    const categoryData = starWarsData[category];
    switch(category) {
            case 'people':
                displayNameList(categoryData);
                break;
            case 'planets':
                displayPlanetsData(categoryData);
                break;
            case 'films':
                displayFilmsData(categoryData);
                break;
            case 'species':
                displaySpeciesData(categoryData);
                break;
            case 'vehicles':
                displayVehiclesData(categoryData);
                break;
            case 'starships':
                displayStarshipsData(categoryData);
                break;
            default:
                console.error('Invalid category: ', category);
        }

    }



function displayNameList(data) {
    const centerContent = document.getElementById('centerContent');
    centerContent.innerHTML = '';
    const leftContent = document.getElementById('leftContent');
    leftContent.innerHTML = '';
    for (let person of data) {
        leftContent.innerHTML += `<p>${person.name}</p>`;
    }
}




// Page functions.

function loadingPage() {
    document.getElementById('centerContent').innerHTML = `<h1>Welcome to the swapi.dev interactive database <br>Loading....</h1>`;
}

function mainPage() {
    createCategoryButtons(starWarsData);
}

function peoplePage(data) {
    displayNameList(data);
}


function planetsPage() {
}

function filmsPage() {
}

function speciesPage() {
}

function vehiclesPage() {
}







/**
 * Initializes the application by fetching the data and displaying it on the webpage
 */
function init() {
    loadingPage();
    fetchData().then(() => {
        mainPage();

        
        
    }).catch(error => {
        console.error("Error fetching data:", error);
    });
}

document.addEventListener('DOMContentLoaded', init); //add an event listener to the document to call the init function when the document is loaded




