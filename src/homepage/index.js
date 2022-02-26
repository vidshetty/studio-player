import "../css/homestyles.css";
import "../css/hometeststyles.css";
import "../css/playerstyles.css";
import "../css/albumview.css";
import MainPanel from "./mainpanel";
import React, { useState, useEffect, useRef, useContext } from "react";
import Play from "../assets/playbutton-white.svg";
import Pause from "../assets/pausebutton-white.svg";
import Close from "../assets/deletewhite.svg";
import Placeholder from "../assets/placeholder.svg";
import repeat from "../assets/repeat-white.svg";
import repeatOne from "../assets/repeat-one-white.svg";
import noRepeat from "../assets/norepeat-disabled.svg";
import shuffleoff from "../assets/shuffle-disabled.svg";
import shuffleon from "../assets/shuffle-enabled.svg";
import next from "../assets/nextbutton-white.svg";
import previous from "../assets/previousbutton-white.svg";
import upArrow from "../assets/uparrow.svg";
import downArrow from "../assets/downarrow.svg";
import Button from "../Button";

import { APIService } from "../api-service";

import {
    convertTime,
    wait,
    Timer,
    global,
    skipSecs
} from "../common";

import {
    PlayerContext,
    QueueContext,
    QueueOpenedContext,
    AlbumContext,
    MenuContext,
    RepeatTypeContext,
    SongIsPausedContext,
    FullScreenContext,
    LyricsContext,
    LyricsTextContext,
    RadioContext,
    MiniPlayerContext,
    ResponseBarContext,
    ProfileContext,
    KeyShortcutContext,
    UserContext
} from "../index";


const audio = new Audio();


// Player
export let pauseOrPlay = null;
let trackingTimer = null;
const shouldCache = false;
class PlayerData {
    static trackingTimer = null;
    static elapsedTime = null;
    static duration = null;
    static range = null;
    static volumerange = null;
    static setVolume = 1;
    static percent = 0
    static bufferPercent = 0;
    static repeatType = null;
    static mainVolume = 1;
    static queue = null;
    static currentSongIndex = null;
    static isPlaying = null;
    static buffering = null;
    static manuallyPaused = null;
    static screen = null;
    static currentLyricIndex = null;
    static lyrics = null;
    static lyricsText = null;
}

// Opener
let style = null;

// Response bar
let timeout = null;

// ProfileOpener
let signOutLoading = null;


const changeColor = (percent,bufferPercent) => {
    return `linear-gradient(to right, #066bff ${percent}%, ` + 
            `#404040 ${percent}%, #404040 ${bufferPercent}%, #303030 0%)`;
};

const changeColorVolume = (value) => {
    return `linear-gradient(to right, #808080 ${value}%, rgba(255,255,255,0.1) 0%)`;
};

const fetchStream = async url => {
    return fetch(url,{
        method: "GET"
    })
    .then(res => {
        const reader = res.body.getReader();
        return reader.read().then(result => {
            return result;
        });
    });
};

const trial = async () => {
    // const res = await fetch("https://scriptwaale.herokuapp.com/listen/Bekhayali");
    // const reader = res.body.getReader();
    // while (true) {
    //     const { value, done } = await reader.read();
    //     console.log("value",value);
    //     const blob = new Blob(value);
    //     audio.src = URL.createObjectURL(blob);
    //     audio.play();
    //     if (done) break;
    // }
    // console.log("Response done");
    async function fetchAudio() {
        
      }
    fetchAudio()
      .then((response) => {
        var blob = new Blob([response.value], { type: 'audio/mp3' });
        var url = window.URL.createObjectURL(blob)
        const music = new Audio();
        music.src = url;
        // console.log("playing");
        music.play();
      })
      
};


