// required packages
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({extended: false});
var fs = require('fs');

// read the data file
function readData(fileName){
    let dataRead = fs.readFileSync('./data/' + fileName + '.json');
    let infoRead = JSON.parse(dataRead);
    return infoRead;
}

// read the data file
function writeData(info, fileName){
    data = JSON.stringify(info);
    fs.writeFileSync('./data/' + fileName + '.json', data);
}

// update the data file, I use "name" to be equal to fruit, or animal or color
// to match with the file names
// I assume we always just add 1 to a single item
function combineCounts(name, value){
    // console.log(value);
    info = readData(name);
     // will be useful for text entry, since the item typed in might not be in the list
    var found = 0;
    for (var i=0; i<info.length; i++){
        if (info[i][name] === value){
            info[i].count = parseInt(info[i].count) + 1;
            found = 1;
        }
    }
    if (found === 0){
        info.push({[name] : value, count: 1});
    }
    writeData(info, name);
}

// This is the controler per se, with the get/post
module.exports = function(app){

    // when a user goes to localhost:3000/analysis
    // serve a template (ejs file) which will include the data from the data files
    app.get('/analysis', function(req, res){
        var textanswer = readData("textAnswer")
        var Q1 = readData("Q1")
        var Q2 = readData("Q2")
        var Q3 = readData("Q3")
        var comment = readData("comment")
        res.render('showResults', {results: [ textanswer, Q1, Q2, Q3, comment]});
        console.log([ textanswer, Q1, Q2]);
    });

    // when a user goes to localhost:3000/niceSurvey
    // serve a static html (the survey itself to fill in)
    app.get('/NiceSurvey', function(req, res){
        res.sendFile(__dirname+'/views/NiceSurvey.html');
    });

    // when a user types SUBMIT in localhost:3000/niceSurvey
    // the action.js code will POST, and what is sent in the POST
    // will be recuperated here, parsed and used to update the data files
    app.post('/niceSurvey', urlencodedParser, function(req, res){
        console.log(req.body);
        var json = req.body;

        for (var key in json) {
            console.log(key + ": " + json[key]);
            if (key === "Q1" || "Q2" || "Q3") {
                // Handle the usability radio button input
                combineCounts(key, json[key]);
            } else if (key === "textAnswer" || "comment") {
                // Handle the text answer input
                combineCounts(key, json[key]);
            } else {
                // Handle other inputs, e.g., checkboxes as in your original example
                if (json[key].length === 2) {
                    for (var item in json[key]) {
                        combineCounts(key, json[key][item]);
                    }
                } else {
                    combineCounts(key, json[key]);
                }
            }
        }

        res.sendFile(__dirname + "/views/NiceSurvey.html");
    });

    // Export controller function
    module.exports = function (app) {

        // Handle GET requests to /analysis
        app.get('/analysis', function (req, res) {
            // Read data from files
            const textanswer = readData('textAnswer');
            const Q1 = readData('Q1');
            const Q2 = readData('Q2');
            const Q3 = readData('Q3');
            const comment = readData('comment');

            // Render the analysis page with the retrieved data
            res.sendFile(__dirname + '/views/showResults.html');
        });

        // Handle GET requests to /niceSurvey
        app.get('/NiceSurvey', function (req, res) {
            // Serve the static HTML survey page
            res.sendFile(__dirname + '/views/NiceSurvey.html');
        });

        // Handle POST requests to /niceSurvey
        app.post('/niceSurvey', urlencodedParser, function (req, res) {
            // Process the form data and update data files
            const json = req.body;

            for (const key in json) {
                if (Object.hasOwnProperty.call(json, key)) {
                    if (key === "Q1" || key === "Q2" || key === "Q3" || key === "textAnswer" || key === "comment") {
                        // Handle radio button and text input
                        combineCounts(key, json[key]);
                    } else {
                        // Handle checkboxes
                        if (Array.isArray(json[key])) {
                            json[key].forEach(value => combineCounts(key, value));
                        } else {
                            combineCounts(key, json[key]);
                        }
                    }
                }
            }

            // Redirect to the analysis page after processing the form data
            res.redirect('/analysis');
        });
    };


};