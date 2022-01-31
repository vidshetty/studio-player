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

import {
    convertTime,
    wait,
    sendRequest,
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


export const audio = new Audio();


// Player
export let pauseOrPlay = null;
let trackingTimer = null, elapsedTime = null;
let duration = null, range = null;
let volumerange = null;
let setVolume = 1, percent = 0, bufferPercent = 0;
let whichRepeat = null;
let goToNext = null, goToPrevious = null;
let mainVolume = 1;
let actualQueue = null;
let currentSongIndex = 0, isSongPlaying = null;
let isBuffering = null, manuallyPausedLocal = null, timeout = null;
let screenLocal = null, currentLyricIndex = null;
let lyricsLocal = null, lyricTextLocal = null;
let ctrlKey = false, vKey = false;
const shouldCache = false;

// Opener
let style = null;

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
    const [, setPreLoaded] = useState(false);
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

    screenLocal = screen;
    actualQueue = queue;
    currentSongIndex = queue.findIndex(each => {
        return each.id === song.id;
    });
    manuallyPausedLocal = manuallyPaused;
    isSongPlaying = isPlaying;
    isBuffering = buffering;
    lyricsLocal = lyrics;
    lyricTextLocal = lyricText;


    const changeRepeat = e => {
        e.stopPropagation();
        localStorage.setItem("repeatType",repeatType+1 > 2 ? 0 : repeatType+1);
        whichRepeat = repeatType+1 > 2 ? 0 : repeatType+1;
        setRepeatType(prev => prev+1 > 2 ? 0 : prev+1);
    };
    pauseOrPlay = async e => {
        e && e.stopPropagation && e.stopPropagation();
        if (isSongPlaying) {
            setManuallyPaused(true);
            audio.pause();
        } else {
            setManuallyPaused(false);
            audio.play();
            setTimeout(() => {
                if (audio.readyState <= 2 && !isBuffering) {
                    waiting();
                }
            }, 500);
        }
    };
    const openQueue = e => {
        e && e.stopPropagation();
        documentClick(e);
        setQueueOpened(!queueOpened);
    };
    goToNext = e => {
        e && e.stopPropagation && e.stopPropagation();
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
            const nextIndex = findNextIndex();
            setSong(actualQueue[nextIndex]);
            currentSongIndex = nextIndex;
        }
        setSongPaused(true);
    };
    goToPrevious = e => {
        e && e.stopPropagation && e.stopPropagation();
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
            const prevIndex = findPreviousIndex();
            setSong(actualQueue[prevIndex]);
            currentSongIndex = prevIndex;
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
        audio.currentTime = diff * 0.1 * audio.duration;
    };
    const shuffleHandler = async e => {

        e.stopPropagation();

        if (!shuffle && actualQueue.length > 3) {
            const dummyQueue = actualQueue;
            const index = dummyQueue.indexOf(song);
            [dummyQueue[0], dummyQueue[index]] = [dummyQueue[index], dummyQueue[0]];
            const shuffled = randomize(dummyQueue.slice(1, actualQueue.length));
            setQueue(shuffled);
            setShuffle(true);
            await wait(500);
            setShuffle(false);
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
        range.max = audio.duration;
        duration.innerText = convertTime(audio.duration);
        setBuffering(false);
        setSongPaused(false);
        setTimeout(() => {
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
        }, 500);
    };
    const waiting = (e) => {
        setBuffering(true);
        setSongPaused(true);
        if (trackingTimer.canPause()) trackingTimer.pause();
    };
    const timeupdate = (e) => {

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

        if (range === document.activeElement) return;

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
    const ended = (e) => {
        range.value = 0;
        elapsedTime.innerText = "0: 00";
        trackingTimer.stop();
        range.style.background = changeColor(0,0);
        if (whichRepeat === 2) {
            audio.currentTime = 0;
            setTimeout(() => {
                audio.play();
            }, 300);
            trackingTimer.stop();
            trackingTimer = new Timer(30, addToRecentlyPlayed);
            if (!trackingTimer.hasStarted()) trackingTimer.start();
        }
        else if (whichRepeat === 0) {
            setIsPlaying(false);
            setSongPaused(true);
        }
        else {
            if (actualQueue.length === 1) {
                audio.currentTime = 0;
                setTimeout(() => {
                    audio.play();
                }, 300);
                trackingTimer.stop();
                trackingTimer = new Timer(30, addToRecentlyPlayed);
                if (!trackingTimer.hasStarted()) trackingTimer.start();
            }
            else {
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
    };
    const onplaying = async (e) => {
        setManuallyPaused(false);
        setSongPaused(false);
        setIsPlaying(true);
        if (trackingTimer.canContinue()) trackingTimer.continue();
        document.title = `${song.Title || song.Album} | StudioMusic`;
    };

    const forward = () => {
        const duration = audio.duration;
        const time = audio.currentTime;
        if (time + skipSecs < duration) {
            audio.currentTime = time + skipSecs;
            timeupdate();
        }
    };
    const rewind = () => {
        const time = audio.currentTime;
        if (time - skipSecs > 0) {
            audio.currentTime = time - skipSecs;
            timeupdate();
        }
    };
    const onkeydown = (e) => {

        if (e.keyCode === 17) ctrlKey = true;
        if (e.keyCode === 86) vKey = true

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

        if (e.keyCode === 38 && !global.searchBarOpen) {
            e.preventDefault();
            const val = parseFloat(volumerange.value);
            volumerange.value = val+5 > 100 ? 100 : val+5;
            volumechange();
            setResBar(prev => {
                return { ...prev, open: true, msg: `Volume: ${Math.floor(volumerange.value)}%` };
            });
        }
        
        if (e.keyCode === 40 && !global.searchBarOpen) {
            e.preventDefault();
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

        if (e.keyCode >= 48 && e.keyCode <= 57) {
            seekShortcut(e.keyCode - 48);
        }

        if (e.keyCode >= 96 && e.keyCode <= 105) {
            seekShortcut(e.keyCode - 96);
        }

        if (e.keyCode === 39) {
            e.preventDefault();
            forward();
        }

        if (e.keyCode === 37) {
            e.preventDefault();
            rewind();
        }
    };

    const seek = e => {
        if (e.action === "seekforward") {
            forward();
        }
        else if (e.action === "seekbackward") {
            rewind();
        }
        else if (e.action === "seekto") {
            audio.currentTime = e.seekTime;
        };
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
            data: { albumId: song._albumId }
        });

        if (shouldCache) {
            cacheNextSong();
        }
    };

    const documentClick = e => {
        if (openerDetails.open) {
            setOpenerDetails(prev => {
                return { ...prev, open: false };
            });
        }
    };

    useEffect(() => {
        setPreLoaded(false);
        currentLyricIndex = null;
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
                trackingTimer = null;
            }
        };
    },[song]);

    useEffect(() => {

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
        else {
            shutdown();
        }

        setIsPlaying(true);
        setBuffering(true);
        audio.addEventListener("loadedmetadata", metadata);
        audio.addEventListener("waiting", waiting);
        audio.addEventListener("timeupdate", timeupdate);
        audio.addEventListener("canplay", canplay);
        audio.addEventListener("ended", ended);
        audio.addEventListener("pause", onpaused);
        audio.addEventListener("playing", onplaying);

        return () => {
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
        }, 3000);
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