const Player = () => {

    const [hovered, setHovered] = useState(false);
    const [, setMuteOptions] = useState({ mute: false, lastlevel: null });
    const [song, setSong] = useContext(AlbumContext);
    const [, setPlaying] = useContext(PlayerContext);
    const [queue, setQueue] = useContext(QueueContext);
    const [buffering, setBuffering] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [manuallyPaused, setManuallyPaused] = useState(false);
    const [repeatType, setRepeatType] = useContext(RepeatTypeContext);
    const [shuffle, setShuffle] = useState(false);
    const [queueOpened, setQueueOpened] = useContext(QueueOpenedContext);
    const [,setSongPaused] = useContext(SongIsPausedContext);
    const [screen,] = useContext(FullScreenContext);
    const [openerDetails, setOpenerDetails] = useContext(MenuContext);
    const [, setResBar] = useContext(ResponseBarContext);
    const [lyrics,] = useContext(LyricsContext);
    const [lyricText ,setLyricText] = useContext(LyricsTextContext);
    const [isRadioOn, setRadioOn] = useContext(RadioContext);
    const [update,] = useState(true);

    PlayerData.screen = screen;
    PlayerData.queue = queue;
    PlayerData.manuallyPaused = manuallyPaused;
    PlayerData.isPlaying = isPlaying;
    PlayerData.buffering = buffering;
    PlayerData.lyrics = lyrics;
    PlayerData.lyricsText = lyricText;
    PlayerData.currentSongIndex = PlayerData.queue.findIndex(each => {
        return each.id === song.id;
    });


    class SeekData {

        static #forwardInUse = false;
        static #rewindInUse = false;
        static #seekTimer = 0;
        static #curTime = null;
        static #newCurTime = null;
    
        static move(direction) {
            if (direction === "forward") this.#forwardInUse = true;
            if (direction === "rewind") this.#rewindInUse = true;
            this.#curTime = audio.currentTime;
    
            const duration = audio.duration;
            this.#seekTimer += direction === "forward" ? skipSecs : skipSecs * -1;
            this.#newCurTime = (() => {
                if (direction === "forward") {
                    return this.#curTime + this.#seekTimer > duration ? duration : this.#curTime + this.#seekTimer;
                }
                return this.#curTime + this.#seekTimer < 0 ? 0 : this.#curTime + this.#seekTimer;
            })();
    
            PlayerData.range.value = this.#newCurTime;
            PlayerData.percent = PlayerData.range.value/PlayerData.range.max * 100;
            PlayerData.range.style.background = changeColor(PlayerData.percent, PlayerData.bufferPercent);
        }
    
        static inUse(direction = null) {
            if (direction === null) return this.#forwardInUse || this.#rewindInUse;
            if (direction === "forward") return this.#forwardInUse;
            if (direction === "rewind") return this.#rewindInUse;
        }
    
        static #set() {
            audio.currentTime = this.#newCurTime;
        }
    
        static release(direction = null) {
            if (direction === "forward") this.#forwardInUse = false;
            else if (direction === "rewind") this.#rewindInUse = false;
            else {
                this.#forwardInUse = false;
                this.#rewindInUse = false;
            }
            this.#seekTimer = 0;
            this.#curTime = null;
            this.#set();
            this.#newCurTime = null;
        }

    }


    pauseOrPlay = (e) => {
        e && e.stopPropagation && e.stopPropagation();

        if (!PlayerData.manuallyPaused) {
            audio.pause();
            onpaused();
        }
        else {
            const cur = audio.currentTime;
            audio.currentTime = cur;
            setManuallyPaused(false);
            audio.play()
            .then(() => {
                if (!trackingTimer.hasStarted()) trackingTimer.start();
            });
        }
    };

    const changeRepeat = (e) => {
        e && e.stopPropagation && e.stopPropagation();
        setRepeatType(prev => {
            const newVal = prev+1 > 2 ? 0 : prev+1;
            PlayerData.repeatType = newVal;
            localStorage.setItem("repeatType", newVal);
            return newVal;
        });
    };
    const openQueue = (e) => {
        e && e.stopPropagation();
        documentClick(e);
        setQueueOpened(!queueOpened);
    };
    const goToNext = (e) => {
        e && e.stopPropagation && e.stopPropagation();
        if (PlayerData.queue.length === 1) audio.currentTime = 0;
        else {
            const findNextIndex = () => {
                let found = false;
                let nowIndex = PlayerData.currentSongIndex;
                let nextIndex;
                while (!found) {
                    nextIndex = nowIndex < PlayerData.queue.length - 1 ? nowIndex + 1 : 0;
                    const nextSong = PlayerData.queue[nextIndex];
                    if (Object.keys(nextSong).length < 2) nowIndex = nextIndex;
                    else found = true;
                }
                return nextIndex;
            };
            const nextIndex = findNextIndex();
            setSong(PlayerData.queue[nextIndex]);
            PlayerData.currentSongIndex = nextIndex;
        }
        setSongPaused(true);
    };
    const goToPrevious = (e) => {
        e && e.stopPropagation && e.stopPropagation();
        setSongPaused(true);
        if (PlayerData.queue.length === 1 || audio.currentTime > 10) {
            audio.currentTime = 0;
            trackingTimer.stop();
            trackingTimer = new Timer(30, addToRecentlyPlayed);
            if (!trackingTimer.hasStarted() && !audio.paused) trackingTimer.start();
        }
        else {
            const findPreviousIndex = () => {
                let found = false;
                let nowIndex = PlayerData.currentSongIndex;
                let previousIndex;
                while (!found) {
                    previousIndex = nowIndex === 0 ? PlayerData.queue.length - 1 : nowIndex - 1;
                    const previousSong = PlayerData.queue[previousIndex];
                    if (Object.keys(previousSong).length < 2) nowIndex = previousIndex;
                    else found = true;
                }
                return previousIndex;
            };
            const prevIndex = findPreviousIndex();
            setSong(PlayerData.queue[prevIndex]);
            PlayerData.currentSongIndex = prevIndex;
        }
    };
    const shutdown = () => {
        setPlaying(false);
        audio.src = "";
        setSong({});
        setQueue([]);
        setRadioOn(false);
        if (queueOpened) setQueueOpened(!queueOpened);
    };
    const randomize = (arr) => {
        let i, len = arr.length, rand;
        for (i=len-1; i>0; i--) {
            rand = Math.floor(Math.random() * len);
            [arr[i], arr[rand]] = [arr[rand], arr[i]];
        }
        arr.splice(0,0,song);
        return arr;
    };
    const seekShortcut = (diff) => {
        if (isNaN(audio.duration)) return;
        const amount = diff * 0.1 * audio.duration;
        audio.currentTime = amount;
        PlayerData.range.value = amount;
        PlayerData.percent = PlayerData.range.value/PlayerData.range.max * 100;
        PlayerData.range.style.background = changeColor(PlayerData.percent, PlayerData.bufferPercent);
    };
    const shuffleHandler = async (e) => {
        e.stopPropagation();
        if (!shuffle && PlayerData.queue.length > 3) {
            const dummyQueue = PlayerData.queue;
            const index = dummyQueue.indexOf(song);
            [dummyQueue[0], dummyQueue[index]] = [dummyQueue[index], dummyQueue[0]];
            const shuffled = randomize(dummyQueue.slice(1, PlayerData.queue.length));
            setQueue(shuffled);
            setShuffle(true);
            await wait(500);
            setShuffle(false);
        }
    };


    const volumeinput = (e) => {
        e.stopPropagation();
        PlayerData.volumerange.style.background = changeColorVolume(PlayerData.volumerange.value);
        audio.volume = PlayerData.volumerange.value/100;
        PlayerData.mainVolume = PlayerData.volumerange.value/100;
        PlayerData.setVolume = PlayerData.volumerange.value/100;
        setMuteOptions(prev => {
            return { ...prev, mute: false, lastlevel: PlayerData.volumerange.value };
        });
    };
    const volumechange = (e) => {
        e && e.stopPropagation();
        PlayerData.volumerange.style.background = changeColorVolume(PlayerData.volumerange.value);
        audio.volume = PlayerData.volumerange.value/100;
        PlayerData.mainVolume = PlayerData.volumerange.value/100;
        PlayerData.setVolume = PlayerData.volumerange.value/100;
        setMuteOptions(prev => {
            return { ...prev, mute: false, lastlevel: PlayerData.volumerange.value };
        });
    };


    const progressinput = (e) => {
        PlayerData.range.focus();
        PlayerData.elapsedTime.innerText = convertTime(PlayerData.range.value);
        PlayerData.percent = PlayerData.range.value/PlayerData.range.max * 100;
        PlayerData.range.style.background = changeColor(PlayerData.percent, PlayerData.bufferPercent);
    };
    const progresschange = (e) => {
        audio.currentTime = PlayerData.range.value;
        audio.volume = PlayerData.mainVolume;
        PlayerData.range.blur();
        PlayerData.percent = PlayerData.range.value/PlayerData.range.max * 100;
        PlayerData.range.style.background = changeColor(PlayerData.percent, PlayerData.bufferPercent);
    };


    const metadata = (e) => {
        PlayerData.range.max = audio.duration;
        PlayerData.duration.innerText = convertTime(audio.duration);

        if (PlayerData.manuallyPaused) return;

        audio.play()
        .then(() => {
            if (!trackingTimer.hasStarted()) trackingTimer.start();
        })
        .catch(e => {
            console.log("error",e.message,e.name);
            setResBar(prev => {
                return { ...prev, open: true, msg: "Autoplay disabled!" };
            });
            onpaused();
        });
    };
    const waiting = (e) => {
        setBuffering(true);
        setSongPaused(true);
        setIsPlaying(false);
        if (trackingTimer.canPause()) trackingTimer.pause();
    };
    const timeupdate = (e) => {

        PlayerData.elapsedTime.innerText = convertTime(audio.currentTime);

        if (PlayerData.lyrics.length > 0 && song.lyrics && song.sync) {
            let found = false;
            for (let i=0; i<PlayerData.lyrics.length; i++) {
                const each = PlayerData.lyrics[i];
                if (audio.currentTime < each.from) break;
                if (audio.currentTime <= each.to) {
                    found = true;
                    if (PlayerData.currentLyricIndex !== i) {
                        setLyricText(each);
                        PlayerData.currentLyricIndex = i;
                    }
                    break;
                }
            }
            if (Object.keys(PlayerData.lyricsText).length > 0 && !found) setLyricText({});
        }

        if (PlayerData.range === document.activeElement) return;

        if (SeekData.inUse()) return;

        PlayerData.range.value = audio.currentTime;
        PlayerData.percent = PlayerData.range.value/PlayerData.range.max * 100;

        // let value = 0;
        // try {
        //     for (let i=0; i<audio.buffered.length; i++) {
        //         if (audio.currentTime < audio.buffered.end(i)) {
        //             value = audio.buffered.end(i);
        //             break;
        //         }
        //     }
        //     // value = (audio.buffered && audio.buffered.end(audio.buffered.length - 1));
        // }
        // catch(e) {
        //     value = 0;
        // }

        // PlayerData.bufferPercent = (value/PlayerData.range.max) * 100;
        PlayerData.range.style.background = changeColor(PlayerData.percent, PlayerData.bufferPercent);

    };
    const onprogress = (e) => {

        let value = 0;

        try {
            for (let i=0; i<audio.buffered.length; i++) {
                if (audio.currentTime < audio.buffered.end(i)) {
                    value = audio.buffered.end(i);
                    break;
                }
            }
        }
        catch(e) {
            value = 0;
        }

        PlayerData.bufferPercent = (value/PlayerData.range.max) * 100;
        PlayerData.range.style.background = changeColor(PlayerData.percent, PlayerData.bufferPercent);

    };
    const canplay = (e) => {
        setBuffering(false);
        if (PlayerData.manuallyPaused) return;

        setSongPaused(false);
        setIsPlaying(true);
        if (trackingTimer.hasStarted() && trackingTimer.canContinue()) trackingTimer.continue();
    };
    const ended = (e) => {
        PlayerData.range.value = 0;
        PlayerData.elapsedTime.innerText = "0: 00";
        trackingTimer.stop();
        PlayerData.range.style.background = changeColor(0,0);
        if (PlayerData.repeatType === 2) {
            audio.currentTime = 0;
            setTimeout(() => {
                audio.play();
            }, 300);
            trackingTimer.stop();
            trackingTimer = new Timer(30, addToRecentlyPlayed);
            if (!trackingTimer.hasStarted()) trackingTimer.start();
        }
        else if (PlayerData.repeatType === 0) {
            setIsPlaying(false);
            setSongPaused(true);
        }
        else {
            if (PlayerData.queue.length === 1) {
                audio.currentTime = 0;
                setTimeout(() => {
                    audio.play();
                }, 300);
                trackingTimer.stop();
                trackingTimer = new Timer(30, addToRecentlyPlayed);
                if (!trackingTimer.hasStarted()) trackingTimer.start();
            }
            else goToNext();
        }
    };
    const onpaused = (e) => {
        setManuallyPaused(true);
        setSongPaused(true);
        setBuffering(false);
        setIsPlaying(false);
        if (trackingTimer.canPause()) trackingTimer.pause();
        document.title = "StudioMusic";
    };
    const onplaying = (e) => {
        // setManuallyPaused(false);
        setBuffering(false);
        setSongPaused(false);
        setIsPlaying(true);
        if (trackingTimer.canContinue()) trackingTimer.continue();
        document.title = `${song.Title || song.Album} | StudioMusic`;
    };


    const forward = () => {
        if (SeekData.inUse("rewind")) return;
        SeekData.move("forward");
    };
    const rewind = () => {
        if (SeekData.inUse("forward")) return;
        SeekData.move("rewind");
    };
    const onkeydown = (e) => {

        if (global.searchBarOpen) return;

        // pause/play - space bar
        if (e.keyCode === 32) {
            e && e.preventDefault && e.preventDefault();
            e && e.stopPropagation && e.stopPropagation();
            return;
        }

        // volume up - up arrow
        if (e.keyCode === 38) {
            e.preventDefault();
            const val = parseFloat(PlayerData.volumerange.value);
            PlayerData.volumerange.value = val+5 > 100 ? 100 : val+5;
            volumechange();
            setResBar(prev => {
                return { ...prev, open: true, msg: `Volume: ${Math.floor(PlayerData.volumerange.value)}%` };
            });
            return;
        }

        // forward - right arrow
        if (e.keyCode === 39) {
            e.preventDefault();
            forward();
            return;
        }

        // rewind - left arrow
        if (e.keyCode === 37) {
            e.preventDefault();
            rewind();
            return;
        }
        
        // volume down - down arrow
        if (e.keyCode === 40) {
            e.preventDefault();
            const val = parseFloat(PlayerData.volumerange.value);
            PlayerData.volumerange.value = val-5 < 0 ? 0 : val-5;
            volumechange();
            setResBar(prev => {
                return { ...prev, open: true, msg: `Volume: ${Math.floor(PlayerData.volumerange.value)}%` };
            });
            return;
        }

    };
    const onkeyup = (e) => {

        if (global.searchBarOpen) return;

        // repeat
        if (e.keyCode === 82) {
            e.preventDefault();
            changeRepeat();
            setResBar(prev => {
                return {
                    ...prev,
                    open: true,
                    msg: (() => {
                        if (PlayerData.repeatType === 0) return "Repeat Off";
                        if (PlayerData.repeatType === 1) return "Repeat All";
                        if (PlayerData.repeatType === 2) return "Repeat One";
                    })()
                };
            });
            return;
        }

        // pause/play - space bar
        if (e.keyCode === 32) {
            e && e.preventDefault && e.preventDefault();
            e && e.stopPropagation && e.stopPropagation();
            pauseOrPlay();
            return;
        }

        // mute/unmute - m
        if (e.keyCode === 77) {
            const val = parseFloat(PlayerData.volumerange.value);
            setMuteOptions(prev => {
                if (prev.mute) {
                    const val = prev.lastlevel;
                    PlayerData.volumerange.value = val;
                    PlayerData.volumerange.style.background = changeColorVolume(PlayerData.volumerange.value);
                    audio.volume = PlayerData.volumerange.value/100;
                    PlayerData.mainVolume = PlayerData.volumerange.value/100;
                    PlayerData.setVolume = PlayerData.volumerange.value/100;
                    setResBar(pre => {
                        return { ...pre, open: true, msg: `Volume: ${val}%` };
                    });
                    return { ...prev, mute: false };
                } else {
                    PlayerData.volumerange.value = 0;
                    PlayerData.volumerange.style.background = changeColorVolume(PlayerData.volumerange.value);
                    audio.volume = PlayerData.volumerange.value/100;
                    PlayerData.mainVolume = PlayerData.volumerange.value/100;
                    PlayerData.setVolume = PlayerData.volumerange.value/100;
                    setResBar(pre => {
                        return { ...pre, open: true, msg: `Volume: 0%` };
                    });
                    return { ...prev, mute: true, lastlevel: val };
                }
            });
            return;
        }

        // next - n
        if (e.keyCode === 78) {
            e.preventDefault();
            goToNext();
            return;
        }

        // previous - p
        if (e.keyCode === 80) {
            e.preventDefault();
            goToPrevious();
            return;
        }

        // seek - 0-9
        if (e.keyCode >= 48 && e.keyCode <= 57) {
            seekShortcut(e.keyCode - 48);
            return;
        }

        // seek 0-9
        if (e.keyCode >= 96 && e.keyCode <= 105) {
            seekShortcut(e.keyCode - 96);
            return;
        }

        // forward - right arrow
        if (e.keyCode === 39) {
            e.preventDefault();
            if (SeekData.inUse("forward")) SeekData.release();
            return;
        }

        // rewind - left arrow
        if (e.keyCode === 37) {
            e.preventDefault();
            if (SeekData.inUse("rewind")) SeekData.release();
            return;
        }

    };


    const seek = (e) => {
        if (e.action === "seekforward") {
            forward();
            if (SeekData.inUse("forward")) SeekData.release();
        }
        else if (e.action === "seekbackward") {
            rewind();
            if (SeekData.inUse("rewind")) SeekData.release();
        }
        else if (e.action === "seekto") audio.currentTime = e.seekTime;
    };


    const cacheNextSong = async () => {
        if (PlayerData.queue.length === 1) return;

        const curIndex = PlayerData.queue.findIndex(e => e.id === song.id);
        const nextIndex = PlayerData.queue.length-1 === curIndex ? 0 : curIndex+1;
        const nextSong = PlayerData.queue[nextIndex];

        const options = {
            method: "GET",
            headers: new Headers({
                "allowaccess": "a"
            })
        };
        const cache = await caches.open("song-data");
        const songdata = await cache.match(nextSong.url);
        if (songdata) return;
        cache.add(new Request(nextSong.url, options));
    };
    const addToRecentlyPlayed = () => {
        APIService.addToRecentlyPlayed({ albumId: song._albumId });
        if (shouldCache) {
            cacheNextSong();
        }
    };
    const documentClick = (e) => {
        if (openerDetails.open) {
            setOpenerDetails(prev => {
                return { ...prev, open: false };
            });
        }
    };


    useEffect(() => {
        PlayerData.currentLyricIndex = null;
        setLyricText("");

        if (Object.keys(song).length > 0) {
            trackingTimer = new Timer(20, addToRecentlyPlayed);
            if ("mediaSession" in navigator) {
                navigator.mediaSession.metadata = new window.MediaMetadata({
                    title: song.Title || song.Album,
                    artist: song.Artist,
                    album: song.Album,
                    artwork: [
                        { src: song.Thumbnail }
                    ]
                });
                navigator.mediaSession.setActionHandler("play", pauseOrPlay);
                navigator.mediaSession.setActionHandler("pause", pauseOrPlay);
                navigator.mediaSession.setActionHandler("previoustrack", goToPrevious);
                navigator.mediaSession.setActionHandler("nexttrack", goToNext);
                navigator.mediaSession.setActionHandler("seekbackward", seek);
                navigator.mediaSession.setActionHandler("seekforward", seek);
                navigator.mediaSession.setActionHandler("seekto", seek);
            }
        }

        return () => {
            document.title = "StudioMusic";
            if (trackingTimer) {
                trackingTimer.stop();
            }
        };
    },[song]);

    useEffect(() => {

        audio.volume = PlayerData.setVolume;
        PlayerData.elapsedTime = document.querySelector(".elapsedtime");
        PlayerData.duration = document.querySelector(".progressduration");
        PlayerData.range = document.querySelector(".range");
        PlayerData.volumerange = document.querySelector(".volumerange");
        const rType = parseInt(localStorage.getItem("repeatType"));
        PlayerData.repeatType = 1;
        if (rType) {
            setRepeatType(rType);
            PlayerData.repeatType = rType;
        }

        document.addEventListener("keydown", onkeydown);
        document.addEventListener("keyup", onkeyup);

        PlayerData.volumerange.value = audio.volume * 100;
        PlayerData.volumerange.style.background = changeColorVolume(PlayerData.volumerange.value);

        PlayerData.volumerange.addEventListener("input", volumeinput);
        PlayerData.volumerange.addEventListener("change", volumechange);

        PlayerData.range.addEventListener("input", progressinput);
        PlayerData.range.addEventListener("change", progresschange);

        PlayerData.duration.innerText = "0: 00";
        PlayerData.bufferPercent = 0;

        if (Object.keys(song).length > 0) {
            // let LINK;
            // if (shouldCache) {
            //     const cache = await caches.open("song-data");
            //     const songdata = await cache.match(song.url);
            //     if (songdata) {
            //         const blob = await songdata.blob();
            //         LINK = URL.createObjectURL(blob);
            //     } else {
            //         LINK = song.url;
            //     }
            // } else {
            //     LINK = song.url;
            // }
            // audio.src = LINK;
            audio.src = song.url;
        }
        else shutdown();

        setBuffering(true);
        setIsPlaying(true);
        setSongPaused(true);
        setManuallyPaused(false);
        audio.addEventListener("loadedmetadata", metadata);
        audio.addEventListener("waiting", waiting);
        audio.addEventListener("timeupdate", timeupdate);
        audio.addEventListener("progress", onprogress);
        audio.addEventListener("canplay", canplay);
        audio.addEventListener("ended", ended);
        audio.addEventListener("pause", onpaused);
        audio.addEventListener("playing", onplaying);

        return () => {
            document.removeEventListener("keydown", onkeydown);
            document.removeEventListener("keyup", onkeyup);

            PlayerData.volumerange.removeEventListener("input", volumeinput);
            PlayerData.volumerange.removeEventListener("change", volumechange);
            PlayerData.range.removeEventListener("input", progressinput);
            PlayerData.range.removeEventListener("change", progresschange);

            audio.removeEventListener("loadedmetadata", metadata);
            audio.removeEventListener("waiting", waiting);
            audio.removeEventListener("timeupdate", timeupdate);
            audio.removeEventListener("progress", onprogress);
            audio.removeEventListener("canplay", canplay);
            // audio.removeEventListener("play",onplay);
            audio.removeEventListener("ended", ended);
            audio.removeEventListener("pause", onpaused);
            audio.removeEventListener("playing", onplaying);
        };

    }, [song, update]);


    return(
        <div className="dummycover">
            <input type="range" min="0" defaultValue="0" className="range" disabled={buffering || song.url === ""} />
            <div className="outerplayer">
                <div className="player">
                    <div className="innerplayer" onClick={openQueue}
                    onMouseOver={() => setHovered(true)}
                    onMouseOut={() => setHovered(false)}>
                        <div className="albumpart">
                            <div className="back">
                                <img src={previous} onClick={goToPrevious} alt="" title="Previous Song / Rewind" />
                            </div>
                            <div className="middle">
                                { Object.keys(song).length !== 0 ?
                                    <>
                                    {
                                        buffering ? <div className="bufferloader"></div> : 
                                        <img className="mainplayimg" onClick={pauseOrPlay} src={ PlayerData.isPlaying ? Pause : Play } alt=""
                                        title={ PlayerData.isPlaying ? "Pause" : "Play" } />
                                    }
                                    </> :
                                    <img className="mainplayimg" src={Play} title="Play" alt="" />
                                }
                            </div>
                            <div className="forward">
                                <img src={next} onClick={goToNext} alt="" title="Next Song" />
                            </div>
                            <div className="elapsedtime">0: 00</div>
                            <div className="durationdivider">/</div>
                            <div className="progressduration">0: 00</div>
                        </div>
                        <div className="playerpart">
                            <div className="innerplayerpart">
                                { Object.keys(song).length !== 0 ?
                                    <>
                                        <div className="outer-album">
                                            <div className="albumthumbnail" style={{ backgroundImage: `url(${Placeholder})`, backgroundSize: "cover" }}>
                                                <img src={song.Thumbnail} alt="" />
                                            </div>
                                        </div>
                                        <div className="songdetails">
                                            <div className="songtitle">{song.Title || song.Album}</div>
                                            <div className="songartists">
                                                {
                                                    song.Album.length > 30 ?
                                                    <>
                                                    <p>{`${song.Artist.slice(0,30)}...`}</p>
                                                    <div className="home-separator"><div></div></div>
                                                    <p>{`${song.Album.slice(0,30)}...`}</p>
                                                    </>
                                                    :
                                                    song.Artist.length > 30 ?
                                                    <>
                                                    <p>{`${song.Artist.slice(0,30)}...`}</p>
                                                    <div className="home-separator"><div></div></div>
                                                    <p>{`${song.Album}`}</p>
                                                    </>
                                                    :
                                                    <>
                                                    <p>{`${song.Artist}`}</p>
                                                    <div className="home-separator"><div></div></div>
                                                    <p>{`${song.Album}`}</p>
                                                    </>
                                                }
                                                <div className="home-separator"><div></div></div>
                                                <p>{song.Duration}</p>
                                                <div className="home-separator"><div></div></div>
                                                <p>{song.Year}</p>
                                            </div>
                                        </div>
                                    </> : null
                                }
                            </div>
                        </div>
                        <div className="volumepart">
                            <div className="volumerocker"
                            style={{ opacity: `${ hovered ? "1" : "0" }` }}>
                                <div className="volumeinput">
                                    <input type="range" min="0" max="100" defaultValue="100" className="volumerange"
                                    onClick={e => e.stopPropagation()}/>
                                </div>
                            </div>
                            <div className="shuffle">
                                { !isRadioOn ? <img src={shuffle ? shuffleon : shuffleoff} alt="" title="Shuffle" onClick={shuffleHandler} /> : "" }
                            </div>
                            <div className="repeat">
                                <img src={
                                    repeatType === 0 ? noRepeat :
                                    repeatType === 1 ? repeat : repeatOne
                                } alt="" onClick={changeRepeat} title={
                                    repeatType === 0 ? "Repeat Off" :
                                    repeatType === 1 ? "Repeat All" : "Repeat One"
                                } />
                            </div>
                            {
                                PlayerData.screen.show ? "" :
                                <div className="queueopener" onClick={openQueue}>
                                    <img src={queueOpened ? downArrow : upArrow} alt="" title="Player" />
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
    
};


const Opener = ({ openerDetails, setOpenerDetails }) => {
    const opener = useRef(null);
    const { xValue, yValue, data = [] } = openerDetails;
    style = {
        top: `${yValue}px`,
        left: `${xValue}px`
    };

    const click = e => {
        if (
            !(e.target === opener.current ||
                opener.current.contains(e.target))
        ) {
            setOpenerDetails(prev => {
                return { ...prev, open: false };
            });
        }
    };

    useEffect(() => {
        opener.current = document.querySelector(".opener");
        document.addEventListener("click",click);
        return () => {
            document.removeEventListener("click",click);
        };
    }, []);

    return(
        <div className="opener" style={style}>
            { data.length !== 0 ?
                data.map(menu => {
                    return(
                        <div className="rowinmenu" onClick={menu.func}>
                            <div className="rowtext">{menu.name}</div>
                        </div>
                    );
                })
                : ""
            }
        </div>
    );
};

const FullScreen = () => {
    const [song,] = useContext(AlbumContext);
    const [songIsPaused, setSongIsPaused] = useContext(SongIsPausedContext);

    const lessen = value => {
        let color = song.Color.split(",");
        color[3] = `${value}`;
        color = color.join(",");
        return color;
    };

    const handleClick = e => {};

    useEffect(() => {
        document.querySelector(".full-display").requestFullscreen();
    }, []);
    
    return(
        <></>
        // <div className="full-display">
        //     <div className="inner-full-display" style={{ backgroundColor: lessen(0.2) }}>
        //         <div className="imageholder">
        //             <img src={song.Thumbnail} alt=""/>
        //         </div>
        //         {/* <p className="display-title">{song.Title || song.Album}</p> */}
        //         <div className="controls-container">
        //             <Button className="button-control" onClick={goToPrevious}>
        //                 <img src={previous} alt="" title="Previous Song / Rewind" />
        //             </Button>
        //             <Button className="button-control" onClick={pauseOrPlay}>
        //                 <img src={Pause} alt="" title="Play / Pause" />
        //             </Button>
        //             <Button className="button-control" onClick={goToNext}>
        //                 <img src={next} alt="" title="Next Song" />
        //             </Button>
        //         </div>
        //         <div className="bottombar"></div>
        //     </div>
        // </div>
    );
};

const MiniPlayer = () => {
    const [mini, setMini] = useContext(MiniPlayerContext);
    const [song,] = useContext(AlbumContext);
    const [queue,] = useContext(QueueContext);
    const [songIsPaused,] = useContext(SongIsPausedContext);
    const anim = useRef(null);

    if (queue.length === 0 && mini) {
        setMini(false);
    }

    const close = e => {
        e.stopPropagation();
        setMini(false);
    };

    const handleClick = e => {
        e.stopPropagation();
        pauseOrPlay();
        anim.current.classList.remove("hidden");
        setTimeout(() => {
            anim.current.classList.add("hidden");
        },500);
    };

    if (!mini) {
        return null;
    }
    return (
        <div className="miniplayer" onClick={handleClick}
        style={{ backgroundImage: `url(${Placeholder})`, backgroundSize: "cover" }}
        >
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
                <div className="minishadow">
                    <div className="close-view" onClick={close}>
                        <img src={Close} alt="" />
                    </div>
                    <div className="playpause-anim hidden" ref={anim}>
                        <img src={ songIsPaused ? Play : Pause } alt="" />
                        <div></div>
                    </div>
                </div>
                <img src={song.Thumbnail || ""} alt="" />
            </div>
        </div>
    );
};

export const ResponseBar = () => {
    const [obj, setObj] = useContext(ResponseBarContext);
    const [playing,] = useContext(PlayerContext);

    const decideClass = () => {
        if (playing) {
            if (obj.open) return "responsebar up";
            if (obj.open === false) return "responsebar down";
            if (obj.open === "") return "responsebar start";
        }
        if (obj.open) return "responsebar notplaying up";
        if (obj.open === false) return "responsebar notplaying down";
        if (obj.open === "") return "responsebar start";
    };

    if (obj.open) {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
            setObj(prev => {
                return { ...prev, open: false };
            });
        }, 2000);
    }

    return(
        <div className={decideClass()}>
            <div className="message">{obj.msg}</div>
        </div>
    );
};

