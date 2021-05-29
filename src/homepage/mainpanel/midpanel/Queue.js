import "../../../css/queuestyles.css";
import { useState, useEffect, useRef } from "react";
import { Redirect, useHistory } from "react-router-dom";
import Close from "../../../assets/deletewhite.svg";
import Placeholder from "../../../assets/placeholder.svg";
import Play from "../../../assets/playbutton-white.svg";
import Pause from "../../../assets/pausebutton-white.svg";
import Expand from "../../../assets/expand-white.svg";
// import Expand from "../../../assets/fullscreen.png";
import Minimize from "../../../assets/minimizeplayer-white.svg";
import { MidPanelLoader } from "./index";
import { pauseOrPlay } from "../../index";
import {
    CustomUseState,
    queueGlobal,
    queueOpenedGlobal,
    songIsPausedGlobal,
    albumGlobal,
    responseBar,
    openerGlobal,
    playingGlobal,
    topBarGlobal,
    miniPlayerGlobal,
    checkX,
    checkY,
    prefix,
    global
} from "../../../common";
let finalQueue = [], queueLength, songIndex, smallArr;
let actualQueue, firstpart, lastpart, topBar, miniLocal, isOpen, scrollInterval = null;



const SongInQueue = ({ nowPlaying = false, songIsPaused = null, song, number = null, openerFunc }) => {
    const [hovered, setHovered] = useState(false);
    const [,setPlayingSong] = CustomUseState(albumGlobal);
    const [,setSongIsPaused] = CustomUseState(songIsPausedGlobal);

    const mouseOver = e => {
        setHovered(true);
    };

    const mouseOut = e => {
        setHovered(false);
    };

    const setSong = () => {
        if (nowPlaying) {
            return;
        }
        setPlayingSong(song);
        setSongIsPaused(true);
    };

    const handleMenu = e => {
        e.stopPropagation();
        const dimensions = { x: e.clientX, y: e.clientY };
        const windowDim = { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight };
        openerFunc(e, { dimensions, windowDim, song });
    };

    return(
        <div className="nowplaying" style={{
            marginTop: `${ nowPlaying ? "10px" : "" }`,
            marginBottom: `${ nowPlaying ? "30px" : "" }`,
            borderBottom: `${ nowPlaying ? "" : "1px solid rgba(255,255,255,0.1)" }`
        }} onMouseOver={mouseOver} onMouseOut={mouseOut}>
            <div className="innernowplaying"
            style={{ backgroundColor: `${ nowPlaying || hovered ? "#202020" : "" }` }}
            onClick={setSong}
            >
                {
                    nowPlaying ?
                    <div className="firstpartifnowplaying">
                        {
                            !songIsPaused ?
                            <div className="playinganim">
                                <div className="div1"></div>
                                <div className="div2"></div>
                                <div className="div3"></div>
                                <div className="div4"></div>
                            </div> : 
                            <div className="pausedanim">
                                <div className="div5"></div>
                                <div className="div6"></div>
                                <div className="div7"></div>
                                <div className="div8"></div>
                            </div>
                        }
                    </div> :
                    <div className="firstpart">{number}</div>
                }
                <div className="nowplayingart">
                    <img src={song.Thumbnail} alt=""/>
                </div>
                <div className="queuesongdetails">
                    <div className="startingpart">
                        <div className="playingsongname"
                        style={{ color: `${ nowPlaying ? "white" : "white" }` }}>{song.Title || song.Album}</div>
                        <div className="playingsongartist">{song.Artist}</div>
                    </div>
                </div>
                <div className="lastpart">
                    <div className={ hovered ? "openercontrol" : "openercontrol hidden" } style={{marginLeft: "0px"}}
                    onClick={handleMenu}>
                        <div className="opener1"></div>
                        <div className="opener2"></div>
                        <div className="opener3"></div>
                    </div>
                    { hovered ? "" : song.Duration }
                </div>
            </div>
        </div>
    );
};

