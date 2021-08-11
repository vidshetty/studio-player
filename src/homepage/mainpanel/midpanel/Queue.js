import "../../../css/queuestyles.css";
import React, { useState, useEffect, useRef, useContext } from "react";
import { Redirect, useHistory } from "react-router-dom";
import Close from "../../../assets/deletewhite.svg";
import Placeholder from "../../../assets/placeholder.svg";
import Play from "../../../assets/playbutton-white.svg";
import Pause from "../../../assets/pausebutton-white.svg";
import Expand from "../../../assets/expand-white.svg";
// import Expand from "../../../assets/fullscreen.png";
import Minimize from "../../../assets/new-minimizeplayer-white.svg";
import LyricsIcon from "../../../assets/lyrics-white.svg";
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
    basename,
    global,
    lyricsGlobal,
    sendRequest,
    lyricTextGlobal,
    sharingBaseLink
} from "../../../common";
import Button from "../../../Button";
import {
    AlbumContext,
    LyricsContext,
    LyricsTextContext,
    MenuContext,
    MiniPlayerContext,
    PlayerContext,
    QueueContext,
    QueueOpenedContext,
    ResponseBarContext,
    SongIsPausedContext
} from "../../../index";
let finalQueue = [], queueLength, songIndex, smallArr;
let actualQueue, firstpart, lastpart, topBar, miniLocal, isOpen, scrollInterval = null;
let lyricTimeout = null;


const Loader = () => {
    return(
        <div className="fullcover">
            <div className="bufferloader"/>
        </div>
    );
};

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


const EachLyric = ({ each, lyricText }) => {
    return(
        <div className={`each-lyric ${each.key === lyricText.key ? "activetext" : ""}`}>
            {each.text}
        </div>
    );
};

const LyricsPart = ({ song, setTab }) => {
    const lyricsContainer = useRef(null);
    const activeLyrics = useRef(null);
    const [lyrics, setLyrics] = useContext(LyricsContext);
    const [lyricText,] = useContext(LyricsTextContext);
    const [lyricsLoading, setLyricsLoading] = useState(false);

    const call = async () => {
        if (!lyricsLoading) setLyricsLoading(true);
        const res = await sendRequest({
            method: "GET",
            endpoint: `/getLyrics?name=${song.Title || song.Album}`
        });
        if (res) {
            setLyricsLoading(false);
            setLyrics(res);
            if (res.length === 0) {
                setTimeout(() => setTab(1), 500);
            }
        }
    };

    useEffect(() => {
        if (!song.lyrics) {
            setTab(1);
            return;
        }
        call();
    }, [song]);

    useEffect(() => {
        lyricsContainer.current = document.querySelector(".lyrics-part");
        activeLyrics.current = document.querySelector(".each-lyric.activetext");
        if (lyricsContainer.current && activeLyrics.current) {
            lyricsContainer.current.scroll({
                top: activeLyrics.current.offsetTop - (lyricsContainer.current.offsetHeight / 4),
                behavior: "smooth"
            });
        }
    }, [lyricsLoading]);

    useEffect(() => {
        lyricsContainer.current = document.querySelector(".lyrics-part");
        activeLyrics.current = document.querySelector(".each-lyric.activetext");
        if (lyricsContainer.current && activeLyrics.current) {
            lyricsContainer.current.scroll({
                top: activeLyrics.current.offsetTop - (lyricsContainer.current.offsetHeight / 4),
                behavior: "smooth"
            });
        }
    }, [song, lyricText]);

    if (lyricsLoading) {
        return <Loader/>;
    }
    return(
        <div className="outer-lyrics-part">
            {
                lyrics.length > 0 ?
                <div className="sync-definer">
                    { song.sync ? "Lyrics are time synced" : "Lyrics are not time synced" }
                </div> : null
            }
            <div className="lyrics-part">
                {
                    lyrics.length === 0 ? 
                    <div className="no-lyrics">No lyrics found!</div> : null
                }
                {
                    lyrics.length > 0 ?
                    <>    
                        {
                            lyrics.map(each => {
                                return <EachLyric each={each} lyricText={lyricText} />;
                            })
                        }
                    </> : null
                }
            </div>
        </div>
    );
};


