// create the graph and append to svg

let svg = d3.select('#svg');

// Get layout parameters
let svgWidth = +svg.attr('width');
let svgHeight = +svg.attr('height');

let padding = { t: 60, r: 40, b: 30, l: 40 };

// Compute chart dimensions
let chartWidth = svgWidth - padding.l - padding.r;
let chartHeight = svgHeight - padding.t - padding.b;

// Compute the spacing for bar bands based on all 26 letters
let barBand = chartHeight / 26;
let barHeight = barBand * 0.7;

// Create a group element for appending chart elements
let chartG = svg.append('g')
    .attr('transform', 'translate(' + [padding.l, padding.t] + ')');

// fetch the data
let data = d3.csv('./disney_plus_titles.csv')
    .then((dataset) => {
        console.log("Data done downloading.");
        let consumableData = processData(dataset);

        let test = consumableData[0];
        convertToPercentage(test);

        let maxFrequency = Number.MIN_VALUE;

        test.forEach((row) => {
            if (row.frequency > maxFrequency) {
                maxFrequency = row.frequency;
            }
        })

        // Add X Axis
        let xScale = d3.scaleLinear()
            .domain([0, maxFrequency])
            .range([0, chartWidth]);

        // define tick format function to append % 
        let xAxisTop = d3.axisTop(xScale).ticks(6).tickFormat((d) => {
            return d * 100 + '%';
        });
        // append the top axis
        svg.append('g')
            .attr('class', 'axis-label')
            .call(xAxisTop)
            .attr('transform', 'translate ( ' + padding.l + ', ' + padding.t + ')');

        // define tick format function to append % for axis bottom
        let xAxisBottom = d3.axisBottom(xScale).ticks(6).tickFormat((d) => {
            return d + '%';
        });

        // append the axis bottom
        svg.append('g')
            .attr('class', 'axis-label')
            .call(xAxisBottom)
            .attr('transform', 'translate ( ' + (padding.r) + ', ' + (svgHeight - padding.b) + ')');

        // append the tittle of the graph
        svg.append('text')
            .attr('transform', 'translate (' + (chartWidth - 145) + ',' + (padding.t / 2) + ')')
            .text('Letter Frequency (%)');

        updateChart(test);

    })
    .catch((err) => {
        console.error(err);
    }
);

// will take in a column
updateChart = (data) => {
    let bars = chartG.selectAll('.bar')
        .data(data, (d) => {
            return d.id;
        })

    let barEnter = bars.enter()
        .append('g')
        .attr('class', 'bar')

    barEnter.merge(bars)
        .attr('transform', (d, i) => {
            return 'translate(' + [0, i * barBand + 4] + ')';
        })

    barEnter.append('rect')
        .attr('width', (d) => {
            console.log(d);
            return (d.frequency * 40 * barBand);
        })
        .attr('height', barHeight);

    bars.exit().remove();

    barEnter.append('text')
        .attr('x', -20)
        .attr('y', 12)
        .text((d) => {
            return d.letter;
        })
}

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

    // convert to array of objects format for visualization
    let frequencyArr = arrayOfObject(arrayOfFrequencies);

    console.log(frequencyArr);

    console.log("Processing the data has ended.");

    return frequencyArr;
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

arrayOfObject = (arrayOfFrequencies) => {
    let frequencies = [];
    arrayOfFrequencies.forEach((object) => {
        let result = Object.keys(object)
            .map(key => ({ id: key, frequency: object[key] }));
        frequencies.push(result);
    })
    return frequencies;
}

convertToPercentage = (dataset) => {
    let total = 0;

    // get the total
    dataset.forEach((datum) => {
        total += datum.frequency;
    })

    // convert raw number to percentage
    dataset.forEach((datum) => {
        datum.frequency = (datum.frequency / total);
    })

    console.log(dataset);
}