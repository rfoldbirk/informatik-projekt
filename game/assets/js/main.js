var socket = io()
const D = document // orkede altså ikke at skrive document hver evig eneste gang.
var sendMsg // gemmer senere en funktion i denne variable sådan at man til en hver tid kan kommunikere med serveren


function mobileAndTabletCheck() {
    // jeg skal være helt ærlig... jeg har altså ikke lavet dette sindsygt lange regex, men det fungerer vildt godt
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
}


const isMobile = mobileAndTabletCheck() // så jeg til enhver tid kan tjekke om det er en mobil eller computer

var size = (isMobile) ? '70vw':'40vw' // der skal være forskellige skærm størrelser til forskellige enheder

var boardOpen = false // om brættet er åbent eller lukket

var nickname // så brugeren selv ved hvad den hedder
var type_of_marker = -1 // så den ved hvilke af de to slags brikker den selv er. -1 er bare ingenting


// serveren byder klienten velkommen, når den opretter forbindelse for første gang.
socket.on('welcome', (data) => {
    nickname = data.nickname

    var Header = D.getElementById('Header')
    Header.innerText = `Hej ${nickname}!` // Sætter headeren til en bestemt streng

    sendMsg = (topic, data) => { // her gemmer jeg en funktion i en variable med to parametre.
        socket.emit(topic, data)
    }

    removeEveryBtn() // fjerner alle knapperne
    close(true)
})

// når serveren sender information omkring en 
socket.on('matchDetails', function(data) {
    if (data == false) return

    if (data.turn.includes(nickname)) { // hvis der klientens tur
        D.querySelector('#instruction').innerText = "Det er din tur"
        if (data.remove) { // hvis klienten skal fjerne en brik
            D.querySelector('#instruction').innerText = "Du skal fjerne én af dine brikker"
        }
    } else {
        // hvis det ikke er klientens tur
        D.querySelector('#instruction').innerText = "Venter på modstanderen..."
    }

    var i = 0
    for (var tile of data.board) {
        var remove = (data.turn.includes(nickname)) ? data.remove:false // tjekker om det spillerens tur og hvis det er: så bliver variablen kun sand hvis serveren fortæller at der skal fjernes en brik
        placeMarker(i, tile-1, remove)
        i ++
    }

    if (data.turn.includes('WON')) { // hvis en af spillerene har vundet
        if (data.turn.includes(nickname)) { // hvis det var klienten
            // min sejr
            // så ændres teksten
            D.getElementById('mo_titel').innerText = "Sejr!!!"
            D.getElementById('mo_desc').innerText = "Tillykke med sejren, du er en sand kryds og bolle ninja"
        }

        // uanset hvad bliver den der modal åbnet
        // og hvis klienten tabte ændres intet da teksten allerede er der.
        D.getElementById('fate').click()
    } else if (data.turn.includes('TIE')) {
        // i tilfælde af at kampen blev uafgjort.¨
        // dette kan dog ikke ske længere... men i tilfælde af at jeg vil udvikle videre på programmet beholder jeg det.
        D.getElementById('mo_titel').innerText = "Uafgjort"
        D.getElementById('mo_desc').innerText = "I er begge to nogle vilde ninjaer!"
        D.getElementById('fate').click()
    }
})


// serveren fortæller hvor mange spillere der er.
socket.on('players', function(data) {
    // funktionen opretter faktisk bare en knap for hver spiller.

    // hvis en knap allerede findes, undlader programmet at lave en ny undtagen i tilfælde af at knappen var disabled.

    for (var p of data) {
        var btns = D.querySelectorAll('#openBtn')
        var exists = false
        for (var btn of btns) {
            if (btn.innerText == p.nickname) {
                exists = true
                if (btn.disabled) {
                    btn.remove()
                    exists = false
                }
            }
        }

        if (!exists)
            newPlayer(p.nickname, p.currentGameID) // oprettelse af en knap
    }
})


// fjerner en spiller
socket.on('removePlayer', function(name) {
    // kalder bare en funktion som fjerner en knap
    removePlayer(name)
})


// lukker brættet
socket.on('close', function() {
    close() // funktionen lukker brættet
})


// når serveren annoncerer at en kamp er startet
socket.on('re_invite', function(data) {
    if (data == "denied") {
        // modal popup
    } else {
        data.title = data.title.replace(nickname, `<span>${nickname}</span>`)

        D.querySelector('#Header').innerHTML = data.title


        // nulstiller modal
        D.getElementById('mo_titel').innerText = "Bedre held næste gang :)"
        D.getElementById('mo_desc').innerText = "Det var ellers en tæt kamp... Du får ham næste gang!"


        // skriver hvis tur det er
        if (data.turn == nickname) {
            D.querySelector('#instruction').innerText = "Det er din tur"
        } else {
            D.querySelector('#instruction').innerText = "Venter på modstanderen..."
        }

        // redegører for hvilken slags brik spilleren har
        if (data.p1.nickname == nickname) {
            type_of_marker = 0
        } else {
            type_of_marker = 1
        }

        open() // åbner brættet
    }
})


