// Dette script har adgang til alle funktioner og variabler i main.js og ikke omvendt
// I håb om at gøre programmet lidt mere overskueligt har jeg placeret nogle af de funktioner
// som ikke gør så meget

function load() {
    // Der skal jo være plads til både mobil og computer :)
    D.getElementById('menuBtn').ontouchend = () => {
        close()
    }

    D.getElementById('menuBtn').onmouseup = () => {
        close()
    }
}

var animateWidth = (isMobile) ? '90%':'450px'

// starter en animation af en bjælke, som senere folder sig ud.
anime({
    targets: '#bg',
    width: animateWidth, // -> from '28px' to '100%',
    easing: 'easeInOutQuad',
    direction: 'alternate',
    duration: 1500,
    loop: true
})


// Bliver kaldt når musen er inde over et element
function hover(elem) {
    if (!isMobile && boardOpen) // tjekker om enheden er en computer og om brættet er åbent
        elem.classList.add("fields-hover")
}


// fjerner bare klassen fra element.
function deHover(elem) {
    elem.classList.remove("fields-hover")
}


// sender en besked til serveren om hvilket felt, der blev trykket på
function select(elem) {
    sendMsg('chooseTile', elem.id)
}

// sender en besked til serveren om hvem man gerne vil invitere til en kamp
function invite(name) {
    sendMsg('invite', name)
}