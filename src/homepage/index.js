import "../css/homestyles.css";
import "../css/playerstyles.css";
import "../css/albumview.css";
import MainPanel from "./mainpanel";
import { useState, useEffect } from "react";
// import Play from "../assets/playwhite.png";
import Play from "../assets/playblack.png";
// import Pause from "../assets/pausewhite.png";
import Pause from "../assets/pauseblack.png";
// import Close from "../assets/deletewhite.svg";
import Placeholder from "../assets/placeholder.svg";
import repeat from "../assets/repeat.png";
import repeatOne from "../assets/repeatone.png";
import noRepeat from "../assets/norepeat.png";
import shuffleoff from "../assets/shufflewhite.png";
import shuffleon from "../assets/shuffleaquamarine.png";
import next from "../assets/nexttrack.png";
import previous from "../assets/previoustrack.png";
import queuewhite from "../assets/queuewhite.png";
import queueaquamarine from "../assets/queueaquamarine.png";
import fullscreenaquamarine from "../assets/fullscreenaquamarine.svg";
import fullscreenwhite from "../assets/fullscreenwhite.svg";
import innerfullaquamarine from "../assets/innerfullaquamarine.svg";
import innerfullwhite from "../assets/innerfullwhite.svg";
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
    topBarGlobal,
    sendRequest,
    Timer,
    fullScreenGlobal
} from "../common";
export const audio = new Audio();
let mainVolume = 1;
let loaded = false;
let whichRepeat;
let ctrlKey = false;
let currentSongIndex = 0, isSongPlaying, actualQueue;
let volumerange, elapsedTime, duration, range, percent = 0, style;
export let pauseOrPlay;
let setVolume = 1, isBuffering, topBar, songPausedLocal;
let trackingTimer, screenLocal;
// const { ipcRenderer } = window.electron;


const changeColor = percent => {
    return `linear-gradient(to right, aquamarine ${percent}%, rgba(255,255,255,0.1) 0%)`;
};

const changeColorVolume = (value) => {
    return `linear-gradient(to right, white ${value}%, rgba(255,255,255,0.1) 0%)`;
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
        const requestOptions = {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        };
        let url = 'https://scriptwaale.herokuapp.com/listen/Bekhayali';
        return fetch(url, requestOptions)
          .then(res => {
            // if (!res.ok)
            //   throw new Error(`${res.status} = ${res.statusText}`);
            var reader = res.body.getReader();
            return reader
              .read()
              .then((result) => {
                return result;
              });
          })
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
      .catch((error) => {
        // this.setState({
        //     error: error.message
        // });
      });
};