// placerer en brik på et felt
function placeMarker(p, type, remove) {
    let div = D.getElementById(p) // alle felterne har et id som er deres respektive tal i rækkefølgen.
    let marker = div.querySelector('#marker') // tager et div elementet i div elementet... noice

    let mark_class = (isMobile) ? 'mark-mobile':'mark' // forskellig stil til forskellige enheder

    marker.classList.add(mark_class)
    marker.classList.remove('me') // det er strengt nødvendigt at fjerne eventuelle klasser
    marker.classList.remove('remove') // ditto

    if (type == -1) { // -1 betyder bare at der ikke skal være nogen brik
        marker.classList.remove(mark_class) // igen... super vigtigt
        marker.classList.remove('circle') // ditto igen igen
    } else if (type == 1) { // der skal være en cirkel!
        marker.classList.add('circle')
    }

    if (type != -1) {
        if (type == type_of_marker) { // hvis det er klientens egen brik
            if (remove) { // hvis en af brikkerne skal fjernes
                marker.classList.add('remove')
            } else { // ellers er de bare normale og grønne
                marker.classList.add('me')
            }
        }
    }
}


// fjerner en knap ud fra dens navn
function removePlayer(name) {
    var btns = D.querySelectorAll('#openBtn')
    for (var btn of btns) { // looper indtil den finder en knap med et matchende navn.
        if (btn.innerText == name)
            btn.remove()
    }
}


// fjerner alle knapperne
function removeEveryBtn() {
    // ødelægger alt muahahahahahah
    // ej. den fjerner altså bare alle knappene
    // så ikke alt
    for (var b of D.querySelectorAll('#openBtn'))
        b.remove()
}

// laver en ny knap
function newPlayer(name, gameID) {
    if (boardOpen || name == nickname) // knapperne skal ikke være der hvis man enten er i gang med et spil eller hvis spilleren er en selv
        return

    // brugte kommentaren nedenunder som en arbejdstegning
    // <button id="openBtn" type="button" class="btn btn-primary"> Navn her </button>

    var btn = D.createElement('button') // ikke noget vildt her
    btn.classList = "btn btn-primary"
    btn.id = "openBtn"
    btn.type = "button"
    btn.innerText = name


    // sørger for at både touch devices og normale computere kan bruge knappen
    btn.ontouchend = () => {
        invite(name)
    }
    btn.onmouseup = () => {
        invite(name)
    }


    if (gameID != null) // hvis spilleren er i gang med et spil, så er knappen disabled
        btn.disabled = true

    D.querySelector('.players').appendChild(btn) // tilføjer den til det rigtige div element
}


// pbner brættet
function open() {
    if (boardOpen)
        return

    removeEveryBtn() // fjerner som sagt alle knapperne
    boardOpen = true


    // sørger for at alle felterne for den rigtige stil afhængig af enhed
    var fields = D.querySelectorAll('.apply-for-field')

    let fields_class = (isMobile) ? 'fields-mobile':'fields'

    for (var f of fields)
        f.classList.add(fields_class)

    // fjerner den tidligere animation og tilføjer en ny
    anime.remove('#bg');
    anime({ // der er her brættet folder sig ud
        targets: '#bg',
        height: size,
        width: size,
        duration: 1000
    })
}


// faktisk bare det omvendte af open()
function close(force) {
    if (!boardOpen && !force) // man kan ikke kalde denne funktion hvis brættet allerede er lukket med mindre man forcer den.
        return

    type_of_marker = -1 // nulstiller ens brik type

    boardOpen = false // husker at brættet er lukket


    // nulstiller headeren
    var Header = D.getElementById('Header')
    Header.innerText = `Hej ${nickname}!`


    // nulstiller instruktionen
    D.querySelector('#instruction').innerText = "Prøv at udfordre en af dine venner!"


    // sørger for at felterne for fjernet deres klasser
    var fields = D.querySelectorAll('.apply-for-field')
    let fields_class = (isMobile) ? 'fields-mobile':'fields'

    for (var f of fields)
        f.classList.remove(fields_class)


    // fjerner alle brikker fra brættet
    for (var i = 0; i < 9; i ++) {
        placeMarker(i, -1) 
    }

    D.getElementById('bg').style.height = '2px'

    anime.remove('#bg'); // fjerner den gamle animation og laver en ny
    anime({
        targets: '#bg',
        width: animateWidth, // -> from '28px' to '100%',
        easing: 'easeInOutQuad',
        direction: 'alternate',
        duration: 1500,
        loop: true
    })

    sendMsg('getPlayers') // henter spillere
    sendMsg('ready') // lader serveren vide at klienten er klar igen
}