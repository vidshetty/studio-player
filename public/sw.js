const cacheName = "v1";


self.addEventListener("install", e => {
    self.skipWaiting();
});

self.addEventListener("activate", e => {
    e.waitUntil(
        caches.keys().then(names => {
            for (let name of names) {
                if (name !== cacheName) {
                    caches.delete(name);
                }
            }
        })
    );
});

const callCache = e => {
    return caches.match(e.request)
    .then(resp => {
        if (resp) {
            return resp;
        }
        return caches.open(cacheName).then(cache => {
            return fetch(e.request).then(response => {
                cache.put(e.request, response.clone())
                .catch(e => {
                    console.log("error in request",e.request);
                });
                return response;
            });
        });
    });
};

self.addEventListener("fetch", e => {
    const { url } = e.request;

    if (
        url.includes(".svg") ||
        url.includes(".png") ||
        url.includes(".css") ||
        url.includes(".js") ||
        url.includes("font") ||
        url === "https://studiomusic.herokuapp.com" ||
        url === "https://studiomusic.herokuapp.com/" ||
        url === "https://studiomusic.herokuapp.com/player"
        // url.includes("/player/album") ||
        // url.includes("/player/track") ||
        // url.includes("/player/search")
    ) {
        e.respondWith(callCache(e));
    } else {
        e.respondWith(fetch(e.request))
    }
});


// e.waitUntil(
//     caches.open(cacheName).then(cache => {
//         cache.add(url);
//     })
// );

// if (url.includes("songserver") && headers.has("range")) {
//     const newHeaders = {};
//     for (const each of headers.entries()) {
//         newHeaders[each[0]] = each[1];
//     }
//     newHeaders["allowaccess"] = "a";
//     e.respondWith(
//         fetch(url,{
//             method: "GET",
//             headers: newHeaders,
//             redirect: "follow"
//         })
//     );
// }