// State variables
let editingState = false
let editingTerm = null

// Transition Methods
function transition(elem, duration, animations, direction="normal") {
    elem.style.animation = animations
    elem.style.animationDuration = duration
    elem.style.animationDirection = direction
    elem.style.animationFillMode = "both"
}

// Page Changing methods
async function switchPanel(termName) {
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
        user.term = termName
        user.panel = "term"
        await chrome.storage.local.set({ userLocal: user }, function () { });
    });

    await chrome.sidePanel.setOptions({ path: `termpanel/termpanel.html`})
}

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
        user.panel = "main"
        await chrome.storage.local.set({ userLocal: user }, function () { });
    });

    await chrome.sidePanel.setOptions({ path: `sidepanel/sidepanel.html`})
}

// Retrieving elements
var returnButton = document.getElementById("return")
var setHeading = document.getElementById("setHeading")
var settings = document.getElementById("settings")

var termscontainer = document.getElementById("terms-container")

// Bottom of the screen stuff
var bottombuttons = document.getElementById("bottom-buttons")
var add = document.getElementById("add")
var search = document.getElementById("search")

var bottominputs1 = document.getElementById("bottom-inputs1")
var searching = document.getElementById("searching")
var close1 = document.getElementById("close1")

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

// Retrieving terms
chrome.storage.local.get(['userLocal'], async function (result) {
    let user = result.userLocal
    let existingTerms = user.flashcards[user.set]

    // Getting current set
    setHeading.innerHTML = user.set

    for (let termName of existingTerms) {
        // Creating existing term objects
        let termToAdd = document.createElement("button")
        termToAdd.setAttribute("class", "term")
        termToAdd.innerHTML = termName

        // Adding function to each term
        termToAdd.addEventListener("click", async function() {
            if (editingState) {

            } else {
                // Switching panels
                await switchPanel(termToAdd.innerHTML);
            }
        })

        // Hover stuff
        termToAdd.addEventListener("mouseover", async function() {
            transition(termToAdd, "300ms", "color1")
        })

        termToAdd.addEventListener("mouseleave", async function() {
            transition(termToAdd, "300ms", "color1", "reverse")
        })

        // Adding to container
        termscontainer.appendChild(termToAdd)
    }
})

// Going to adding terms
/*add.addEventListener("mouseenter", async function() {
    transition(add, "300ms", "color1")
})

add.addEventListener("mouseleave", async function() {
    transition(add, "300ms", "color1", "reverse")
})*/

add.onclick = async function () {
    transition(add, "500ms", "grow, fadeout")
    transition(search, "500ms", "shrink, fadeout")

    transition(close2, "500ms", "shrink, fadein")
    transition(adding, "500ms", "grow, fadein")

    bottom.removeChild(bottominputs2)
    bottom.appendChild(bottominputs2)

    adding.focus()
}

// Adding terms
adding.addEventListener("keypress", async (e) => {
    // Checking for existing term name
    let match = false
    for (let term of [...termscontainer.children]){
        if (term.innerHTML == adding.value){
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
            // Adding the term
            if (e.key == "Enter" && adding.value != "") {
                addSet(adding.value)
            }
        } else{
            
        }
    }
})

async function addSet(termName) {
    let termToAdd = document.createElement("button")
    termToAdd.setAttribute("class", "term")
    termToAdd.innerHTML = termName

    // Adding function to the term
    termToAdd.addEventListener("click", async function() {
        if (editingState) {
            if (editingTerm != termToAdd.innerHTML) {
                if (editingTerm == "") {
                    transition(close2, "500ms", "fadein")
                    transition(adding, "500ms", "fadein")

                    bottom.removeChild(bottominputs2)
                    bottom.appendChild(bottominputs2)
                }

                await new Promise(resolve => setTimeout(resolve, 500));

                editingTerm = termToAdd.innerHTML
            } else {
                transition(close2, "500ms", "fadeout")
                transition(adding, "500ms", "fadeout")
                await new Promise(resolve => setTimeout(resolve, 500));
                editingTerm = ""
            }
        } else {
            // Switching panels
            await switchPanel(termToAdd.innerHTML);
        }
    })

    // Hover stuff
    termToAdd.addEventListener("mouseover", async function() {
        transition(termToAdd, "300ms", ((editingState)? "color2": "color1"))
    })

    termToAdd.addEventListener("mouseleave", async function() {
        transition(termToAdd, "300ms", ((editingState)? "color2": "color1"), "reverse")
    })

    // Adding to container
    termscontainer.appendChild(termToAdd)

    // Adding to storage
    await chrome.storage.local.get(['userLocal'], async function (result) {
        let user = result.userLocal;
        user.flashcards[user.set].push(termName)
        user.definitions[termName] = []
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
        transition(search, "500ms", "grow, fadein")

        transition(adding, "500ms", "shrink, fadeout")
        transition(close2, "500ms", "grow, fadeout")
        adding.value = ""

        bottom.removeChild(bottombuttons)
        bottom.appendChild(bottombuttons)
    } else{
        
    }
}

// Going to search terms
/*search.addEventListener("mouseenter", async function() {
    transition(search, "300ms", "color1")
})

search.addEventListener("mouseleave", async function() {
    transition(search, "300ms", "color1", "reverse")
})*/

search.onclick = async function () {
    transition(add, "500ms", "grow, fadeout")
    transition(search, "500ms", "shrink, fadeout")

    transition(close1, "500ms", "shrink, fadein")
    transition(searching, "500ms", "grow, fadein")

    bottom.removeChild(bottominputs1)
    bottom.appendChild(bottominputs1)

    searching.focus()
}

// Searching terms

// Returning from searching sets
/*close1.addEventListener("mouseenter", async function() {
    transition(close1, "300ms", "color1")
})

close1.addEventListener("mouseleave", async function() {
    transition(close1, "300ms", "color1", "reverse")
})*/

close1.onclick = async function () {
    transition(add, "500ms", "shrink, fadein")
    transition(search, "500ms", "grow, fadein")

    transition(searching, "500ms", "shrink, fadeout")
    transition(close1, "500ms", "grow, fadeout")
    searching.value = ""

    bottom.removeChild(bottombuttons)
    bottom.appendChild(bottombuttons)
}

// Settings click
settings.onclick = async function() {
    if (!editingState) {
        // Changing set colors
        for (let term of [...termscontainer.children]){
            term.style.backgroundColor = "#003c28"
            term.style.color = "#b08cff"
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
        transition(search, "500ms", "fadeout")
    } else {
        // Changing set colors
        for (let term of [...termscontainer.children]){
            term.style.backgroundColor = "#250074"
            term.style.color = "#b2ffd7"
        }
        
        // Changing bottom elements back
        if (editingTerm != "") {
            console.log("hi")
            transition(add, "500ms", "shrink, fadein")
            transition(search, "500ms", "grow, fadein")

            transition(adding, "500ms", "shrink, fadeout")
            transition(close2, "500ms", "grow, fadeout")
            adding.value = ""

            bottom.removeChild(bottombuttons)
            bottom.appendChild(bottombuttons)
        } else {
            transition(add, "500ms", "fadein")
            transition(search, "500ms", "fadein")

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