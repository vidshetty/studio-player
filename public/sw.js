this.self.addEventListener("install", e => {
    console.log("sw installed");
});

this.self.addEventListener("activate", e => {
    console.log("sw activated");
});

this.self.addEventListener("fetch", e => {
    const { url, headers } = e.request;
    if (url.includes("songserver") && headers.has("range")) {
        const newHeaders = {};
        for (const each of headers.entries()) {
            newHeaders[each[0]] = each[1];
        }
        newHeaders["allowaccess"] = "a";
        e.respondWith(
            fetch(url,{
                method: "GET",
                headers: newHeaders,
                redirect: "follow"
            })
        );
    }
});