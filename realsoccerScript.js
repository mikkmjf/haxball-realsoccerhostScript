var roomName = "default";
var maxPlayers = 1;
var playerName = "default";
var roomPublic;


var script = document.createElement('script');
script.src = 'https://code.jquery.com/jquery-1.11.0.min.js';
script.type = 'text/javascript';
document.getElementsByTagName('head')[0].appendChild(script);
var iframedoc = document.getElementsByTagName('iframe')[0].contentWindow.document;
var welcome = document.createElement("div");
document.getElementsByTagName('iframe')[0].contentWindow.document.body.appendChild(welcome);
welcome.innerHTML = '<h2>Welcome to AutoRoom by GrzeWho start-up settings page.</h2> <br/>  <h3>To create a room, enter the room name, maximum players amount, and the name of the host player, then press the button. <br/></h3>';
welcome.innerHTML += 'Room name: <input type="text" id="roomname"><br>';
welcome.innerHTML += 'Host player name: <input type="text" id="hostname"><br>';
welcome.innerHTML += 'Number of players: <input type="text" id="number"><br>';
welcome.innerHTML += 'Private room? <input type="checkbox" id="vis">';
welcome.innerHTML += '<button type="button" id="myBtn">Create a room!</button><br>';
welcome.innerHTML += 'This room supports loading and saving statistics through a file. Type in !savetofile in-game to generate a link, then click it to download. <br>';
iframedoc.getElementById("myBtn").addEventListener("click", function()
        {
         roomName = iframedoc.getElementById("roomname").value;
         maxPlayers = parseInt(iframedoc.getElementById("number").value);
        
         playerName = iframedoc.getElementById("hostname").value;
        if(!iframedoc.getElementById("vis").checked)
        {
            roomPublic = true;
        }else roomPublic = false;
        if(isNaN(maxPlayers))
        {
            console.error("Please enter a valid number in the number of players field | Liczba graczy musi byc liczba.");
        }else{
        createRoom();
        welcome.innerHTML = 'This room supports loading and saving statistics through a file. Type in !savetofile in-game to generate a link, then click it to download. <br>';
        welcome.innerHTML += "You can load a file containing the room statistics that you want to include.";
        }
        });

