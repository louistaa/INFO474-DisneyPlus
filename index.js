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
    console.log("Processing the data has started");

    console.log("Processing the data has ended");
}