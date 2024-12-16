// State variables
let editingState = false
let editingDef = null

// Transition Methods
function transition(elem, duration, animations, direction="normal") {
    elem.style.animation = animations
    elem.style.animationDuration = duration
    elem.style.animationDirection = direction
    elem.style.animationFillMode = "both"
}

// Page Changing methods
async function returnPanel() {
    // Switching panels
    for (let e of document.body.querySelectorAll("*")) {
        // Transitioning out
        if (e.style.visibility != "hidden") {
            transition(e, "300ms", "fadeout")
        }
    }

    await new Promise(resolve => setTimeout(resolve, 300));

    await chrome.storage.local.get(['userLocal'], async function (result) {
        let user = result.userLocal;
        user.panel = "set"
        user.term = ""
        await chrome.storage.local.set({ userLocal: user }, function () { });
    });

    await chrome.sidePanel.setOptions({ path: `setpanel/setpanel.html`})
}

// Retrieving elements
var returnButton = document.getElementById("return")
var termHeading = document.getElementById("termHeading")
var settings = document.getElementById("settings")

var defscontainer = document.getElementById("definitions-container")
var noDefs = document.getElementById("placeholder")

// Bottom of the screen stuff
var bottombuttons = document.getElementById("bottom-buttons")
var add = document.getElementById("add")

var bottominputs2 = document.getElementById("bottom-inputs2")
var adding = document.getElementById("naming")
var close2 = document.getElementById("close2")

var bottom = document.getElementById("bottom")

// Returning to main page
returnButton.addEventListener("mouseenter", async function() {
    transition(returnButton, "300ms", "color1")
})

returnButton.addEventListener("mouseleave", async function() {
    transition(returnButton, "300ms", "color1", "reverse")
})

returnButton.onclick = async function() {
    returnPanel()
}

// Retrieving definitions
chrome.storage.local.get(['userLocal'], async function (result) {
    let user = result.userLocal
    let existingDefs = user.definitions[user.term]

    // Getting current definition
    termHeading.innerHTML = user.term

    if (existingDefs.length > 0) {
        defscontainer.removeChild(noDefs)
    }

    for (let defName of existingDefs) {
        // Creating existing term objects
        let defToAdd = document.createElement("button")
        defToAdd.setAttribute("class", "definition")
        defToAdd.innerHTML = defName

        // Adding function to each term
        defToAdd.addEventListener("click", async function() {
            if (editingState) {

            }
        })

        // Hover stuff
        defToAdd.addEventListener("mouseover", async function() {
            transition(defToAdd, "300ms", "color1")
        })

        defToAdd.addEventListener("mouseleave", async function() {
            transition(defToAdd, "300ms", "color1", "reverse")
        })

        // Adding to container
        defscontainer.appendChild(defToAdd)
    }
})

// Going to adding definitions
/*add.addEventListener("mouseenter", async function() {
    transition(add, "300ms", "color1")
})

add.addEventListener("mouseleave", async function() {
    transition(add, "300ms", "color1", "reverse")
})*/

add.onclick = async function () {
    transition(add, "500ms", "grow, fadeout")

    transition(close2, "500ms", "shrink, fadein")
    transition(adding, "500ms", "grow, fadein")

    bottom.removeChild(bottominputs2)
    bottom.appendChild(bottominputs2)

    adding.focus()
}

// Adding definitions
adding.addEventListener("keypress", async (e) => {
    // Checking for existing term name
    let match = false
    for (let def of [...defscontainer.children]){
        if (def.innerHTML == adding.value){
            match = true
        }
    }

    if (match){
        // Name already exists
        transition(adding, "200ms", "shake")
        await new Promise(resolve => setTimeout(resolve, 200));
        adding.style.animation = null
        adding.value = ""
    } else{
        if (!editingState){
            // Adding the definition
            if (e.key == "Enter" && adding.value != "") {
                addSet(adding.value)
            }
        } else{
            
        }
    }
})