function createRoom()
{
var officialRSHLHost = false;

var stadiumWidth = 1150;
var stadiumHeight = 600;
var radiusBall = 9.8;
var throwInLeeway = 400;
var greenLine = 510;

var triggerDistance = radiusBall + 15 + 0.01;
var outLineY = stadiumWidth - (radiusBall / 2) + 6;
stadiumWidth += (radiusBall / 2) + 6;
stadiumHeight += (radiusBall / 2) + 6;

var Team = {
    SPECTATORS: 0,
    RED: 1,
    BLUE: 2
};
var lastScores = 0;
var lastTeamTouched = 0;
var lineBallPosition;
var exitingPos = null;
var previousBallPos;
var assistingTouch = "";
var lastPlayerTouched = "";

var backMSG = false;
var lastCall;
var isBallUp = false;
var crossed = false;
var lat = 52;
var long = 21;
var ended = false;
var isBallKickedOutside = false;
var invMass = 1.05;
var previousPlayerTouched;
var RSHLMap;
var room = HBInit({
    roomName: roomName,
    maxPlayers: maxPlayers,
    public: roomPublic,
    playerName: playerName,
    geo: {
        "code": "PL",
        "lat": lat,
        "lon": long
    }
});
    var lineCrossedPlayers = [{
        name: "temp",
        times: 0
    }];
    var goalsPlayers = [{
        name: "temp",
        times: 0
    }];
    var assistsPlayers = [{
        name: "temp",
        times: 0
    }];
    var matchesPlayers = [{
        name: "temp",
        times: 0
    }];
    var winsPlayers = [{
        name: "temp",
        times: 0
    }];
    var cleanSheets = [{
        name: "temp",
        times: 0,
        matches: 0,
        goals: 0
    }];
    var currentGKRed = [{
        name: "temp",
        times: 0,
        average: 1500
    }];
    var currentGKBlue = [{
        name: "temp",
        times: 0,
        average: -1500
    }];
    var chatLog = [{
        player: "",
        message: ""
    }];
    room.setScoreLimit(3);
    room.setTimeLimit(6);

    room.setTeamsLock(true);
    var filterOn = false;
    var safeOn = false;
    var scores;
    var blueConsecutive = 0;
    var redConsecutive = 0;
    var redGK;
    var blueGK;
    var registeredPlayers = new Array;
    var previousTeamTouched;
    var afkList = new Array;
    var activeList = new Array;
    var possessionRed = 0;
    var possessionBlue = 0;
    var mapSettings = [0.5, 0.5, 0.96, 0.12, 0.07, 0.96, 5.65, 1.05, 9.8];
            editMap();
    room.setCustomStadium(RSHLMap);

room.onTeamGoal = function(team) {
    var players = room.getPlayerList();
    var goal = 0;
    var found = false;
    setTimeout(function() {
        lastScores = room.getScores().red + room.getScores().blue;
    }, 1000);

    if (!officialRSHLHost && players.length > 7) {
        if(team==Team.RED)
        {
            found = false;
            for (var j = 0; j < cleanSheets.length; j++) {
                if (cleanSheets[j].name == blueGK.name) {
                    cleanSheets[j].goals = cleanSheets[j].goals + 1;
                    found = true;
                }

            }
            if (!found) {
                cleanSheets.push({
                    name: blueGK.name,
                    times: 0,
                    goals: 1,
                    matches: 0
                });
                found = false;
        }
    }else
        {
            found = false;
            for (var j = 0; j < cleanSheets.length; j++) {
                if (cleanSheets[j].name == redGK.name) {
                    cleanSheets[j].goals = cleanSheets[j].goals + 1;
                    found = true;
                }

            }
            if (!found) {
                cleanSheets.push({
                    name: redGK.name,
                    times: 0,
                    goals: 1,
                    matches: 0
                });
                found = false;
        }
    }
        for (var i = 0; i < players.length; i++) {
            if (players[i].name == lastPlayerTouched.name) {
                if (players[i].team == team) {
                    found = false;
                    for (var j = 0; j < goalsPlayers.length; j++) {
                        if (goalsPlayers[j].name == players[i].name) {
                            goalsPlayers[j].times = goalsPlayers[j].times + 1;
                            found = true;
                            goal = goalsPlayers[j].times;

                        }

                    }
                    if (!found) {
                        goalsPlayers.push({
                            name: players[i].name,
                            times: 1
                        });
                        goal = 1;
                    }
                    if (players[i].name != assistingTouch.name && assistingTouch.team == team) {
                        found = false;
                        for (var j = 0; j < assistsPlayers.length; j++) {
                            if (assistsPlayers[j].name == assistingTouch.name) {
                                assistsPlayers[j].times = assistsPlayers[j].times + 1;
                                found = true;
                                assist = assistsPlayers[j].times;
                            }

                        }
                        if (!found) {
                            assistsPlayers.push({
                                name: assistingTouch.name,
                                times: 1
                            });
                            assist = 1;
                        }
                        room.sendChat("Goal - Scored by " + players[i].name + " {" + goal + "}. Assist by " + assistingTouch.name + " {" + assist + "}");
                        assistingTouch = "";
                        lastPlayerTouched = "";

                    } else {
                        room.sendChat("Goal - Scored by " + players[i].name + " {" + goal + "}");
                        assistingTouch = "";
                        lastPlayerTouched = "";
                    }

                } else if (team == 2 && lastPlayerTouched.name == redGK.name && previousPlayerTouched.team == team) {
                    found = false;
                    for (var j = 0; j < goalsPlayers.length; j++) {
                        if (goalsPlayers[j].name == previousPlayerTouched.name) {
                            goalsPlayers[j].times = goalsPlayers[j].times + 1;
                            found = true;
                            goal = goalsPlayers[j].times;

                        }
                    }
                    if (!found) {
                        goalsPlayers.push({
                            name: previousPlayerTouched.name,
                            times: 1
                        });
                        goal = 1;
                    }
                    room.sendChat("Ball touched by the GK. Goal scored by " + previousPlayerTouched.name + " {" + goal + "}");
                } else if (team == 1 && lastPlayerTouched.name == blueGK.name && previousPlayerTouched.team == team) {
                    found = false;
                    for (var j = 0; j < goalsPlayers.length; j++) {
                        if (goalsPlayers[j].name == previousPlayerTouched.name) {
                            goalsPlayers[j].times = goalsPlayers[j].times + 1;
                            found = true;
                            goal = goalsPlayers[j].times;

                        }
                    }
                    if (!found) {
                        goalsPlayers.push({
                            name: previousPlayerTouched.name,
                            times: 1
                        });
                        goal = 1;
                    }
                    room.sendChat("Ball touched by the GK. Goal scored by " + previousPlayerTouched.name + " {" + goal + "}")
                } else {
                    room.sendChat("OWN GOAL!");
                }


            }
        }

    } else {
        room.sendChat("Goal. Not enough players - not added to the stats.");
    }
}

room.onPlayerLeave = function(player) {
    if (afkList.includes(player.name)) {
        afkList.splice(afkList.indexOf(player.name), 1);
    }
    var players = room.getPlayerList();
    var adminNumber = 0;
    for (var i = 0; i < players.length; i++) {
        if (players[i].admin) {
            adminNumber++;
        }
    }
    if (adminNumber < 1) {
        if(players.length>1)
        room.setPlayerAdmin(room.getPlayerList()[1].id, true);
    }
    for(var i = 0; i < registeredPlayers.length; i++)
    {
        if(registeredPlayers[i].name==player.name)
        {
            registeredPlayers[i].auth=false;
        }
    }
}
room.onGameStart = function(player) {
    lineCrossedPlayers = [{
        name: "temp",
        times: 0,
        punished: false
    }];
    currentGKRed = [{
        name: "temp",
        times: 0,
        average: 1500
    }];
    currentGKBlue = [{
        name: "temp",
        times: 0,
        average: -1500
    }];
    backupStats();
    saveToFile();
    blueGK = "";
    redGK = "";
    scores = room.getScores();
    lastScores = room.getScores().red + room.getScores().blue;
    ended = false;
    possessionRed = 0;
    possessionBlue = 0;
    activeList = [];
    setTimeout(function() {
        var scores = room.getScores();
        if(scores.time != 0)
        {
            checkActivePlayers();   
        }
          
        }, 15000);
}
function checkActivePlayers()
{
    var players = room.getPlayerList();
      for (var i = 0; i < players.length; i++) {
        if (!activeList.includes(players[i].id) && players[i].team!=0) {
            room.kickPlayer(players[i].id, "Autokick - AFK", false);
            room.pauseGame(true);
            room.sendChat(players[i].name + " was AFK. Pick another player.");
        }
    }
}
room.onPlayerBallKick = function(player) {
    var ballPosition = room.getBallPosition();
    if (player.name != lastPlayerTouched.name) {
        previousPlayerTouched = lastPlayerTouched;
        if (lastTeamTouched == player.team) {
            assistingTouch = lastPlayerTouched;
        } else assistingTouch = "";
    }

    lastPlayerTouched = player;
    lastTeamTouched = player.team;
        if(isBallOutsideStadium)
{
    getPlayersNotWithinLine();
}
    if (isBallOutsideStadium && ballPosition.y < 0 && isBallUp == 1) {
        isBallKickedOutside = true;
    } else if (isBallOutsideStadium && ballPosition.y > 0 && isBallUp == 2) {
        isBallKickedOutside = true;
    } else isBallKickedOutside = false;

}
room.onGameTick = function() {
    isThrowInCorrect();
    getLastTouchTheBall();
    checkBallPosition();
    isBackRequired();
    isBallCrossingTheLine();
    hasBallLeftTheLine();
    isBallGoingUp();
    checkLineCrosses();
    determineGK();
    checkEnd();
    checkPossession();
    protectFromDicks();
    scores = room.getScores();
}
function protectFromDicks()
{
    var players = room.getPlayerList();
    var d = new Date();
    var currTime = d.getTime();
    if(players.length>=maxPlayers-3 && currTime > lastChatTimeStamp + 450000)
    {
        for(var i = 0; i < players.length; i++)
        {
            if(VIPlist.includes(players[i].name))
            {

            }else
            room.kickPlayer(players[i].id, "Room block detected.", true);
        }
       
    }
}
room.onGameStop = function(player) {
    var players = room.getPlayerList();
    if(players.length>5){
    if ((scores.time > 280 && scores.time < 298) || (scores.red == 3 || scores.blue == 3) && player != null && player.id != 0 && ended == false) {
        ended = true;
        room.sendChat("Game stopped before it finished. Stats have been counted.")
        var victory;
        var posR = calculatePossessionRed();
        var posB = calculatePossessionBlue();
        room.sendChat("BALL POSSESSION --- RED: " + Math.round(posR) + "% || BLUE: " + Math.round(posB) + "%.");
        var found = false;
        if (scores.red > scores.blue) {
            redConsecutive++;
            blueConsecutive = 0;
            victory = 1;
            if (redConsecutive > 1) {
                room.sendChat("Red won their " + redConsecutive + " match in a row!");
            }
        }
        if (scores.red < scores.blue) {
            blueConsecutive++;
            redConsecutive = 0;
            victory = 2;
            if (redConsecutive > 1) {
                room.sendChat("Blue won their " + blueConsecutive + " match in a row!");
            }
        }
        var players = room.getPlayerList();
        for (var i = 0; i < players.length; i++) {
            if (players[i].team == victory) {
                found = false;
                for (var j = 0; j < winsPlayers.length; j++) {
                    if (winsPlayers[j].name == players[i].name) {
                        winsPlayers[j].times = winsPlayers[j].times + 1;
                        found = true;
                    }

                }
                if (!found) {
                    winsPlayers.push({
                        name: players[i].name,
                        times: 1
                    });
                    found = false;
                }

            }
            if (players[i].team == 1 || players[i].team == 2) {
                found = false;
                for (var j = 0; j < matchesPlayers.length; j++) {
                    if (matchesPlayers[j].name == players[i].name) {
                        matchesPlayers[j].times = matchesPlayers[j].times + 1;
                        found = true;
                    }

                }
                if (!found) {
                    matchesPlayers.push({
                        name: players[i].name,
                        times: 1
                    });
                    found = false;
                }
            }

        }
        if (scores.blue == 0) {
            room.sendChat(redGK.name + " kept a clean sheet!")
            found = false;
            for (var j = 0; j < cleanSheets.length; j++) {
                if (cleanSheets[j].name == redGK.name) {
                    cleanSheets[j].matches = cleanSheets[j].matches + 1;
                    found = true;
                }

            }
            if (!found) {
                cleanSheets.push({
                    name: redGK.name,
                    times: 0,
                    goals: 0,
                    matches: 1
                });
                found = false;
            }
        }
        if (scores.red == 0) {
            room.sendChat(blueGK.name + " kept a clean sheet!")
            found = false;
            for (var j = 0; j < cleanSheets.length; j++) {
                  if (cleanSheets[j].name == blueGK.name) {
                    cleanSheets[j].matches = cleanSheets[j].matches + 1;
                    found = true;
                }

            }
            if (!found) {
                cleanSheets.push({
                    name: blueGK.name,
                    times: 0,
                    goals: 0,
                    matches: 1
                });
                found = false;
            }
        }
        for (var j = 0; j < cleanSheets.length; j++) {
            if (cleanSheets[j].name == blueGK.name) {
                cleanSheets[j].times = cleanSheets[j].times + 1;
            }
            if (cleanSheets[j].name == redGK.name)
            {
                cleanSheets[j].times = cleanSheets[j].times + 1; 
            }     
         }
        var currentGKRed = [{
            name: "temp",
            times: 0,
            average: 1500
        }];
        var currentGKBlue = [{
            name: "temp",
            times: 0,
            average: -1500
        }];
    }
}
}
function checkLineCrosses() {
    var players = room.getPlayerList();
    for (var i = 0; i < lineCrossedPlayers.length; i++) {
        if (lineCrossedPlayers[i].times == 2 && lineCrossedPlayers[i].punished == false) {
            players = room.getPlayerList();
            for (var j = 0; j < players.length; j++) {
                players = room.getPlayerList();
                if (lineCrossedPlayers[i].name == players[j].name) {
                    var team = players[j].team;
                    var who = j;
                    lineCrossedPlayers[i].punished = true;
                    room.setPlayerTeam(players[j].id, 0);
                    room.sendChat("SECOND LINE VIOLATION - 3 SECONDS PENALTY");
                    punish(players[j].id, team, 3000);
                    break;
                }
            }
        }
        if (lineCrossedPlayers[i].times > 2 && lineCrossedPlayers[i].punished == false) {
            players = room.getPlayerList();
            for (var j = 0; j < players.length; j++) {
                players = room.getPlayerList();
                if (lineCrossedPlayers[i].name == players[j].name) {
                    var team = players[j].team;
                    var who = j;
                    lineCrossedPlayers[i].punished = true;
                    room.setPlayerTeam(players[j].id, 0);
                    room.sendChat("MULTIPLE LINE VIOLATIONS - 5 SECONDS PENALTY");
                    punish(players[j].id, team, 5000);
                    break;
                }
            }
        }

    }
}
function punish(punishedId, team, time)
{
    setTimeout(function() {
                        room.setPlayerTeam(punishedId, team);
                    }, time);
}
function isThrowInCorrect()
{
    var ballPosition = room.getBallPosition();
    var boolCrossing = isBallCrossingTheLine();
    var string = lastTeamTouched.toString();

    if(boolCrossing && !isBallKickedOutside && string==lastCall && (lastCall=="1" || lastCall=="2"))
    {

        if(lastCall=="2")
        {
            //room.sendChat("RED (BAD THROW-IN)");
        }
        if(lastCall=="1")
        {
           // room.sendChat("BLUE (BAD THROW-IN)");
        }

        isBallKickedOutside == false;
    }else if(boolCrossing && string!=lastCall && (lastCall=="1" || lastCall=="2"))
    {
        //room.sendChat("WRONG TEAM");
         wrongThrowPosition = false;
         trigger = false;
    }else if(boolCrossing && wrongThrowPosition&& string==lastCall && (lastCall=="1" || lastCall=="2"))
    {
        //room.sendChat("WRONG PLACE");
        wrongThrowPosition = false;
        trigger = false;
    }else if(boolCrossing)
    {
        checkPlayersLine();
    }

}
var playersNotInLine = new Array;
function getPlayersNotWithinLine() {
playersNotInLine = new Array;
var players = room.getPlayerList();
    for (var i = 0; i < players.length; i++) {
        if (players[i].position != null) {
            if (players[i].team != lastTeamTouched && players[i].team != lastCall && lastCall != "CK" && lastCall != "GK") {
                if ((players[i].position.y > greenLine || players[i].position.y < -greenLine) && pointDistance(room.getBallPosition(), players[i].position) < 500) {
                    playersNotInLine.push(players[i].name);
                }
            }

        }
    }
}
function checkPlayersLine() {
for(var i = 0; i < playersNotInLine.length; i++)
{
var found = false;
for (var j = 0; j < lineCrossedPlayers.length; j++) {
                        if (lineCrossedPlayers[j].name == playersNotInLine[i]) {
                            lineCrossedPlayers[j].times = lineCrossedPlayers[j].times + 1;
                            lineCrossedPlayers[j].punished = false;
                            room.sendChat("LINE - " + lineCrossedPlayers[j].name + " {" + lineCrossedPlayers[j].times + "}");
                            found = true;
                        }

                    }
                    if (!found) {
                        lineCrossedPlayers.push({
                            name: playersNotInLine[i],
                            times: 1,
                            punished: false
                        });
                        room.sendChat("LINE - " + playersNotInLine[i] + " {1}");
                    }
}

}
function checkEnd() {
    var scores = room.getScores();
    var players = room.getPlayerList();
    if(players.length>5)
    {
    if (scores.time > 480 && ended == false) {
        ended = true;
        room.stopGame();
        var posR = calculatePossessionRed();
        var posB = calculatePossessionBlue();
        room.sendChat("BALL POSSESSION --- RED: " + Math.round(posR) + "% || BLUE: " + Math.round(posB) + "%.");
        var players = room.getPlayerList();
        for (var i = 0; i < players.length; i++) {
            if (players[i].team == 1 || players[i].team == 2) {
                found = false;
                for (var j = 0; j < matchesPlayers.length; j++) {
                    if (matchesPlayers[j].name == players[i].name) {
                        matchesPlayers[j].times = matchesPlayers[j].times + 1;
                        found = true;
                    }

                }
                if (!found) {
                    matchesPlayers.push({
                        name: players[i].name,
                        times: 1
                    });
                    found = false;
                }
            }
        }
        blueConsecutive = 0;
        redConsecutive = 0;
        room.sendChat("DRAW");
        for (var i = 0; i < players.length; i++) {
            if ((players[i].team == 1 || players[i].team == 2) && players[i].id != 0) {
                room.setPlayerTeam(players[i].id, 0);
            }
        }

        if (scores.blue == 0) {
            room.sendChat(redGK.name + " kept a clean sheet!")
            found = false;
            for (var j = 0; j < cleanSheets.length; j++) {
                if (cleanSheets[j].name == redGK.name) {
                    cleanSheets[j].matches = cleanSheets[j].matches + 1;
                    found = true;
                }

            }
            if (!found) {
                cleanSheets.push({
                    name: redGK.name,
                    times: 0,
                    goals: 0,
                    matches: 1
                });
                found = false;
            }
        }
        if (scores.red == 0) {
            room.sendChat(blueGK.name + " kept a clean sheet!")
            found = false;
            for (var j = 0; j < cleanSheets.length; j++) {
                  if (cleanSheets[j].name == blueGK.name) {
                    cleanSheets[j].matches = cleanSheets[j].matches + 1;
                    found = true;
                }

            }
            if (!found) {
                cleanSheets.push({
                    name: blueGK.name,
                    times: 0,
                    goals: 0,
                    matches: 1
                });
                found = false;
            }
        }
        for (var j = 0; j < cleanSheets.length; j++) {
            if (cleanSheets[j].name == blueGK.name) {
                cleanSheets[j].times = cleanSheets[j].times + 1;
            }
            if (cleanSheets[j].name == redGK.name)
            {
                cleanSheets[j].times = cleanSheets[j].times + 1; 
            }     
         }
        var currentGKRed = [{
            name: "temp",
            times: 0,
            average: 1500
        }];
        var currentGKBlue = [{
            name: "temp",
            times: 0,
            average: -1500
        }];
        players = room.getPlayerList();
        if (players.length > 8) {
            var plfound = 0;
            for (var i = 0; i < players.length; i++) {
                if (players[i].team == 0 && plfound == 0 && players[i].id != 0) {
                    if (afkList.includes(players[i].name)) {

                    } else {
                        room.setPlayerTeam(players[i].id, 2);
                        plfound++;
                    }

                }
                if (players[i].team == 0 && plfound == 1 && players[i].id != 0) {
                    if (afkList.includes(players[i].name)) {

                    } else {
                        room.setPlayerTeam(players[i].id, 1);
                        plfound++;
                        break;
                    }
                }
            }
        }
    }
}
}
room.onTeamVictory = function(scores) {
    var players = room.getPlayerList();
    if(players.length>5)
    {
    if (ended == false) {
        ended = true;
        room.stopGame();
        var posR = calculatePossessionRed();
        var posB = calculatePossessionBlue();
        room.sendChat("BALL POSSESSION --- RED: " + Math.round(posR) + "% || BLUE: " + Math.round(posB) + "%.");

        var victory = -1;
        var found = false;
        if (scores.blue == 0) {
            room.sendChat(redGK.name + " kept a clean sheet!")
            found = false;
            for (var j = 0; j < cleanSheets.length; j++) {
                if (cleanSheets[j].name == redGK.name) {
                    cleanSheets[j].matches = cleanSheets[j].matches + 1;
                    found = true;
                }

            }
            if (!found) {
                cleanSheets.push({
                    name: redGK.name,
                    times: 0,
                    goals: 0,
                    matches: 1
                });
                found = false;
            }
        }
        if (scores.red == 0) {
            room.sendChat(blueGK.name + " kept a clean sheet!")
            found = false;
            for (var j = 0; j < cleanSheets.length; j++) {
                  if (cleanSheets[j].name == blueGK.name) {
                    cleanSheets[j].matches = cleanSheets[j].matches + 1;
                    found = true;
                }

            }
            if (!found) {
                cleanSheets.push({
                    name: blueGK.name,
                    times: 0,
                    goals: 0,
                    matches: 1
                });
                found = false;
            }
        }
        for (var j = 0; j < cleanSheets.length; j++) {
            if (cleanSheets[j].name == blueGK.name) {
                cleanSheets[j].times = cleanSheets[j].times + 1;
            }
            if (cleanSheets[j].name == redGK.name)
            {
                cleanSheets[j].times = cleanSheets[j].times + 1; 
            }     
         }
        if (scores.red > scores.blue) {
            redConsecutive++;
            blueConsecutive = 0;
            victory = 1;
            if (redConsecutive > 1) {
                room.sendChat("Red won their " + redConsecutive + " match in a row!");
            }
            var players = room.getPlayerList();
            if (players.length > 8) {
                for (var i = 0; i < players.length; i++) {
                    if (players[i].team == 2 && players[i].id != 0) {
                        room.setPlayerTeam(players[i].id, 0);
                    }
                }
                for (var i = 0; i < players.length; i++) {
                    if (players[i].team == 0 && players[i].id != 0) {
                        if (afkList.includes(players[i].name)) {

                        } else {
                            room.setPlayerTeam(players[i].id, 2);
                            break;
                        }

                    }
                }
            }

        }
        if (scores.blue > scores.red) {
            blueConsecutive++;
            redConsecutive = 0;
            victory = 2;
            if (blueConsecutive > 1) {
                room.sendChat("Blue won their " + blueConsecutive + " match in a row!");
            }
            var players = room.getPlayerList();
            if (players.length > 8) {
                for (var i = 0; i < players.length; i++) {
                    if (players[i].team == 1 && players[i].id != 0) {
                        room.setPlayerTeam(players[i].id, 0);
                    }
                }
                for (var i = 0; i < players.length; i++) {
                    if (players[i].team == 0 && players[i].id != 0) {
                        if (afkList.includes(players[i].name)) {

                        } else {
                            room.setPlayerTeam(players[i].id, 1);
                            break;
                        }
                    }
                }
            }
        }
        var players = room.getPlayerList();
        for (var i = 0; i < players.length; i++) {
            if (players[i].team == victory) {
                found = false;
                for (var j = 0; j < winsPlayers.length; j++) {
                    if (winsPlayers[j].name == players[i].name) {
                        winsPlayers[j].times = winsPlayers[j].times + 1;
                        found = true;
                    }

                }
                if (!found) {
                    winsPlayers.push({
                        name: players[i].name,
                        times: 1
                    });
                    found = false;
                }

            }
            if (players[i].team != 0) {
                found = false;
                for (var j = 0; j < matchesPlayers.length; j++) {
                    if (matchesPlayers[j].name == players[i].name) {
                        matchesPlayers[j].times = matchesPlayers[j].times + 1;
                        found = true;
                    }

                }
                if (!found) {
                    matchesPlayers.push({
                        name: players[i].name,
                        times: 1
                    });
                    found = false;
                }
            }
        }
        var currentGKRed = [{
            name: "temp",
            times: 0,
            average: 1500
        }];
        var currentGKBlue = [{
            name: "temp",
            times: 0,
            average: -1500
        }];
    }
}
}

var playerCount = 0;
room.onPlayerJoin = function(player) {
    playerCount++;
    var name = player.name;
    if(playerCount%150==0)
    {
        room.sendChat("cc");
    }
	if(playerCount%47==0)
    {
        room.sendChat("ee");
		room.sendChat("W morde chcesz?");
    }
	if(playerCount%27==0)
    {
		room.sendChat("nn");
    }
	
    if(bannedPlayers.includes(player.name))
    {
        room.kickPlayer(player.id, "You are banned from this room.", true);
    }
    if(name.charAt(0)==" ")
    {
        room.kickPlayer(player.id, "Invalid nickname. Space in the beginning.", false);
    }
    var players = room.getPlayerList();
    var adminNumber = 0;
    for (var i = 0; i < players.length; i++) {
        if (players[i].admin) {
            adminNumber++;
        }
    }
    if (adminNumber < 3) {
        room.setPlayerAdmin(players[1].id, true);
        if (players.length > 2)
            room.setPlayerAdmin(players[2].id, true);
    }

    for(var i = 0; i < registeredPlayers.length; i++)
    {
        if(registeredPlayers[i].name==player.name)
        {
        if(registeredPlayers[i].auth==true)
        {
            room.kickPlayer(player.id, "User with this name is already logged in", 0);
            registeredPlayers[i].auth=true;
        }else{
        var foundid = i;
        room.sendChat(player.name + " is a restricted nickname. Authentication required. {!login password}");

        setTimeout(function() {
            if(!(registeredPlayers[foundid].auth))
                        room.kickPlayer(player.id, "Fake detected. Goodbye.", 1);
                    }, 20000);
        }
    }
    }
}
room.onPlayerActivity = function(player) {
    if(!activeList.includes(player))
    {
    activeList.push(player.id);
    }
}
function isOutsideStadium(ballPosition) {
    return ballPosition.x > stadiumWidth || ballPosition.x < -stadiumWidth || ballPosition.y > stadiumHeight || ballPosition.y < -stadiumHeight;
}
var isBallOutsideStadium = false;
var previousPlayerCall = "";
var chatLog;
function filter(message)
{
    message = message.toLowerCase();
    message = message.replace(/\s/g, '');
    message = message.split('.').join('');
    message = message.split(',').join('');
    if(message.includes("motherfucker") || message.includes("fuck") || message.includes("cunt") || message.includes("twat") || message.includes("snatch") || message.includes("pussy") || message.includes("prick") || message.includes("bellend") || message.includes("bastard") || message.includes("shit") || message.includes("bitch") || message.includes("arsehole") || message.includes("dick") || message.includes("wanker") || message.includes("tosser") || message.includes("nigger") || message.includes("nigga") || message.includes("dich") || message.includes("fick") || message.includes("hure") || message.includes("ass") || message.includes("whore") || message.includes("shit") || message.includes("gown") || message.includes("huj") || message.includes("dziwk") ||message.includes("kutas"))
    {
        return true;
    }else return false;
}
var muteList = new Array();
var bannedPlayers = new Array();
var VIPlist = ["Becky G", "geoff"];
var lastChatTimeStamp;
var lastMessagePlayers = new Array();


room.onPlayerChat = function(player, message) {
    if (message == "!admin youloveit") {
        room.setPlayerAdmin(player.id, true);
        return false;
    } 
    var d = new Date();
    lastChatTimeStamp = d.getTime();
    var messages = 0;
    lastMessagePlayers.push([player.name, lastChatTimeStamp]);
    if(lastMessagePlayers.length>3)
        {
            lastMessagePlayers.splice(0,1);
        }

    for(var i = 0; i < lastMessagePlayers.length; i++)
        {
            if(lastMessagePlayers[i][0]==player.name)
            {
                messages++;
            }
        }
        if(messages>=3)
        {
            if(lastMessagePlayers[0][1]+5000>lastMessagePlayers[2][1]&&!VIPlist.includes(player.name))
            {
            myMatches = 0;
            for (var o = 0; o < matchesPlayers.length; o++) {
                if (matchesPlayers[o].name == player.name) {
                    myMatches = matchesPlayers[o].times;
                }
            }
            if(myMatches<100)
            {
                room.kickPlayer(player.id, "Spammer detected.", false);
               // permabanPlayer("the host", player.name);
            }
        }

    }

    var regexp = /[A-z\d\u00C0-\u00ff?!*@$]+/g;
    var i = message.indexOf(' ');
    var parameter = [message.slice(0,i), message.slice(i+1)];
    if(parameter[0]== "!login")
    {
    for(var i = 0; i < registeredPlayers.length; i++)
    {
        if(registeredPlayers[i].name==player.name)
        {
        if(registeredPlayers[i].auth==false)
        {
          
                var hash = new String(parameter[1]).hashCode();
                if(hash==registeredPlayers[i].pass)
                {
                    registeredPlayers[i].auth = true;              
                    room.sendChat("Authenticated succesfully. Welcome, " + player.name);  
                    if(VIPlist.includes(player.name))
                    {
                        room.setPlayerAdmin(player.id, true);
                    }
                }
            
        return false;
        }
        }
    }
    }
    for(var i = 0; i < registeredPlayers.length; i++)
    {
        if(registeredPlayers[i].name==player.name)
        {
        if(registeredPlayers[i].auth==false)
        {
            return false;
        }
    }
    }
    if(!regexp.test(message))
    {
        var hasPlayed = false;
        for(var i = 0; i < matchesPlayers.length; i++)
                {
                    if(matchesPlayers[i].name==player.name)
                    {
                        hasPlayed = true;
                    }
                }
        if(!hasPlayed)
               {
                return false;
                room.kickPlayer(player.id, "Spammer detected - illegal characters", false);            
               } 

    }
    if(safeOn)
    {
        if (message == "!admin youloveit") {
            room.setPlayerAdmin(player.id, true);
            return false;
        } 
        if(player.team==0&&player.admin==false)
        {
            return false;
        }

    }
    var i = message.indexOf(' ');
    var parameter = [message.slice(0,i), message.slice(i+1)];
   /* chatLog.push({
        player: player.name,
        message: message
    });*/
    if(filter(message) && filterOn)
    {
        return false;
    }
    if(muteList.includes(player.name))
    {
        return false;
    }
    if (!afkList.includes(player.name)) {
        if (message.charAt(0) == "!") {
            if (parameter[0] == "!mute" && player.admin == true) {
                if (!muteList.includes(parameter[1])) {
                    muteList.push(parameter[1]);
                    room.sendChat(parameter[1] + " has been muted by " + player.name);
                } else {
                    muteList.splice(muteList.indexOf(parameter[1]), 1);
                    room.sendChat(parameter[1] + " has been unmuted by " + player.name)
                }
                return false;
            }  else if (message == "!original" && player.admin == true) {
                room.stopGame();
                mapSettings = [0.5, 0.5, 0.96, 0.12, 0.07, 0.96, 5.65, 1.05, 9.8];
                editMap();
                room.setCustomStadium(RSHLMap);
                room.sendChat("Stadium settings are set to original.");
            }  else if (parameter[0] == "!bcoef" && (VIPlist.includes(player.name))) {
                room.stopGame();
                mapSettings[0] = parseFloat(parameter[1]);
                editMap();
                room.setCustomStadium(RSHLMap);
                room.sendChat("Bcoef is set to: " + parameter[1]);
            }  else if (parameter[0] == "!playerMass" && (VIPlist.includes(player.name))) {
                room.stopGame();
                mapSettings[1] = parseFloat(parameter[1]);
                editMap();
                room.setCustomStadium(RSHLMap);
                room.sendChat("Player mass is set to: " + parameter[1]);
            }  else if (parameter[0] == "!damping" && (VIPlist.includes(player.name))) {
                room.stopGame();
                mapSettings[2] = parseFloat(parameter[1]);
                editMap();
                room.setCustomStadium(RSHLMap);
                room.sendChat("Damping is set to: " + parameter[1]);
            }  else if (parameter[0] == "!acceleration" && (VIPlist.includes(player.name))) {
                room.stopGame();
                mapSettings[3] = parseFloat(parameter[1]);
                editMap();
                room.setCustomStadium(RSHLMap);
                room.sendChat("Acceleration is set to: " + parameter[1]);
            }  else if (parameter[0] == "!kickacceleration" && (VIPlist.includes(player.name))) {
                room.stopGame();
                mapSettings[4] = parseFloat(parameter[1]);
                editMap();
                room.setCustomStadium(RSHLMap);
                room.sendChat("Kick acceleration is set to: " + parameter[1]);
            }  else if (parameter[0] == "!kickdamping" && (VIPlist.includes(player.name))) {
                room.stopGame();
                mapSettings[5] = parseFloat(parameter[1]);
                editMap();
                room.setCustomStadium(RSHLMap);
                room.sendChat("Kick damping is set to: " + parameter[1]);
            }  else if (parameter[0] == "!kickstrength" && (VIPlist.includes(player.name))) {
                room.stopGame();
                mapSettings[6] = parseFloat(parameter[1]);
                editMap();
                room.setCustomStadium(RSHLMap);
                room.sendChat("Kick strength is set to: " + parameter[1]);
            }  else if (parameter[0] == "!ballweight" && (VIPlist.includes(player.name))) {
                room.stopGame();
                mapSettings[7] = parseFloat(parameter[1]);
                editMap();
                room.setCustomStadium(RSHLMap);
                room.sendChat("Ball weight is set to: " + parameter[1]);
            }   else if (parameter[0] == "!ballradius" && (VIPlist.includes(player.name))) {
                room.stopGame();
                mapSettings[8] = parseFloat(parameter[1]);
                editMap();
                room.setCustomStadium(RSHLMap);
                room.sendChat("Ball radius is set to: " + parameter[1]);
            }   else if (parameter[0] == "!map") {
                room.sendChat("Map editing commands: !bcoef !playerMass !damping !acceleration !kickacceleration !kickdamping !kickstrength !ballweight !ballradius");
            }else if (parameter[0] == "!afk" && player.admin == true) {
                if(parameter[1]!=null)
                {
                if (!afkList.includes(parameter[1])) {
                    afkList.push(parameter[1]);
                    room.sendChat(parameter[1] + " has been set AFK by " + player.name + ". Type !afk to be available again.")
                } else {
                    afkList.splice(afkList.indexOf(parameter[1]), 1);
                    room.sendChat(parameter[1] + " set not AFK anymore by " + player.name + ".")
                }
                return false;
                }
            }else if (message == "!afk") {
                if (!afkList.includes(player.name)) {
                    afkList.push(player.name);
                    room.sendChat(player.name + " went AFK.");
                    scores = room.getScores();
                    if (player.team != 0) {
                        room.setPlayerTeam(player.id, 0);
                    }
                    if(scores!=null&&scores.time>60)
                    {
                    setTimeout(function() {
                            scores = room.getScores();
                            if(scores==null||scores.time<10)
                            {
                            room.pauseGame(true);
                            room.kickPlayer(player.id, "Stats cheating detected!", false);
                            }
                        }, 10000);
                    }

                } else {
                    afkList.splice(afkList.indexOf(player.name), 1);
                    room.sendChat(player.name + " is not AFK anymore.")
                }
                return false;
            } else if (message == "!clearstats" && player.name == "Becky G") {
                lineCrossedPlayers = [{
                    name: "temp",
                    times: 0,
                    punished: false
                }];
                goalsPlayers = [{
                    name: "temp",
                    times: 0
                }];
                assistsPlayers = [{
                    name: "temp",
                    times: 0
                }];
                matchesPlayers = [{
                    name: "temp",
                    times: 0
                }];
                winsPlayers = [{
                    name: "temp",
                    times: 0
                }];
                 cleanSheets = [{
        name: "temp",
        times: 0
    }];
                blueConsecutive = 0;
                redConsecutive = 0;
                room.sendChat("Stats cleared.");

            } else if (parameter[0] == "!rejestruj" || parameter[0] =="!register" && (VIPlist.includes(player.name))) {
                for(var i = 0; i < registeredPlayers.length; i++)
                {
                    if(registeredPlayers[i].name==player.name)
                    {
                        room.sendChat("Already registered.");
                        return false;
                    }
                }
                    var hash = new String(parameter[1]).hashCode();
                    registeredPlayers.push({name: player.name, pass: hash, auth: true});
                    room.sendChat("Registered.");
                return false;
            } else if (parameter[0] == "!wyrejestruj" || parameter[0] =="!deregister" && (VIPlist.includes(player.name))) {
                for (var o = 0; o < registeredPlayers.length; o++) {
                   if(parameter[1]==registeredPlayers[o].name)
                   {
                    registeredPlayers.splice(o,1);
                    room.sendChat(parameter[1] + " is deregistered.");
                   }
                }
                return false;
            } else if (parameter[0] == "!wyrejestruj" || parameter[0] =="!deregister" || parameter[0] == "!rejestruj" || parameter[0] =="!register" && (VIPlist.includes(player.name))) {
                room.sendChat("VIP only command.");
                return false;
            }else if (parameter[0] == "!login") {
                room.sendChat("Already logged in. [!login password]");
                return false;
            }else if (parameter[0] == "!ban") {
                permabanPlayer(player.name, parameter[1]);
                return false;
            }else if (parameter[0] == "!unban" && VIPlist.includes(player.name)) {
                for(var i = 0; i < bannedPlayers.length; i++)
                {
                    if(bannedPlayers[i]==parameter[1])
                    {
                        bannedPlayers.splice(i,1);
                        room.sendChat(parameter[1] + " has been unbanned by " + player.name);
                        room.clearBans();
                    }
                }
                return false;
            }else if (parameter[0] == "!delete" && VIPlist.includes(player.name)) {
                for(var i = 0; i < registeredPlayers.length; i++)
                {
                    if(registeredPlayers[i].name==player.name)
                    {
                        bannedPlayers.splice(i,1);
                        room.sendChat(parameter[1] + " stats have been deleted by " + player.name);
                        deleteStats(parameter[1]);
                        statBannedPlayers.push(parameter[1]);
                    }
                }
                return false;
            }else if (message == "!clearbans" && player.admin == true) {
                room.clearBans();
                room.sendChat(player.name + " has cleared the bans.");
            }else if (message == "!unmuteall" && player.admin == true) {
                room.sendChat(player.name + " has unmuted everyone.");
                muteList = new Array;
            }else if (message == "!mutedlist" && player.admin == true) {
                room.sendChat("-------Muted players-------");
                var preparedString = "";
                for (var o = 0; o < muteList.length; o++) {
                   preparedString += " | " + muteList[o];
                }
                room.sendChat(preparedString);
            } else if (message == "!filter" && player.admin == true) {
                if(filterOn == true)
                {
                    filterOn = false;
                    room.sendChat("Language filter off.");
                }else
                {
                    filterOn = true;
                    room.sendChat("Language filter on.");
                }
            } else if (message == "!safemode" && player.admin == true) {
                if(safeOn == true)
                {
                    safeOn = false;
                    room.sendChat("Safe mode off.");
                }else
                {
                    safeOn = true;
                    room.sendChat("Safe mode on. Only admins and players can chat.");
                }
            }else if (message == "!best" && player.admin == true) {
                var arrayofBest = bestCalculate();
                room.sendChat("Wins per game");
                for (var o = 0; o < arrayofBest.length; o++) {
                    if (o < 5) {
                        var tempString = "" + (o + 1) + "#: " + arrayofBest[o].name + " - " + (arrayofBest[o].times*100).toFixed(2) + "% wins. [" + arrayofBest[o].matches + " matches played]"
                        room.sendChat("" + tempString);
                    }
                }
            } else if (message == "!worst" && player.admin == true) {
                var arrayofBest = bestCalculate();
                room.sendChat("Worst players by win ratio");
                for (var o = 0; o < arrayofBest.length; o++) {
                    if (o < 5) {
                        var tempString = "" + (o + 1) + "#: " + arrayofBest[arrayofBest.length-o-1].name + " - " + (arrayofBest[arrayofBest.length-o-1].times*100).toFixed(2) + "% wins. [" + arrayofBest[arrayofBest.length-o-1].matches + " matches played]"
                        room.sendChat("" + tempString);
                    }
                }
            } else if (message == "!gpg" && player.admin == true) {
                var arrayofBest = gpgCalculate();
                room.sendChat("Goals per game");
                for (var o = 0; o < arrayofBest.length; o++) {
                    if (o < 5) {
                        var tempString = "" + (o + 1) + "#: " + arrayofBest[o].name + " - " + arrayofBest[o].times.toFixed(2) + " goals per game. [" + arrayofBest[o].matches + " matches played]"
                        room.sendChat("" + tempString);
                    }
                }
            } else if (message == "!apg" && player.admin == true) {
                var arrayofBest = apgCalculate();
                room.sendChat("Assists per game");
                for (var o = 0; o < arrayofBest.length; o++) {
                    if (o < 5) {
                        var tempString = "" + (o + 1) + "#: " + arrayofBest[o].name + " - " + arrayofBest[o].times.toFixed(2) + " assists per game. [" + arrayofBest[o].matches + " matches played]"
                        room.sendChat("" + tempString);
                    }
                }
            } else if (message == "!bestgk" && player.admin == true) {
                var arrayofBest = csCalculate();
                room.sendChat("Clean sheets per game");
                for (var o = 0; o < arrayofBest.length; o++) {
                    if (o < 5) {
                        var tempString = "" + (o + 1) + "#: " + arrayofBest[o].name + " - " + (arrayofBest[o].times*100).toFixed(2) + "% clean sheets. [" + arrayofBest[o].matches + " matches as GK]"
                        room.sendChat("" + tempString);
                    }
                }
            } else if (message == "!wins" && player.admin == true) {
                winsPlayers.sort(compare);
                room.sendChat("Wins as a player");
                for (var o = 0; o < winsPlayers.length; o++) {
                    if (o < 5) {
                        room.sendChat(o + 1 + "#: " + winsPlayers[o].name + " - " + winsPlayers[o].times + " wins.");
                    }
                }

            } else if (message == "!goals" && player.admin == true) {
                goalsPlayers.sort(compare);
                room.sendChat("Best goalscorers");
                for (var o = 0; o < goalsPlayers.length; o++) {
                    if (o < 5) {
                        room.sendChat(o + 1 + "#: " + goalsPlayers[o].name + " - " + goalsPlayers[o].times + " goals.");
                    }
                }

            } else if (message == "!assists" && player.admin == true) {
                assistsPlayers.sort(compare);
                room.sendChat("Most assists");
                for (var o = 0; o < assistsPlayers.length; o++) {
                    if (o < 5) {
                        room.sendChat(o + 1 + "#: " + assistsPlayers[o].name + " - " + assistsPlayers[o].times + " assists.");
                    }
                }
            } else if (message == "!gk" && player.admin == true) {
                cleanSheets.sort(compare);
                room.sendChat("Best goalkeepers");
                for (var o = 0; o < cleanSheets.length; o++) {
                    if (o < 5) {
                        room.sendChat(o + 1 + "#: " + cleanSheets[o].name + " - " + cleanSheets[o].times + " clean sheets.");
                    }
                }
            }  else if (message == "!savetofile" && player.admin == true) {
               saveToFile();
               room.sendChat("Player stats saved. Download link generated in the headless host window.");
            }   else if (message == "!nolife" && player.admin == true) {
                matchesPlayers.sort(compare);
                room.sendChat("Biggest no-life");
                for (var o = 0; o < matchesPlayers.length; o++) {
                    if (o < 5) {
                        room.sendChat(o + 1 + "#: " + matchesPlayers[o].name + " - " + matchesPlayers[o].times + " matches.");
                    }
                }
            } else if (parameter[0] == "!playerstats") {
                personalInfo(parameter[1]);
            }  else if (message == "!me") {
                personalInfo(player.name);
                return false;
            } else {
                room.sendChat("Available commands - !afk !me !playerstats <name>");
                room.sendChat("-----Admin commands-----");
                room.sendChat("!best !worst !wins !goals !assists !nolife !gk !gpg !apg !clearbans !safemode !filter !afk <nick> !mute <nick> !mutedlist !unmuteall");
            }
            if (player.name == "Becky G") {
                return false;
            } else return true;
        }
    } else if (message == "!afk") {
        if (!afkList.includes(player.name)) {
            afkList.push(player.name);
            room.sendChat(player.name + " went AFK.")
        if(scores!=null&&scores.time>0)
                    {
                    setTimeout(function() {
                            if(scores==null||scores.time<10)
                            {
                            room.pauseGame(true);
                            room.kickPlayer(player.id, "Stats cheating detected!", false);
                            }
                        }, 10000);
                    }
        } else {
            afkList.splice(afkList.indexOf(player.name), 1);
            room.sendChat(player.name + " is not AFK anymore.")
        }
        return false;
    } else return false;
}
function permabanPlayer(admin, player)
{
    if(VIPlist.includes(admin) || admin == "the host")
    {
        if(bannedPlayers.includes(player))
        {
            room.sendChat(player + " is already banned.");
            return false;
        }
        players = room.getPlayerList();
        for(var i = 0; i<players.length; i++)
        {
            if(players[i].name==player)
            {
                room.kickPlayer(players[i].id, "You have been banned by " + admin, true);
            }
        }
        room.sendChat(admin + " added " + player + " to the banned list.");
        bannedPlayers.push(player);
    }
}

var statBannedPlayers = new Array;
function deleteStats(player)
{
    for (var o = 0; o < goalsPlayers.length; o++) {
        if (goalsPlayers[o].name == player) {
            goalsPlayers.splice(o,1);
        }
    }
    for (var o = 0; o < assistsPlayers.length; o++) {
        if (assistsPlayers[o].name == player) {
            assistsPlayers.splice(o,1);
        }
    }
    for (var o = 0; o < winsPlayers.length; o++) {
        if (winsPlayers[o].name == player) {
            winsPlayers.splice(o,1);
        }
    }
    for (var o = 0; o < matchesPlayers.length; o++) {
        if (matchesPlayers[o].name == player) {
            matchesPlayers.splice(o,1);
        }
    }
    for (var o = 0; o < cleanSheets.length; o++) {
        if (cleanSheets[o].name == player) {
           cleanSheets.splice(o,1);
        }
    }
}
function personalInfo(player)
{
    if(statBannedPlayers.includes(player))
    {
        room.sendChat(player + " - stats deleted. Unfair player.");
        deleteStats(player);
        return false;
    }
                var myGoals = 0;
                var myAssists = 0;
                var myWins = 0;
                var myMatches = 0;
                var winRatio = 0;
                var goalRatio = 0;
                var assistRatio = 0;
                var myCleanSheets = 0;
                var timesAsGK = 0;
                var cleanSheetRatio = 0;
                var goalsAgainst = 0;
                for (var o = 0; o < goalsPlayers.length; o++) {
                    if (goalsPlayers[o].name == player) {
                        myGoals = goalsPlayers[o].times;
                    }
                }
                for (var o = 0; o < assistsPlayers.length; o++) {
                    if (assistsPlayers[o].name == player) {
                        myAssists = assistsPlayers[o].times;
                    }
                }
                for (var o = 0; o < winsPlayers.length; o++) {
                    if (winsPlayers[o].name == player) {
                        myWins = winsPlayers[o].times;
                    }
                }
                for (var o = 0; o < matchesPlayers.length; o++) {
                    if (matchesPlayers[o].name == player) {
                        myMatches = matchesPlayers[o].times;
                    }
                }
                if(myMatches==0)
                {
                    room.sendChat(player + " has not played any matches");
                    return false;
                }
                for (var o = 0; o < cleanSheets.length; o++) {
                    if (cleanSheets[o].name == player) {
                        myCleanSheets = cleanSheets[o].matches;
                        timesAsGK = cleanSheets[o].times;
                        goalsAgainst = cleanSheets[o].goals;
                    }
                }
                winRatio = myWins / myMatches;
                goalRatio = myGoals / myMatches;
                assistRatio = myAssists / myMatches;
                cleanSheetRatio = myCleanSheets / timesAsGK;
                room.sendChat(player + " - " + "G: " + myGoals + ", A: " + myAssists + ", M: " + myMatches + ", W: " + myWins + ", WPG: " + (winRatio*100).toFixed(2) + "%, GPG: " + goalRatio.toFixed(2) + ", APG: " + assistRatio.toFixed(2) + ", CS%: " + (cleanSheetRatio*100).toFixed(2) + ", GK-: " + goalsAgainst);
            }
function checkBallPosition() {
    var ballPosition = room.getBallPosition();
    if (isOutsideStadium(ballPosition)) {
        // console.log(ballPosition);
        if (!isBallOutsideStadium) {
            isBallOutsideStadium = true;
            exitingPos = ballPosition.x;
            var totalScores = room.getScores().red + room.getScores().blue;
            if (lastScores != totalScores) {
                lastScores = totalScores;
                return false;
            }
            if (ballPosition.x > stadiumWidth && lastTeamTouched == Team.RED || ballPosition.x < -stadiumWidth && lastTeamTouched == Team.BLUE) {
                lastCall = "GK";
                room.sendChat("GK");
            } else if (ballPosition.x > stadiumWidth && lastTeamTouched == Team.BLUE || ballPosition.x < -stadiumWidth && lastTeamTouched == Team.RED) {
                room.sendChat("CK");
                lastCall = "CK";
            } else {
                isBallKickedOutside = false;
                room.sendChat(lastTeamTouched == Team.RED ? "B" : "R");
                lastCall = lastTeamTouched == Team.RED ? "2" : "1";
            }

        }
    } else {
        isBallOutsideStadium = false;
        backMSG = true;

    }
    return true;
}

function getLastTouchTheBall() {
    var ballPosition = room.getBallPosition();
    var players = room.getPlayerList();
    for (var i = 0; i < players.length; i++) {
        if (players[i].position != null) {
            var distanceToBall = pointDistance(players[i].position, ballPosition);
            if (distanceToBall < triggerDistance) {
                if (lastPlayerTouched.name != players[i].name) {
                    previousPlayerTouched = lastPlayerTouched;
                    if (lastTeamTouched == players[i].team) {

                        assistingTouch = lastPlayerTouched;
                    } else previousTeamTouched = lastTeamTouched;

                }
                lastTeamTouched = players[i].team;
                previousPlayerTouched == lastPlayerTouched;
                lastPlayerTouched = players[i];
            }
        }
    }
    return lastPlayerTouched;
}

function pointDistance(p1, p2) {
    var d1 = p1.x - p2.x;
    var d2 = p1.y - p2.y;
    return Math.sqrt(d1 * d1 + d2 * d2);
}

var trigger = false;
var wrongThrowPosition = false;
function isBackRequired()
{
var ballPosition = room.getBallPosition();
if(!isBallKickedOutside)
{
if(lastCall=="1")
{
    if((ballPosition.x - exitingPos > throwInLeeway) && backMSG==true && isOutsideStadium(ballPosition) && ((ballPosition.y - outLineY > 20) || (ballPosition.y - outLineY < -20)))
    {
        backMSG = false;
        room.sendChat("BACK");
        trigger = true;
        wrongThrowPosition = true;
    }
    if((ballPosition.x - exitingPos < -throwInLeeway) && backMSG==true && isOutsideStadium(ballPosition) && ((ballPosition.y - outLineY > 20) || (ballPosition.y - outLineY < -20)))
    {
        backMSG = false;
        room.sendChat("FURTHER");
        trigger = true;
        wrongThrowPosition = true;
    }
}
if(lastCall=="2")
{
    if((ballPosition.x - exitingPos > throwInLeeway) && backMSG==true && isOutsideStadium(ballPosition) && ((ballPosition.y - outLineY > 20) || (ballPosition.y - outLineY < -20)))
    {
        backMSG = false;
        room.sendChat("FURTHER");
        trigger = true;
        wrongThrowPosition = true;
    }
    if((ballPosition.x - exitingPos < -throwInLeeway) && backMSG==true && isOutsideStadium(ballPosition) && ((ballPosition.y - outLineY > 20) || (ballPosition.y - outLineY < -20)))
    {
        backMSG = false;
        room.sendChat("BACK");
        trigger = true;
        wrongThrowPosition = true;
    }
}
}
if(lastCall=="2" && trigger && isOutsideStadium && Math.abs(exitingPos - ballPosition.x)< throwInLeeway-20)
{
    room.sendChat("OK");
    trigger = false;
    wrongThrowPosition = false;
    backMSG = true;
}
if(lastCall=="1" && trigger && isOutsideStadium && Math.abs(exitingPos - ballPosition.x)< throwInLeeway-20)
{
    room.sendChat("OK");
    trigger = false;
    wrongThrowPosition = false;
    backMSG = true;
}



}
function isBallCrossingTheLine() {
    previousBallPos = lineBallPosition;
    lineBallPosition = room.getBallPosition().y;
    crossed = (lineBallPosition < stadiumHeight && previousBallPos > stadiumHeight) || (lineBallPosition > -stadiumHeight && previousBallPos < -stadiumHeight);
    return (lineBallPosition < stadiumHeight && previousBallPos > stadiumHeight) || (lineBallPosition > -stadiumHeight && previousBallPos < -stadiumHeight);
}

var previousBallPosForGoingUp;
var currentBallPosForGoingUp;

function isBallGoingUp() {
    previousBallPosForGoingUp = currentBallPosForGoingUp;
    currentBallPosForGoingUp = room.getBallPosition().y;
    if (previousBallPosForGoingUp - currentBallPosForGoingUp > 0.01) {
        isBallUp = 2;
    } else if (previousBallPosForGoingUp - currentBallPosForGoingUp < -0.01) {

        isBallUp = 1;
    } else {
        isBallUp = 0;
    }
}

function hasBallLeftTheLine() {
    var ballPosition = room.getBallPosition();
    if (ballPosition.y < outLineY && isBallKickedOutside) {

    } else if (ballPosition.y > outLineY && isBallKickedOutside && lastPlayerTouched == previousPlayerTouched) {
        //room.sendChat("BAD THROW");
    }

}

function compare(a, b) {
    return b.times - a.times;
}

function determineGK() {
    var players = room.getPlayerList();
    for (var i = 0; i < players.length; i++) {
        if (players[i].team == 1) {
            found = false;
            for (var j = 0; j < currentGKRed.length; j++) {
                if (currentGKRed[j].name == players[i].name) {
                    currentGKRed[j].times = currentGKRed[j].times + 1;
                    currentGKRed[j].average = currentGKRed[j].average + (players[i].position.x - currentGKRed[j].average) / currentGKRed[j].times;
                    found = true;
                }

            }
            if (!found) {
                currentGKRed.push({
                    name: players[i].name,
                    times: 1,
                    average: 0.0
                });
                found = false;
            }

        } else if (players[i].team == 2) {
            found = false;
            for (var j = 0; j < currentGKBlue.length; j++) {
                if (currentGKBlue[j].name == players[i].name) {
                    currentGKBlue[j].times = currentGKBlue[j].times + 1;
                    currentGKBlue[j].average = currentGKBlue[j].average + (players[i].position.x - currentGKBlue[j].average) / currentGKBlue[j].times;
                    found = true;
                }

            }
            if (!found) {
                currentGKBlue.push({
                    name: players[i].name,
                    times: 1,
                    average: 0.0
                });
                found = false;
            }
        }
        var players = room.getPlayerList();
        var tempGKRed = currentGKRed[0];
        for (var j = 1; j < currentGKRed.length; j++) {
            if (currentGKRed[j].average < tempGKRed.average) {
                tempGKRed = currentGKRed[j];
            }
        }
        redGK = tempGKRed;
        var tempGKBlue = currentGKBlue[0];
        for (var j = 1; j < currentGKBlue.length; j++) {
            if (currentGKBlue[j].average > tempGKBlue.average) {
                tempGKBlue = currentGKBlue[j];
            }
        }
        blueGK = tempGKBlue;
    }
}

function bestCalculate() {
    var tempArray = new Array;
    matchesPlayers.sort(compare);
    winsPlayers.sort(compare);
    for (var i = 0; i < matchesPlayers.length; i++) {
        if (matchesPlayers[i].times > 0.075 * matchesPlayers[0].times) {
            var tempName = matchesPlayers[i].name;
            for (var j = 0; j < winsPlayers.length; j++) {
                if (winsPlayers[j].name == tempName && winsPlayers[j].name != "temp") {
                    var ratio = winsPlayers[j].times / matchesPlayers[i].times;
                    tempArray.push({
                        name: tempName,
                        times: ratio,
                        matches: matchesPlayers[i].times
                    });
                }
            }
        }
    }
    tempArray.sort(compare);
    return tempArray;
}

function gpgCalculate() {
    var tempArray = [{
        name: "temp",
        times: 0,
        matches: 0
    }];
    matchesPlayers.sort(compare);
    goalsPlayers.sort(compare);
    for (var i = 0; i < matchesPlayers.length; i++) {
        if (matchesPlayers[i].times > 0.075 * matchesPlayers[0].times) {
            var tempName = matchesPlayers[i].name;
            for (var j = 0; j < goalsPlayers.length; j++) {
                if (goalsPlayers[j].name == tempName && goalsPlayers[j].name != "temp") {
                    var ratio = goalsPlayers[j].times / matchesPlayers[i].times;
                    tempArray.push({
                        name: tempName,
                        times: ratio,
                        matches: matchesPlayers[i].times
                    });
                }
            }
        }
    }
    tempArray.sort(compare);
    return tempArray;
}

function apgCalculate() {
    var tempArray = new Array;
    matchesPlayers.sort(compare);
    assistsPlayers.sort(compare);
    for (var i = 0; i < matchesPlayers.length; i++) {
        if (matchesPlayers[i].times > 0.075 * matchesPlayers[0].times) {
            var tempName = matchesPlayers[i].name;
            for (var j = 0; j < assistsPlayers.length; j++) {
                if (assistsPlayers[j].name == tempName && assistsPlayers[j].name != "temp") {
                    var ratio = assistsPlayers[j].times / matchesPlayers[i].times;
                    tempArray.push({
                        name: tempName,
                        times: ratio,
                        matches: matchesPlayers[i].times
                    });
                }
            }
        }
    }
    tempArray.sort(compare);
    return tempArray;
}

function csCalculate() {
    var tempArray = new Array;
    cleanSheets.sort(compare);
    for (var i = 0; i < cleanSheets.length; i++) {
        if (cleanSheets[i].times > 0.1 * cleanSheets[0].times) {
                if (cleanSheets[i].name != "temp") {
                    var ratio = cleanSheets[i].matches / cleanSheets[i].times;
                    tempArray.push({
                        name: cleanSheets[i].name,
                        times: ratio,
                        matches: cleanSheets[i].times
                    });
                }
            }
        }
    tempArray.sort(compare);
    return tempArray;
}
room.onStadiumChange = function(newStadiumName, byPlayer) {
    if (newStadiumName != "Real Soccer 1.3D by RawR") {
        room.sendChat("Changing the map is not allowed.");
        room.setCustomStadium(RSHLMap);
        room.kickPlayer(byPlayer.id, "Don't change the map", false);
    }
}

room.onPlayerTeamChange = function(changedPlayer, byPlayer) {
    if(byPlayer.id!=0)
    {
        for (var j = 0; j < currentGKRed.length; j++) {
            if (currentGKRed[j].name == changedPlayer.name) {
                currentGKRed.splice(j, 1);
            }
        }
        for (var j = 0; j < currentGKBlue.length; j++) {
            if (currentGKBlue[j].name == changedPlayer.name) {
                currentGKBlue.splice(j, 1);
            }
        }

    }
    if (afkList.includes(changedPlayer.name) && byPlayer.id != 0) {
        room.sendChat(changedPlayer.name + " is currently AFK.");
        room.setPlayerTeam(changedPlayer.id, 0);
    }
    scores = room.getScores();
    if(scores!=null&&scores.time>60&&byPlayer.id!=0)
                    {
                    setTimeout(function() {
                            scores = room.getScores();
                            if(scores==null||scores.time<10)
                            {
                            room.pauseGame(true);
                            room.kickPlayer(changedPlayer.id, "Stats cheating detected!", false);
                            }
                        }, 10000);
                    }
}

function checkPossession()
{
    if(lastPlayerTouched!=null && !isBallOutsideStadium)
    {
        if(lastPlayerTouched.team==1)
        {
            possessionRed++;
        }
        if(lastPlayerTouched.team==2)
        {
            possessionBlue++;
        }
}
}
function calculatePossessionRed()
{
    var total = possessionBlue + possessionRed;
    var posperRed = possessionRed / total * 100;
    return posperRed;
}
function calculatePossessionBlue()
{
    var total = possessionBlue + possessionRed;
    var posperBlue = possessionBlue / total * 100;
    return posperBlue;
}
var currentdate = new Date(); 
function saveToFile()
{
    var link = iframedoc.getElementById("dl");
    var arrToFile = new Array;
    arrToFile = [goalsPlayers, assistsPlayers, matchesPlayers, winsPlayers, cleanSheets, registeredPlayers];
    var resultJson = [JSON.stringify(arrToFile, null, 2)]
    var blob = new Blob(resultJson, {type : 'application/json'});
    if(link==null)
    {
       link  = document.createElement("a");
       document.getElementsByTagName('iframe')[0].contentWindow.document.body.appendChild(link);
    }         
    currentdate = new Date(); 
    var datetime = currentdate.getDate() + "_"
            + (currentdate.getMonth()+1)  + "_" 
            + currentdate.getFullYear() + "_"  
            + currentdate.getHours() + "_"  
            + currentdate.getMinutes();
    link.href = URL.createObjectURL(blob);
    link.id = "dl";
    link.download = "yourRoomStats|" + datetime + ".hbx";
    link.innerHTML = "Click here to download the room stats file.";


}
function backupStats()
{
    var arrToFile = new Array;
    arrToFile = [goalsPlayers, assistsPlayers, matchesPlayers, winsPlayers, cleanSheets, registeredPlayers];
    var resultJson = [JSON.stringify(arrToFile, null, 2)] 
    fetch('http://localhost:5000/api/values', {
        method: "POST",
        headers: { 
            'Accept': 'application/json',
            'Content-Type': 'application/json' 
        },
        body: resultJson,
        mode: 'no-cors'
        })
  .then((response) => {
    return response.json();
  })
  .then((jsonObject) => {
  console.log(jsonObject)
  })
  .catch((error) => {
  });
}
function handleFileSelect(evt) {
var files = evt.target.files[0]; // FileList object
var reader = new FileReader();
var text = "";
reader.onload = function(){
  text = reader.result;
  var myObject = JSON.parse(text);
        
        goalsPlayers = myObject[0];
        assistsPlayers = myObject[1];
        matchesPlayers = myObject[2];
        winsPlayers = myObject[3];
        cleanSheets = myObject[4];
        registeredPlayers = myObject[5];
        room.sendChat("Stats loaded from a file.");
};
reader.readAsText(files);
for(var i = 0; i < registeredPlayers.length; i++)
{
    registeredPlayers[i].auth = false;
}
}
//prepare document
var iframedoc = document.getElementsByTagName('iframe')[0].contentWindow.document;
welcome.innerHTML += '';
iframedoc.body.insertAdjacentHTML('beforeend', '<div><button type="button" id="banBtn">Ban everyone</button><br></div><input type="file" id="files" name="files"/>');
iframedoc.getElementById('files').addEventListener('change', handleFileSelect, false);

String.prototype.hashCode = function() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

iframedoc.getElementById("banBtn").addEventListener("click", function()
{
    if(room!=null)
    {
        players = room.getPlayerList();
        for(var i = 0; i < players.length; i++)
        {
            if(!VIPlist.includes(players[i].name))
            {
                room.kickPlayer(players[i].id, "Admin panel - AutoBan", true);
            }
        }
    }
});

function editMap()
{
    RSHLMap = `{

    "name" : "Real Soccer 1.3D by RawR",

    "width" : 1300,

    "height" : 670,

    "spawnDistance" : 500,

    "bg" : { "type" : "grass", "width" : 1150, "height" : 600, "kickOffRadius" : 180, "cornerRadius" : 0 },

    "playerPhysics" : {
        "bCoef" : ` + mapSettings[0] + `,
        "invMass" : ` + mapSettings[1] + `,
        "damping" : ` + mapSettings[2] + `,
        "acceleration" : ` + mapSettings[3] + `,
        "kickingAcceleration" : ` + mapSettings[4] + `,
        "kickingDamping" : ` + mapSettings[5] + `,
        "kickStrength" : ` + mapSettings[6] + `,

    },

    "vertexes" : [
        /* 0 */ { "x" : 0, "y" : 700, "trait" : "kickOffBarrier" },
        /* 1 */ { "x" : 0, "y" : 180, "trait" : "kickOffBarrier" },
        /* 2 */ { "x" : 0, "y" : -180, "trait" : "kickOffBarrier" },
        /* 3 */ { "x" : 0, "y" : -700, "trait" : "kickOffBarrier" },
        
        /* 4 */ { "x" : 1150, "y" : 255, "trait" : "line" },
        /* 5 */ { "x" : 840, "y" : 255, "trait" : "line" },
        /* 6 */ { "x" : 1150, "y" : -255, "trait" : "line" },
        /* 7 */ { "x" : 840, "y" : -255, "trait" : "line" },
        /* 8 */ { "x" : 1150, "y" : 155, "trait" : "line" },
        /* 9 */ { "x" : 1030, "y" : 155, "trait" : "line" },
        /* 10 */ { "x" : 1150, "y" : -155, "trait" : "line" },
        /* 11 */ { "x" : 1030, "y" : -155, "trait" : "line" },
        /* 12 */ { "x" : 840, "y" : -135, "trait" : "line", "curve" : -130 },
        /* 13 */ { "x" : 840, "y" : 135, "trait" : "line", "curve" : -130 },
        /* 14 */ { "x" : -1150, "y" : -255, "trait" : "line", "curve" : -90, "color" : "97AC86" },
        /* 15 */ { "x" : -840, "y" : -255, "trait" : "line" },
        /* 16 */ { "x" : -1150, "y" : 255, "trait" : "line" },
        /* 17 */ { "x" : -840, "y" : 255, "trait" : "line" },
        /* 18 */ { "x" : -1150, "y" : -155, "trait" : "line" },
        /* 19 */ { "x" : -1030, "y" : -155, "trait" : "line" },
        /* 20 */ { "x" : -1150, "y" : 155, "trait" : "line" },
        /* 21 */ { "x" : -1030, "y" : 155, "trait" : "line" },
        /* 22 */ { "x" : -840, "y" : 135, "trait" : "line", "curve" : -130 },
        /* 23 */ { "x" : -840, "y" : -135, "trait" : "line", "curve" : -130 },
        /* 24 */ { "x" : 935, "y" : 4, "trait" : "line" },
        /* 25 */ { "x" : 935, "y" : -4, "trait" : "line" },
        /* 26 */ { "x" : -935, "y" : 4, "trait" : "line" },
        /* 27 */ { "x" : -935, "y" : -4, "trait" : "line" },
        /* 28 */ { "x" : -1150, "y" : 525, "bCoef" : 0, "cMask" : ["wall" ], "trait" : "line" },
        /* 29 */ { "x" : -1075, "y" : 600, "bCoef" : 0, "cMask" : ["wall" ], "trait" : "line", "_selected" : true },
        /* 30 */ { "x" : -1075, "y" : -600, "bCoef" : 0, "cMask" : ["wall" ], "trait" : "line" },
        /* 31 */ { "x" : -1150, "y" : -525, "bCoef" : 0, "cMask" : ["wall" ], "trait" : "line" },
        /* 32 */ { "x" : 1075, "y" : 600, "bCoef" : 0, "cMask" : ["wall" ], "trait" : "line" },
        /* 33 */ { "x" : 1150, "y" : 525, "bCoef" : 0, "cMask" : ["wall" ], "trait" : "line" },
        /* 34 */ { "x" : 1150, "y" : -525, "bCoef" : 0, "cMask" : ["wall" ], "trait" : "line" },
        /* 35 */ { "x" : 1075, "y" : -600, "bCoef" : 0, "cMask" : ["wall" ], "trait" : "line" },
        /* 36 */ { "x" : -1150, "y" : 127, "trait" : "line", "color" : "ffffff" },
        /* 37 */ { "x" : -1214, "y" : 124, "trait" : "line", "color" : "ffffff", "curve" : 5 },
        /* 38 */ { "x" : -1150, "y" : -127, "trait" : "line", "color" : "ffffff" },
        /* 39 */ { "x" : -1214, "y" : -124, "trait" : "line", "color" : "ffffff", "curve" : 5 },
        /* 40 */ { "x" : 1150, "y" : 127, "trait" : "line", "color" : "ffffff" },
        /* 41 */ { "x" : 1214, "y" : 124, "trait" : "line", "color" : "ffffff", "curve" : -5 },
        /* 42 */ { "x" : 1150, "y" : -127, "trait" : "line", "color" : "ffffff" },
        /* 43 */ { "x" : 1214, "y" : -124, "trait" : "line", "color" : "ffffff", "curve" : -5 },
        /* 44 */ { "x" : 0, "y" : -4, "trait" : "line" },
        /* 45 */ { "x" : 0, "y" : 4, "trait" : "line" },
        /* 46 */ { "x" : 0, "y" : -4, "trait" : "line" },
        /* 47 */ { "x" : 0, "y" : 4, "trait" : "line" },
        /* 48 */ { "x" : -1214, "y" : 124, "trait" : "line", "color" : "ffffff" },
        /* 49 */ { "x" : -1250, "y" : 150, "trait" : "line", "color" : "ffffff", "pos" : [-1250,150 ] },
        /* 50 */ { "x" : -1214, "y" : -124, "trait" : "line", "color" : "ffffff" },
        /* 51 */ { "x" : -1250, "y" : -150, "trait" : "line", "color" : "ffffff", "pos" : [-1250,-150 ] },
        /* 52 */ { "x" : 1214, "y" : 124, "trait" : "line", "color" : "ffffff" },
        /* 53 */ { "x" : 1250, "y" : 150, "trait" : "line", "color" : "ffffff" },
        /* 54 */ { "x" : 1214, "y" : -124, "trait" : "line", "color" : "ffffff" },
        /* 55 */ { "x" : 1250, "y" : -150, "trait" : "line", "color" : "ffffff" },
        /* 56 */ { "x" : -1185, "y" : 155, "bCoef" : -4.5, "cMask" : ["ball" ], "trait" : "line", "curve" : 40, "color" : "BEB86C" },
        /* 57 */ { "x" : -1185, "y" : 255, "bCoef" : -4.5, "cMask" : ["ball" ], "trait" : "line", "curve" : 40, "color" : "BEB86C" },
        /* 58 */ { "x" : 1185, "y" : 155, "bCoef" : -4.5, "cMask" : ["ball" ], "trait" : "line", "curve" : -40, "color" : "BEB86C" },
        /* 59 */ { "x" : 1185, "y" : 255, "bCoef" : -4.5, "cMask" : ["ball" ], "trait" : "line", "curve" : -40, "color" : "BEB86C" },
        /* 60 */ { "x" : -1185, "y" : -155, "bCoef" : -4.5, "cMask" : ["ball" ], "trait" : "line", "curve" : -40, "color" : "BEB86C" },
        /* 61 */ { "x" : -1185, "y" : -255, "bCoef" : -4.5, "cMask" : ["ball" ], "trait" : "line", "curve" : -40, "color" : "BEB86C" },
        /* 62 */ { "x" : 1185, "y" : -155, "bCoef" : -4.5, "cMask" : ["ball" ], "trait" : "line", "curve" : 40, "color" : "BEB86C" },
        /* 63 */ { "x" : 1185, "y" : -255, "bCoef" : -4.5, "cMask" : ["ball" ], "trait" : "line", "curve" : 40, "color" : "BEB86C" },
        /* 64 */ { "x" : 1158, "y" : -607, "bCoef" : -2.45, "cMask" : ["ball" ], "trait" : "line", "curve" : 0, "color" : "BEB86C" },
        /* 65 */ { "x" : 1187, "y" : -578, "bCoef" : -2.45, "cMask" : ["ball" ], "trait" : "line", "curve" : -60, "color" : "BEB86C" },
        /* 66 */ { "x" : 1158, "y" : 607, "bCoef" : -2.45, "cMask" : ["ball" ], "trait" : "line", "curve" : 0, "color" : "BEB86C" },
        /* 67 */ { "x" : 1187, "y" : 578, "bCoef" : -2.45, "cMask" : ["ball" ], "trait" : "line", "curve" : 60, "color" : "BEB86C" },
        /* 68 */ { "x" : -1158, "y" : 607, "bCoef" : -2.45, "cMask" : ["ball" ], "trait" : "line", "curve" : 0, "color" : "BEB86C" },
        /* 69 */ { "x" : -1187, "y" : 578, "bCoef" : -2.45, "cMask" : ["ball" ], "trait" : "line", "curve" : -60, "color" : "BEB86C" },
        /* 70 */ { "x" : -1158, "y" : -607, "bCoef" : -2.45, "cMask" : ["ball" ], "trait" : "line", "curve" : 0, "color" : "BEB86C" },
        /* 71 */ { "x" : -1187, "y" : -578, "bCoef" : -2.45, "cMask" : ["ball" ], "trait" : "line", "curve" : 60, "color" : "BEB86C" },
        /* 72 */ { "x" : -1190, "y" : -255, "bCoef" : -1, "cMask" : ["ball" ], "trait" : "line", "color" : "000000", "curve" : 0 },
        /* 73 */ { "x" : -1180, "y" : -255, "bCoef" : -1, "cMask" : ["ball" ], "trait" : "line", "color" : "000000", "curve" : 0 },
        /* 74 */ { "x" : -1190, "y" : -155, "bCoef" : -1, "cMask" : ["ball" ], "trait" : "line", "color" : "000000", "curve" : 0 },
        /* 75 */ { "x" : -1180, "y" : -155, "bCoef" : -1, "cMask" : ["ball" ], "trait" : "line", "color" : "000000", "curve" : 0 },
        /* 76 */ { "x" : -1190, "y" : 155, "bCoef" : -1, "cMask" : ["ball" ], "trait" : "line", "color" : "000000", "curve" : 0 },
        /* 77 */ { "x" : -1180, "y" : 155, "bCoef" : -1, "cMask" : ["ball" ], "trait" : "line", "color" : "000000", "curve" : 0 },
        /* 78 */ { "x" : -1190, "y" : 255, "bCoef" : -1, "cMask" : ["ball" ], "trait" : "line", "color" : "000000", "curve" : 0 },
        /* 79 */ { "x" : -1180, "y" : 255, "bCoef" : -1, "cMask" : ["ball" ], "trait" : "line", "color" : "000000", "curve" : 0 },
        /* 80 */ { "x" : 1190, "y" : -255, "bCoef" : -1, "cMask" : ["ball" ], "trait" : "line", "color" : "000000", "curve" : 0 },
        /* 81 */ { "x" : 1180, "y" : -255, "bCoef" : -1, "cMask" : ["ball" ], "trait" : "line", "color" : "000000", "curve" : 0 },
        /* 82 */ { "x" : 1190, "y" : -155, "bCoef" : -1, "cMask" : ["ball" ], "trait" : "line", "color" : "000000", "curve" : 0 },
        /* 83 */ { "x" : 1180, "y" : -155, "bCoef" : -1, "cMask" : ["ball" ], "trait" : "line", "color" : "000000", "curve" : 0 },
        /* 84 */ { "x" : 1190, "y" : 255, "bCoef" : -1, "cMask" : ["ball" ], "trait" : "line", "color" : "000000", "curve" : 0 },
        /* 85 */ { "x" : 1180, "y" : 255, "bCoef" : -1, "cMask" : ["ball" ], "trait" : "line", "color" : "000000", "curve" : 0 },
        /* 86 */ { "x" : 1190, "y" : 155, "bCoef" : -1, "cMask" : ["ball" ], "trait" : "line", "color" : "000000", "curve" : 0 },
        /* 87 */ { "x" : 1180, "y" : 155, "bCoef" : -1, "cMask" : ["ball" ], "trait" : "line", "color" : "000000", "curve" : 0 },
        /* 88 */ { "x" : -1148, "y" : -525, "trait" : "line", "curve" : -90, "color" : "5E844D" },
        /* 89 */ { "x" : 1148, "y" : -525, "trait" : "line", "color" : "5E844D" },
        /* 90 */ { "x" : -1148, "y" : 525, "trait" : "line", "curve" : -90, "color" : "5E844D" },
        /* 91 */ { "x" : 1148, "y" : 525, "trait" : "line", "color" : "5E844D" },
        /* 92 */ { "x" : -1150, "y" : -260, "trait" : "line", "curve" : -100, "color" : "5E844D" },
        /* 93 */ { "x" : -840, "y" : -600, "trait" : "line", "color" : "5E844D", "curve" : -100 },
        /* 94 */ { "x" : -1150, "y" : 260, "trait" : "line", "curve" : 100, "color" : "5E844D" },
        /* 95 */ { "x" : -840, "y" : 600, "trait" : "line", "color" : "5E844D", "curve" : 100 },
        /* 96 */ { "x" : -840, "y" : -1150, "trait" : "line", "color" : "5E844D", "curve" : -100 },
        /* 97 */ { "x" : 1150, "y" : -260, "trait" : "line", "curve" : 100, "color" : "5E844D" },
        /* 98 */ { "x" : 840, "y" : -600, "trait" : "line", "color" : "5E844D", "curve" : 100 },
        /* 99 */ { "x" : 1150, "y" : 260, "trait" : "line", "curve" : -100, "color" : "5E844D" },
        /* 100 */ { "x" : 840, "y" : 600, "trait" : "line", "color" : "5E844D", "curve" : -100 }

    ],

    "segments" : [
        { "v0" : 37, "v1" : 39, "curve" : 5, "color" : "ffffff", "trait" : "reargoalNetleft", "x" : -1210 },
        
        { "v0" : 41, "v1" : 43, "curve" : -5, "color" : "ffffff", "trait" : "reargoalNetright" },
        
        { "v0" : 4, "v1" : 5, "trait" : "line", "y" : 250 },
        { "v0" : 5, "v1" : 7, "trait" : "line", "x" : 840 },
        { "v0" : 6, "v1" : 7, "trait" : "line", "y" : -250 },
        { "v0" : 8, "v1" : 9, "trait" : "line", "y" : 150 },
        { "v0" : 9, "v1" : 11, "trait" : "line", "x" : 1030 },
        { "v0" : 10, "v1" : 11, "trait" : "line", "y" : -150 },
        { "v0" : 12, "v1" : 13, "curve" : -130, "trait" : "line", "x" : 840 },
        { "v0" : 14, "v1" : 15, "trait" : "line", "y" : -250 },
        { "v0" : 15, "v1" : 17, "trait" : "line", "x" : -840 },
        { "v0" : 16, "v1" : 17, "trait" : "line", "y" : 250 },
        { "v0" : 18, "v1" : 19, "trait" : "line", "y" : -150 },
        { "v0" : 19, "v1" : 21, "trait" : "line", "x" : -1030 },
        { "v0" : 20, "v1" : 21, "trait" : "line", "y" : 150 },
        { "v0" : 22, "v1" : 23, "curve" : -130, "trait" : "line", "x" : -840 },
        { "v0" : 24, "v1" : 25, "curve" : -180, "trait" : "line", "x" : 935 },
        { "v0" : 26, "v1" : 27, "curve" : -180, "trait" : "line", "x" : -935 },
        { "v0" : 24, "v1" : 25, "curve" : 180, "trait" : "line", "x" : 935 },
        { "v0" : 26, "v1" : 27, "curve" : 180, "trait" : "line", "x" : -935 },
        { "v0" : 24, "v1" : 25, "curve" : 90, "trait" : "line", "x" : 935 },
        { "v0" : 26, "v1" : 27, "curve" : 90, "trait" : "line", "x" : -935 },
        { "v0" : 24, "v1" : 25, "curve" : -90, "trait" : "line", "x" : 935 },
        { "v0" : 26, "v1" : 27, "curve" : -90, "trait" : "line", "x" : -935 },
        { "v0" : 24, "v1" : 25, "trait" : "line", "x" : 935 },
        { "v0" : 26, "v1" : 27, "trait" : "line", "x" : -935 },
        { "v0" : 28, "v1" : 29, "curve" : 90, "bCoef" : 0, "cMask" : ["wall" ], "trait" : "line" },
        { "v0" : 30, "v1" : 31, "curve" : 90, "bCoef" : 0, "cMask" : ["wall" ], "trait" : "line" },
        { "v0" : 32, "v1" : 33, "curve" : 90, "bCoef" : 0, "cMask" : ["wall" ], "trait" : "line" },
        { "v0" : 34, "v1" : 35, "curve" : 90, "bCoef" : 0, "cMask" : ["wall" ], "trait" : "line" },
        
        { "v0" : 36, "v1" : 37, "curve" : 5, "color" : "ffffff", "trait" : "sidegoalNet" },
        { "v0" : 38, "v1" : 39, "curve" : -5, "color" : "ffffff", "trait" : "sidegoalNet" },
        { "v0" : 40, "v1" : 41, "curve" : -5, "color" : "ffffff", "trait" : "sidegoalNet" },
        { "v0" : 42, "v1" : 43, "curve" : 5, "color" : "ffffff", "trait" : "sidegoalNet" },
        
        { "v0" : 44, "v1" : 45, "curve" : -180, "trait" : "line" },
        { "v0" : 46, "v1" : 47, "curve" : 180, "trait" : "line" },
        { "v0" : 44, "v1" : 45, "curve" : -90, "trait" : "line" },
        { "v0" : 46, "v1" : 47, "curve" : 90, "trait" : "line" },
        { "v0" : 48, "v1" : 49, "color" : "ffffff", "trait" : "line" },
        { "v0" : 50, "v1" : 51, "color" : "ffffff", "trait" : "line" },
        { "v0" : 52, "v1" : 53, "color" : "ffffff", "trait" : "line" },
        { "v0" : 54, "v1" : 55, "color" : "ffffff", "trait" : "line" },
        { "v0" : 56, "v1" : 57, "curve" : 40, "vis" : true, "color" : "BEB86C", "bCoef" : -4.7, "cMask" : ["ball" ], "trait" : "line", "x" : -1220 },
        { "v0" : 58, "v1" : 59, "curve" : -40, "vis" : true, "color" : "BEB86C", "bCoef" : -4.7, "cMask" : ["ball" ], "trait" : "line", "x" : 1220 },
        { "v0" : 60, "v1" : 61, "curve" : -40, "vis" : true, "color" : "BEB86C", "bCoef" : -4.7, "cMask" : ["ball" ], "trait" : "line", "x" : -1220 },
        { "v0" : 62, "v1" : 63, "curve" : 40, "vis" : true, "color" : "BEB86C", "bCoef" : -4.7, "cMask" : ["ball" ], "trait" : "line", "x" : 1220 },
        { "v0" : 64, "v1" : 65, "curve" : -60, "vis" : true, "color" : "BEB86C", "bCoef" : -2.45, "cMask" : ["ball" ], "trait" : "line" },
        { "v0" : 66, "v1" : 67, "curve" : 60, "vis" : true, "color" : "BEB86C", "bCoef" : -2.45, "cMask" : ["ball" ], "trait" : "line" },
        { "v0" : 68, "v1" : 69, "curve" : -60, "vis" : true, "color" : "BEB86C", "bCoef" : -2.45, "cMask" : ["ball" ], "trait" : "line" },
        { "v0" : 70, "v1" : 71, "curve" : 60, "vis" : true, "color" : "BEB86C", "bCoef" : -2.45, "cMask" : ["ball" ], "trait" : "line" },
        
        { "v0" : 0, "v1" : 1, "trait" : "kickOffBarrier" },
        { "v0" : 1, "v1" : 2, "curve" : 180, "cGroup" : ["blueKO" ], "trait" : "kickOffBarrier" },
        { "v0" : 1, "v1" : 2, "curve" : -180, "cGroup" : ["redKO" ], "trait" : "kickOffBarrier" },
        { "v0" : 2, "v1" : 3, "trait" : "kickOffBarrier" },
        
        { "v0" : 72, "v1" : 73, "curve" : 0, "vis" : true, "color" : "000000", "bCoef" : -1, "cMask" : ["ball" ], "trait" : "line" },
        { "v0" : 74, "v1" : 75, "curve" : 0, "vis" : true, "color" : "000000", "bCoef" : -1, "cMask" : ["ball" ], "trait" : "line" },
        { "v0" : 76, "v1" : 77, "curve" : 0, "vis" : true, "color" : "000000", "bCoef" : -1, "cMask" : ["ball" ], "trait" : "line" },
        { "v0" : 78, "v1" : 79, "curve" : 0, "vis" : true, "color" : "000000", "bCoef" : -1, "cMask" : ["ball" ], "trait" : "line" },
        { "v0" : 80, "v1" : 81, "curve" : 0, "vis" : true, "color" : "000000", "bCoef" : -1, "cMask" : ["ball" ], "trait" : "line" },
        { "v0" : 82, "v1" : 83, "curve" : 0, "vis" : true, "color" : "000000", "bCoef" : -1, "cMask" : ["ball" ], "trait" : "line" },
        { "v0" : 84, "v1" : 85, "curve" : 0, "vis" : true, "color" : "000000", "bCoef" : -1, "cMask" : ["ball" ], "trait" : "line" },
        { "v0" : 86, "v1" : 87, "curve" : 0, "vis" : true, "color" : "000000", "bCoef" : -1, "cMask" : ["ball" ], "trait" : "line" },
        { "v0" : 88, "v1" : 89, "color" : "5E844D", "trait" : "line", "y" : -475 },
        { "v0" : 90, "v1" : 91, "color" : "5E844D", "trait" : "line", "y" : -475 },
        { "v0" : 92, "v1" : 93, "curve" : -100, "color" : "5E844D", "trait" : "line", "y" : -475 },
        { "v0" : 94, "v1" : 95, "curve" : 100, "color" : "5E844D", "trait" : "line", "y" : -475 },
        { "v0" : 97, "v1" : 98, "curve" : 100, "color" : "5E844D", "trait" : "line", "y" : -475 },
        { "v0" : 99, "v1" : 100, "curve" : -100, "color" : "5E844D", "trait" : "line", "y" : -475 }

    ],

    "goals" : [
        { "p0" : [-1160,-124 ], "p1" : [-1160,124 ], "team" : "red" },
        { "p0" : [1160,124 ], "p1" : [1160,-124 ], "team" : "blue" }

    ],

    "discs" : [
        { "pos" : [-1150,127 ], "color" : "FF0000", "bCoef" : 0.5, "trait" : "goalPost" },
        { "pos" : [-1150,-127 ], "color" : "FF0000", "bCoef" : 0.5, "trait" : "goalPost" },
        { "pos" : [1150,127 ], "color" : "0000FF", "bCoef" : 0.5, "trait" : "goalPost" },
        { "pos" : [1150,-127 ], "color" : "0000FF", "bCoef" : 0.5, "trait" : "goalPost" },
        
        { "pos" : [-1250,150 ], "color" : "FF0000", "trait" : "stanchion" },
        { "pos" : [-1250,-150 ], "color" : "FF0000", "trait" : "stanchion" },
        { "pos" : [1250,150 ], "color" : "0000FF", "trait" : "stanchion", "x" : 1250 },
        { "pos" : [1250,-150 ], "color" : "0000FF", "trait" : "stanchion", "x" : 1250 },
        
        { "radius" : 2, "invMass" : 0, "pos" : [-1150,-600 ], "color" : "FFFFFF", "bCoef" : -0.1, "cMask" : ["ball" ], "trait" : "goalPost" },
        { "radius" : 2, "invMass" : 0, "pos" : [-1150,600 ], "color" : "FFFFFF", "bCoef" : -0.1, "cMask" : ["ball" ], "trait" : "goalPost" },
        { "radius" : 2, "invMass" : 0, "pos" : [1150,-600 ], "color" : "FFFFFF", "bCoef" : -0.1, "cMask" : ["ball" ], "trait" : "goalPost" },
        { "radius" : 2, "invMass" : 0, "pos" : [1150,600 ], "color" : "FFFFFF", "bCoef" : -0.1, "cMask" : ["ball" ], "trait" : "goalPost" }

    ],

    "planes" : [
        { "normal" : [0,1 ], "dist" : -635, "bCoef" : 0, "trait" : "ballArea" },
        { "normal" : [0,-1 ], "dist" : -635, "bCoef" : 0, "trait" : "ballArea" },
        
        { "normal" : [0,1 ], "dist" : -670, "bCoef" : 0 },
        { "normal" : [0,-1 ], "dist" : -670, "bCoef" : 0 },
        { "normal" : [1,0 ], "dist" : -1300, "bCoef" : 0 },
        { "normal" : [-1,0 ], "dist" : -1300, "bCoef" : 0.1 },
        { "normal" : [1,0 ], "dist" : -1214, "bCoef" : 0, "cMask" : ["ball" ] },
        { "normal" : [-1,0 ], "dist" : -1214, "bCoef" : 0, "cMask" : ["ball" ] }

    ],

    "traits" : {
        "ballArea" : { "vis" : false, "bCoef" : 0, "cMask" : ["ball" ] },
        "goalPost" : { "radius" : 5, "invMass" : 0, "bCoef" : 2 },
        "stanchion" : { "radius" : 3, "invMass" : 0, "bCoef" : 3, "cMask" : ["none" ] },
        "cornerflag" : { "radius" : 3, "invMass" : 0, "bCoef" : 0.5, "color" : "FFFF00", "cGroup" : [ ] },
        "reargoalNetleft" : { "vis" : true, "bCoef" : 0.1, "cMask" : ["ball","red","blue" ], "curve" : 10, "color" : "C7E6BD" },
        "reargoalNetright" : { "vis" : true, "bCoef" : 0.1, "cMask" : ["ball","red","blue" ], "curve" : -10, "color" : "C7E6BD" },
        "sidegoalNet" : { "vis" : true, "bCoef" : 1, "cMask" : ["ball","red","blue" ], "color" : "C7E6BD" },
        "kickOffBarrier" : { "vis" : false, "bCoef" : 0.1, "cGroup" : ["redKO","blueKO" ], "cMask" : ["red","blue" ] },
        "line" : { "vis" : true, "cMask" : [ ], "color" : "C7E6BD" },
        "tunnel" : { "vis" : true, "cMask" : ["red","blue" ], "color" : "000000" },
        "advertising" : { "vis" : true, "cMask" : ["red","blue" ], "color" : "333333" },
        "teambench" : { "vis" : true, "cMask" : [ ], "color" : "000000" },
        "manager" : { "radius" : 15, "vis" : true, "cMask" : ["red","blue" ], "invMass" : 0, "color" : "333333" },
        "physio" : { "radius" : 15, "vis" : true, "cMask" : ["red","blue" ], "invMass" : 0, "color" : "666666" },
        "redsubs" : { "radius" : 15, "vis" : true, "cMask" : ["red","blue" ], "invMass" : 0, "color" : "E56E56" },
        "bluesubs" : { "radius" : 15, "vis" : true, "cMask" : ["red","blue" ], "invMass" : 0, "color" : "5689E5" }

    },

    "ballPhysics" : {
        "invMass" : ` + mapSettings[7] + `,
        "radius" : ` + mapSettings[8] + `

    }
}`;
}
}