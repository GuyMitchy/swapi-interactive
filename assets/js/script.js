/* jshint esversion: 6 */

// TEACHING MYSELF API CALLING BY BUILDING THIS INTERACTIVE STAR WARS DATABASE USING LIVE DATA FROM SWAPI - I WILL BE USING THIS CODE AS A TEMPLATE FOR OTHER APIS - HENCE THE COMMENTS
// AI ASSISTED BUT NO CODE WRITTEN BY AI, JUST USED AS A GUIDE TO HELP ME UNDERSTAND THE API CALLING PROCESS.


let starWarsData = {};  //only getting 10 results from each category, need to fix - due to pagination - Want to figure out how to store this not in global scope




/**
 * Fetches data from the Star Wars API and stores it in the starWarsData object
 * 
 */
function fetchData() {
    const categories = ['people', 'planets', 'films', 'species', 'vehicles', 'starships']; //array of categories to use to fetch diffrent endpoints.
    const baseUrl = 'https://swapi.dev/api/'; //base url of api
    let promises = [];


    console.log('Starting to fetch data...');

       // Check if we have cached data
       const cachedData = localStorage.getItem('starWarsData');
       if (cachedData) {
           console.log('Using cached data');
           starWarsData = JSON.parse(cachedData);
           console.log('starWarsData:', starWarsData);
           return Promise.resolve();
       }
   

       // Recursively fetches all pages of a given category - Was confused about the basecase here cause
       // in all the examples i'd done in tutorails it was the first statment in the function, but here 
       // its the else sttatement within the promise chain.
       // we hit it when we get a response with no next page data, and store the data we have then reccurse back up the call stack.

      function fetchAllPages(url, category, results = {}) {   
        return fetch(url)
            .then(response => response.json())
            .then(data => {
                data.results.forEach(item => {
                    const id = getIdFromUrl(item.url);
                    results[id] = item;
                });
                if (data.next) {
                    return fetchAllPages(data.next, category, results);
                } else {
                    starWarsData[category] = results;
                    return results;
                }
            });
    }

    for (let category of categories) {
        let promise = fetchAllPages(`${baseUrl}${category}/`, category)
            .catch((e) => {
                console.error(`Error fetching ${category}: ${e}`);
            });
        promises.push(promise);
    }

    return Promise.all(promises).then(() => { 
        console.log('All fetch operations completed.');
        // Cache the data in localStorage
        localStorage.setItem('starWarsData', JSON.stringify(starWarsData));
        console.log('Data cached in localStorage');
        console.log('Final starWarsData:', JSON.stringify(starWarsData, null, 2));
    });
}


/**
 * creates category buttons for each category in the starWarsData object
 * 
 */
function createCategoryButtons(data) {
    const centerContent = document.getElementById('centerContent');
    centerContent.innerHTML = '';

    for (let category in data) {
        const button = document.createElement('button');
        button.textContent = category.capitalize();
        button.addEventListener('click', () => clickCategoryButtons(category));
        centerContent.appendChild(button);
    }

}
function clickCategoryButtons(category) {
    displayCategoryData(category);
}

function displayCategoryData(category) {
    const centerContent = document.getElementById('centerContent');
    centerContent.innerHTML = '';
    const leftContent = document.getElementById('leftContent');
    leftContent.innerHTML = '';
    const bg = document.getElementById('section');
    bg.classList.remove('bg-logo');
    bg.classList.add('bg-no-logo');
    const backButton = document.createElement('button');
    backButton.textContent = 'Back';
    backButton.addEventListener('click', () => backButtonClick());
    backButtonContainer.appendChild(backButton);

    for (let item of Object.values(starWarsData[category])) {
        const element = document.createElement('p');
        element.classList.add('crosshair');
        element.textContent = item.name || item.title; // Use title for films, name for others
        leftContent.appendChild(element);

        element.addEventListener('click', () => displayItemDetails(item, category));
        
    }
}

function displayItemDetails(item, category) {
    const rightContent = document.getElementById('rightContent');
    rightContent.innerHTML = '';

    
    // const allKeys = ['name', 'title', 'model', 'manufacturer', 'cost_in_credits', 'length', 'crew', 'passengers', 'cargo_capacity', 'consumables', 'vehicle_class', 'starship_class', 'classification', 'designation', 'average_height', 'average_lifespan', 'eye_colors', 'hair_colors', 'skin_colors', 'language', 'climate', 'terrain', 'surface_water', 'population', 'rotation_period', 'orbital_period', 'diameter', 'gravity'];
    //Now looping instead of hardcoding the keys.
    rightContent.innerHTML += `<h1 class="nameTitle">${item.name || item.title}</h1>`;

    for (let key in item) {
        if (item[key] && typeof item[key] !== 'object' && key !== 'url' && key !== 'created' && key !== 'edited' && key !== 'homeworld' && key !== 'name' && key !== 'title') {
            rightContent.innerHTML += `<p>${key.replace('_', ' ').capitalize()}: ${item[key]}</p>`;
        }
    }

    // unlike the other related data, the homeworld is not an array, so we need to handle it differently.
    if (item.homeworld) {
        const id = getIdFromUrl(item.homeworld);
        const planetName = starWarsData.planets[id]?.name || 'Unknown';
        rightContent.innerHTML += `<p>Homeworld: ${planetName}</p>`;
    }

    // Handle related data (films, people, etc.)
    const relatedCategories = ['films', 'people', 'species', 'starships', 'vehicles', 'planets', 'pilots', 'characters', 'residents'];

    for (let relatedCategory of relatedCategories) {
        if (item[relatedCategory] && item[relatedCategory].length > 0) {
            const relatedItems = item[relatedCategory].map(url => {
                const id = getIdFromUrl(url);
                const dataCategory = ['characters', 'pilots', 'residents'].includes(relatedCategory) ? 'people' : relatedCategory;
                const relatedData = starWarsData[dataCategory][id];
                return relatedData ? (relatedData.name || relatedData.title) : 'Unknown';
            }).join(', ');
            // Display appropriate category name
            let displayCategory;
            switch (relatedCategory) {
                case 'characters':
                    displayCategory = 'Characters';
                    break;
                case 'pilots':
                    displayCategory = 'Pilots';
                    break;
                case 'residents':
                    displayCategory = 'Residents';
                    break;
                default:
                    displayCategory = relatedCategory.capitalize();
            }
            rightContent.innerHTML += `<p>${displayCategory}: ${relatedItems}</p>`;
        }
    }

    

    
}

