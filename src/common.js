import { useState, useEffect, useRef } from "react";
import axios from "axios";
let songservers = [];
// let baseLink = "";


// export const baseHeaders = {
//     "Connection": "Keep-Alive",
//     "Keep-Alive": "timeout=20000,max=1000"
// };

export const keepServersActive = async () => {
    console.log("activate call");

    if (songservers.length === 0) {
        songservers = await axios({
            method: "GET",
            url: "https://fervent-meninsky-931668.netlify.app/.netlify/functions/serverUrls"
        }).then(res => res.data.archives);
    }

    await Promise.all(
        songservers.map(async (server) => {
            try {
                const res = await axios.get(server);
                return res;
            } catch(e) {
                console.log("ERROR---------------",e.message);
                if (e) return;
            }
        })
    );
};

export const sendRequest = async config => {
    let baseLink = "http://localhost:5000";
    // const baseLink = "https://studioserver.herokuapp.com";
    // let baseLink = "http://192.168.29.77:5000";
    // const baseLink = "";

    if (!baseLink) {
        baseLink = await axios({
            method: "GET",
            url: "https://fervent-meninsky-931668.netlify.app/.netlify/functions/serverUrls"
            // url: "https://studio-urls.netlify.app/.netlify/functions/serverUrls"
        }).then(res => res.data.server);
    }

    const baseHeaders = {
        USER: localStorage.getItem("userId") || ""
    };
    let res;

    try {
        res = await axios({
            method: config.method,
            url: `${baseLink}/api${config.endpoint}`,
            // url: `/api${config.endpoint}`,
            data: config.data || {},
            headers: baseHeaders
        });
        const { data } = res;
        if (data.redirect) {
            window.location.href = "/login";
            return null;
        }
        return data;
    } catch (e) {
        console.log("ERROR----",e.message);
        return null;
    }
};


const openerConfig = {
    open: false,
    yValue: 0,
    xValue: 0,
    type: null,
    data: []
};

const topBarConfig = {
    button: false,
    buttonFunc: () => {},
    title: "",
    bgColor: "transparent"
};

const searchConfig = {
    open: false,
    input: "",
    prevTab: ""
};

const fullScreenConfig = {
    show: false
}

export function Timer (delay, cb) {

    let _time = delay;
    let _callback = cb;

    let _timeoutTimer = 0;
    let _intervalTimer = 0;
    let _secondsTracker = 0;
    let _done = false;
    let _paused = false;
    let _started = false;

    const _startInterval = () => {
        clearInterval(_intervalTimer);
        _intervalTimer = setInterval(() => {
            _secondsTracker++;
        },1000);
    };

    this.start = (t = _time) => {
        _paused = false;
        _started = true;
        _startInterval();
        clearTimeout(_timeoutTimer);
        _timeoutTimer = setTimeout(() => {
            _callback();
            _done = true;
            clearInterval(_intervalTimer);
        },t*1000);
    };

    this.pause = () => {
        _paused = true;
        clearTimeout(_timeoutTimer);
        clearInterval(_intervalTimer);
    }

    this.continue = () => {
        let diff = _time - _secondsTracker < 0 ? 0 : _time - _secondsTracker;
        this.start(diff);
    };

    this.canPause = () => {
        return !_done && _started && !_paused;
    };

    this.canContinue = () => {
        return !_done && _started && _paused;
    };

    this.hasStarted = () => {
        return _started;
    };

    this.hasFinished = () => {
        return this.done;
    };

    this.stop = () => {
        clearInterval(_intervalTimer);
        clearTimeout(_timeoutTimer);
    };

};

export const httpCheck = () => {
    if (window.location.protocol !== "http:") {
        window.location.protocol = "https:";
    }
};

export const wait = time => {
    return new Promise((resolve,) => {
        setTimeout(resolve, time);
    });
};

export const checkX = (cursorX, sWidth) => {
    const atRight = (cursorX + 250 + 5) < sWidth;
    if (atRight) {
        return cursorX + 5;
    }
    return cursorX - 250 - 5;
};

export const checkY = (cursorY, sHeight, num) => {
    const heightOfBody = (50 * num) + 10;
    const atBottom = (heightOfBody + cursorY + 5) < sHeight;
    if (atBottom) {
        return cursorY + 5;
    }
    return cursorY - heightOfBody - 5;
};

