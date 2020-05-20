console.clear()


// det er meget vigtigt at denne mappe er angivet korrekt
// det burde ikke være nødvendigt at ændre denne variable når du får programmet :)
const RootFolder = "informatik-eksamen"

// setup
var app = require('express')()
var http = require('http').createServer(app)
var io = require('socket.io')(http)


// mit eget lille modul som jeg bruger til at holde styr på spillerene.
var gameClass = require('./game.js')
var game = new gameClass


// windows og mac bruger henholdsvis \\ og / til at adskille mapper i deres filsystem.
// det finder jeg ud af her :)
var slash = (process.platform == 'win32') ? '\\' : '/'
var split_dirname = __dirname.split(slash)

while (split_dirname[split_dirname.length - 1] != RootFolder) {
    split_dirname.pop()
}

// og så gemmer jeg det i en global environment variable
process.env.DIRNAME = split_dirname.join('/')

// den håndterer alle /assets/ requests
const assetsRoute = require('./routes/assets-routes')


app.use('/assets', assetsRoute) // først håndteres /assets
app.use('*', function (req, res) { // derefter alt andet
    res.sendFile(process.env.DIRNAME + '/game/index.html')
    // uanset hvad sender jeg bare den samme html side
})


// socket.io
io.on('connection', function (socket) {
    var nickname = game.addPlayer(socket.id)
    socket.emit('welcome', {ssid: socket.id, nickname: nickname})


    // når en klient mister / stopper forbindelsen
    socket.on("disconnect", () => {
        var object = game.removePlayer(socket.id) // fjerner spilleren og et eventuelt spil der er igang
        if (object == false)
            return

        // bliver sendt til alle, så de ved at de skal fjerne en spiller
        io.emit("removePlayer", object.nickname)
        io.to(object.p2_ssid).emit('close') // i tilfælde af at spilleren var i gang med en kamp, for denne at vide at spilleren forlod. 
    })
    

    // en klient sender denne request med en spillers navn.
    socket.on('invite', (data) => {
        var match = game.newGame(socket.id, data) // laver en ny kamp

        if (match != false) { // kampen kunne godt oprettes

            // de to deltagere bliver gjort opmærksomme på at deres kamp er begyndt.
            socket.emit("re_invite", match)
            io.to(match.p2.ssid).emit("re_invite", match)

            return
        }

        // hvis kampen ikke kan oprettes for klienten det af vide.
        socket.emit("re_invite", "denied")
    })


    // enhver klient kan få information om en kamp.
    socket.on('getMatchDetails', () => {
        var player = game.getPlayer('ssid', socket.id)
        var match = game.getMatch(player.currentGameID)

        socket.emit('matchDetails', match)
    })


    // efter en kamp skal serveren tage imod denne request før en spiller 
    socket.on('ready', () => {
        var player = game.getPlayer('ssid', socket.id)
        if (player) player.currentGameID = null // currentGameID bliver brugt til at vide om spilleren er i gang med et spil

        io.emit("players", game.getPlayers) // derefter sender den en opdatering ud til alle klienter
    })


    // bliver kaldt når bliver trykket på en af de ni firkanter på brættet
    socket.on('chooseTile', (data) => {
        var res = game.chooseTile(socket.id, data)


        var player = game.getPlayer('ssid', socket.id)
        var {match} = game.getMatch(player.currentGameID)

        if (match == null) return

        io.to(match.p1.ssid).emit('matchDetails', match)
        io.to(match.p2.ssid).emit('matchDetails', match)

        if (res) { // hvis kampen blev vundet af en af deltagerne.
            game.removeMatch(player.currentGameID)
        }
    })


    // sender til alle spillere hvilke andre spillere der er online
    socket.on("getPlayers", () => {
        io.emit("players", game.getPlayers)
    })

    // når en klient opretter forbindelse bliver der sendt en opdatering til alle
    io.emit("players", game.getPlayers)
})


// start af server
http.listen(80, function () {
    console.log('localhost:80')
})