const EachSong = ({ index, i, queue, each, songIsPaused, setSongIsPaused, setSong, openerFunc }) => {
    const [hovered, setHovered] = useState(false);

    const handleMouse = e => e.stopPropagation();
    const mouseover = e => setHovered(true);
    const mouseout = e => setHovered(false);

    const playThis = e => {
        e.stopPropagation();
        setSong(each);
        setSongIsPaused(true);
    };

    const handleMenu = e => {
        e.stopPropagation();
        const dimensions = { x: e.clientX, y: e.clientY };
        const windowDim = { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight };
        openerFunc(e, { dimensions, windowDim, song: each });
    };

    const mousedown = e => {
        const element = e.currentTarget;
        global.selectedElement = element;
        global.selectedSong = each;
        global.selectedSongIndex = queue.indexOf(each);
        global.containerDimensions = document.querySelector(".tab-container").getBoundingClientRect();
        element.classList.add("absolute");
    };

    const mouseup = e => {};

    if (Object.keys(each).length === 1) {
        return(
            <div className="each-song"></div>
        );
    }
    return(
        <div className={`each-song${index === i ? " active-song" : ""}`} title={each.Title || each.Album} onMouseDown={mousedown}
        onMouseUp={mouseup} onMouseOver={mouseover} onMouseOut={mouseout} style={{ marginBottom: `${ i+1 === queue.length ? "10px" : "" }` }}>
            <div className="song-album" onMouseDown={handleMouse} onMouseUp={handleMouse}>
                <img className="song-album-img" src={each.Thumbnail} alt="" />
                {
                    index !== i ?
                        <div className="song-album-cover-hidden">
                            <img src={Play} className="song-album-cover-img" title="Play" alt="" onClick={playThis} />
                        </div> : 
                        <div className="song-album-cover-hidden">
                            {
                                !songIsPaused ?
                                <img src={Pause} className="song-album-cover-img" title="Pause" alt="" onClick={pauseOrPlay} /> : 
                                <img src={Play} className="song-album-cover-img" title="Play" alt="" onClick={pauseOrPlay} />
                            }
                        </div>
                }
                {
                    index === i && !hovered ?
                        <div className="song-album-cover">
                            {
                                !songIsPaused ?
                                <div className="playinganim">
                                    <div className="div1"></div>
                                    <div className="div2"></div>
                                    <div className="div3"></div>
                                    <div className="div4"></div>
                                </div> : 
                                <div className="pausedanim">
                                    <div className="div5"></div>
                                    <div className="div6"></div>
                                    <div className="div7"></div>
                                    <div className="div8"></div>
                                </div> 
                            }
                        </div> : null
                }
            </div>
            <div className="song-body">
                <div className="song-body-upper">
                    <div>{each.Title || each.Album}</div>
                </div>
                <div className="song-body-lower">
                    <div>{each.Artist}</div>
                </div>
            </div>
            <div className="song-options" onMouseDown={handleMouse} onMouseUp={handleMouse}>
                <div className={ hovered ? "openercontrol" : "openercontrol hidden" } style={{marginLeft: "0px"}}
                onClick={handleMenu} title="More Options">
                    <div className="opener1"></div>
                    <div className="opener2"></div>
                    <div className="opener3"></div>
                </div>
                { hovered ? null : each.Duration }
            </div>
        </div>
    );
};

