// This programs purpose was to grab chess.com user data and statistics based on an array of usernames and display that data to the html page. We do that by accessing chess.com's API and fetching it. There is also a function that is accessible to the html page, setHTML(), that rechecks the data and updates what you see on the html page.

// this is the array for usernames for looking up values in the api. I have as seeded data my chess.com username and some of my friends
let chessUsernames = [];
function addUsername (username) {chessUsernames.push(username);}        // a function to add a username that simply pushes an element to the list
let colorThresholds = [2200, 2000, 1900, 1800, 1700, 1500]              // an array of thresholds used to color code the ratings data
let selectedPlayer;                                                     // a variable for the first inputed username in the list, who is highlighted in the data

// this is a function to delete usernames from the array and the buttons that represent them on the html page
function deleteUsername (username) {                                    // it has an input parameter of the username that you are trying to remove
    var index = chessUsernames.indexOf(username);                       // gets the index of the username in the array, but if their are no instances of that username it will return -1
    if (index !== -1) {                                                 // checking if there are any instances of that username, and if there are it will
        chessUsernames.splice(index, 1);                                // 1) delete the username element from the array
        document.getElementById(username).remove();                     // 2) remove the html button that represents the array element
        setHTML();                                                      // 3) call the setHTML() function that resets the data that will be searched for and displayed based on the change in the username dataset
    }
}

// what will become the final array with summarized information on each of the players in the chess data
let playersData = [];

window.addEventListener("DOMContentLoaded", async(e) => {               // giving the document content time to load before setting innerHTML equal to the data we are retrieving
    setHTML();
})

// a function to access data by looping through each of the inputed usernames and fetching userful information from the chess.com API
async function setChessData (usernames) {
    return usernames.map(async(username) => {                           // the looping mechanism is .map() because this has support for asyncrony. what is actually being returned is an array of promises that will be gathered, but it will take a little bit of time for the promises to be fulfilled creating accessible values.
        var userData;                                                   // a temporary variable for gathering some of the data from the API
        var stats;                                                      // another temporary variable for gathering some of the data from the API. the reason there is two variables is because of the way that chess.com's API is designed, with some data at different urls for the same username. for more information on chess.com's API; https://www.chess.com/news/view/published-data-api

        // fetching some identifying user data that can be used later like the profile image, which is seperate from the gameplay statistics on chess.com's API. I use await and .then so that the fetched data is properly recieved before being assigned to a variable
        await fetch('https://api.chess.com/pub/player/' + username)
            .then(response => response.json())                          // recieving the response as json
            .then(data => {userData = data})                            // setting the temporary variable equal to the json objects

        // fetching the main gameplay statistics for each username in a very similary manner as shown above. '/stats' is the extension added to the url to find player statistics
        await fetch('https://api.chess.com/pub/player/' + username + '/stats')
            .then(response => response.json())                          // recieving the response as json
            .then(data => {stats = data})                               // setting the temporary variable equal to the json objects

        // returning some of each players data as an object to the array for future use. this includes the profile image or avatar link, the username, the current and best rating for the chess time formats rapid, blitz and bullet, and the overall win/loss/draw record for each time format
        return {
            avatar:userData.avatar,
            username:username,
            joinDate: new Date (userData.joined * 1000),
            lastOnline: new Date (userData.last_online * 1000),
            url:userData.url,
            rapid:{rating:stats.chess_rapid.last.rating, best:stats.chess_rapid.best.rating, record:stats.chess_rapid.record},
            blitz:{rating:stats.chess_blitz.last.rating, best:stats.chess_blitz.best.rating, record:stats.chess_blitz.record},
            bullet:{rating:stats.chess_bullet.last.rating, best:stats.chess_bullet.best.rating, record:stats.chess_bullet.record}
        };
    })
}

