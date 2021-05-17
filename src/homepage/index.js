import "../css/homestyles.css";
import "../css/playerstyles.css";
import "../css/albumview.css";
import MainPanel from "./mainpanel";
import { useState, useEffect } from "react";
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
// import previous from "../assets/previoustrack.png";
import previous from "../assets/previousbutton-white.svg";
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
    topBarGlobal,
    sendRequest,
    Timer,
    fullScreenGlobal,
    miniPlayerGlobal,
    usePrevious,
    profileOpener
} from "../common";
export const audio = new Audio();
let mainVolume = 1;
let loaded = false;
let whichRepeat;
let ctrlKey = false;
let currentSongIndex = 0, isSongPlaying, actualQueue;
let volumerange, elapsedTime, duration, range, percent = 0, style, bufferPercent = 0;
export let pauseOrPlay;
let setVolume = 1, isBuffering, topBar, songPausedLocal, timeout = null;
let trackingTimer, screenLocal;
// const { ipcRenderer } = window.electron;


const changeColor = (percent,bufferPercent) => {
    // return `linear-gradient(to right, red ${percent}%, #505050 0%)`;
    // return `linear-gradient(to right, #066bff ${percent}%, #505050 0%)`;
    return `linear-gradient(to right, #066bff ${percent}%, #303030 0%)`;
    // return `linear-gradient(to right, #066bff ${percent}%, #505050 ${percent}%, #505050 ${bufferPercent}%, #303030 0%)`;
};

const changeColorVolume = (value) => {
    return `linear-gradient(to right, white ${value}%, rgba(255,255,255,0.1) 0%)`;
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
        console.log("playing");
        music.play();
      })
      
};

