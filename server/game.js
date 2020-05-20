class Game {

    currentPlayers = []
    currentMatches = []

    get getPlayers() {
        return this.currentPlayers
    }

    getMatch(matchID) {
        var i = 0
        for (var m of this.currentMatches) {
            if (m.title == matchID)
                return {match: m, i: i}

            i ++
        }

        return false
    }

    removeMatch(matchID) {
        var {match, i} = this.getMatch(matchID)

        match.p1.currentGameID = 'nothing'
        match.p2.currentGameID = 'nothing'

        this.currentMatches.splice(i, 1)
    }

    chooseTile(ssid, data) {
        let player = this.getPlayer('ssid', ssid)
        let {match} = this.getMatch(player.currentGameID)

        if (player == false || match == null) return


        var playerNum = (player.nickname == match.p1.nickname) ? 1:2
        var otherPlayer = (playerNum == 1) ? match.p2:match.p1
        var otherPlayerNum = (playerNum == 1) ? 2:1

        if (match.turn == player.nickname) {
            if (this.getAmountOfTiles(match.board, playerNum) < 3) {
                if (match.board[data] == 0) { // hvis der er plads til en brik
                    if (data != match.lastPos) {
                        match.board[data] = playerNum

                        match.turn = otherPlayer.nickname
                        match.lastPos = null

                        var {win, all_occupied} = this.checkForWin(match.board)
                        if (win) {
                            match.turn = player.nickname + 'WON'
                            return true
                        } else if (all_occupied) {
                            match.turn = player.nickname + 'TIE'
                            return true
                        }
                        if ( this.getAmountOfTiles(match.board, otherPlayerNum) >= 3 ) {
                            match.remove = true
                        }
                    } else {
                        // det samme valg
                        match.board[data] = playerNum
                        match.remove = true
                    }
                }
            } else {
                if (match.board[data] == playerNum) {
                    match.board[data] = 0
                    match.remove = false
                    match.lastPos = data
                }
            }
        }
        return false
    }


    checkForWin(board) {
        let points = [0, 1, 2, 3, 6]

        let win = false
        let all_occupied = true

        for (var x of points) {
            if (x == 0) {
                win = (this.checkDirection(board, x, 3)) ? true:win
                win = (this.checkDirection(board, x, 1)) ? true:win
                win = (this.checkDirection(board, x, 4)) ? true:win
            } else if (x == 1 || x == 2) {
                win = (this.checkDirection(board, x, 3)) ? true:win
            } else {
                win = (this.checkDirection(board, x, 1)) ? true:win
                win = (this.checkDirection(board, x, -2)) ? true:win
            }
        }

        for (var t of board)
            if (t == 0) all_occupied = false

        return {win: win, all_occupied: all_occupied}
    }


    checkDirection(board, start, pattern) {
        let type = board[start]

        if (type != 0 && type == board[start + pattern] && type == board[start + pattern*2]) {
            return true
        }
        return false
    }


    getAmountOfTiles(board, type) {
        let amount = 0
        for (var tile of board) {
            if (tile == type)
                amount ++
        }

        return amount
    }

    newGame(p1_ssid, p2_nickname) {
        var p1 = this.getPlayer('ssid', p1_ssid)
        var p2 = this.getPlayer('nickname', p2_nickname)

        if (p1 == false || p2 == false) 
            return false

        if (p1.currentGameID != null || p2.currentGameID != null)
            return false

        let randomNumber = Math.floor(Math.random() * (Math.floor(1) - Math.ceil(0) + 1)) + Math.ceil(0)

        var match = {
            title: `${p1.nickname} VS. ${p2.nickname}`,
            p1: p1,
            p2: p2,
            turn: (randomNumber == 0) ? p1.nickname:p2.nickname,
            remove: false,
            lastPos: null,
            board: [
                0, 0, 0,
                0, 0, 0,
                0, 0, 0,
            ]
        }

        p1.currentGameID = match.title
        p2.currentGameID = match.title

        this.currentMatches.push(match)
        return match
    }

    getPlayer(type, identifier) {
        for (var p of this.currentPlayers) {
            if (p[type] == identifier) {
                return p
            }
        }
        return false
    }

    addPlayer(ssid) {
        let n = getName()
        if (!n)
            return false

        this.currentPlayers.push({
            ssid: ssid,
            nickname: n,
            currentGameID: null
        })

        return n
    }

    removePlayer(ssid) {
        let i = 0
        for (var player of this.currentPlayers) {
            if (player.ssid == ssid) {
                var p2 = null
                var p2_ssid = null
                this.currentPlayers.splice(i, 1)

                for (var x in usedNames) {
                    if (usedNames[x] == player.nickname) {
                        usedNames.splice(x, 1)
                    }
                }

                for (var y in this.currentMatches) {
                    if (this.currentMatches[y].title.includes(player.nickname)) {
                        
                        if (this.currentMatches[y].p1.nickname == player.nickname) {
                            p2 = this.currentMatches[y].p2
                        } else {
                            p2 = this.currentMatches[y].p1
                        }

                        p2.currentGameID = null
                        p2_ssid = p2.ssid

                        this.currentMatches.splice(y, 1)
                    }
                }

                return {nickname: player.nickname, p2_ssid: p2_ssid}
            }

            i ++
        }

        return false
    }
}


const names = ["Adam", "Barry", "Clark", "Anna", "Chad", "Doug", "Frank", "Joe"]
var usedNames = []

function getName() {
    let randomNumber = Math.floor(Math.random() * (Math.floor(names.length-1) - Math.ceil(0) + 1)) + Math.ceil(0)

    if (usedNames.length == names.length)
        return false

    if (!usedNames.includes(names[randomNumber])) {
        usedNames.push(names[randomNumber])
        return names[randomNumber]
    } else {
        return getName()
    }
}


module.exports = Game