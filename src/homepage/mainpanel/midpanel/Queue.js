import "../../../css/queuestyles.css";
import { useState, useEffect, useRef } from "react";
import { Redirect, useHistory } from "react-router-dom";
import Close from "../../../assets/deletewhite.svg";
import Placeholder from "../../../assets/placeholder.svg";
import Expand from "../../../assets/expand-white.svg";
// import Expand from "../../../assets/fullscreen.png";
import Minimize from "../../../assets/minimizeplayer-white.svg";
import { MidPanelLoader } from "./index";
import {
    CustomUseState,
    queueGlobal,
    queueOpenedGlobal,
    songIsPausedGlobal,
    albumGlobal,
    responseBar,
    openerGlobal,
    topBarGlobal,
    miniPlayerGlobal,
    checkX,
    checkY,
    routesGlobal,
    prefix
} from "../../../common";
let finalQueue = [], queueLength, songIndex, smallArr;
let actualQueue, firstpart, lastpart, topBar, miniLocal, isOpen;



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

const Queue = () => {
    const [queueOpened, setQueueOpened] = CustomUseState(queueOpenedGlobal);
    const [songIsPaused,] = CustomUseState(songIsPausedGlobal);
    const [song,] = CustomUseState(albumGlobal);
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

    const removeSong = (song) => {
        const removeIndex = actualQueue.indexOf(song);
        if (removeIndex !== -1) {
            actualQueue.splice(removeIndex, 1);
            localStorage.setItem("queue",JSON.stringify(actualQueue));
            setQueue(actualQueue);
            setUpdate(!update);
            setResBar({
                open: true,
                msg: `Removed ${song.Title || song.Album} from queue`
            });
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
    }, [update]);


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
                            <img className="minimizer" onClick={minimizer} src={Minimize} alt="" />
                            <img src={song.Thumbnail} alt="" className="leftqueuealbumart" />
                        </div>
                    </div>
                </div>
                <div className="rightqueuepart">
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
                </div>
            </div>
        </div>
    );
};


export default Queue;