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
    for (let i = 1; i < numColumns; i++) {
        // push placeholder objects for each column
        arrayOfFrequencies.push({});
    }
    
    let frequencyCount = {};

    // for each row in the dataset
    dataset.forEach((element) => {
        // start at index 1 to skip show_id columns
        for (let i = 1; i < 2; i++) {
            let value = element[columns[i]];
            // check if key exists in the map
            if (!frequencyCount.hasOwnProperty(value)) {
                // create a new key
                frequencyCount[value] = 0;
            } 
            // increment
            frequencyCount[value]++;
        }
    })

    // arrayOfFrequencies.push(frequencyCount);
    // console.log(arrayOfFrequencies);

    console.log("Processing the data has ended.");
}