const ArtEachLyric = ({ each, lyricText, song }) => {
    // const setColor = () => {
    //     const { Color = "" } = song;
    //     if (each.key === lyricText.key) return Color ? `${Color}` : "white";
    //     return "#505050";
    // };

    return(
        <div className={`art-each-lyric ${each.key === lyricText.key ? "activetext" : each.key < lyricText.key ? "disappear" : ""}`}
        // style={{ color: setColor() }}
        >
            {each.text}
        </div>
    );
};

const ArtLyrics = ({ song, setArtLyricsOpen }) => {
    const lyricsContainer = useRef(null);
    const activeLyrics = useRef(null);
    const [lyrics, setLyrics] = useContext(LyricsContext);
    const [lyricText,] = useContext(LyricsTextContext);
    const [lyricsLoading, setLyricsLoading] = useState(false);
    const [hovered, setHovered] = useState("");

    const close = () => {
        setArtLyricsOpen(false);
    };

    const call = async () => {
        if (!lyricsLoading) setLyricsLoading(true);
        const res = await sendRequest({
            method: "GET",
            endpoint: `/getLyrics?name=${song.Title || song.Album}`
        });
        if (res) {
            setLyricsLoading(false);
            setLyrics(res);
            if (res.length === 0) {
                lyricTimeout = setTimeout(close, 1000);
            }
        }
    };

    useEffect(() => {
        clearTimeout(lyricTimeout);
        call();
    }, [song]);

    useEffect(() => {
        lyricsContainer.current = document.querySelector(".lyrics-part");
        activeLyrics.current = document.querySelector(".art-each-lyric.activetext");
        if (lyricsContainer.current && activeLyrics.current) {
            lyricsContainer.current.scroll({
                top: activeLyrics.current.offsetTop - (lyricsContainer.current.offsetHeight / 2) + 100,
                behavior: "smooth"
            });
        }
    }, [lyricsLoading]);

    useEffect(() => {
        lyricsContainer.current = document.querySelector(".lyrics-part");
        activeLyrics.current = document.querySelector(".art-each-lyric.activetext");
        if (lyricsContainer.current && activeLyrics.current) {
            lyricsContainer.current.scroll({
                top: activeLyrics.current.offsetTop - (lyricsContainer.current.offsetHeight / 2) + 100,
                behavior: "smooth"
            });
        }
    }, [song, lyricText]);

    return(
        <div className="art-lyrics"
        onMouseOver={() => setHovered(true)}
        onMouseOut={() => setHovered(false)}
        >
            {
                lyricsLoading ?
                <Loader/> :
                <div className="lyrics-part">
                    {
                        lyrics.length === 0 ? 
                        <div className="no-lyrics" style={{color:"white"}}>No lyrics found!</div> : null
                    }
                    {
                        lyrics.map(each => {
                            return <ArtEachLyric each={each} lyricText={lyricText} song={song} />;
                        })
                    }
                </div>
            }
            {
                lyrics.length !== 0 ?
                <div className={`close-lyrics ${ hovered ? "come-down" : hovered === "" ? "stay" : "go-up" }`}  onClick={close} title="Close Lyrics">
                    <img src={Close} alt="" />
                </div>
                : null
            }
        </div>
    );
};