const NewRightQueue = ({ song, songIsPaused, setSongIsPaused, setSong, openerFunc }) => {
    const [queue, setQueue] = CustomUseState(queueGlobal);
    const [showScroll, setShowScroll] = useState(false);
    const [position, setPosition] = useState({ show: false, top: 0 });
    const [selected, setSelected] = useState(false);
    const index = queue.indexOf(song);
    const container = useRef(null);
    actualQueue = queue;

    const mouseover = e => setShowScroll(true);
    const mouseout = e => setShowScroll(false);

    const mousedown = e => {
        if (global.selectedElement) {
            setSelected(true);
            const top = (e.clientY - global.containerDimensions.top) + (global.scrolled || 0);
            global.selectedElement.style.top = top + "px";
            const nearest = Math.floor(top / 60);
            setPosition({ ...position, show: true, top: nearest * 60 });

            // const { selectedSong } = global;
            // const index = actualQueue.indexOf(selectedSong);
            // actualQueue.splice(index+1,0,{ id: index });
            // setQueue(actualQueue);
        }
    };

    const mouseup = e => {
        if (global.selectedElement) {
            setPosition({ ...position, show: false });
            setSelected(false);

            const nearestIndex = Math.floor(position.top / 60);
            actualQueue.splice(global.selectedSongIndex, 1);
            actualQueue.splice(nearestIndex, 0, global.selectedSong);

            // const index = actualQueue.findIndex(each => {
            //     if (Object.keys(each).length === 1) {
            //         return true;
            //     }
            //     return false;
            // });
            // actualQueue.splice(index,1);

            setQueue(actualQueue);

            global.selectedElement.classList.remove("absolute");
            global.selectedElement = null;
            global.selectedSongIndex = null;
            global.selectedSong = null;
        }
    };

    const keepScrollDown = () => {
        scrollInterval = setInterval(() => {
            container.current && container.current.scrollTop++;
            global.selectedElement.style.top = (1+parseFloat(global.selectedElement.style.top.slice(0,-2))) + "px";
        },5);
    };

    const mousemove = e => {
        if (global.selectedElement) {
            const top = (e.clientY - global.containerDimensions.top) + (global.scrolled || 0);
            global.selectedElement.style.top = top + "px";
            const nearest = Math.floor(top / 60);
            setPosition({ ...position, top: nearest * 60 });
            // if (e.clientY > global.containerDimensions.bottom - 100) {
            //     !scrollInterval && keepScrollDown();
            // }
            // if (e.clientY < global.containerDimensions.bottom - 100) {
            //     clearInterval(scrollInterval);
            //     scrollInterval = null;
            // }
        }
    };

    const scroll = e => {
        global.scrolled = e.target.scrollTop;
    };

    const flush = () => {
        const index = actualQueue.findIndex(each => {
            if (Object.keys(each).length === 1) {
                return true;
            }
            return false;
        });
        if (index !== -1) {
            actualQueue.splice(index,1);
            setQueue(actualQueue);
        }
    };

    useEffect(() => {
        // flush();
        global.activeSong = document.querySelector(".each-song.active-song");
        container.current = document.querySelector(".tab-container");
        if (global.activeSong && container.current && !global.selectedElement) {
            container.current.scroll({ top: global.activeSong.offsetTop, behavior: "smooth" });
        }
    }, [song, queue]);

    return(
        <div className={`tab-container${showScroll ? " show" : ""}`}
        onMouseOver={mouseover}
        onMouseOut={mouseout}
        onMouseMove={mousemove}
        onScroll={scroll}
        onMouseDown={mousedown}
        onMouseUp={mouseup}
        >
            {
                queue.map((each,i) => {
                    return <EachSong index={index} i={i} each={each} queue={queue} songIsPaused={songIsPaused} setSongIsPaused={setSongIsPaused}
                    setSong={setSong} openerFunc={openerFunc} />;
                })
            }
            {
                selected ?
                <div style={
                    { width: "100%", position: "absolute",
                      height: `100%`,
                      top: `${global.scrolled || 0}px`,
                      left: "0", backgroundColor: "rgba(0,0,0,0.5)", zIndex: "50" }
                } ></div> :
                null
            }
            { 
                position.show ?
                <div style={
                    { width: "50px", height: "4px", position: "absolute", left: "calc((100% - 50px)/2)", zIndex: "100",
                        top: `${position.top}px`, backgroundColor: "gray", borderRadius: "5px" }
                }></div> :
                null
            }
        </div>
    );
};

