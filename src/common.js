import React from "react";



const HIDE_ALL_LOGS = true;


export const print = (...params) => {
    if (HIDE_ALL_LOGS) return;
    console.log(...params);
};

export class Timer {

    #_time;
    #_callback;
    #_timeoutTimer = 0;
    #_intervalTimer = 0;
    #_secondsTracker = 0;
    #_done = false;
    #_paused = false;
    #_started = false;

    constructor(delay, cb) {
        this.#_time = delay;
        this.#_callback = cb;
    }

    #_startInterval () {
        clearInterval(this.#_intervalTimer);
        this.#_intervalTimer = setInterval(() => {
            this.#_secondsTracker++;
        },1000);
    };

    start (t = this.#_time) {
        this.#_paused = false;
        this.#_started = true;
        this.#_startInterval();
        clearTimeout(this.#_timeoutTimer);
        this.#_timeoutTimer = setTimeout(() => {
            this.#_callback();
            this.#_done = true;
            clearInterval(this.#_intervalTimer);
        }, t*1000);
    };

    pause () {
        this.#_paused = true;
        clearTimeout(this.#_timeoutTimer);
        clearInterval(this.#_intervalTimer);
    }

    continue () {
        let diff = this.#_time - this.#_secondsTracker < 0 ? 0 : this.#_time - this.#_secondsTracker;
        this.start(diff);
    };

    canPause () {
        return !this.#_done && this.#_started && !this.#_paused;
    };

    canContinue () {
        return !this.#_done && this.#_started && this.#_paused;
    };

    hasStarted () {
        return this.#_started;
    };

    hasFinished () {
        return this.#_done;
    };

    stop () {
        clearInterval(this.#_intervalTimer);
        clearTimeout(this.#_timeoutTimer);
    };

};

export const httpCheck = () => {
    // if (window.location.protocol !== "https:") {
    //     window.location.protocol = "https:";
    // }
};

export const wait = time => {
    return new Promise((resolve,) => {
        setTimeout(resolve, time);
    });
};

export const checkX = (cursorX, sWidth) => {

    const x = 10;
    const atRight = (cursorX + 250 + x) < sWidth;
    if (atRight) return cursorX + x;
    return cursorX - 250 - x;

};

export const checkY = (cursorY, sHeight, num) => {

    const y = 10;
    const heightOfBody = (50 * num) + 10;
    const atBottom = (heightOfBody + cursorY + y) < sHeight;
    if (atBottom) return cursorY + y;
    return cursorY - heightOfBody - y;

};

export const convertTime = time => {
    const total = Math.floor(time);
    let min = total/60;
    let secs;
    let arr = min.toString().split(".");
    if (arr.length < 2) {
        min = arr[0];
        secs = "00";
        return `${min}: ${secs}`;
    }
    min = arr[0];
    secs = total - (min*60);
    return `${min}: ${secs < 10 ? "0" : ""}${secs}`;
};

export const dateToString = dateValue => {
    const date = new Date(dateValue);
    let month = "";
    switch(date.getMonth()) {
        case 0: month = "January"; break;
        case 1: month = "February"; break;
        case 2: month = "March"; break;
        case 3: month = "April"; break;
        case 4: month = "May"; break;
        case 5: month = "June"; break;
        case 6: month = "July"; break;
        case 7: month = "August"; break;
        case 8: month = "September"; break;
        case 9: month = "October"; break;
        case 10: month = "November"; break;
        case 11: month = "December"; break;
    };
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
};

export const global = {
    searchBarOpen: false, // search bar is open or not
    id: 0, // song id in queue

    activeSong: null, // playing song, used in queue
    selectedElement: null, // used in queue
    scrolled: null, // used in queue
    selectedSong: null, // used in queue
    selectedSongIndex: null, // used in queue
    containerDimensions: null, // used in queue
};


export const skipSecs = 5;
export const prefix = "/player";
export const basename = "";
// export const basename = "/player";
// export const prefix = "";
export const sharingBaseLink = (() => {
    return `https://studiomusic.herokuapp.com${prefix}${basename}`;
    // return `http://localhost:3000${prefix}${basename}`;
})();