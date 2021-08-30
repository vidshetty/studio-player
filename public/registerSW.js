if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js")
    .then(res => console.log("registered-player-sw"))
    .catch(err => console.log("error"));
}