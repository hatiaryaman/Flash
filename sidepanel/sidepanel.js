// State variables
let editingState = false
let editingSet = ""

// Transition Methods
function transition(elem, duration, animations, direction="normal") {
    elem.style.animation = animations
    elem.style.animationDuration = duration
    elem.style.animationDirection = direction
    elem.style.animationFillMode = "both"
}

// Page Changing methods
async function switchPanel(setName) {
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
        user.set = setName
        user.panel = "set"
        await chrome.storage.local.set({ userLocal: user }, function () { });
    });3

    await chrome.sidePanel.setOptions({ path: `setpanel/setpanel.html`})
}

// Retrieving elements
var settings = document.getElementById("settings")

var setscontainer = document.getElementById("sets-container")

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

// Retrieving sets
chrome.storage.local.get(['userLocal'], async function (result) {
    let user = result.userLocal
    let existingSets = Object.keys(user.flashcards)

    for (let setName of existingSets) {
        // Creating existing set objects
        let setToAdd = document.createElement("button")
        setToAdd.setAttribute("class", "set")
        setToAdd.innerHTML = setName

        // Adding function to each set
        setToAdd.addEventListener("click", async function() {
            if (editingState) {
                if (editingSet != setToAdd.innerHTML) {
                    if (editingSet == "") {
                        transition(close2, "500ms", "fadein")
                        transition(adding, "500ms", "fadein")

                        bottom.removeChild(bottominputs2)
                        bottom.appendChild(bottominputs2)
                    }

                    await new Promise(resolve => setTimeout(resolve, 500));

                    editingSet = setToAdd.innerHTML
                } else {
                    transition(close2, "500ms", "fadeout")
                    transition(adding, "500ms", "fadeout")
                    await new Promise(resolve => setTimeout(resolve, 500));
                    editingSet = ""
                }
            } else {
                // Switching panels
                await switchPanel(setToAdd.innerHTML);
            }
        })

        // Hover stuff
        setToAdd.addEventListener("mouseover", async function() {
            transition(setToAdd, "300ms", ((editingState)? "color2": "color1"))
        })

        setToAdd.addEventListener("mouseleave", async function() {
            transition(setToAdd, "300ms", ((editingState)? "color2": "color1"), "reverse")
        })

        // Adding to container
        setscontainer.appendChild(setToAdd)
    }
})

// Going to adding sets
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

// Adding sets
adding.addEventListener("keypress", async (e) => {
    if (e.key == "Enter" && adding.value != "") {
        // Checking for existing set name
        let match = false
        for (let set of [...setscontainer.children]){
            if (set.innerHTML == adding.value){
                match = true
            }
        }

        if (match){
            // Name already exists
            transition(adding, "200ms", "shake")
            await new Promise(resolve => setTimeout(resolve, 200));
            adding.style.animation = null
        } else{
            if (!editingState){
                // Adding the set
                addSet(adding.value)
            } else{
                // Changing set name
                for (let set of [...setscontainer.children]){
                    if (set.innerHTML == editingSet){
                        set.innerHTML = adding.value
                    }
                }

                chrome.storage.local.get(['userLocal'], async function (result) {
                    let user = result.userLocal
                    let terms = user.flashcards[editingSet]
                    console.log(terms)
                    user.flashcards[adding.value] = terms
                    delete user.flashcards[editingSet]
                    console.log(user.flashcards)
                    await chrome.storage.local.set({userLocal: user}, function () {});
                    adding.value = ""
                })
            }
        }
    }
})

async function addSet(setName) {
    let setToAdd = document.createElement("button")
    setToAdd.setAttribute("class", "set")
    setToAdd.innerHTML = setName

    // Adding function to the set
    setToAdd.addEventListener("click", async function() {
        if (editingState) {

        } else {
            // Switching panels
            await switchPanel(setToAdd.innerHTML);
        }
    })

    // Hover stuff
    setToAdd.addEventListener("mouseover", async function() {
        transition(setToAdd, "300ms", "color1")
    })

    setToAdd.addEventListener("mouseleave", async function() {
        transition(setToAdd, "300ms", "color1", "reverse")
    })

    // Adding to container
    setscontainer.appendChild(setToAdd)

    // Adding to storage
    await chrome.storage.local.get(['userLocal'], async function (result) {
        let user = result.userLocal;
        user.flashcards[setName] = []
        console.log(user.flashcards)
        await chrome.storage.local.set({ userLocal: user }, function () { });
    });

    adding.value = ""
}

// Returning from adding sets
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
        for (let set of [...setscontainer.children]){
            if (set.innerHTML == editingSet) {
                setscontainer.removeChild(set)
            }
        }

        await chrome.storage.local.get(['userLocal'], async function (result) {
            let user = result.userLocal;
            delete user.flashcards[editingSet]
            await chrome.storage.local.set({ userLocal: user }, function () { });
            editingSet = ""
        });

        transition(adding, "500ms", "fadeout")
        transition(close2, "500ms", "fadeout")
        adding.value = ""
    }
}

// Going to search sets
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

// Searching sets

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
        for (let set of [...setscontainer.children]){
            set.style.backgroundColor = "#003c28"
            set.style.color = "#b08cff"
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
        for (let set of [...setscontainer.children]){
            set.style.backgroundColor = "#250074"
            set.style.color = "#b2ffd7"
        }
        
        // Changing bottom elements back
        if (editingSet != "") {
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