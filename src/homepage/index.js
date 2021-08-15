import "../css/homestyles.css";
import "../css/hometeststyles.css";
import "../css/playerstyles.css";
import "../css/albumview.css";
import MainPanel from "./mainpanel";
import React, { useState, useEffect, useRef, useContext } from "react";
import { useHistory } from "react-router-dom";
// import Play from "../assets/playwhite.png";
import Play from "../assets/playbutton-white.svg";
// import Pause from "../assets/pausewhite.png";
import Pause from "../assets/pausebutton-white.svg";
import Close from "../assets/deletewhite.svg";
import Placeholder from "../assets/placeholder.svg";
// import repeat from "../assets/repeat.png";
import repeat from "../assets/repeat-white.svg";
// import repeatOne from "../assets/repeatone.png";
import repeatOne from "../assets/repeat-one-white.svg";
// import noRepeat from "../assets/norepeat.png";
import noRepeat from "../assets/norepeat-disabled.svg";
import shuffleoff from "../assets/shuffle-disabled.svg";
import shuffleon from "../assets/shuffle-enabled.svg";
// import next from "../assets/nexttrack.png";
import next from "../assets/nextbutton-white.svg";
import next_trans from "../assets/nextbutton-transparent.svg";
// import previous from "../assets/previoustrack.png";
import previous from "../assets/previousbutton-white.svg";
import previous_trans from "../assets/previousbutton-transparent.svg";
import queuewhite from "../assets/queuewhite.png";
import queueaquamarine from "../assets/queueaquamarine.png";
import fullscreenaquamarine from "../assets/fullscreenaquamarine.svg";
import fullscreenwhite from "../assets/fullscreenwhite.svg";
import innerfullaquamarine from "../assets/innerfullaquamarine.svg";
import innerfullwhite from "../assets/innerfullwhite.svg";
import upArrow from "../assets/uparrow.svg";
import downArrow from "../assets/downarrow.svg";
import Expand from "../assets/expand-white.svg";
import volumesvg from "../assets/volume.svg";
import Button from "../Button";
import {
    CustomUseState,
    playingGlobal,
    albumGlobal,
    convertTime,
    wait,
    queueGlobal,
    queueOpenedGlobal,
    songIsPausedGlobal,
    repeatTypeGlobal,
    radioGlobal,
    openerGlobal,
    homeClass,
    responseBar,
    searchBarGlobal,
    topBarGlobal,
    sendRequest,
    Timer,
    fullScreenGlobal,
    miniPlayerGlobal,
    usePrevious,
    profileOpener,
    lyricsGlobal,
    lyricTextGlobal,
    global,
    skipSecs,
    prefix,
    basename
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
export const audio = new Audio();
const shouldCache = false;
let mainVolume = 1;
let loaded = false;
let whichRepeat;
let ctrlKey = false, vKey = false;
let currentSongIndex = 0, isSongPlaying, actualQueue;
let volumerange, elapsedTime, duration, range, percent = 0, style, bufferPercent = 0;
export let pauseOrPlay;
let goToNext, goToPrevious;
let setVolume = 1, isBuffering, manuallyPausedLocal, songPausedLocal, timeout = null;
let trackingTimer, screenLocal, currentLyricIndex = null, lyricsLocal, lyricTextLocal, preLoadedLocal;


const changeColor = (percent,bufferPercent) => {
    return `linear-gradient(to right, #066bff ${percent}%, #404040 ${percent}%, #404040 ${bufferPercent}%, #303030 0%)`;
    // return `linear-gradient(to right, #2941ab ${percent}%, #404040 ${percent}%, #404040 ${bufferPercent}%, #303030 0%)`;
    // return `linear-gradient(to right, #ffffff ${percent}%, #404040 ${percent}%, #404040 ${bufferPercent}%, #303030 0%)`;
};

const changeColorVolume = (value) => {
    // return `linear-gradient(to right, white ${value}%, rgba(255,255,255,0.1) 0%)`;
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
    const [preLoaded, setPreLoaded] = useState(false);
    const [song, setSong] = useContext(AlbumContext);
    const [playerOn,setPlaying] = useContext(PlayerContext);
    const [queue, setQueue] = useContext(QueueContext);
    const [buffering, setBuffering] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [manuallyPaused, setManuallyPaused] = useState(false);
    // const [buttonshow, setButtonshow] = useState(false);
    const [repeatType, setRepeatType] = useContext(RepeatTypeContext);
    const [shuffle, setShuffle] = useState(false);
    const [queueOpened, setQueueOpened] = useContext(QueueOpenedContext);
    const [songPaused, setSongPaused] = useContext(SongIsPausedContext);
    // const [topBarConfig, setTopBarConfig] = CustomUseState(topBarGlobal);
    const [screen, setScreen] = useContext(FullScreenContext);
    const [openerDetails, setOpenerDetails] = useContext(MenuContext);
    const [resBar, setResBar] = useContext(ResponseBarContext);
    const [lyrics,] = useContext(LyricsContext);
    const [lyricText ,setLyricText] = useContext(LyricsTextContext);
    const prevSong = usePrevious(song);
    screenLocal = screen;
    // topBar = topBarConfig;
    const [isRadioOn, setRadioOn] = useContext(RadioContext);
    const [update, setUpdate] = useState(true);
    const hist = useHistory();
    actualQueue = queue;
    currentSongIndex = queue.findIndex(each => {
        return each.id === song.id;
    });
    manuallyPausedLocal = manuallyPaused;
    preLoadedLocal = preLoaded;
    isSongPlaying = isPlaying;
    isBuffering = buffering;
    songPausedLocal = songPaused;
    lyricsLocal = lyrics;
    lyricTextLocal = lyricText;
    let playerOnLocal = playerOn;


    const changeRepeat = e => {
        e.stopPropagation();
        localStorage.setItem("repeatType",repeatType+1 > 2 ? 0 : repeatType+1);
        whichRepeat = repeatType+1 > 2 ? 0 : repeatType+1;
        setRepeatType(prev => prev+1 > 2 ? 0 : prev+1);
    };
    pauseOrPlay = async e => {
        e && e.stopPropagation && e.stopPropagation();
        if (song.url === "") {
            const index = actualQueue.indexOf(song);
            song.url = song.backup;
            delete song.backup;
            setSong(song);
            actualQueue[index] = song;
            setQueue(actualQueue);
            setUpdate(!update);
            return;
        }
        if (isSongPlaying) {
            // setSongPaused(true);
            // setIsPlaying(false);
            // mainVolume = audio.volume;
            // const reduce = setInterval(() => {
            //     audio.volume = audio.volume - 0.2 >= 0 ? audio.volume - 0.2 : audio.volume;
            // },50);
            // await wait(800);
            // clearInterval(reduce);
            setManuallyPaused(true);
            audio.pause();
        } else {
            // setSongPaused(false);
            // setIsPlaying(true);
            setManuallyPaused(false);
            audio.play();
            // const increase = setInterval(() => {
            //     audio.volume = audio.volume + 0.2 <= mainVolume ? audio.volume + 0.2 : mainVolume;
            // },50);
            // await wait(800);
            // clearInterval(increase);
        }
    };
    const openQueue = e => {
        e && e.stopPropagation();
        documentClick(e);
        setQueueOpened(!queueOpened);
        // if (!queueOpened) hist.push(`${prefix}${basename}/queue`);
        // else hist.goBack();
    };
    goToNext = e => {
        e && e.stopPropagation && e.stopPropagation();
        localStorage.removeItem("time");
        localStorage.removeItem("duration");
        if (actualQueue.length === 1) {
            audio.currentTime = 0;
        } else {
            const findNextIndex = () => {
                let found = false;
                let nowIndex = currentSongIndex;
                let nextIndex;
                while (!found) {
                    nextIndex = nowIndex < actualQueue.length - 1 ? nowIndex + 1 : 0;
                    const nextSong = actualQueue[nextIndex];
                    if (Object.keys(nextSong).length < 2) {
                        nowIndex = nextIndex;
                    } else {
                        found = true;
                    }
                }
                return nextIndex;
            };
            // const nextIndex = currentSongIndex < actualQueue.length - 1 ? currentSongIndex + 1 : 0;
            const nextIndex = findNextIndex();
            setSong(actualQueue[nextIndex]);
            currentSongIndex = nextIndex;
        }
        setSongPaused(true);
    };
    goToPrevious = e => {
        e && e.stopPropagation && e.stopPropagation();
        localStorage.removeItem("time");
        localStorage.removeItem("duration");
        setSongPaused(true);
        if (actualQueue.length === 1 || audio.currentTime > 10) {
            audio.currentTime = 0;
            trackingTimer.stop();
            trackingTimer = new Timer(30, addToRecentlyPlayed);
            if (!trackingTimer.hasStarted() && !audio.paused) trackingTimer.start();
        } else {
            const findPreviousIndex = () => {
                let found = false;
                let nowIndex = currentSongIndex;
                let previousIndex;
                while (!found) {
                    previousIndex = nowIndex === 0 ? actualQueue.length - 1 : nowIndex - 1;
                    const previousSong = actualQueue[previousIndex];
                    if (Object.keys(previousSong).length < 2) {
                        nowIndex = previousIndex;
                    } else {
                        found = true;
                    }
                }
                return previousIndex;
            };
            // const prevIndex = currentSongIndex === 0 ? actualQueue.length-1 : currentSongIndex - 1;
            const prevIndex = findPreviousIndex();
            setSong(actualQueue[prevIndex]);
            currentSongIndex = prevIndex;
        }
    };
    const shutdown = () => {
        setPlaying(false);
        audio.src = "";
        setSong({});
        localStorage.removeItem("queue");
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
    const shuffleHandler = e => {
        e.stopPropagation();
        if (!shuffle && actualQueue.length > 3) {
            const dummyQueue = actualQueue;
            const index = dummyQueue.indexOf(song);
            [dummyQueue[0], dummyQueue[index]] = [dummyQueue[index], dummyQueue[0]];
            const shuffled = randomize(dummyQueue.slice(1,actualQueue.length));
            localStorage.setItem("queue",JSON.stringify(shuffled));
            setQueue(shuffled);
            // setShuffle(!shuffle);
            setShuffle(true);
            setTimeout(() => {
                setShuffle(false);
            },500);
        }
        // if (shuffle) {
        //     setShuffle(!shuffle);
        // }
    };
    const goToNextForMediaSession = () => {
        localStorage.removeItem("time");
        localStorage.removeItem("duration");
        if (actualQueue.length === 1) {
            audio.currentTime = 0;
        } else {
            const nextIndex = currentSongIndex < actualQueue.length - 1 ? currentSongIndex + 1 : 0;
            setSong(actualQueue[nextIndex]);
            currentSongIndex = nextIndex;
        }
        setSongPaused(true);
    };
    const goToPreviousForMediaSession = () => {
        localStorage.removeItem("time");
        localStorage.removeItem("duration");
        setSongPaused(true);
        if (actualQueue.length === 1 || audio.currentTime > 10) {
            audio.currentTime = 0;
            trackingTimer.stop();
            trackingTimer = new Timer(30, addToRecentlyPlayed);
            if (!trackingTimer.hasStarted()) trackingTimer.start();
        } else {
            const index = actualQueue.indexOf(song);
            setSong(index === 0 ? actualQueue[actualQueue.length-1] : actualQueue[index-1]);
        }
    };


    const volumeinput = e => {
        e.stopPropagation();
        volumerange.style.background = changeColorVolume(volumerange.value);
        audio.volume = volumerange.value/100;
        mainVolume = volumerange.value/100;
        setVolume = volumerange.value/100;
        setMuteOptions(prev => {
            return { ...prev, mute: false, lastlevel: volumerange.value };
        });
    };
    const volumechange = e => {
        e && e.stopPropagation();
        volumerange.style.background = changeColorVolume(volumerange.value);
        audio.volume = volumerange.value/100;
        mainVolume = volumerange.value/100;
        setVolume = volumerange.value/100;
        setMuteOptions(prev => {
            return { ...prev, mute: false, lastlevel: volumerange.value };
        });
    };


    const progressinput = (e) => {
        range.focus();
        elapsedTime.innerText = convertTime(range.value);
        percent = range.value/range.max * 100;
        range.style.background = changeColor(percent,bufferPercent);
    };
    const progresschange = (e) => {
        audio.currentTime = range.value;
        audio.volume = mainVolume;
        range.blur();
        percent = range.value/range.max * 100;
        range.style.background = changeColor(percent,bufferPercent);
    };


    const metadata = (e) => {
        loaded = true;
        localStorage.setItem("duration",audio.duration);
        range.max = audio.duration;
        duration.innerText = convertTime(audio.duration);
        setBuffering(false);
        setSongPaused(false);
        setTimeout(() => {
            audio.play();
            if (!trackingTimer.hasStarted()) trackingTimer.start();
        }, 500);
        // const time = localStorage.getItem("time");
        // console.log("time",time);
        // if (time === null) {
        //     audio.currentTime = 0;
        // } else {
        //     audio.currentTime = time;
        //     console.log("setting time");
        // }
    };
    const waiting = (e) => {
        setBuffering(true);
        setSongPaused(true);
        if (trackingTimer.canPause()) trackingTimer.pause();
    };
    const timeupdate = (e) => {
        localStorage.setItem("time", audio.currentTime);
        elapsedTime.innerText = convertTime(audio.currentTime);

        if (lyricsLocal.length > 0 && song.lyrics && song.sync) {
            let found = false;
            for (let i=0; i<lyricsLocal.length; i++) {
                const each = lyricsLocal[i];
                if (audio.currentTime < each.from) break;
                if (audio.currentTime <= each.to) {
                    found = true;
                    if (currentLyricIndex !== i) {
                        setLyricText(each);
                        currentLyricIndex = i;
                    }
                    break;
                }
            }
            if (Object.keys(lyricTextLocal).length > 0 && !found) setLyricText({});
        }

        if (range === document.activeElement) {
            return;
        }

        range.value = audio.currentTime;
        percent = range.value/range.max * 100;
        let value;
        try {
            value = (audio.buffered && audio.buffered.end(audio.buffered.length - 1));
        } catch(e) {
            value = 0;
        }
        bufferPercent = (value/range.max) * 100;
        range.style.background = changeColor(percent,bufferPercent);
    };
    const canplay = (e) => {
        if (!manuallyPausedLocal) {
            setBuffering(false);
            setSongPaused(false);
            if (trackingTimer.canContinue()) trackingTimer.continue();
        }
    };
    const onplay = (e) => {
        setIsPlaying(true);
        setSongPaused(false);
    };
    const ended = (e) => {
        range.value = 0;
        elapsedTime.innerText = "0: 00";
        trackingTimer.stop();
        range.style.background = changeColor(0,0);
        if (whichRepeat === 2) {
            audio.currentTime = 0;
            setTimeout(() => audio.play(), 300);
            trackingTimer.stop();
            trackingTimer = new Timer(30, addToRecentlyPlayed);
            if (!trackingTimer.hasStarted()) trackingTimer.start();
        } else if (whichRepeat === 0) {
            setIsPlaying(false);
            setSongPaused(true);
        } else {
            if (actualQueue.length === 1) {
                audio.currentTime = 0;
                setTimeout(() => audio.play(), 300);
                trackingTimer.stop();
                trackingTimer = new Timer(30, addToRecentlyPlayed);
                if (!trackingTimer.hasStarted()) trackingTimer.start();
            } else {
                goToNext();
            }
        }
    };
    const onpaused = async (e) => {
        setManuallyPaused(true);
        setSongPaused(true);
        setIsPlaying(false);
        if (trackingTimer.canPause()) trackingTimer.pause();
        document.title = "StudioMusic";
        // ipcRenderer.send("paused");
        // await wait(1000);
        // audio.volume = 0;
    };
    const onplaying = async (e) => {
        setManuallyPaused(false);
        setSongPaused(false);
        setIsPlaying(true);
        if (trackingTimer.canContinue()) trackingTimer.continue();
        document.title = `${song.Title || song.Album} | StudioMusic`;
        // ipcRenderer.send("playing");
        // await wait(1000);
        // audio.volume = mainVolume;
        // pauseOrPlay();
    };

    const forward = () => {
        const duration = audio.duration;
        const time = audio.currentTime;
        if (time + skipSecs < duration) {
            audio.currentTime = time + skipSecs;
        }
    };
    const rewind = () => {
        const time = audio.currentTime;
        if (time - skipSecs > 0) {
            audio.currentTime = time - skipSecs;
        }
    };
    const onkeydown = (e) => {
        if (e.keyCode === 17) ctrlKey = true;
        if (e.keyCode === 86) vKey = true;

        if (global.searchBarOpen) return;

        if (e.keyCode === 32 && !isBuffering) {
            e.preventDefault();
            pauseOrPlay();
        }

        if (e.keyCode === 77) {
            const val = parseFloat(volumerange.value);
            setMuteOptions(prev => {
                if (prev.mute) {
                    const val = prev.lastlevel;
                    volumerange.value = val;
                    volumerange.style.background = changeColorVolume(volumerange.value);
                    audio.volume = volumerange.value/100;
                    mainVolume = volumerange.value/100;
                    setVolume = volumerange.value/100;
                    setResBar(pre => {
                        return { ...pre, open: true, msg: `Volume: ${val}%` };
                    });
                    return { ...prev, mute: false };
                } else {
                    volumerange.value = 0;
                    volumerange.style.background = changeColorVolume(volumerange.value);
                    audio.volume = volumerange.value/100;
                    mainVolume = volumerange.value/100;
                    setVolume = volumerange.value/100;
                    setResBar(pre => {
                        return { ...pre, open: true, msg: `Volume: 0%` };
                    });
                    return { ...prev, mute: true, lastlevel: val };
                }
            });
        }

        if (e.keyCode === 78) {
            e.preventDefault();
            goToNext();
        }

        if (e.keyCode === 80) {
            e.preventDefault();
            goToPrevious();
        }

        if (e.keyCode === 39) {
            e.preventDefault();
            forward();
        }

        if (e.keyCode === 37) {
            e.preventDefault();
            rewind();
        }

        if (e.keyCode === 107 && vKey) {
            const val = parseFloat(volumerange.value);
            volumerange.value = val+5 > 100 ? 100 : val+5;
            volumechange();
            setResBar(prev => {
                return { ...prev, open: true, msg: `Volume: ${Math.floor(volumerange.value)}%` };
            });
        }
        
        if (e.keyCode === 109 && vKey) {
            const val = parseFloat(volumerange.value);
            volumerange.value = val-5 < 0 ? 0 : val-5;
            volumechange();
            setResBar(prev => {
                return { ...prev, open: true, msg: `Volume: ${Math.floor(volumerange.value)}%` };
            });
        }
    };
    const onkeyup = (e) => {
        if (e.keyCode === 17) ctrlKey = false;
        if (e.keyCode === 86) vKey = false;
    };

    const seek = e => {
        if (e.action === "seekforward") {
            forward();
        } else if (e.action === "seekbackward") {
            rewind();
        } else if (e.action === "seekto") {}
    };

    const lessen = () => {
        const split = song.Color.split(",");
        split[3] = "0.3)";
        return split.join(",");
    };

    const cacheNextSong = async () => {
        if (actualQueue.length === 1) {
            return;
        }
        const curIndex = actualQueue.findIndex(e => e.id === song.id);
        const nextIndex = actualQueue.length-1 === curIndex ? 0 : curIndex+1;
        const nextSong = actualQueue[nextIndex];

        const options = {
            method: "GET",
            headers: new Headers({
                "allowaccess": "a"
            })
        };
        const cache = await caches.open("song-data");
        const songdata = await cache.match(nextSong.url);
        if (songdata) {
            return;
        }
        cache.add(new Request(nextSong.url, options));
    };

    const addToRecentlyPlayed = () => {
        sendRequest({
            method: "POST",
            endpoint: "/addToRecentlyPlayed",
            data: {
                albumId: song._albumId
            }
        });
        if (shouldCache) {
            cacheNextSong();
        }
    };

    const screenSetting = () => {
        if (playerOnLocal) {
            setScreen({
                ...screenLocal,
                show: !screenLocal.show
            });
            // ipcRenderer.send("full");
        }
    };

    const documentClick = e => {
        if (openerDetails.open) {
            setOpenerDetails({
                ...openerDetails,
                open: false
            });
        }
    };

    const calcColor = () => {
        const split = song.Color.split(",");
        split[3] = "0.1)";
        return split.join(",");
    };

    useEffect(() => {
        setPreLoaded(false);
        currentLyricIndex = null;
        setLyricText("");
        let shouldRemove = false;
        (() => {
            if (Object.keys(prevSong).length < 1) {
                return;
            }
            if (prevSong.Type !== song.Type) {
                shouldRemove = true;
                return;
            }
            const titleExistsInCurrent = song.Title !== undefined;
            const titleExistsInPrev = prevSong.Title !== undefined;
            if (titleExistsInCurrent && titleExistsInPrev) {
                if (prevSong.Title !== song.Title) {
                    shouldRemove = true;
                    return;
                }
            } else if (!titleExistsInCurrent && titleExistsInPrev) {
                shouldRemove = true;
                return;
            } else if (titleExistsInCurrent && !titleExistsInPrev) {
                shouldRemove = true;
                return;
            } else if (!titleExistsInCurrent && !titleExistsInPrev) {
                if (prevSong.Album !== song.Album) {
                    shouldRemove = true;
                    return;
                }
            }
        })();
        if (shouldRemove) {
            localStorage.removeItem("time");
            localStorage.removeItem("duration");
        }
        if (Object.keys(song).length !== 0) {
            trackingTimer = new Timer(20,addToRecentlyPlayed);
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
                trackingTimer = null;
            }
        };
    },[song]);

    useEffect(() => {
        const setUp = async () => {
            audio.volume = setVolume;
            elapsedTime = document.querySelector(".elapsedtime");
            duration = document.querySelector(".progressduration");
            range = document.querySelector(".range");
            volumerange = document.querySelector(".volumerange");
            const rType = parseInt(localStorage.getItem("repeatType"));
            whichRepeat = 1;
            if (rType) {
                setRepeatType(rType);
                whichRepeat = rType;
            }

            // if (prevSong.Album !== song.Album) {
            //     localStorage.removeItem("time");
            //     localStorage.removeItem("duration");
            // }

            document.addEventListener("keydown",onkeydown);
            document.addEventListener("keyup",onkeyup);
            // document.addEventListener("click",documentClick);

            volumerange.value = audio.volume * 100;
            volumerange.style.background = changeColorVolume(volumerange.value);
            volumerange.addEventListener("input",volumeinput);
            volumerange.addEventListener("change",volumechange);
            range && range.addEventListener("input",progressinput);
            range && range.addEventListener("change",progresschange);

            // setIsPlaying(true);
            // percent = 0;
            duration.innerText = "0: 00";
            loaded = false;
            if (Object.keys(song).length !== 0) {
                let LINK;
                if (shouldCache) {
                    const cache = await caches.open("song-data");
                    const songdata = await cache.match(song.url);
                    if (songdata) {
                        const blob = await songdata.blob();
                        LINK = URL.createObjectURL(blob);
                    } else {
                        LINK = song.url;
                    }
                } else {
                    LINK = song.url;
                }

                audio.src = LINK;

                // fetchStream(song.url).then(response => {
                //     const blob = new Blob([response.value], { type: 'audio/mp3' });
                //     const url = window.URL.createObjectURL(blob);
                //     audio.src = url;
                //     audio.play();
                // })
                // .catch((error) => {
                //     console.log("error",error.message);
                // });
            } else {
                shutdown();
            }

            let oldDuration = undefined, oldTime = undefined;
            if (song.url !== "") {
                setIsPlaying(true);
                setBuffering(true);
                audio.addEventListener("loadedmetadata",metadata);
                audio.addEventListener("waiting",waiting);
                audio.addEventListener("timeupdate",timeupdate);
                audio.addEventListener("canplay",canplay);
                // audio.addEventListener("play",onplay);
                audio.addEventListener("ended",ended);
                audio.addEventListener("pause",onpaused);
                audio.addEventListener("playing",onplaying);

                localStorage.setItem("nowplaying",JSON.stringify(song));
                // oldDuration = localStorage.getItem("duration");
                // oldTime = localStorage.getItem("time");
                oldDuration = null;
                oldTime = null;
                if (oldDuration !== null && oldTime !== null) {
                    audio.currentTime = oldTime;
                    range.max = oldDuration;
                    range.value = oldTime;
                    percent = range.value/range.max * 100;
                    range.style.background = changeColor(percent,0);
                    duration.innerText = convertTime(oldDuration);
                    elapsedTime.innerText = convertTime(oldTime);
                }
            } else {
                setSongPaused(true);
                oldDuration = localStorage.getItem("duration");
                oldTime = localStorage.getItem("time");
                range.max = oldDuration;
                range.value = oldTime;
                percent = range.value/range.max * 100;
                range.style.background = changeColor(percent,0);
                duration.innerText = convertTime(oldDuration);
                elapsedTime.innerText = convertTime(oldTime);
            }
        };

        setUp();

        return () => {
            if (song.url === "") {
                const index = actualQueue.indexOf(song);
                song.url = song.backup;
                delete song.backup;
                actualQueue[index] = song;
                setQueue(actualQueue);
            }
            document.removeEventListener("keydown",onkeydown);
            document.removeEventListener("keyup",onkeyup);
            // document.removeEventListener("click",documentClick);

            volumerange.removeEventListener("input",volumeinput);
            volumerange.removeEventListener("change",volumechange);
            range && range.removeEventListener("input",progressinput);
            range && range.removeEventListener("change",progresschange);

            audio.removeEventListener("loadedmetadata",metadata);
            audio.removeEventListener("waiting",waiting);
            audio.removeEventListener("timeupdate",timeupdate);
            audio.removeEventListener("canplay",canplay);
            // audio.removeEventListener("play",onplay);
            audio.removeEventListener("ended",ended);
            audio.removeEventListener("pause",onpaused);
            audio.removeEventListener("playing",onplaying);
        };

    },[song, update]);

    return(
        <div className="dummycover">
            <input type="range" min="0" defaultValue="0" className="range" disabled={buffering || song.url === ""} />
            <div className="outerplayer">
                <div className="player"
                // style={{ backgroundColor: `${calcColor()}` }}
                >
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
                                        <img className="mainplayimg" onClick={pauseOrPlay} src={ isSongPlaying ? Pause : Play } alt=""
                                        title={ isSongPlaying ? "Pause" : "Play" } />
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
                                screenLocal.show ? "" :
                                <div className="queueopener" onClick={openQueue}>
                                    <img src={queueOpened ? downArrow : upArrow} alt="" title="Player" />
                                </div>
                            }
                            {/* { Object.keys(song).length !== 0 ?
                                <div className="destroyplayer" onClick={shutdown}>
                                    <img src={Close} alt="" />
                                </div> : ""
                            } */}
                            {/* <div className="fullscreenbutton"
                            onClick={screenSetting}
                            onMouseOver={() => setButtonshow(true)}
                            onMouseOut={() => setButtonshow(false)}
                            >
                                <img src={ screenLocal.show ? (buttonshow ? innerfullaquamarine : innerfullwhite) : 
                                    (buttonshow ? fullscreenaquamarine : fullscreenwhite) } alt="" />
                            </div> */}
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
        if (!((e.target === opener.current) || opener.current.contains(e.target))) {
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
        <div className="full-display">
            <div className="inner-full-display" style={{ backgroundColor: lessen(0.2) }}>
                <div className="imageholder">
                    <img src={song.Thumbnail} alt=""/>
                </div>
                {/* <p className="display-title">{song.Title || song.Album}</p> */}
                <div className="controls-container">
                    <Button className="button-control" onClick={goToPrevious}>
                        <img src={previous} alt="" title="Previous Song / Rewind" />
                    </Button>
                    <Button className="button-control" onClick={pauseOrPlay}>
                        <img src={Pause} alt="" title="Play / Pause" />
                    </Button>
                    <Button className="button-control" onClick={goToNext}>
                        <img src={next} alt="" title="Next Song" />
                    </Button>
                </div>
                <div className="bottombar"></div>
            </div>
        </div>
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

const ResponseBar = () => {
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
        }, 1500);
    }

    return(
        // <div className={ obj.open ? "responsebar up" : obj.open !== "" ? "responsebar down" : "responsebar start" }>
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
    window.isLoading = isLoading;

    const openAccount = () => {
        window.open("/account", "_blank");
        return true;
    };

    const signOut = async () => {
        setIsLoading(true);
        const res = await sendRequest({
            method: "GET",
            endpoint: "/sign-out"
        });
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
        if (!(e.target === profileOpener.current || profileOpener.current.contains(e.target))) {
            setProfileOpen(false);
        }
    };

    const keyShort = () => {
        if (!openKeyShort) {
            setOpenKeyShort(true);
        }
        return true;
    };

    const data = [
        // { name: "Account", func: openAccount },
        // { name: "History", func: ()=>{ return false; } },
        { name: "Keyboard Shortcuts", func: keyShort },
        { name: "Sign Out", func: signOut, only: true }
    ];

    const handle = async (menu) => {
        if (window.isLoading) {
            return;
        }
        const hide = await menu.func();
        if (hide) {
            setProfileOpen(false);
        }
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
            { data.length !== 0 ?
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
        { name: `Forward ${skipSecs} secs`, keys: ["->"] },
        { name: `Rewind ${skipSecs} secs`, keys: ["<-"] },
        { name: "Previous song", keys: ["P"] },
        { name: "Next song", keys: ["N"] },
        { name: "Volume Up", keys: ["V","+"] },
        { name: "Volume Down", keys: ["V","-"] },
        { name: "Mute/Unmute", keys: ["M"] }
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
    // const [name,] = CustomUseState(homeClass);
    const [screen,] = useContext(FullScreenContext);

    return(
        <div className="homemain">
            { openKeyShort ? <KeyboardShortcut setOpenKeyShort={setOpenKeyShort} /> : null }
            { openerDetails.open ? <Opener openerDetails={openerDetails} setOpenerDetails={setOpenerDetails} /> : null }
            { profileOpen ? <ProfileOpener setProfileOpen={setProfileOpen} /> : null }
            <MiniPlayer/>
            <ResponseBar/>
            { screen.show ? <FullScreen/> : null }
            <MainPanel/>
            { playing ? <Player/> : null }
        </div>
    );
};

export default Home;