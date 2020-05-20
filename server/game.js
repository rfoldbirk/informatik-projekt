const names = ["Adam", "Barry", "Clark", "Anna", "Chad", "Doug", "Frank", "Joe"]
var usedNames = []

class Game {

    currentPlayers = []
    currentMatches = []


    get getPlayers() {
        var arr = []

        // jeg udelukker udelukkende ssid'et da det er privat
        for (var p of this.currentPlayers) {
            arr.push({
                nickname: p.nickname,
                currentGameID: p.currentGameID
            })
        }

        return arr
    }

    // returnerer kampen og dens indeks i arrayet currentMatches
    getMatch(matchID) {
        var i = 0 // ja, jeg ved godt at man kan lave et for loop der holder styr på begge dele, men jeg var lidt doven
        for (var m of this.currentMatches) {
            if (m.title == matchID)
                return {match: m, i: i}

            i ++
        }

        return false
    }


    // fjerner en kamp
    removeMatch(matchID) {
        var {match, i} = this.getMatch(matchID)

        match.p1.currentGameID = 'nothing'
        match.p2.currentGameID = 'nothing'

        this.currentMatches.splice(i, 1)
    }


    // når en spiller trykker på en af de 9 felter
    chooseTile(ssid, data) {
        var player = this.getPlayer('ssid', ssid)
        var {match} = this.getMatch(player.currentGameID)

        if (player == false || match == null) return // I tilfælde af fejl


        // variabler der holder styr på hvem spilleren er og hvem modstanderen er.
        var playerNum = (player.nickname == match.p1.nickname) ? 1:2
        var otherPlayer = (playerNum == 1) ? match.p2:match.p1
        var otherPlayerNum = (playerNum == 1) ? 2:1

        // det skal jo være spillerens tur :)
        if (match.turn == player.nickname) {
            if (this.getAmountOfTiles(match.board, playerNum) < 3) { // hvis han endnu ikke har placeret tre brikker
                if (match.board[data] == 0) { // hvis der er plads til en brik
                    if (data != match.lastPos) { // hvis den ikke bliver placeret samme sted som sidst
                        match.board[data] = playerNum

                        match.turn = otherPlayer.nickname // her ændrer jeg hvis tur det er.
                        match.lastPos = null

                        
                        // når man skriver {} rundt om en variable kan man 'extracte' variabler fra en objekt... ret smart
                        var {win, all_occupied} = this.checkForWin(match.board) // bare en funktion der tjekker om nogen har vundet
                        if (win) {
                            match.turn = player.nickname + 'WON'
                            return true
                        } else if (all_occupied) { // det her bliver faktisk ikke brugt længere i og med at det er umuligt at fylde brættet med brikker.
                            match.turn = player.nickname + 'TIE' // dog beholder jeg det i tilfælde af at jeg engang vil lave videre på det.
                            return true
                        }

                        // hvis der er 3 eller flere brikker, flår klienten at vide at den bliver nødt til at fjerne en brik.
                        if ( this.getAmountOfTiles(match.board, otherPlayerNum) >= 3 ) {
                            match.remove = true
                        }
                    } else {
                        // i tilfælde af at man fortryder bliver brikken placeret, men det er stadig ens tur
                        match.board[data] = playerNum
                        match.remove = true
                    }
                }
            } else { // hvis man har 3 brikker på brættet skal man fjerne en
                if (match.board[data] == playerNum) { // jeg tjekker selvfølgelig at det er ens egen brik
                    match.board[data] = 0
                    match.remove = false
                    match.lastPos = data
                }
            }
        }
        return false // den skal kun returnere true i tilfælde af at den ene vinder.
    }


    // funktionen tjekker om der er 3 på stribe i forskellige retninger.
    checkForWin(board) {
        var points = [0, 1, 2, 3, 6] // bliver brugt som start punkter

        var win = false
        var all_occupied = true

        for (var x of points) {
            if (x == 0) {
                // jeg bruger funktion checkDirection() til at tjekke en bestemt retning ud fra et startpunkt
                win = (this.checkDirection(board, x, 3)) ? true:win // ned
                win = (this.checkDirection(board, x, 1)) ? true:win // højre
                win = (this.checkDirection(board, x, 4)) ? true:win // ned & højre
            } else if (x == 1 || x == 2) {
                win = (this.checkDirection(board, x, 3)) ? true:win // ned
            } else {
                win = (this.checkDirection(board, x, 1)) ? true:win // højre
                win = (this.checkDirection(board, x, -2)) ? true:win // op & højre
            }
        }

        for (var t of board) // tjekker om alle felterne er optaget
            if (t == 0) all_occupied = false // hvis bare et felt ikke er optaget sættes variablen til falsk

        return {win: win, all_occupied: all_occupied}
    }