// simple bubble sort algorithm to order the players by average rating in descending order when called
function sortPlayers () {
    for (i = 0; i < playersData.length; i++) {                          // looping through the players data once
        for (j = 0; j < playersData.length - i - 1; j++) {              // nested loop for looping through the players accessible data and checking values against eachother
            // getting the sum of one of the players ratings across time formats
            var selectedRatingSum = playersData[j].rapid.rating + playersData[j].blitz.rating + playersData[j].bullet.rating;
            // getting the same sum for the other that is next in the array
            var incrementedRatingSum = playersData[j+1].rapid.rating + playersData[j+1].blitz.rating + playersData[j+1].bullet.rating;

            // if the first players rating on average is less than the seconds, then we swap the players
            if (selectedRatingSum < incrementedRatingSum) {
                let temp = playersData[j];                              // temporary variable to keep the original value of playersData[j] from being lost in the swap
                playersData[j] = playersData[j+1]                       // setting playersData[j] equal to the higher rated playersData[j+1]
                playersData[j+1] = temp;                                // setting playersData[j+1] equal to the lower rated player using the temporary variable
            }
        }
    }
}

// a little function to find colors that represent the strength of players rating
function colorPicker (rating) {
    if (rating >= colorThresholds[0]) {return "#0099ff";}
    if (rating >= colorThresholds[1]) {return "#33cccc";}
    if (rating >= colorThresholds[2]) {return "#33cc33";}
    if (rating < colorThresholds[5]) {return "#ff5050";}
    if (rating < colorThresholds[4]) {return "#ff9933";}
    if (rating < colorThresholds[3]) {return "#ffff00";}
    return "#cccccc";
}

