chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => console.error(error));

chrome.storage.local.get(['userLocal'], async function () {
    let user = {
        set: "",
        term: "",
        flashcards: {"Math": ["Addition", "Subtraction"], "Science": ["Electrons", "Potatoes"]},
        definitions: {"Addition": ["Add", "Mad"], "Electrons": ["Not protons"]},
        panel: "main"
    }
    await chrome.storage.local.set({userLocal: user}, function () {});
})