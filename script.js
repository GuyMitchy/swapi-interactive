



let starWarsData = { };




function fetchData() {
    const categories = ['people', 'planets', 'films', 'species', 'vehicles', 'starships']; //array of categories to use fetch diffrent endpoints.
    const baseUrl = 'https://swapi.dev/api/'; //base url of api
    let promises = [];

    
    console.log('Starting to fetch data...');


    for (let category of categories) { //for each category in the categories array
            let promise = fetch(`${baseUrl}${category}/`) //fetch the data from the api
            .then(response => response.json()) //convert the response to json
            .then(data => {
                starWarsData[category] = data.results; //store the data in the starWarsData object
                console.log(starWarsData[category]); //log the data to the console
            })
            .catch((e) => {
                console.error(`Error: ${e}`);
            })
            promises.push(promise);
    }
    return Promise.all(promises).then(() => {;
    console.log('All fetch operations completed.');
    //console.log('Final starWarsData:', JSON.stringify(starWarsData, null, 2));
}
)}



function displayData(starWarsData) {
    console.log('hello ${starWarsData}');
    let content = '';
    for (let category in starWarsData) {
        content += `<h2>${category}</h2>`;
        if (category === 'films') {
            for (let item of starWarsData[category]) {
                content += `<p>${item.title}</p>`;
            }
        }
        else {
        for (let item of starWarsData[category]) {
            content += `<p>${item.name}</p>`;
        }
    }
    document.getElementById('content').innerHTML = content;
}

function init() {
    fetchData().then(() => {
        displayData(starWarsData);
    }).catch(error => {
        console.error("Error fetching data:", error);
    });
}

document.addEventListener('DOMContentLoaded', init);





// if data === people then store in people variable
// if data === planets then store in planets variable
// if data === films then store in films variable
// if data === species then store in species variable
// if data === vehicles then store in vehicles variable
// if data === starships then store in starships variable

//write as switch statement