async function addSet(defName) {
    let defToAdd = document.createElement("button")
    defToAdd.setAttribute("class", "definition")
    defToAdd.innerHTML = defName

    // Adding function to the term
    defToAdd.addEventListener("click", async function() {
        if (editingState) {
            if (editingDef != defToAdd.innerHTML) {
                if (editingDef == "") {
                    transition(close2, "500ms", "fadein")
                    transition(adding, "500ms", "fadein")

                    bottom.removeChild(bottominputs2)
                    bottom.appendChild(bottominputs2)
                }

                await new Promise(resolve => setTimeout(resolve, 500));

                editingDef = defToAdd.innerHTML
            } else {
                transition(close2, "500ms", "fadeout")
                transition(adding, "500ms", "fadeout")
                await new Promise(resolve => setTimeout(resolve, 500));
                editingDef = ""
            }
        } else {
            // Switching panels
            await switchPanel(defToAdd.innerHTML);
        }
    })

    // Hover stuff
    defToAdd.addEventListener("mouseover", async function() {
        transition(defToAdd, "300ms", ((editingState)? "color2": "color1"))
    })

    defToAdd.addEventListener("mouseleave", async function() {
        transition(defToAdd, "300ms", ((editingState)? "color2": "color1"), "reverse")
    })

    // Adding to container
    defscontainer.appendChild(defToAdd)

    // Adding to storage
    await chrome.storage.local.get(['userLocal'], async function (result) {
        let user = result.userLocal;
        user.flashcards[user.set].push(defName)
        user.definitions[defName] = []
        console.log(user.flashcards)
        await chrome.storage.local.set({ userLocal: user }, function () { });
    });

    adding.value = ""
}

// Returning from adding terms
/*close2.addEventListener("mouseenter", async function() {
    transition(close2, "300ms", "color1")
})

close2.addEventListener("mouseleave", async function() {
    transition(close2, "300ms", "color1", "reverse")
})*/

close2.onclick = async function () {
    if (!editingState) {
        transition(add, "500ms", "shrink, fadein")

        transition(adding, "500ms", "shrink, fadeout")
        transition(close2, "500ms", "grow, fadeout")
        adding.value = ""

        bottom.removeChild(bottombuttons)
        bottom.appendChild(bottombuttons)
    } else{
        
    }
}

// Settings click
settings.onclick = async function() {
    if (!editingState) {
        // Changing set colors
        for (let def of [...defscontainer.children]){
            def.style.backgroundColor = "#003c28"
            def.style.color = "#b08cff"
        }

        // Changing close2 image
        let trash = document.createElement("img")
        trash.setAttribute("id","trash")
        trash.setAttribute("src","delete.png")
        close2.replaceChildren(trash)

        // Changing adding to renaming
        adding.setAttribute("placeholder", "Rename")

        editingState = true

        transition(add, "500ms", "fadeout")
    } else {
        // Changing set colors
        for (let def of [...defscontainer.children]){
            def.style.backgroundColor = "#250074"
            def.style.color = "#b2ffd7"
        }
        
        // Changing bottom elements back
        if (editingDef != "") {
            console.log("hi")
            transition(add, "500ms", "shrink, fadein")

            transition(adding, "500ms", "shrink, fadeout")
            transition(close2, "500ms", "grow, fadeout")
            adding.value = ""

            bottom.removeChild(bottombuttons)
            bottom.appendChild(bottombuttons)
        } else {
            transition(add, "500ms", "fadein")

            bottom.removeChild(bottombuttons)
            bottom.appendChild(bottombuttons)
        }

        // Changing close2 image back
        let close = document.createElement("img")
        close.setAttribute("id","X-image")
        close.setAttribute("src","X.png")
        close2.replaceChildren(close)

        // Changing adding placeholder back
        adding.setAttribute("placeholder", "Set name")

        editingState = false
    }
}