const Player = () => {
    const [hovered, setHovered] = useState(false);
    const [song, setSong] = CustomUseState(albumGlobal);
    const [playerOn,setPlaying] = CustomUseState(playingGlobal);
    const [queue, setQueue] = CustomUseState(queueGlobal);
    const [buffering, setBuffering] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [buttonshow, setButtonshow] = useState(false);
    const [repeatType, setRepeatType] = CustomUseState(repeatTypeGlobal);
    const [shuffle, setShuffle] = useState(false);
    const [queueOpened, setQueueOpened] = CustomUseState(queueOpenedGlobal);
    const [songPaused, setSongPaused] = CustomUseState(songIsPausedGlobal);
    const [topBarConfig, setTopBarConfig] = CustomUseState(topBarGlobal);
    const [screen, setScreen] = CustomUseState(fullScreenGlobal);
    const [openerDetails, setOpenerDetails] = CustomUseState(openerGlobal);
    const prevSong = usePrevious(song);
    screenLocal = screen;
    topBar = topBarConfig;
    // const [, setTab] = CustomUseState(tabGlobal);
    const [isRadioOn, setRadioOn] = CustomUseState(radioGlobal);
    const [update, setUpdate] = useState(true);
    actualQueue = queue;
    currentSongIndex = queue.indexOf(song);
    isSongPlaying = isPlaying;
    isBuffering = buffering;
    songPausedLocal = songPaused;
    let playerOnLocal = playerOn;


    const changeRepeat = e => {
        e.stopPropagation();
        localStorage.setItem("repeatType",repeatType+1 > 2 ? 0 : repeatType+1);
        whichRepeat = repeatType+1 > 2 ? 0 : repeatType+1;
        setRepeatType(repeatType+1 > 2 ? 0 : repeatType+1);
    };
    pauseOrPlay = async (e = "") => {
        if (e !== "") {
            e.stopPropagation();
        }
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
            audio.pause();
        } else {
            // setSongPaused(false);
            // setIsPlaying(true);
            audio.play();
            // const increase = setInterval(() => {
            //     audio.volume = audio.volume + 0.2 <= mainVolume ? audio.volume + 0.2 : mainVolume;
            // },50);
            // await wait(800);
            // clearInterval(increase);
        }
    };
    const openQueue = (e = "") => {
        if (e !== "") {
            e.stopPropagation();
        }
        documentClick(e);
        setQueueOpened(!queueOpened);
    };
    const goToNext = (e = "") => {
        if (e !== "") {
            e.stopPropagation();
        }
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
    const goToPrevious = (e = "") => {
        if (e !== "") {
            e.stopPropagation();
        }
        localStorage.removeItem("time");
        localStorage.removeItem("duration");
        setSongPaused(true);
        if (actualQueue.length === 1 || audio.currentTime > 10) {
            audio.currentTime = 0;
            trackingTimer = null;
            trackingTimer = new Timer(30, addToRecentlyPlayed);
            if (!trackingTimer.hasStarted()) trackingTimer.start();
        } else {
            const index = actualQueue.indexOf(song);
            setSong(index === 0 ? actualQueue[actualQueue.length-1] : actualQueue[index-1]);
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
            console.log("shuffled",shuffled);
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
            trackingTimer = null;
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
    };
    const volumechange = e => {
        e.stopPropagation();
        volumerange.style.background = changeColorVolume(volumerange.value);
        audio.volume = volumerange.value/100;
        mainVolume = volumerange.value/100;
        setVolume = volumerange.value/100;
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
        audio.play();
        setBuffering(false);
        setSongPaused(false);
        // audio.currentTime = 0;
        // const time = localStorage.getItem("time");
        // console.log("time",time);
        // if (time === null) {
        //     audio.currentTime = 0;
        // } else {
        //     audio.currentTime = time;
        //     console.log("setting time");
        // }
        if (!trackingTimer.hasStarted()) trackingTimer.start();
    };
    const waiting = (e) => {
        setBuffering(true);
        setSongPaused(true);
        if (trackingTimer.canPause()) {
            trackingTimer.pause();
        }
    };
    const timeupdate = (e) => {
        localStorage.setItem("time", audio.currentTime);
        elapsedTime.innerText = convertTime(audio.currentTime);
        if ((range === document.activeElement)) {
        } else {
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
        }
    };
    const canplay = (e) => {
        console.log("can play");
        setBuffering(false);
        // audio.play();
        setSongPaused(false);
        if (trackingTimer.canContinue()) {
            trackingTimer.continue();
        }
    };
    const onplay = (e) => {
        setIsPlaying(true);
        setSongPaused(false);
    };
    const ended = (e) => {
        range.value = 0;
        elapsedTime.innerText = "0: 00";
        if (!trackingTimer.hasFinished()) {
            trackingTimer.stop();
        }
        if (whichRepeat === 2) {
            audio.play();
            trackingTimer = null;
            trackingTimer = new Timer(30, addToRecentlyPlayed);
            if (!trackingTimer.hasStarted()) trackingTimer.start();
        } else if (whichRepeat === 0) {
            setIsPlaying(false);
            setSongPaused(true);
            range.style.background = changeColor(0);
        } else {
            if (queue.length === 1) {
                audio.play();
            } else {
                goToNext();
            }
        }
    };
    const onpaused = async (e) => {
        setSongPaused(true);
        setIsPlaying(false);
        if (trackingTimer.canPause()) {
            trackingTimer.pause();
        }
        document.title = "Studio";
        // ipcRenderer.send("paused");
        // await wait(1000);
        // audio.volume = 0;
    };
    const onplaying = async (e) => {
        setSongPaused(false);
        setIsPlaying(true);
        if (trackingTimer.canContinue()) {
            trackingTimer.continue();
        }
        document.title = `${song.Title || song.Album} - Studio`;
        // ipcRenderer.send("playing");
        // await wait(1000);
        // audio.volume = mainVolume;
        // pauseOrPlay();
    };


    const onkeydown = (e) => {
        if (e.keyCode === 17) {
            ctrlKey = true;
        }
        if (e.keyCode === 32 && ctrlKey && !isBuffering) {
            e.preventDefault();
            pauseOrPlay();
        }
        if (e.keyCode === 78 && ctrlKey) {
            e.preventDefault();
            goToNext();
        }
        if (e.keyCode === 80 && ctrlKey) {
            e.preventDefault();
            goToPrevious();
        }
        if (e.keyCode === 39 && ctrlKey) {
            const duration = audio.duration;
            const time = audio.currentTime;
            if (time + 10 < duration) {
                audio.currentTime = time + 10;
            }
        }
        if (e.keyCode === 37 && ctrlKey) {
            const time = audio.currentTime;
            if (time - 10 > 0) {
                audio.currentTime = time - 10;
            }
        }
    };
    const onkeyup = (e) => {
        if (e.keyCode === 17) {
            ctrlKey = false;
        }
    };

    const lessen = () => {
        const split = song.Color.split(",");
        split[3] = "0.3)";
        return split.join(",");
    };

    const addToRecentlyPlayed = () => {
        sendRequest({
            method: "POST",
            endpoint: "/addToRecentlyPlayed",
            data: {
                album: song.Album
            }
        });
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
        console.log("click",openerDetails.open);
        if (openerDetails.open) {
            setOpenerDetails({
                ...openerDetails,
                open: false
            });
        }
    };

    useEffect(() => {
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
        console.log("sholdremove",shouldRemove);
        if (shouldRemove) {
            localStorage.removeItem("time");
            localStorage.removeItem("duration");
        }
        trackingTimer = new Timer(30,addToRecentlyPlayed);
        if ("mediaSession" in navigator) {
            navigator.mediaSession.metadata = new window.MediaMetadata({
                title: song.Title || song.Album,
                artist: song.Artist,
                album: song.Album,
                artwork: [
                    { src: song.Thumbnail }
                ]
            });
        }
        console.log("network",navigator?.connection?.downlink);
        console.log("type",navigator?.connection?.type);
        console.log("connection",navigator?.connection);
        return () => {
            if (trackingTimer !== null) {
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
            whichRepeat = 0;
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
                audio.preload = "auto";
                audio.src = song.url;
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
                audio.addEventListener("play",onplay);
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
                    range.style.background = changeColor(percent);
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
                range.style.background = changeColor(percent);
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
                                    <div className="albumthumbnail" style={{
                                        backgroundImage: `url(${Placeholder})`,
                                        backgroundSize: "cover"
                                    }}>
                                        <img src={song.Thumbnail} alt="" />
                                    </div>
                                    <div className="songdetails">
                                        <p className="songtitle">{song.Title || song.Album}</p>
                                        <div className="songartistscontainer">
                                            {
                                                song.Album.length > 30 ?
                                                <>
                                                <p className="songartists">{`${song.Artist.slice(0,30)}...`}</p>
                                                <div className="separator"></div>
                                                <p className="songartists">{`${song.Album.slice(0,30)}...`}</p>
                                                </>
                                                :
                                                song.Artist.length > 30 ?
                                                <>
                                                <p className="songartists">{`${song.Artist.slice(0,30)}...`}</p>
                                                <div className="separator"></div>
                                                <p className="songartists">{`${song.Album}`}</p>
                                                </>
                                                :
                                                <>
                                                <p className="songartists">{`${song.Artist}`}</p>
                                                <div className="separator"></div>
                                                <p className="songartists">{`${song.Album}`}</p>
                                                </>
                                            }
                                            <div className="separator"></div>
                                            <p className="songartists">{song.Duration}</p>
                                            <div className="separator"></div>
                                            <p className="songartists">{song.Year}</p>
                                        </div>
                                    </div></> : ""
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
                                } alt="" onClick={changeRepeat} title="Repeat" />
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


export const Opener = () => {
    const [openerDetails,] = CustomUseState(openerGlobal);
    const { open, xValue, yValue, data = [] } = openerDetails;
    style = {
        top: `${yValue}px`,
        left: `${xValue}px`
    };

    if (!open) {
        return "";
    }
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
    const [song,] = CustomUseState(albumGlobal);

    const lessen = value => {
        let color = song.Color.split(",");
        color[3] = `${value}`;
        color = color.join(",");
        return color;
    };
    
    return(
        <div className="fulldisplay">
            <div className="innerfulldisplay"
            // style={{ background: `linear-gradient(to bottom,${song.Color || ""},${song.Color || ""},black` }}
            // style={{ background: `linear-gradient(to bottom,black,${lessen(0.5)},${lessen(0.5)},black` }}
            // style={{ background: `${lessen(0.3)}` }}
            style={{ background: `#7fffd430` }}
            // style={{ background: `#252525` }}
            // style={{ background: `radial-gradient(${lessen(1)},${lessen(1)},black)` }}
            >
                <div className="imageholder"
                // style={{ backgroundImage: `url(${song.Thumbnail})`, backgroundSize: "cover" }}
                >
                    {/* <div className="innerimageholder">
                    </div> */}
                    <img src={song.Thumbnail} alt=""/>
                </div>
                <div className="bottombar"></div>
            </div>
        </div>
    );
};

const MiniPlayer = () => {
    const [mini, setMini] = CustomUseState(miniPlayerGlobal);
    const [song,] = CustomUseState(albumGlobal);

    if (!mini) {
        return "";
    }
    return (
        <div className="miniplayer">
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
                <div className="minishadow">
                    <div className="close-view" onClick={() => setMini(false)}>
                        <img src={Close} alt="" />
                    </div>
                </div>
                <img src={song.Thumbnail || ""} alt="" />
            </div>
        </div>
    );
};

const ResponseBar = () => {
    const [obj, setObj] = CustomUseState(responseBar);
    const [playing,] = CustomUseState(playingGlobal);

    if (obj.open && playing) {
        if (timeout) {
            clearTimeout(timeout);
        } 
        timeout = setTimeout(() => {
            setObj({ ...obj, open: false });
        }, 1500);
    }

    return(
        <div className={ obj.open && playing ? "responsebar up" : obj.open !== "" ? "responsebar down" : "responsebar start" }>
            <div className="message">{obj.msg}</div>
        </div>
    );
};

const ProfileOpener = ({ setProfileOpen }) => {
    const [isLoading, setIsLoading] = useState(false);
    const picture = localStorage.getItem("picture");
    const userName = localStorage.getItem("username").split(" ");
    const email = localStorage.getItem("email");
    const list = [
        "profile-opener",
        "rowinmenu",
        "rowtext",
        "picture-container",
        "account-section",
        "account-picture",
        "center-picture",
        "dummy-class",
        "account-name",
        "account-email"
    ];
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
        if (!list.includes(e.target.className) && !window.isLoading) {
            setProfileOpen(false);
        }
    };

    const data = [
        { name: "Account", func: openAccount },
        { name: "History", func: ()=>{ return false; } },
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
        document.addEventListener("click", click);
        return () => {
            document.removeEventListener("click",click);
        };
    }, []);

    return(
        <div className="profile-opener">
            <div className="account-section">
                <div className="account-picture">
                    {
                        picture ?
                        <div className="center-picture">
                            <img src={picture} alt="" className="dummy-class" />
                        </div> :
                        <div className="center-picture" style={{ backgroundColor: "violet", color: "black", fontSize: "2em" }}>
                            {userName[0][0]?.toUpperCase()}{userName[1] && userName[1][0]?.toUpperCase()}
                        </div>
                    }
                </div>
                <div className="account-name">{userName}</div>
                <div className="account-email">{email}</div>
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

const Home = () => {
    const [playing,] = CustomUseState(playingGlobal);
    const [profileOpen, setProfileOpen] = CustomUseState(profileOpener);
    // const [name,] = CustomUseState(homeClass);
    const [screen,] = CustomUseState(fullScreenGlobal);

    return(
        <div className="homemain">
            <Opener/>
            { profileOpen ? <ProfileOpener setProfileOpen={setProfileOpen} /> : null }
            <MiniPlayer/>
            <ResponseBar/>
            <MainPanel/>
            { screen.show ? <FullScreen/> : "" }
            { playing ? <Player/> : "" }
        </div>
    );
};

export default Home;