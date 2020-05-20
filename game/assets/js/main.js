var socket = io()
const D = document
var sendMsg


function mobileAndTabletCheck() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
}

const isMobile = mobileAndTabletCheck()

var size = (isMobile) ? '70vw':'40vw'

var boardOpen = false

var ssid
var nickname
var type_of_marker = -1

socket.on('welcome', (data) => {
    ssid = data.ssid
    nickname = data.nickname

    var Header = D.getElementById('Header')
    Header.innerText = `Hej ${nickname}!`

    sendMsg = (topic, data) => {
        socket.emit(topic, data)
    }

    removeEveryBtn()
    close(true)
})

socket.on('matchDetails', function(data) {
    if (data == false) return

    if (data.turn.includes(nickname)) {
        D.querySelector('#instruction').innerText = "Det er din tur"
        if (data.remove) {
            D.querySelector('#instruction').innerText = "Du skal fjerne én af dine brikker"
        }
    } else {
        D.querySelector('#instruction').innerText = "Venter på modstanderen"
    }

    var i = 0
    for (var tile of data.board) {
        var remove = (data.turn.includes(nickname)) ? data.remove:false
        placeMarker(i, tile-1, remove)
        i ++
    }

    if (data.turn.includes('WON')) {
        if (data.turn.includes(nickname)) {
            // min sejr
            D.getElementById('mo_titel').innerText = "Sejr!!!"
            D.getElementById('mo_desc').innerText = "Tillykke med sejren, du er en sand kryds og bolle ninja"
        }

        D.getElementById('fate').click()
    } else if (data.turn.includes('TIE')) {
        D.getElementById('mo_titel').innerText = "Uafgjort"
        D.getElementById('mo_desc').innerText = "I er begge to nogle vilde ninjaer!"
        D.getElementById('fate').click()
    }
})


socket.on('players', function(data) {
    // window.location.reload()

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
            newPlayer(p.nickname, p.currentGameID)
    }
})



socket.on('removePlayer', function(name) {
    removePlayer(name)
})


socket.on('close', function() {
    console.log('close')
    close()
})


socket.on('re_invite', function(data) {
    if (data == "denied") {
        // modal popup
    } else {
        D.querySelector('#Header').innerText = data.title

        D.getElementById('mo_titel').innerText = "Bedre held næste gang :)"
        D.getElementById('mo_desc').innerText = "Det var ellers en tæt kamp... Du får ham næste gang!"

        if (data.turn == nickname) {
            D.querySelector('#instruction').innerText = "Det er din tur"
        } else {
            D.querySelector('#instruction').innerText = "Venter på modstanderen"
        }

        if (data.p1.nickname == nickname) {
            type_of_marker = 0
        } else {
            type_of_marker = 1
        }

        open()
    }
})

function placeMarker(p, type, remove) {
    let div = D.getElementById(p)
    let marker = div.querySelector('#marker') // tager div elementet i div elementet.

    let mark_class = (isMobile) ? 'mark-mobile':'mark'

    marker.classList.add(mark_class)
    marker.classList.remove('me')
    marker.classList.remove('remove')

    if (type == -1) {
        marker.classList.remove(mark_class)
        marker.classList.remove('circle')
    } else if (type == 1) {
        marker.classList.add('circle')
    }

    if (type != -1) {
        if (type == type_of_marker) {
            if (remove) {
                marker.classList.add('remove')
            } else {
                marker.classList.add('me')
            }
            
        }
    }
}



function removePlayer(name) {
    var btns = D.querySelectorAll('#openBtn')
    for (var btn of btns) {
        if (btn.innerText == name)
            btn.remove()
    }
}

function removeEveryBtn() {
    // ødelægger alt
    for (var b of D.querySelectorAll('#openBtn'))
        b.remove()
}


function newPlayer(name, gameID) {
    if (boardOpen) 
        return
    // <button id="openBtn" type="button" class="btn btn-primary"> Join </button>

    var btn = D.createElement('button')
    btn.classList = "btn btn-primary"
    btn.id = "openBtn"
    btn.type = "button"
    btn.innerText = name

    btn.ontouchend = () => {
        invite(name)
    }
    btn.onmouseup = () => {
        invite(name)
    }


    if (gameID != null)
        btn.disabled = true

    D.querySelector('.players').appendChild(btn)

    if (name == nickname)
        btn.remove()
}


var animateWidth = (isMobile) ? '90%':'450px'
console.log(animateWidth)

anime({
    targets: '#bg',
    width: animateWidth, // -> from '28px' to '100%',
    easing: 'easeInOutQuad',
    direction: 'alternate',
    duration: 1500,
    loop: true
})




function hover(elem) {
    if (!isMobile && boardOpen)
        elem.classList.add("fields-hover")
}

function deHover(elem) {
    elem.classList.remove("fields-hover")
}


function select(elem) {
    sendMsg('chooseTile', elem.id)
}


function invite(name) {
    sendMsg('invite', name)
}


function load() {
    D.getElementById('menuBtn').ontouchend = () => {
        close()
    }

    D.getElementById('menuBtn').onmouseup = () => {
        close()
    }
}


function open() {
    if (boardOpen)
        return

    removeEveryBtn()
    boardOpen = true
    var fields = D.querySelectorAll('.apply-for-field')

    let fields_class = (isMobile) ? 'fields-mobile':'fields'

    for (var f of fields)
        f.classList.add(fields_class)


    anime.remove('#bg');
    anime({ // der er her brættet folder sig ud
        targets: '#bg',
        height: size,
        width: size,
        duration: 1000
    })
}


function close(force) {
    if (!boardOpen && !force)
        return

    type_of_marker = -1

    boardOpen = false
    var fields = D.querySelectorAll('.apply-for-field')

    var Header = D.getElementById('Header')
    Header.innerText = `Hej ${nickname}!`

    D.querySelector('#instruction').innerText = "Prøv at udfordre en af dine venner!"

    let fields_class = (isMobile) ? 'fields-mobile':'fields'

    for (var f of fields)
        f.classList.remove(fields_class)

    for (var i = 0; i < 9; i ++) {
        placeMarker(i, -1)
    }

    D.getElementById('bg').style.height = '2px';

    anime.remove('#bg');
    anime({
        targets: '#bg',
        width: animateWidth, // -> from '28px' to '100%',
        easing: 'easeInOutQuad',
        direction: 'alternate',
        duration: 1500,
        loop: true
    })

    sendMsg('getPlayers')
    sendMsg('ready')
}




socket.on('update', function() {
    window.location.reload()
})