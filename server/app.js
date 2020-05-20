console.clear()

const RootFolder = "informatik-eksamen"

var app = require('express')()
var http = require('http').createServer(app)
var io = require('socket.io')(http)

var gameClass = require('./game.js')
var game = new gameClass

let slash = (process.platform == 'win32') ? '\\' : '/'
let split_dirname = __dirname.split(slash)

while (split_dirname[split_dirname.length - 1] != RootFolder) {
    split_dirname.pop()
}

process.env.DIRNAME = split_dirname.join('/')

console.log(process.env.DIRNAME)

// routes
const assetsRoute = require('./routes/assets-routes')


app.use('/assets', assetsRoute)
app.use('*', function (req, res) {
    res.sendFile(process.env.DIRNAME + '/game/index.html')
})


io.on('connection', function (socket) {
    var nickname = game.addPlayer(socket.id)
    socket.emit('welcome', {ssid: socket.id, nickname: nickname})


    socket.on("disconnect", () => {
        var object = game.removePlayer(socket.id)
        if (object == false)
            return

        io.emit("removePlayer", object.nickname)
        io.to(object.p2_ssid).emit('close')
    })

    socket.on('invite', (data) => {
        let match = game.newGame(socket.id, data)

        if (match != false) {
            socket.emit("re_invite", match)
            io.to(match.p2.ssid).emit("re_invite", match)

            return
        }

        socket.emit("re_invite", "denied")
    })

    socket.on('getMatchDetails', () => {
        let player = game.getPlayer('ssid', socket.id)
        let match = game.getMatch(player.currentGameID)

        socket.emit('matchDetails', match)
    })

    socket.on('ready', () => {
        let player = game.getPlayer('ssid', socket.id)
        if (player) player.currentGameID = null

        io.emit("players", game.getPlayers)
    })

    socket.on('chooseTile', (data) => {
        var res = game.chooseTile(socket.id, data)


        let player = game.getPlayer('ssid', socket.id)
        let {match} = game.getMatch(player.currentGameID)

        if (match == null) return

        io.to(match.p1.ssid).emit('matchDetails', match)
        io.to(match.p2.ssid).emit('matchDetails', match)

        if (res) {
            game.removeMatch(player.currentGameID)
        }
    })

    socket.on('forceUpdate', () => {
        io.emit('update')
    })

    socket.on("getPlayers", () => {
        io.emit("players", game.getPlayers)
    })

    io.emit("players", game.getPlayers)
})

http.listen(80, function () {
    console.log('localhost:80')
})