// Helper functions
function getIdFromUrl(url) {
    const parts = url.split('/');
    return parts[parts.length - 2];
}   

function backButtonClick() {
    const bg = document.getElementById('section')
    bg.classList.remove('bg-no-logo');
    bg.classList.add('bg-logo');
    leftContent.innerHTML = '';
    rightContent.innerHTML = '';
    backButtonContainer.innerHTML = '';
    init();
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

// Page functions.

function loadingPage() {
    document.getElementById('centerContent').innerHTML = `<h1 class="loadingTitle">Welcome to the swapi.dev interactive database <br>Loading....</h1>`;
}

function mainPage() {
    createCategoryButtons(starWarsData);
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



// This is how I displayed the people name list and data originally. I've now changed to a more 
// refined approach by using this as a template to make a general function to display all data types.


// function displayNameList(data) {
//     const centerContent = document.getElementById('centerContent');
//     centerContent.innerHTML = '';
//     const leftContent = document.getElementById('leftContent');
//     leftContent.innerHTML = '';
//     for (let person of data) {
//         const name = document.createElement('p');
//         name.classList.add('crosshair');
//         name.textContent = person.name;
//         leftContent.appendChild(name);

//         name.addEventListener('click', () => displayPersonData(person));
//     }
// }

// function displayPersonData(person) {
//     const centerContent = document.getElementById('centerContent');
//     const rightContent = document.getElementById('rightContent');
//     rightContent.innerHTML = '';
//     rightContent.innerHTML += `<h1 class="nameTitle">${person.name}</h1>`;
//     rightContent.innerHTML += `<p>Height: ${person.height}</p>`;
//     rightContent.innerHTML += `<p>Mass: ${person.mass}</p>`;
//     rightContent.innerHTML += `<p>Hair Color: ${person.hair_color}</p>`;
//     rightContent.innerHTML += `<p>Skin Color: ${person.skin_color}</p>`;
//     rightContent.innerHTML += `<p>Eye Color: ${person.eye_color}</p>`;
//     rightContent.innerHTML += `<p>Birth Year: ${person.birth_year}</p>`;
//     rightContent.innerHTML += `<p>Gender: ${person.gender}</p>`;

//     function getIndexFromUrl(url) {
        
//         const parts = url.split('/');
//         console.log(`Index: ${Number(parts[parts.length - 2])}`);
//         return Number(parts[parts.length - 2]);
//     }


//     rightContent.innerHTML += `<p>Homeworld: ${starWarsData.planets[person.homeworld.slice(-2, -1)].name}</p>`; // Use the number on the end of the endpoint url to index the star wars data to get the name of the homeworld!!
//     // Handle films
//     const filmUrls = person.films;
//     filmUrls.forEach(filmUrl => {
//         let i = getIndexFromUrl(filmUrl);
//         let film = starWarsData.films[i - 1].title;

//         rightContent.innerHTML += `<p>Film: ${film}</p>`;
//     });

//     // Handle species
//     const speciesUrls = person.species;
//     console.log(speciesUrls);
//     speciesUrls.forEach(speciesUrl => {
//         let i = getIndexFromUrl(speciesUrl);
//         const species = starWarsData.species[i - 1].name;
//         console.log(species);
//         rightContent.innerHTML += `<p>Species: ${species}</p>`;
//     });

//     // Logic should be sound for these two functions but were getting errors when the index is over 10 because of pagination.

//     // Handle vehicles
//     const vehiclesUrls = person.vehicles;
//     console.log(vehiclesUrls);
//     vehiclesUrls.forEach(vehiclesUrl => {
//         let i = getIndexFromUrl(vehiclesUrl);
//         const vehicles = starWarsData.vehicles[i - 1].name;
//         console.log(vehicles);
//         rightContent.innerHTML += `<p>Vehicles: ${vehicles}</p>`;
//     });

//     // Handle starships
//     const starshipsUrls = person.starships;
//     console.log(starshipsUrls);
//     starshipsUrls.forEach(starshipsUrl => {
//         let i = getIndexFromUrl(starshipsUrl);
//         const starships = starWarsData.starships[i - 1].name;
//         console.log(starships);
//         rightContent.innerHTML += `<p>Starships: ${starships}</p>`;
//     });




// }