    checkDirection(board, start, pattern) {
        // tjekker i en bestemt retning på brættet
        var type = board[start]

        // et rimeligt simpelt if-statement... tjekker bare tre steder på en gang og de skal alle være sande
        if (type != 0 && type == board[start + pattern] && type == board[start + pattern*2]) {
            return true
        }

        // hvis funktionen ikke returnerede true...
        return false // returnere den falsk
    }


    // tjekker hvor mange brikker en spiller har på brættet
    getAmountOfTiles(board, type) {
        // funktionen er rimelig simpelt... Den itererer egentlig bare over arrayet
        // og hver gang den støder på et tal den kender ( tile == type ) lægger den 1 til variablen amount
        var amount = 0
        for (var tile of board) {
            if (tile == type)
                amount ++
        }

        return amount
    }


    // laver et nyt spil med de to spillere
    newGame(p1_ssid, p2_nickname) {
        var p1 = this.getPlayer('ssid', p1_ssid)
        var p2 = this.getPlayer('nickname', p2_nickname)

        if (p1 == false || p2 == false) 
            return false

        if (p1.currentGameID != null || p2.currentGameID != null)
            return false

        // det tilfældige tal afgør hvem af de to spillere der starter ... tallet er enten 0 eller 1
        var randomNumber = Math.floor(Math.random() * (Math.floor(1) - Math.ceil(0) + 1)) + Math.ceil(0)

        var match = {
            title: `${p1.nickname} VS. ${p2.nickname}`, // titlen kan sagtens bare være deres navne i og med at der kun kan være et af hvert navn.
            p1: p1,
            p2: p2,
            turn: (randomNumber == 0) ? p1.nickname:p2.nickname, // et simpelt if statement
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

    // returnerer en spiller
    getPlayer(type, identifier) {
        // type kan enten være ssid eller nickname
        for (var p of this.currentPlayers) {
            if (p[type] == identifier) {
                return p
            }
        }
        return false
    }

    // tilføjer en klient og giver den et navn
    addPlayer(ssid) {
        var n = getName()
        if (!n)
            return false

        // tilføjer en spiller givet at der er plads.
        // navnet bliver valgt tilfældt ud fra de 8 muligheder
        // hvis der ikke er flere navne tilbage kan der ikke være flere spillere i spillet
        // altså kan der kun være 8 klienter på en gang.

        this.currentPlayers.push({
            ssid: ssid, // socket id'et
            nickname: n,
            currentGameID: null
        })

        return n
    }

    // fjerner en spiller
    removePlayer(ssid) {
        var i = 0
        for (var player of this.currentPlayers) {
            if (player.ssid == ssid) {
                var p2 = null
                var p2_ssid = null

                // fjerner selve klienten fra array'et
                this.currentPlayers.splice(i, 1)

                // sørger for at navnet kan bruges igen
                for (var x in usedNames) {
                    if (usedNames[x] == player.nickname) {
                        usedNames.splice(x, 1)
                    }
                }


                // fjerner kampen
                for (var y in this.currentMatches) {
                    if (this.currentMatches[y].title.includes(player.nickname)) {
                        
                        // finder modstanderen
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


                return {
                    nickname: player.nickname, 
                    p2_ssid: p2_ssid
                }
            }

            i ++
        }

        return false
    }
}


// returner et tilfædigt navn
function getName() {
    var randomNumber = Math.floor(Math.random() * (Math.floor(names.length-1) - Math.ceil(0) + 1)) + Math.ceil(0)

    if (usedNames.length == names.length) // hvis der ikke er flere navne tilbage
        return false

    if (!usedNames.includes(names[randomNumber])) { // hvis navnet ikke eksisterer i brugte navne
        usedNames.push(names[randomNumber])
        return names[randomNumber]
    } else {
        return getName()
    }
}


module.exports = Game