const Player = () => {
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


    const changeRepeat = () => {
        localStorage.setItem("repeatType",repeatType+1 > 2 ? 0 : repeatType+1);
        whichRepeat = repeatType+1 > 2 ? 0 : repeatType+1;
        setRepeatType(repeatType+1 > 2 ? 0 : repeatType+1);
    };
    pauseOrPlay = async () => {
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
            setSongPaused(true);
            setIsPlaying(false);
            // mainVolume = audio.volume;
            // const reduce = setInterval(() => {
            //     audio.volume = audio.volume - 0.2 >= 0 ? audio.volume - 0.2 : audio.volume;
            // },50);
            // await wait(800);
            // clearInterval(reduce);
            audio.pause();
        } else {
            setSongPaused(false);
            setIsPlaying(true);
            audio.play();
            // const increase = setInterval(() => {
            //     audio.volume = audio.volume + 0.2 <= mainVolume ? audio.volume + 0.2 : mainVolume;
            // },50);
            // await wait(800);
            // clearInterval(increase);
        }
    };
    const openQueue = () => {
        if (queueOpened) {
            setTopBarConfig({
                ...topBar,
                button: false
            });
        }
        setQueueOpened(!queueOpened);
    };
    const goToNext = () => {
        if (actualQueue.length === 1) {
            audio.currentTime = 0;
        } else {
            const nextIndex = currentSongIndex < actualQueue.length - 1 ? currentSongIndex + 1 : 0;
            setSong(actualQueue[nextIndex]);
            currentSongIndex = nextIndex;
        }
        setSongPaused(true);
    };
    const goToPrevious = () => {
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
    const shuffleHandler = () => {
        if (!shuffle && actualQueue.length > 3) {
            const dummyQueue = actualQueue;
            const index = dummyQueue.indexOf(song);
            [dummyQueue[0], dummyQueue[index]] = [dummyQueue[index], dummyQueue[0]];
            const shuffled = randomize(dummyQueue.slice(1,actualQueue.length));
            console.log("shuffled",shuffled);
            localStorage.setItem("queue",JSON.stringify(shuffled));
            setQueue(shuffled);
            setShuffle(!shuffle);
        }
        if (shuffle) {
            setShuffle(!shuffle);
        }
    };


    const volumeinput = (e) => {
        volumerange.style.background = changeColorVolume(volumerange.value);
        audio.volume = volumerange.value/100;
        mainVolume = volumerange.value/100;
        setVolume = volumerange.value/100;
    };
    const volumechange = (e) => {
        volumerange.style.background = changeColorVolume(volumerange.value);
        audio.volume = volumerange.value/100;
        mainVolume = volumerange.value/100;
        setVolume = volumerange.value/100;
    };


    const progressinput = (e) => {
        range.focus();
        elapsedTime.innerText = convertTime(range.value);
        percent = range.value/range.max * 100;
        range.style.background = changeColor(percent);
    };
    const progresschange = (e) => {
        audio.currentTime = range.value;
        audio.volume = mainVolume;
        range.blur();
        percent = range.value/range.max * 100;
        range.style.background = changeColor(percent);
    };


    const metadata = (e) => {
        loaded = true;
        range.max = audio.duration;
        duration.innerText = convertTime(audio.duration);
        // audio.play();
        setBuffering(false);
        setSongPaused(false);
        audio.currentTime = 0;
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
        // if (elapsedTime.innerText === "0: 10") audio.currentTime = audio.duration - 10;
        elapsedTime.innerText = convertTime(audio.currentTime);
        if(loaded) duration.innerText = `-${convertTime(audio.duration - audio.currentTime)}`;
        if ((range === document.activeElement)) {
        } else {
            range.value = audio.currentTime;
            percent = range.value/range.max * 100;
            range.style.background = changeColor(percent);
        }
    };
    const canplay = (e) => {
        setBuffering(false);
        audio.play();
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

    useEffect(() => {
        trackingTimer = new Timer(30,addToRecentlyPlayed);
        return () => {
            trackingTimer = null;
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

            document.addEventListener("keydown",onkeydown);
            document.addEventListener("keyup",onkeyup);

            volumerange.value = audio.volume * 100;
            volumerange.style.background = changeColorVolume(volumerange.value);
            volumerange.addEventListener("input",volumeinput);
            volumerange.addEventListener("change",volumechange);
            range.addEventListener("input",progressinput);
            range.addEventListener("change",progresschange);

            // setIsPlaying(true);
            percent = 0;
            duration.innerText = "0: 00";
            loaded = false;
            if (Object.keys(song).length !== 0) {
                // if (song.url !== "") {
                //     const link = await sendRequest({
                //         method: "POST",
                //         endpoint: "/getUrl",
                //         data: {
                //             title: song.Type === "Single" ? song.Album : song.Title
                //         }
                //     });
                //     audio.src = link;
                // } else {
                    audio.src = song.url;
                // }
            } else {
                shutdown();
            }

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
            } else {
                setSongPaused(true);
            }
        };

        setUp();

        return () => {
            if (song.url === "") {
                const index = actualQueue.indexOf(song);
                console.log("actualindex",index);
                song.url = song.backup;
                delete song.backup;
                actualQueue[index] = song;
                setQueue(actualQueue);
            }
            document.removeEventListener("keydown",onkeydown);
            document.removeEventListener("keyup",onkeyup);

            volumerange.removeEventListener("input",volumeinput);
            volumerange.removeEventListener("change",volumechange);
            range.removeEventListener("input",progressinput);
            range.removeEventListener("change",progresschange);

            audio.removeEventListener("loadedmetadata",metadata);
            audio.removeEventListener("waiting",waiting);
            audio.removeEventListener("timeupdate",timeupdate);
            audio.removeEventListener("canplay",canplay);
            audio.removeEventListener("play",onplay);
            audio.removeEventListener("ended",ended);
            audio.removeEventListener("pause",onpaused);
            audio.removeEventListener("playing",onplaying);
        };

    },[song, update]);

    return(
        <div className="outerplayer">
            <div className="player"
            // style={{ backgroundColor: `${lessen()}` }}
            // style={{ backgroundColor: `#181818` }}
            style={{ backgroundColor: `#202020` }}
            >
                <div className="innerplayer">
                    <div className="albumpart">
                        { Object.keys(song).length !== 0 ?
                            <>
                            <div className="albumthumbnail" style={{
                                backgroundImage: `url(${Placeholder})`,
                                backgroundSize: "cover"
                            }}>
                                <img src={song.Thumbnail || ""} alt="" />
                            </div>
                            <div className="songdetails">
                                <p className="songtitle">{song.Title || song.Album}</p>
                                <p className="songartists">{song.Artist}</p>
                            </div></> : ""
                        }
                    </div>
                    <div className="playerpart">
                        <div className="controlsdiv">
                            <div className="shuffle" onClick={shuffleHandler}>
                                { !isRadioOn ? <img src={shuffle ? shuffleon : shuffleoff} alt=""/> : "" }
                            </div>
                            <div className="back" onClick={goToPrevious}>
                                <img src={previous} alt=""/>
                            </div>
                            <div className="middle">
                                { Object.keys(song).length !== 0 ?
                                    <>
                                    {
                                        buffering ? <div className="bufferloader"></div> : 
                                        <div className="mainplay" onClick={pauseOrPlay}>
                                            <img src={ isSongPlaying ? Pause : Play } alt="" />
                                        </div>
                                    }
                                    </> :
                                    <>
                                    <div className="mainplay">
                                        <img src={Play} alt="" />
                                    </div> 
                                    </>
                                }
                            </div>
                            <div className="forward" onClick={goToNext}>
                                <img src={next} alt=""/>
                            </div>
                            <div className="repeat">
                                <img src={
                                    repeatType === 0 ? noRepeat :
                                    repeatType === 1 ? repeat : repeatOne
                                } alt="" onClick={changeRepeat} />
                            </div>
                        </div>
                        <div className="progressbar">
                            <div className="elapsedtime">0: 00</div>
                            <div className="progresscontainer">
                                <input type="range" min="0" defaultValue="0" className="range" />
                            </div>
                            <div className="progressduration">0: 00</div>
                        </div>
                    </div>
                    <div className="volumepart">
                        {
                            screenLocal.show ? "" :
                            <div className="queueopener" onClick={openQueue}>
                                <img src={queueOpened ? queueaquamarine : queuewhite} alt=""/>
                            </div>
                        }
                        <div className="volumerocker">
                            {/* <div className="volumebutton">
                                <img alt="" />
                            </div> */}
                            <div className="volumeinput">
                                <input type="range" min="0" max="100" defaultValue="100" className="volumerange" />
                            </div>
                        </div>
                        {/* { Object.keys(song).length !== 0 ?
                            <div className="destroyplayer" onClick={shutdown}>
                                <img src={Close} alt="" />
                            </div> : ""
                        } */}
                        <div className="fullscreenbutton"
                        onClick={screenSetting}
                        onMouseOver={() => setButtonshow(true)}
                        onMouseOut={() => setButtonshow(false)}
                        >
                            <img src={ screenLocal.show ? (buttonshow ? innerfullaquamarine : innerfullwhite) : 
                                (buttonshow ? fullscreenaquamarine : fullscreenwhite) } alt="" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export const Opener = () => {
    const [openerDetails,] = CustomUseState(openerGlobal);
    const { open, xValue, yValue, type = "", data = [] } = openerDetails;
    style = {
        top: `${yValue}px`,
        left: `${xValue}px`
    };

    if (!open) {
        return "";
    }
    // if (type === "album" || type === "song") {
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
    // }
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

const Home = () => {
    const [playing,] = CustomUseState(playingGlobal);
    const [name,] = CustomUseState(homeClass);
    const [screen, setScreen] = CustomUseState(fullScreenGlobal);

    return(
        <div className={name}>
            <Opener/>
            <MainPanel/>
            { screen.show ? <FullScreen/> : "" }
            { playing ? <Player/> : "" }
        </div>
    );
};

export default Home;