export const modifyLibrary = (res, decidingNumber) => {
    for (let key in res) {
        if (res[key].length < decidingNumber) {
            const arr = res[key];
            const times = decidingNumber - arr.length;
            for (let i=1;i<=times; i++) {
                res[key].push({});
            }
        }
    }
    return res;
};

export const convertTime = time => {
    let total = Math.floor(time);
    let min = total/60;
    let secs;
    let arr = min.toString().split(".");
    if (arr.length < 2) {
        min = arr[0];
        secs = "00";
        return `${min}: ${secs}`;
    } else {
        min = arr[0];
        secs = total - (min*60);
        return `${min}: ${secs < 10 ? "0" : ""}${secs}`;
    }
};

export const checkArtist = async (artist,e,type) => {
    return;
    if (artist === "Various Artists") return;
    if (e.target.className !== "artistpara" && type === "artist") return; 
    if (e.target.className !== "albumartistname" && type === "albumartist") return; 
    let res = await sendRequest({
        method: "POST",
        endpoint: `/checkArtist`,
        data: {
            name: artist
        }
    });
    if (e.target.className !== "artistpara-true" && e.target.className !== "artistpara-false" && type === "artist") {
        if (res.available) {
            e.target.className = "artistpara-true";
        } else {
            e.target.className = "artistpara-false";
        }
        return;
    }
    if (e.target.className !== "albumartistname-true" && e.target.className !== "albumartistname-false" && type === "albumartist") {
        if (res.status === 200 && res.data.available) {
            e.target.className = "albumartistname-true";
        } else {
            e.target.className = "albumartistname-false";
        }
    }
};

function createGlobalState(initialValue) {
    this.value = initialValue;
    this.subscribers = [];

    this.getValue = function() {
        return this.value;
    }

    this.setValue = function(newState) {
        if (this.getValue() === newState) {
            return
        }
        this.value = newState;
        this.subscribers.forEach(subscriber => {
            subscriber(this.value);
        });
    }

    this.subscribe = function(itemToSubscribe) {
        if (this.subscribers.indexOf(itemToSubscribe) !== -1) {
            return
        }
        this.subscribers.push(itemToSubscribe);
    }

    this.unsubscribe = function(itemToUnsubscribe) {
        this.subscribers = this.subscribers.filter(
            subscriber => subscriber !== itemToUnsubscribe
        );
    }
};

export const CustomUseState = globalState => {
    let [, setState] = useState();
    const state = globalState.getValue();

    function reRender(newState) {
        setState({});
    }

    useEffect(() => {
        globalState.subscribe(reRender);
        return () => {
            globalState.unsubscribe(reRender);
        }
    })

    function setNewState(newState) {
        globalState.setValue(newState);
    }

    return [state, setNewState];
};

export const usePrevious = value => {
    const ref = useRef({});
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

export let playingGlobal = new createGlobalState(false);
export let colorGlobal = new createGlobalState("");
export let tabGlobal = new createGlobalState("Home");
export let routesGlobal = new createGlobalState(["/home/homescreen"]);
// export let keepButtonGlobal = new createGlobalState(false);
// export let onClickFuncGlobal = new createGlobalState(() => {});
// export let topTitleGlobal = new createGlobalState("");
// export let topBgColor = new createGlobalState("transparent");
export let topBarGlobal = new createGlobalState(topBarConfig);
export let searchBarGlobal = new createGlobalState(searchConfig);
export let fullScreenGlobal = new createGlobalState(fullScreenConfig);
export let albumGlobal = new createGlobalState({});
export let queueGlobal = new createGlobalState([]);
export let queueOpenedGlobal = new createGlobalState("");
export let songIsPausedGlobal = new createGlobalState(false);
export let repeatTypeGlobal = new createGlobalState(0);
export let radioGlobal = new createGlobalState(false);
export let justOpened = new createGlobalState(true);
export let openerGlobal = new createGlobalState(openerConfig);
export let profileOpener = new createGlobalState(false);
export let homeClass = new createGlobalState("homemain start");
export let responseBar = new createGlobalState({ open: "", msg: "" });
export let miniPlayerGlobal = new createGlobalState(false);
export let topBgColorGlobal = new createGlobalState("#202020");
export const global = {};

// export const prefix = "/player";
export const prefix = "";