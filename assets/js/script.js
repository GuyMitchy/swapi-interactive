/* jshint esversion: 11 */

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
        button.addEventListener('click', () => displayCategoryData(category));
        centerContent.appendChild(button);
    }

}


function displayCategoryData(category) {
    const centerContent = document.getElementById('centerContent');
    const leftContent = document.getElementById('leftContent');
    const bg = document.getElementById('section');
    const backButton = document.createElement('button');
    centerContent.innerHTML = '';
    leftContent.innerHTML = '';
    bg.classList.remove('bg-logo');
    bg.classList.add('bg-no-logo');
    
    backButton.textContent = 'Back';
    backButton.addEventListener('click', () => backButtonClick());
    backButtonContainer.appendChild(backButton);

    for (let item of Object.values(starWarsData[category])) {
        const element = document.createElement('p');
        element.classList.add('crosshair', 'gold');
        
        element.textContent = item.name || item.title; // Use title for films, name for others
        leftContent.appendChild(element);

        element.addEventListener('click', () => displayItemDetails(item));
        
    }
}

function displayItemDetails(item) {
    const rightContent = document.getElementById('rightContent');
    rightContent.innerHTML = '';

    
    // const allKeys = ['name', 'title', 'model', 'manufacturer', 'cost_in_credits', 'length', 'crew', 'passengers', 'cargo_capacity', 'consumables', 'vehicle_class', 'starship_class', 'classification', 'designation', 'average_height', 'average_lifespan', 'eye_colors', 'hair_colors', 'skin_colors', 'language', 'climate', 'terrain', 'surface_water', 'population', 'rotation_period', 'orbital_period', 'diameter', 'gravity'];
    //Now looping instead of hardcoding the keys.
    rightContent.innerHTML += `<h1 class="nameTitle">${item.name || item.title}</h1>`;

    for (let key in item) {
        if (item[key] && typeof item[key] !== 'object' && key !== 'opening_crawl' && key !== 'url' && key !== 'created' && key !== 'edited' && key !== 'homeworld' && key !== 'name' && key !== 'title') {
            rightContent.innerHTML += `<p><u class="gold_trigger">${key.replace('_', ' ').capitalize()}</u>: <span class="gold_sibling"><i>${item[key]}</i></span></p>`;
        }
    }

    if (item.opening_crawl) {
        rightContent.innerHTML += `<p><u class="gold_trigger">Opening Crawl</u>: <span class="gold_sibling"><i>${item.opening_crawl}</i></span></p>`;
    }
// Special handling for species, as humans species are not included in the species endpoint.
   
    if (item.species) {
        let speciesContent = 'Human';
        if (item.species.length > 0) {
            speciesContent = item.species.map(url => {
                const id = getIdFromUrl(url);
                const speciesData = starWarsData.species[id];
                return speciesData ? speciesData.name : 'Unknown';
            }).join(', ');
        }
        rightContent.innerHTML += `<p><u class="gold_trigger">Species</u>: <span class="gold_sibling"><i>${speciesContent}</i></span></p>`;
    }

    // unlike the other related data, the homeworld is not an array, so we need to handle it differently.
    if (item.homeworld) {
        const id = getIdFromUrl(item.homeworld);
        const planetName = starWarsData.planets[id]?.name || 'Unknown';
        rightContent.innerHTML += `<p><u class="gold_trigger">Homeworld</u>: <i class="gold_sibling">${planetName}</i></p>`;
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
            rightContent.innerHTML += `<p><u class="gold_trigger">${displayCategory}</u>: <span class="gold_sibling"><i>${relatedItems}</i></span></p>`;
        }
    }
}

// Helper functions
function getIdFromUrl(url) {
    const parts = url.split('/');
    return parts[parts.length - 2];
}   

function backButtonClick() {
    const bg = document.getElementById('section');
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


// INFO MODAL  --wrap this in a function!!!


const infoModal = document.getElementById("infoModal");


const infobtn = document.getElementById("infoButton");


const close = document.getElementsByClassName("close")[0];


infobtn.onclick = function() {
  infoModal.style.display = "block";
};


close.onclick = function() {
  infoModal.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == infoModal) {
    infoModal.style.display = "none";
  }
};

// AUDIO MODAL

// Audio Player functionality
let audioModal = document.getElementById("audioModal");
let audioBtn = document.getElementById("audioButton");
let audioSpan = audioModal.getElementsByClassName("close")[0];
let audioElement = document.getElementById("audioElement");
let playlist = document.getElementById("playlist");
let songs = [];

audioBtn.onclick = function() {
    audioModal.style.display = "block";
}

