// create the graph and append to svg
let svg = d3.select('#svg');

// Get layout parameters
let svgWidth = +svg.attr('width');
let svgHeight = +svg.attr('height');

let padding = { t: 60, r: 40, b: 30, l: 40 };

// Compute chart dimensions
let chartWidth = svgWidth - padding.l - padding.r;
let chartHeight = svgHeight - padding.t - padding.b;

let barBand;
let barHeight;

// Create a group element for appending chart elements
let chartG = svg.append('g')
    .attr('transform', 'translate(' + [padding.l, padding.t] + ')');

// keeping track of the rect widths for each column
// index 1: rect width
// index 2: rect left padding
// index 3: tick bar padding multipler
let rectWidths = {
    show_type: 4.06,
    director: 1457,
    actor: 3950,
    location: 28.5,
    date: 44.25,
    year: 256.2,
    rating: 60.3,
    genre: 137,
    minutes: 553,
    season: 34.8
}

// keep track of current drop down menu selection

let currentSelection;
let maxFrequency;

// fetch the data
let data = d3.csv('./disney_plus_titles.csv')
    .then((dataset) => {
        console.log("Data done downloading.");
        // create dropdown menus
        let columns = Object.keys(rectWidths);

        let dropDown = document.querySelector('.dropdown-menu')

        let index = 0;

        columns.forEach((column) => {
            let menuLink = document.createElement('a');
            menuLink.classList.add('dropdown-item');
            menuLink.innerHTML = column;
            dropDown.appendChild(menuLink)
        })

        // update text to reflect current selection
        $('.dropdown-menu a').click(function () {
            $('#dropdownMenuButton').text($(this).text());
            currentSelection = $(this).text();

            index = 0;
            for (key in Object.keys(rectWidths)) {
                if (Object.keys(rectWidths)[key] == currentSelection) {
                    index = key;
                    break;
                }
            }
        });

        let consumableData = processData(dataset);
        dropDown.addEventListener('click', () => {
            svg.selectAll('.axis-label').remove();

            // sort by ascending frequencies
            consumableData[index].sort((a, b) => {
                return b.frequency - a.frequency;
            })

            let numberOfBands = Object.keys(consumableData[index]).length;

            // no more than 30 bars allowed
            if (numberOfBands > 15) {
                numberOfBands = 15;
            }

            // final calculation for barBand
            barBand = chartHeight / numberOfBands;
            barHeight = barBand * 0.7

            convertToPercentage(consumableData[index]);

            maxFrequency = Number.MIN_VALUE;

            consumableData[index].forEach((row) => {
                if (row.frequency > maxFrequency) {
                    maxFrequency = row.frequency;
                }
            })
            // Add X Axis
            let xScale = d3.scaleLinear()
                .domain([0, maxFrequency])
                .range([0, svgWidth * 2.5]);

            // define tick format function to append % 
            let xAxisTop = d3.axisTop(xScale).ticks(6).tickFormat((d) => {
                return d * 100 + '%';
            });

            // append the top axis
            svg.append('g')
                .attr('class', 'axis-label')
                .call(xAxisTop)
                .attr('transform', 'translate ( ' + padding.l * 4.5 + ', ' + padding.t + ')');

            svg.append('text')
                .attr('transform', 'translate (' + svgWidth * 1.5 + ',' + padding.t  / 3 + ')')
                .text('Frequency (%)')
                .attr('fill', '#4b8bc8')
                .attr('font-weight', 800)
                .attr('font-size', '20px');

            updateChart(consumableData[index], currentSelection);
        })
    })
    .catch((err) => {
        console.error(err);
    }
    );

// will take in a column
updateChart = (data, column) => {
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
            return (d.frequency * rectWidths[column] * barBand);
        })
        .attr('height', barHeight)
        .attr('x', 140);

    bars.exit().remove();

    barEnter.append('text')
        .attr('x', -40)
        .attr('y', 12)
        .text((d) => {
            return d.id;
        })
        .attr('fill', '#4b8bc8')
        .attr('font-weight', 800)
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

    // delete the movie name column
    delete arrayOfFrequencies[1];

    // convert to array of objects format for visualization
    let frequencyArr = arrayOfObject(arrayOfFrequencies);

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
}