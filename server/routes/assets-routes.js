const router = require('express').Router()
const fs = require('fs')

// funktionen finder en fil ud fra pathen
// bliver brugt når jeg henter forskellige assets fra serveren
// alt i mappen assets kan tilgås

function find(path) {
    let splitPath = path.split('/')
    let file = splitPath[splitPath.length - 1]
    let pathWF = splitPath.splice(0, splitPath.length-1).join('/')

    if (fs.lstatSync( process.env.DIRNAME + '/game' + pathWF ).isDirectory()) {
        // det er en mappe
        let children = fs.readdirSync(process.env.DIRNAME + '/game' + pathWF)
        
        let fileName = splitPath[splitPath.length-1]
        fileName = (fileName.includes('.')) ? fileName.split('.')[0] : fileName

        let doesInclude = false


        for (kid of children) {
            let kidWT = (kid.includes('.')) ? kid.split('.')[0]:kid
            
            if (kidWT == fileName) {
                doesInclude = true
                fileName = kid
            }
        }

        let newPath = process.env.DIRNAME + '/game' + pathWF + '/' + fileName

        let isFile

        try {
            isFile = !fs.lstatSync( newPath ).isDirectory()
        } catch (err) {
            return false
        }


        if (isFile && doesInclude) {
            return newPath
        }

        return false

    } else {
        return false // Så er det en fil, og det er ikke meningen
    }
}

router.use('/', (req, res) => {
    if (req.url == '/') {
        res.send(false)
        return
    }
    // den finder automatisk den fil man requester
    let r = find('/assets' + req.url)
    
    
    if (r) {
        res.sendFile(r)
    } else {
        res.send(r)
    }
})



module.exports = router