const ProfileOpener = ({ setProfileOpen }) => {
    const [openKeyShort, setOpenKeyShort] = useContext(KeyShortcutContext);
    const [user,] = useContext(UserContext);
    const [isLoading, setIsLoading] = useState(false);
    const profileOpener = useRef(null);
    signOutLoading = isLoading;

    const signOut = async () => {
        setIsLoading(true);
        const res = await APIService.signOut();
        if (res.success) {
            localStorage.clear();
            window.location.href = "/";
            return false;
        } else {
            localStorage.clear();
            window.location.href = "/login";
            return false;
        }
    };

    const click = e => {
        if (
            !(e.target === profileOpener.current ||
                profileOpener.current.contains(e.target)) && !signOutLoading
        ) setProfileOpen(false);
    };

    const keyShort = () => {
        if (!openKeyShort) setOpenKeyShort(true);
        return true;
    };

    const data = [
        { name: "Keyboard Shortcuts", func: keyShort },
        { name: "Sign Out", func: signOut, only: true }
    ];

    const handle = async (menu) => {
        if (signOutLoading) return;
        const hide = await menu.func();
        if (hide) setProfileOpen(false);
    };

    useEffect(() => {
        profileOpener.current = document.querySelector(".profile-opener");
        document.addEventListener("click", click);
        return () => {
            document.removeEventListener("click",click);
        };
    }, []);

    return(
        <div className="profile-opener">
            <div className="account-section">
                <div className="account-picture">
                    <div className="center-picture">
                        <img src={user.picture} alt="" className="dummy-class" />
                    </div>
                </div>
                <div className="account-name">{user.name}</div>
                <div className="account-email">{user.email}</div>
            </div>
            <div className="time-section">
                <div className="time-container">
                    <p>Your access ends on</p>
                    <p>{user.limit}</p>
                </div>
            </div>
            { data.length > 0 ?
                data.map(menu => {
                    return(
                        <div className="rowinmenu" onClick={() => handle(menu)}>
                            { isLoading && menu.only ? 
                                <div className="small-loader">
                                    <div className="inner-small-loader">
                                        <div className="s-one"></div>
                                        <div className="s-two"></div>
                                        <div className="s-three"></div>
                                    </div>
                                </div>
                                : <div className="rowtext">{menu.name}</div> }
                        </div>
                    );
                })
                : ""
            }
        </div>
    );
};