const EachSong = ({ index, i, queue, each, songIsPaused, setSongIsPaused, setSong, openerFunc, playingSong }) => {
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
        const isPlayingSong = each.id === playingSong.id;
        const playingSongIndex = queue.findIndex(song => song.id === playingSong.id);
        const thisSongIndex = queue.findIndex(song => song.id === each.id);
        openerFunc(e, {
            dimensions,
            windowDim,
            song: each,
            shouldNotGiveOption: isPlayingSong || (playingSongIndex+1 === thisSongIndex)
        });
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

const NewRightQueue = ({ song, songIsPaused, setSongIsPaused, setSong, openerFunc, openerDetails }) => {
    const [queue, setQueue] = useContext(QueueContext);
    const [showScroll, setShowScroll] = useState(false);
    const [position, setPosition] = useState({ show: false, top: 0 });
    const [selected, setSelected] = useState(false);
    const index = queue.findIndex(each => each.id === song.id);
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
        }
    };

    const mouseup = e => {
        if (global.selectedElement) {
            setPosition({ ...position, show: false });
            setSelected(false);

            // const nearestIndex = Math.floor(position.top / 60);
            // actualQueue.splice(global.selectedSongIndex, 1);
            // actualQueue.splice(nearestIndex, 0, global.selectedSong);

            // setQueue(actualQueue);
            setQueue(prev => {
                const nearestIndex = Math.floor(position.top / 60);
                prev.splice(global.selectedSongIndex, 1);
                prev.splice(nearestIndex, 0, global.selectedSong);
                return prev;
            });

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
        style={{ overflowY: `${openerDetails.open ? "" : "overlay"}` }}
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
                    setSong={setSong} openerFunc={openerFunc} playingSong={song} />;
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
    const [queueOpened, setQueueOpened] = useContext(QueueOpenedContext);
    const [,setPlaying] = useContext(PlayerContext);
    const [songIsPaused, setSongIsPaused] = useContext(SongIsPausedContext);
    const [song, setSong] = useContext(AlbumContext);
    const [queue, setQueue] = useContext(QueueContext);
    const [openerDetails, setOpenerDetails] = useContext(MenuContext);
    const [update, setUpdate] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [,setResBar] = useContext(ResponseBarContext);
    const [topBarConfig, setTopBarConfig] = CustomUseState(topBarGlobal);
    const [mini, setMini] = useContext(MiniPlayerContext);
    const [element, setElement] = useState(null);
    const [show, setShow] = useState(false);
    const [artLyricsOpen, setArtLyricsOpen] = useState(false);
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

    const goToAlbum = item => {
        setQueueOpened(false);
        hist.push(`${prefix}${basename}/album/${item._albumId}`);
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
        const removeIndex = actualQueue.findIndex(song => {
            return song.id === each.id;
        });
        if (removeIndex === -1) return;

        if (actualQueue.length === 1) {
            setSong({});
            return;
        }
        actualQueue.splice(removeIndex, 1);
        localStorage.setItem("queue",JSON.stringify(actualQueue));
        setQueue(actualQueue);
        setUpdate(!update);
        setResBar(prev => {
            return { ...prev, open: true, msg: `Removed ${each.Title || each.Album} from queue` };
        });
        if (each.id === song.id) {
            const index = removeIndex === actualQueue.length ? 0 : removeIndex;
            setSong(actualQueue[index]);
            setSongIsPaused(true);
        }
    };

    const playSongNext = each => {
        setQueue(prev => {
            const currSongIndex = prev.findIndex(s => s.id === each.id);
            prev.splice(currSongIndex,1);
            const playingSongIndex = prev.findIndex(s => s.id === song.id);
            prev.splice(playingSongIndex+1, 0, each);
            return prev;
        });
        setResBar(prev => {
            return { ...prev, open: true, msg: `Playing ${each.Title || each.Album} next` };
        });
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
        setMini(prev => {
            return { ...prev, show: true, cover: song.Thumbnail };
        });
        setQueueOpened(false);
    };

    const shareTrack = item => {
        setOpenerDetails(prev => {
            return { ...prev, open: false };
        });
        setResBar(prev => {
            return {
                ...prev,
                open: true,
                msg: "Track link copied to clipboard"
            };
        });
        navigator.clipboard.writeText(`${sharingBaseLink}/track/${item._albumId}/${item._trackId}`);
    };

    const handleMenu = (e, { dimensions, windowDim, song: selectedSong, shouldNotGiveOption }) => {
        e.stopPropagation();
        const data = shouldNotGiveOption ? [
            {
                name: "Remove",
                func: () => removeSong(selectedSong)
            },
            {
                name: "Go to album",
                func: () => goToAlbum(selectedSong)
            },
            {
                name: "Share track",
                func: () => shareTrack(selectedSong)
            }
        ] : [
            {
                name: "Remove",
                func: () => removeSong(selectedSong)
            },
            {
                name: "Play next",
                func: () => playSongNext(selectedSong)
            },
            {
                name: "Go to album",
                func: () => goToAlbum(selectedSong)
            },
            {
                name: "Share track",
                func: () => shareTrack(selectedSong)
            }
        ];
        setOpenerDetails(prev => {
            return {
                ...prev,
                open: true,
                xValue: checkX(dimensions.x, windowDim.width),
                yValue: checkY(dimensions.y, windowDim.height, data.length),
                data
            };
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
            setOpenerDetails(prev => {
                return { ...prev, open: false };
            });
        }
    };

    const documentScroll = e => {
        if (isOpen) {
            setOpenerDetails(prev => {
                return { ...prev, open: false };
            });
        }
    };

    const openLyrics = e => {
        setArtLyricsOpen(true);
    };

    const observer = new IntersectionObserver(([entry]) => {
        const { isIntersecting } = entry;
        setShow(isIntersecting);
    }, { threshold: 0.1 });

    useEffect(() => {
        const currentElement = element;
        const currentObserver = observer;
        if (currentElement) {
            currentObserver.observe(currentElement);
        }
        return () => {
            if (currentElement) {
                currentObserver.unobserve(currentElement);
            }
        };
    }, [element]);

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
    return(
        <div className={ queueOpened ? "bottomqueue show" : queueOpened !== "" ? "bottomqueue hide" : "bottomqueue stay" } ref={setElement}>
            { show ?
            <div className="innerbottomqueue">
                <div className="leftqueuepart">
                    <div className="leftalbumartcover-container">
                        <div className="leftalbumartcover">
                            {
                                !artLyricsOpen ?
                                <>
                                    <div className="dummyforshadow"></div>
                                    <div className="icons">
                                        <img className="minimizer" onClick={minimizer} src={Minimize} alt="" title="Minimize Player" />
                                        {/* <img className="expander" src={LyricsIcon} onClick={openLyrics} alt="" title="Lyrics" /> */}
                                        {/* <img className="minimizer" onClick={minimizer} src={Minimize} alt="" title="Minimize Player" /> */}
                                    </div>
                                </> : null
                            }
                            <img src={song.Thumbnail} alt="" className="leftqueuealbumart" />
                        </div>
                    </div>
                    { artLyricsOpen ? <ArtLyrics song={song} setArtLyricsOpen={setArtLyricsOpen} /> : null }
                </div>
                <div className="new-right-queue">
                    <div className="right-inner-queue">
                        <div className="tab-bar">
                            {/* <div className={`each-tab ${tab === 1 ? "active-tab" : ""}`} style={{cursor:"default"}}>UP NEXT</div> */}
                            <Button className={`each-tab ${tab === 1 ? "active-tab" : ""}`} onClick={() => setTab(1)}>UP NEXT</Button>
                            { song.lyrics ?
                                <Button className={`each-tab ${tab === 2 ? "active-tab" : ""}`} onClick={() => setTab(2)}>LYRICS</Button> :
                                <div className={`each-tab ${tab === 2 ? "active-tab" : ""}`}
                                style={{ cursor:"default", color: "#909090" }}>LYRICS</div>
                            }
                        </div>
                        { tab === 1 ?
                            <NewRightQueue song={song} songIsPaused={songIsPaused} setSongIsPaused={setSongIsPaused} setSong={setSong}
                            openerFunc={handleMenu} openerDetails={openerDetails} /> : null
                        }
                        { tab === 2 ?
                            <LyricsPart song={song} setTab={setTab} /> : null 
                        }
                    </div>
                </div>
            </div> : null }
        </div>
    );
};


export default Queue;