// fetching and setting up the html for the displayed data on the page
async function setHTML () {
    var username = document.getElementById("userInput").value;          // finding the current value of the textbox for inputing usernames
    // checking if the username is an empty string, has whitespace, or is a duplicate of another username. if not then a username will be added and the data will be updated with this new username
    if (username.length > 0 && !username.includes(" ") && !chessUsernames.includes(username)) {
        addUsername(username);                                          // adding the username to the chessUsernames array
        // adding a representitive button to the html so that the user both knows that a username has been successfully added and also giving the user a way to remove the username by simply clicking the new button. this is done by adding an onclick() event that links up to the deleteUsername() function with the passed parameter being the username that is being added
        document.getElementById("usernamesContainer").innerHTML += "<button class='player' id='" + username + "' onclick='deleteUsername(" + '"' + username + '"' + ")'>" + username + "</button>";
        document.getElementById("userInput").value = "";                // setting the value of the input to empty if the name is successfully added. this also prevents some strange behavior when we use the same function to refresh the data once a username has been deleted (see line 13)
    }

    // checking if there are usernames before selecting one to be highlighted in the data
    if (chessUsernames.length > 0) {
        document.querySelector(".player").style.background = "#ccc";    // the first username is highlighted
        selectedPlayer = document.querySelector(".player").textContent; // I find the username for future reference so that I can select him in the data set
    }

    // setting the players data based on the array of usernames, with the only way of waiting for the array of promises to be fulfilled before running more code being "await Promise.all()"
    playersData = await Promise.all(await setChessData(chessUsernames));
    sortPlayers();                                                      // sorting the players by their average rating
    // the table variable is declared to generate a html table. it is declared with the headers to the table
    var table = "<table><tr><th>Username</th><th>Joined</th><th>Last Online</th><th>Bullet</th><th>Blitz</th><th>Rapid</th><th>Average Rating</th></tr>";
    // the graph variable is declared to generate html for the graph
    var graph = "";
    var graphLabels = "";
    document.getElementById("graphContainer").style.gridTemplateColumns = ""; // removing old template columns so that they don't accumulate
    for (i = 0; i < playersData.length; i++) {                          // looping through the players in order, as to not mess up the order of the elements by rating. then I create an html table to display the data to the user
        // adding variables for the actual data for the players
        var bullet = playersData[i].bullet.rating;
        var blitz = playersData[i].blitz.rating;
        var rapid = playersData[i].rapid.rating;
        var username = playersData[i].username;
        var url = playersData[i].url;
        var joinDate = playersData[i].joinDate.toLocaleDateString('en-US', { 
            month: 'numeric', 
            day: 'numeric', 
            year: 'numeric' 
        });
        var lastOnline = playersData[i].lastOnline;
        var today = new Date ();
        var timeDiff = (lastOnline.getTime() - today.getTime())/-60000;
        var timeDiffString = getTimeDiffString(timeDiff);
        // adding grid template columns for future graph bars in this div
        document.getElementById("graphContainer").style.gridTemplateColumns += " 70px";
        table += "<tr>";
        if (username == selectedPlayer) {                               // this if statement checks if the player selected is the first player inputed. if so, we bold the data generated as that player is the current "selected" player
            if (i == 0) {                                               // this if statement checks whether or not the player is first, second or third in the list (already ordered by average rating) so that I can add an emoji indicating first, second and third place
                table += "<td style='font-weight: bold; '>&#x1F947 <a href='" + url + "'>" + username + "</a></td>";
            } else if (i == 1) {
                table += "<td style='font-weight: bold; '>&#x1F948 <a href='" + url + "'>" + username + "</a></td>";
            } else if (i == 2) {
                table += "<td style='font-weight: bold; '>&#x1F949 <a href='" + url + "'>" + username + "</a></td>";
            } else {
                table += "<td style='font-weight: bold; '><a href='" + url + "'>" + username + "</a></td>";
            }
            table += "<td style='font-weight: bold;'>" + joinDate + "</td>";
            table += "<td style='font-weight: bold;'>" + timeDiffString + "</td>";
            table += "<td style='font-weight: bold; background: " + colorPicker(bullet) + "'>" + bullet + "</td>";
            table += "<td style='font-weight: bold; background: " + colorPicker(blitz) + "'>" + blitz + "</td>";
            table += "<td style='font-weight: bold; background: " + colorPicker(rapid) + "'>" + rapid + "</td>";
            table += "<td style='font-weight: bold; background: " + colorPicker((rapid + blitz + bullet) / 3) + "'>" + ((rapid + blitz + bullet) / 3).toFixed(2) + "</td>";
            if (i % 3 == 0) {graphLabels += "<div><p><strong>" + username + "</strong></p></div>";} else {graphLabels += "<div></div>"}
        } else {
            if (i == 0) {                                               // this statement is the same as the above one but checks if unselected players have reached first, second or third place
                table += "<td>&#x1F947 <a href='" + url + "'>" + username + "</a></td>";
            } else if (i == 1) {
                table += "<td>&#x1F948 <a href='" + url + "'>" + username + "</a></td>";
            } else if (i == 2) {
                table += "<td>&#x1F949 <a href='" + url + "'>" + username + "</a></td>";
            } else {
                table += "<td><a href='" + url + "'>" + username + "</a></td>";
            }
            table += "<td>" + joinDate + "</td>";
            table += "<td>" + timeDiffString + "</td>";
            table += "<td style='background: " + colorPicker(bullet) + "'>" + bullet + "</td>";
            table += "<td style='background: " + colorPicker(blitz) + "'>" + blitz + "</td>";
            table += "<td style='background: " + colorPicker(rapid) + "'>" + rapid + "</td>";
            table += "<td style='background: " + colorPicker((rapid + blitz + bullet) / 3) + "'>" + ((rapid + blitz + bullet) / 3).toFixed(2) + "</td>";
        }
        table += "</tr>";
        // generate the graph and popup data in the graph
        graph += "<div class='barWrapper' style='z-index: " + (-i + playersData.length) +"'>";
        graph += "<div class='bar' style='bottom: 0; background: " + colorPicker(bullet) + "; height: " + (bullet / 25) + "px;'>";
        graph += "<div style='background:" + colorPicker(bullet) + "B3;'><table><tr><th><a href='https://www.chess.com/stats/live/bullet/" + username + "'>" + username + "</a></th><th><img src='" + playersData[i].avatar + "'></th></tr><tr><td>current bullet:</td><td>" + bullet + "</td></tr><tr><td>bullet record:</td><td>" + playersData[i].bullet.best + "</td></tr></table></div></div>";
        graph += "<div class='bar' style='bottom: " + (bullet / 25 + 5) + "px; background: " + colorPicker(blitz) + "; height: " + (blitz / 25 - 5) + "px;'>";
        graph += "<div style='background:" + colorPicker(blitz) + "B3;'><table><tr><th><a href='https://www.chess.com/stats/live/blitz/" + username + "'>" + username + "</a></th><th><img src='" + playersData[i].avatar + "'></th></tr><tr><td>current blitz:</td><td>" + blitz + "</td></tr><tr><td>blitz record:</td><td>" + playersData[i].blitz.best + "</td></tr></table></div></div>";
        graph += "<div class='bar top' style='bottom: " + ((bullet / 25 + 5) + (blitz / 25)) + "px; background: " + colorPicker(rapid) + "; height: " + (rapid / 25 - 5) + "px;'>";
        graph += "<div style='background:" + colorPicker(rapid) + "B3;'><table><tr><th><a href='https://www.chess.com/stats/live/rapid/" + username + "'>" + username + "</a></th><th><img src='" + playersData[i].avatar + "'></th></tr><tr><td>current rapid:</td><td>" + rapid + "</td></tr><tr><td>rapid record:</td><td>" + playersData[i].rapid.best + "</td></tr></table></div></div></div>";
    }
    table += "</table>";
    document.getElementById("dataContainer").innerHTML = table;         // actually setting the "dataContainer" div equal to the data we've gathered
    document.getElementById("graphContainer").innerHTML = graph;        // setting "graphContainer" to the html that will create the graph
}