const KeyboardShortcut = ({ setOpenKeyShort }) => {
    const okButton = useRef(null);

    const close = e => {
        setOpenKeyShort(false);
    };

    const data = [
        { name: "Play/Pause", keys: ["Space"] },
        { name: `Forward ${skipSecs} secs`, keys: ["Right"] },
        { name: `Rewind ${skipSecs} secs`, keys: ["Left"] },
        { name: "Previous song", keys: ["P"] },
        { name: "Next song", keys: ["N"] },
        { name: "Volume Up", keys: ["Up"] },
        { name: "Volume Down", keys: ["Down"] },
        { name: "Mute/Unmute", keys: ["M"] },
        { name: "Open shortcuts", keys: ["K"] },
        { name: "Repeat type", keys: ["R"] },
        { name: "Seek to specific point (4 meaning 40% of the duration)", keys: ["0 ... 9"] }
    ];

    useEffect(() => {
        okButton.current = document.querySelector(".bottom-button");
        okButton.current && okButton.current.focus();
    }, []);

    return(
        <div className="keyboard-container">
            <div className="keyboard">
                <div className="keyboard-title">Keyboard Shortcuts</div>
                <div className="shortcuts">
                    <div className="shortcuts-grid">
                        {
                            data.map(each => {
                                return(
                                    <div className="each-shortcut">
                                        <div className="shortcut-name">{each.name}</div>
                                        <div className="shortcut-keys">
                                            {
                                                each.keys.map(key => {
                                                    return(
                                                        <div className="key">{key}</div>
                                                    );
                                                })
                                            }
                                        </div>
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
                <div className="shortcuts-bottom">
                    <button className="bottom-button" onClick={close}>OK</button>
                </div>
            </div>
        </div>
    );
};


const Home = () => {
    const [playing,] = useContext(PlayerContext);
    const [profileOpen, setProfileOpen] = useContext(ProfileContext);
    const [openerDetails, setOpenerDetails] = useContext(MenuContext);
    const [openKeyShort, setOpenKeyShort] = useContext(KeyShortcutContext);

    const onkeyup = (e) => {

        if (global.searchBarOpen) return;

        // open shortcut
        if (e.keyCode === 75) {
            setOpenKeyShort(prev => {
                return !prev;
            });
        }

    };


    useEffect(() => {
        document.addEventListener("keyup", onkeyup);
        return () => {
            document.removeEventListener("keyup", onkeyup);
        };
    }, []);


    return(
        <div className="homemain">
            { openKeyShort ? <KeyboardShortcut setOpenKeyShort={setOpenKeyShort} /> : null }
            { openerDetails.open ? <Opener openerDetails={openerDetails} setOpenerDetails={setOpenerDetails} /> : null }
            { profileOpen ? <ProfileOpener setProfileOpen={setProfileOpen} /> : null }
            <MiniPlayer/>
            <ResponseBar/>
            <MainPanel/>
            { playing ? <Player/> : null }
        </div>
    );
};


export default Home;