const Queue = () => {
    const [tab, setTab] = useState(1);
    const [queueOpened, setQueueOpened] = CustomUseState(queueOpenedGlobal);
    const [,setPlaying] = CustomUseState(playingGlobal);
    const [songIsPaused, setSongIsPaused] = CustomUseState(songIsPausedGlobal);
    const [song, setSong] = CustomUseState(albumGlobal);
    const [queue, setQueue] = CustomUseState(queueGlobal);
    const [openerDetails, setOpenerDetails] = CustomUseState(openerGlobal);
    const [update, setUpdate] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [,setResBar] = CustomUseState(responseBar);
    const [topBarConfig, setTopBarConfig] = CustomUseState(topBarGlobal);
    const [mini, setMini] = CustomUseState(miniPlayerGlobal);
    // const [redirectTo, setRedirectTo] = useState("");
    // const [routes, setRoutes] = CustomUseState(routesGlobal);
    actualQueue = queue;
    topBar = topBarConfig;
    queueLength = queue.length;
    songIndex = actualQueue.indexOf(song);
    firstpart = actualQueue.slice(0,songIndex);
    lastpart = actualQueue.slice(songIndex+1,queueLength);
    miniLocal = mini;
    isOpen = openerDetails.open;
    const sDiv = useRef(null);
    const hist = useHistory();


    const clearQueue = (e) => {
        e.stopPropagation();
        const index = actualQueue.indexOf(song);
        actualQueue = [actualQueue[index]];
        localStorage.setItem("queue",JSON.stringify(actualQueue));
        setQueue(actualQueue);
        setResBar({ open: true, msg: "Queue cleared" });
        setUpdate(!update);
    };

    const goToAlbum = each => {
        setQueueOpened(false);
        // routes.push(`/home/album/${each.Album}`);
        // setRoutes(routes);
        hist.push(`${prefix}/home/album/${each.Album}`);
        // setRedirectTo(`${each.Album}`);
    };
    
    const initial = () => {
        finalQueue = [];
        if (queueLength === 1) {
            return;
        }
        songIndex = queue.indexOf(song);
        if (songIndex === 0) {
            finalQueue = queue.slice(1,queueLength);
            return;
        }
        if (songIndex === queueLength-1) {
            finalQueue = queue.slice(0,queueLength-1);
            return;
        }
        finalQueue = queue.slice(songIndex+1,queueLength);
        smallArr = queue.slice(0,songIndex);
        smallArr.forEach(each => {
            finalQueue.push(each);
        });
        return;
    };

    const close = () => {
        setTopBarConfig({
            ...topBar,
            button: false
        });
        setQueueOpened(false);
    };

    const removeSong = each => {
        const removeIndex = actualQueue.indexOf(each);
        if (removeIndex !== -1) {
            if (actualQueue.length === 1) {
                // setSongIsPaused(true);
                // setQueueOpened(false);
                // setPlaying(false);
                setSong({});
                return;
            }
            actualQueue.splice(removeIndex, 1);
            localStorage.setItem("queue",JSON.stringify(actualQueue));
            setQueue(actualQueue);
            setUpdate(!update);
            setResBar({
                open: true,
                msg: `Removed ${each.Title || each.Album} from queue`
            });
            const eachTitle = each.Title || each.Album;
            const currTitle = song.Title || song.Album;
            if (eachTitle === currTitle) {
                const index = removeIndex === actualQueue.length ? 0 : removeIndex;
                setSong(actualQueue[index]);
                setSongIsPaused(true);
            }
        }
    };

    const albumName = () => {
        if (actualQueue.length === 0) {
            return "";
        }
        const index = songIndex+1 < actualQueue.length ? songIndex+1 : 0;
        return actualQueue[index].Album;
    };

    const lessen = (num) => {
        if (song.Color) {
            let color = song.Color.split(",");
            color[3] = `${num})`;
            color = color.join(",");
            return color;
        }
    };

    const minimizer = () => {
        setMini({
            ...miniLocal,
            show: true,
            cover: song.Thumbnail
        });
        setQueueOpened(false);
    };

    const handleMenu = (e, { dimensions, windowDim, song: selectedSong }) => {
        e.stopPropagation();
        setOpenerDetails({
            ...openerDetails,
            open: true,
            xValue: checkX(dimensions.x, windowDim.width),
            yValue: checkY(dimensions.y, windowDim.height, 2),
            data: [
                {
                    name: "Remove",
                    func: () => removeSong(selectedSong)
                },
                {
                    name: "Go to album",
                    func: () => goToAlbum(selectedSong)
                }
            ]
        });
    };

    const handlePlayingMenu = (e, { dimensions, windowDim, song: selectedSong }) => {
        e.stopPropagation();
        setOpenerDetails({
            ...openerDetails,
            open: true,
            xValue: checkX(dimensions.x, windowDim.width),
            yValue: checkY(dimensions.y, windowDim.height, 1),
            data: [
                {
                    name: "Go to album",
                    func: () => goToAlbum(selectedSong)
                }
            ]
        });
    };

    const documentClick = e => {
        const list = ["openercontrol","opener1","opener2","opener3"];
        if (!list.includes(e.target.className)) {
            setOpenerDetails({
                ...openerDetails,
                open: false
            });
        }
    };

    const documentScroll = e => {
        if (isOpen) {
            setOpenerDetails({
                ...openerDetails,
                open: false
            });
        }
    };


    useEffect(() => {
        setIsLoading(false);
        sDiv.current = document.querySelector(".scrollcontainer");
        document.addEventListener("click",documentClick);
        sDiv.current && sDiv.current.addEventListener("scroll",documentScroll);
        return () => {
            document.removeEventListener("click",documentClick);
            sDiv.current && sDiv.current.removeEventListener("scroll",documentScroll);
        };
    }, [update,queue]);


    if (isLoading) {
        return <MidPanelLoader/>
    }
    // if (!queueOpened) {
    //     return "";
    // }
    return(
        // <div className={ queueOpened ? "bottomqueue up" : queueOpened !== "" ? "bottomqueue down" : "bottomqueue start" }>
        <div className={ queueOpened ? "bottomqueue show" : queueOpened !== "" ? "bottomqueue hide" : "bottomqueue stay" }>
        {/* <div className="bottomqueue"> */}
            <div className="innerbottomqueue">
                <div className="leftqueuepart">
                    <div className="leftalbumartcover-container">
                        <div className="leftalbumartcover">
                            <div className="dummyforshadow"></div>
                            <img className="expander" src={Expand} alt="" />
                            <img className="minimizer" onClick={minimizer} src={Minimize} alt="" title="Minimize Player" />
                            <img src={song.Thumbnail} alt="" className="leftqueuealbumart" />
                        </div>
                    </div>
                </div>

                <div className="new-right-queue">
                    <div className="right-inner-queue">
                        <div className="tab-bar">
                            <div className={`each-tab ${tab === 1 ? "active-tab" : ""}`} onClick={() => setTab(1)}>UP NEXT</div>
                            {/* <div className={`each-tab ${tab === 2 ? "active-tab" : ""}`} onClick={() => setTab(2)}>LYRICS</div> */}
                        </div>
                        { tab === 1 ?
                            <NewRightQueue song={song} songIsPaused={songIsPaused} setSongIsPaused={setSongIsPaused} setSong={setSong}
                            openerFunc={handleMenu} /> : null
                        }
                    </div>
                </div>

                {/* <div className="rightqueuepart">
                    <div className="innerrightqueue">
                        <div className="nowplayingtitle">Now Playing</div>
                        <SongInQueue nowPlaying={true} songIsPaused={songIsPaused} song={song} openerFunc={handlePlayingMenu} />
                        { actualQueue.length !== 1 ?
                            <div className="nowplayingtitle" style={{marginBottom: "8px"}}>
                                <div className="frontblock">Next from: {albumName()}</div>
                                <div className="backblock" onClick={clearQueue}>Clear</div>
                            </div> : ""
                        }
                        <div className="scrollcontainer" style={{ overflowY: `${ isOpen ? "hidden" : "overlay" }` }}>
                            {
                                lastpart.length !== 0 ?
                                lastpart.map((each,i) => {
                                    return <SongInQueue nowPlaying={false} song={each} number={songIndex+i+2} openerFunc={handleMenu} />
                                }) : ""
                            }
                            {
                                songIndex !== queueLength-1 && songIndex !== 0 ?
                                <div style={{ width: "100%", height: "30px" }}></div> : ""
                            }
                            {
                                firstpart.length !== 0 ?
                                firstpart.map((each,i) => {
                                    return <SongInQueue nowPlaying={false} song={each} number={i+1} openerFunc={handleMenu} />
                                }) : ""
                            }
                        </div>
                    </div>
                </div> */}
            </div>
        </div>
    );
};


export default Queue;