// a function to set the thresholds for color coding the data that is tied to the HTML inputs for this data
function setThresholds () {
    var thresholdHTMLInputs = document.querySelectorAll(".threshold");  // selecting all the HTML threshold inputs
    for (i = 0; i < thresholdHTMLInputs.length; i++) {                  // for each element we get the numerical value and set the array value equal to that
        if (!isNaN(thresholdHTMLInputs[i].value)) {                     // checking if the value is a number
            colorThresholds[i] = Number(thresholdHTMLInputs[i].value);
        }
    }
    setHTML();
    document.getElementById("openThresholds").style.display = "inline-block";
    var thresholdHTMLInputs = document.querySelectorAll(".threshold");  // selecting all the HTML threshold inputs
    // selecting their labels as well
    var thresholdHTMLLabels = document.querySelectorAll(".thresholdLabel");
    for (i = 0; i < thresholdHTMLInputs.length; i++) {
        thresholdHTMLInputs[i].style.display = "none";                  // making inputs invisible to the user
    }
    for (i = 0; i < thresholdHTMLLabels.length; i++) {
        thresholdHTMLLabels[i].style.display = "none";                  // making labels invisible to the user
    }
    document.getElementById("saveThresholds").style.display = "none";   // making a button to save changes to the thresholds invisible now that the changes are saved
}

// a function to allow the user to access the inputs for the thresholds
function openThresholdInputs () {
    document.getElementById("openThresholds").style.display = "none";   // removing the button to access the thresholds
    var thresholdHTMLInputs = document.querySelectorAll(".threshold");  // selecting all the HTML threshold inputs
    // selecting their labels as well
    var thresholdHTMLLabels = document.querySelectorAll(".thresholdLabel");
    for (i = 0; i < thresholdHTMLInputs.length; i++) {
        thresholdHTMLInputs[i].value = colorThresholds[i];              // setting the inputs values equal to the current thresholds   
        thresholdHTMLInputs[i].style.display = "inline-block";          // making inputs visible to the user
    }
    for (i = 0; i < thresholdHTMLLabels.length; i++) {
        thresholdHTMLLabels[i].style.display = "inline-block";          // making labels visible to the user
    }
    // making a button to save changes to the thresholds visible
    document.getElementById("saveThresholds").style.display = "inline-block";
}

function getTimeDiffString (timeDiff) {
    if ((timeDiff / 525600) > 1) {return (timeDiff / 525600).toFixed(2) + " years ago";} 
    else if ((timeDiff / 43800) > 1) {return (timeDiff / 43800).toFixed(2) + " months ago";}
    else if ((timeDiff / 10080) > 1) {return (timeDiff / 10080).toFixed(2) + " weeks ago";}
    else if ((timeDiff / 1440) > 1) {return (timeDiff / 1440).toFixed(2) + " days ago";}
    else if ((timeDiff / 60) > 1) {return (timeDiff / 60).toFixed(2) + " hours ago";}
    else {return timeDiff.toFixed(2) + " minutes ago";}
}