// Modify the close button functionality
audioSpan.onclick = function() {
    audioModal.style.display = "none";
    // Remove this line: audioElement.pause();
}

// Add a new function to handle closing the modal
function closeAudioModal() {
    audioModal.style.display = "none";
}

// Modify the window click event to use the new function
window.onclick = function(event) {
    if (event.target == audioModal) {
        closeAudioModal();
    }
}

// Load songs from JSON
fetch('./assets/js/song_list.json')
    .then(response => response.json())
    .then(data => {
        songs = data.songs;
        loadPlaylist();
    });

function loadPlaylist() {
    songs.forEach((song, index) => {
        let li = document.createElement("li");
        li.textContent = song.title;
        li.onclick = () => playSong(index);
        playlist.appendChild(li);
    });
}

function playSong(index) {
    let song = songs[index];
    audioElement.innerHTML = ''; // Clear previous sources
    
    // Add source for webm or m4a
    let source = document.createElement('source');
    source.src = `./assets/star_wars_music/${song.file}`;
    source.type = song.file.endsWith('.webm') ? 'audio/webm' : 'audio/x-m4a';
    audioElement.appendChild(source);
    
    audioElement.load(); // Important: reload the audio element
    audioElement.play().catch(e => console.error('Error playing audio:', e));
    
    // Update modal content
    updateModalContent(song.title);
    
    // Update active song in playlist
    Array.from(playlist.children).forEach((li, i) => {
        if (i === index) {
            li.classList.add('active');
        } else {
            li.classList.remove('active');
        }
    });

    console.log(`Attempting to play: ${song.file}`); // Add this for debugging
}

// Play next song when current song ends
audioElement.addEventListener('ended', () => {
    let currentIndex = songs.findIndex(song => song.file === audioElement.src.split('/').pop());
    let nextIndex = (currentIndex + 1) % songs.length;
    playSong(nextIndex);
});



// PAGE FUNCTIONS

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


function updateModalContent(songTitle) {
    const modalTitle = document.querySelector('#audioModal .audio-modal-content h2');
    if (modalTitle) {
        modalTitle.textContent = songTitle;
    }
}

function updateAudioButtonState(isPlaying) {
    const audioBtn = document.getElementById("audioButton");
    if (isPlaying) {
        audioBtn.classList.add("playing");
    } else {
        audioBtn.classList.remove("playing");
    }
}

// Add these event listeners to the audioElement
audioElement.addEventListener('play', () => updateAudioButtonState(true));
audioElement.addEventListener('pause', () => updateAudioButtonState(false));
audioElement.addEventListener('ended', () => updateAudioButtonState(false));

audioElement.addEventListener('error', (e) => {
    console.error('Error with audio playback:', e);
});

const audioElement2 = document.getElementById('audioElement');
const playPauseBtn = document.getElementById('playPauseBtn');
const seekBar = document.getElementById('seekBar');
const currentTimeSpan = document.getElementById('currentTime');
const durationSpan = document.getElementById('duration');

playPauseBtn.addEventListener('click', togglePlayPause);
seekBar.addEventListener('change', seek);
audioElement2.addEventListener('timeupdate', updateTime);
audioElement2.addEventListener('loadedmetadata', () => {
    seekBar.max = audioElement2.duration;
    durationSpan.textContent = formatTime(audioElement2.duration);
});

function togglePlayPause() {
    if (audioElement2.paused) {
        audioElement2.play();
        playPauseBtn.textContent = 'Pause';
    } else {
        audioElement2.pause();
        playPauseBtn.textContent = 'Play';
    }
}

function seek() {
    audioElement2.currentTime = seekBar.value;
}

function updateTime() {
    seekBar.value = audioElement2.currentTime;
    currentTimeSpan.textContent = formatTime(audioElement2.currentTime);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function playSong(index) {
    let song = songs[index];
    audioElement2.innerHTML = ''; // Clear previous sources
    
    // Add source for webm or m4a
    let source = document.createElement('source');
    source.src = `./assets/star_wars_music/${song.file}`;
    source.type = song.file.endsWith('.webm') ? 'audio/webm' : 'audio/x-m4a';
    audioElement2.appendChild(source);
    
    audioElement2.load(); // Important: reload the audio element
    audioElement2.play().catch(e => console.error('Error playing audio:', e));
    playPauseBtn.textContent = 'Pause';
    
    // Update modal content
    updateModalContent(song.title);
    
    // Update active song in playlist
    Array.from(playlist.children).forEach((li, i) => {
        if (i === index) {
            li.classList.add('active');
        } else {
            li.classList.remove('active');
        }
    });

    console.log(`Attempting to play: ${song.file}`); // Add this for debugging
}
