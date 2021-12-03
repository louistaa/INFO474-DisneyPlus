// fetch the data
let data = d3.csv('./disney_plus_titles.csv')
    .then((dataset) => {
        console.log("Data done downloading.");
        processData(dataset);
    })
    .catch((err) => {
        console.error(err);
    });

// create the circles for the scatter plot
processData = (dataset) => {
    console.log("Processing the data has started.");

    const numColumns = 12;
    let columns = Object.keys(dataset[0]); // grab the first element to retrieve keys

    // array will contain objects of frequency values for each column
    let arrayOfFrequencies = [];

    // start at 1 to skip show_id
    // ends one early to skip the description
    // but creates a placeholder for season length
    for (let i = 1; i < numColumns; i++) {
        // push placeholder objects for each column
        arrayOfFrequencies.push({});
    }

    // for each row in the dataset
    dataset.forEach((element) => {
        // start at 1 to skip show_id
        // ends one early to skip the description
        for (let i = 1; i < numColumns - 1; i++) {

            // find corresponding map to the column
            let map = arrayOfFrequencies[i - 1];

            // get the row
            let value = element[columns[i]];

            // does the column contain a comma?
            // do not process the date, movie
            if (value.includes(", ") && !(i == 6 || i == 1)) {
                cleanRow(value, map);
            } else {
                // check if value is not empty, only add if it is not empty
                if (value != "") {
                    // check if key exists in the map
                    if (!map.hasOwnProperty(value)) {
                        map[value] = 0;
                    }
                    // increment 
                    map[value]++;
                }
            }
        }
    })
    // swap genre and movies time column
    let temp = arrayOfFrequencies[8];
    arrayOfFrequencies[8] = arrayOfFrequencies[9];
    arrayOfFrequencies[9] = temp;

    moveToSeason(arrayOfFrequencies);

    // arrayOfFrequencies.push(frequencyCount);
    // console.log(arrayOfFrequencies);

    console.log("Processing the data has ended.");
}

// helper method that takes in a row and splits the Country string
// will increment the corresponding object to reflect frequencies
cleanRow = (value, map) => {
    let splittedString = value.split(", ");

    splittedString.forEach((string) => {
        // check if value is not empty, only add if it is not empty
        if (string != "") {
            // check if key exists in the map
            if (!map.hasOwnProperty(string)) {
                map[string] = 0;
            }
            // increment 
            map[string]++;
        }
    })
}

moveToSeason = (arrayOfFrequencies) => {
    let movieTimes = arrayOfFrequencies[9]
    for (let key in movieTimes) {
        // moving the season to its own column
        if (key.includes("Season")) {
            arrayOfFrequencies[10][key] = movieTimes[key];
            delete arrayOfFrequencies[9][key];
        }
        
    }
}