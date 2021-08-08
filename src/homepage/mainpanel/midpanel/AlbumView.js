import React, { useState, useEffect, useRef, useContext } from "react";
import "../../../css/albumview.css";
import {
    CustomUseState,
    playingGlobal,
    routesGlobal,
    tabGlobal,
    topBarGlobal,
    checkArtist,
    albumGlobal,
    queueGlobal,
    queueOpenedGlobal,
    songIsPausedGlobal,
    openerGlobal,
    responseBar,
    sendRequest,
    checkX,
    checkY,
    global,
    prefix,
    basename,
    dateToString,
    sharingBaseLink
} from "../../../common";
import { MidPanelLoader } from "./index";
import { HorizontalList } from "./HomeScreen";
import { useParams, Redirect, useHistory, useLocation } from "react-router-dom";
import play from "../../../assets/playwhite.png";
import Play from "../../../assets/playbutton-black.svg";
import Pause from "../../../assets/pausebutton-black.svg";
import BackButton from "../../../assets/backbutton-white.svg";
import PlayWhite from "../../../assets/playbutton-white.svg";
import PauseWhite from "../../../assets/pausebutton-white.svg";
import AddButton from "../../../assets/addbutton-black.svg";
import pause from "../../../assets/pausewhite.png";
import copyright from "../../../assets/copyright.png";
import Placeholder from "../../../assets/placeholder.svg";
import Queue from "./Queue";
import { pauseOrPlay } from "../../../homepage";
import Button from "../../../Button";
import {
    AlbumContext,
    MenuContext,
    PlayerContext,
    QueueContext,
    ResponseBarContext,
    SongIsPausedContext
} from "../../../index";
let mainscreen, actualIsOpen, bgChanged = false, topBar, isOpen = false;


const ShowMoreAlbum = ({ moreAlbums, albumartist }) => {
    if (moreAlbums.length === 0) {
        return "";
    }
    return(
        <div className="morealbumdiv">
            <div className="morebydisplay">More By {albumartist.split(",")[0]}</div>
            <div className="list">
                <HorizontalList list={moreAlbums} />
            </div>
        </div>
    );
};
const ActualAlbumView = () => {
    const [p, setP] = useState("");
    const params = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [albumDetails, setAlbumDetails] = useState({});
    const [routes, setRoutes] = CustomUseState(routesGlobal);
    const [,setTab] = CustomUseState(tabGlobal);
    const [redirectValue, setRedirectValue] = useState({ status: false, to: "" });
    // const [,setKeepButton] = CustomUseState(keepButtonGlobal);
    // const [,setOnClickFunc] = CustomUseState(onClickFuncGlobal);
    // const [,setTopTitle] = CustomUseState(topTitleGlobal);
    // const [,setBgColor] = CustomUseState(topBgColor);
    const [topBarConfig, setTopBarConfig] = CustomUseState(topBarGlobal);
    const [playing, setPlaying] = CustomUseState(playingGlobal);
    const [albumSong, setAlbumForPlayer] = CustomUseState(albumGlobal);
    const [queue, setQueue] = CustomUseState(queueGlobal);
    const [added, setAdded] = useState(false);
    const [songPaused, setSongPaused] = CustomUseState(songIsPausedGlobal);
    const albummain = useRef();
    const [openerDetails, setOpenerDetails] = CustomUseState(openerGlobal);
    const [moreAlbums, setMoreAlbums] = useState([]);
    const [,setResObj] = CustomUseState(responseBar);
    actualIsOpen = openerDetails.open;
    topBar = topBarConfig;
    if (p !== params.name) {
        setIsLoading(true);
        setP(params.name);
    }


    const checkForLeftPanel = () => {
        const route = routes[routes.length - 1];
        if (route.toLowerCase().includes("homescreen")) setTab("Home");
        else if (route.toLowerCase().includes("search")) setTab("Search");
        else if (route.toLowerCase().includes("new-releases")) setTab("New Releases");
        else if (route.toLowerCase().includes("library")) setTab("Library");
    };

    const scrollHandler = e => {
        if (albummain.current.scrollTop > 300 && !bgChanged) {
        // if (mainscreen.current.scrollTop > 300 && bgChanged === false) {
            const initColor = albumDetails && albumDetails.Color.substring(5,albumDetails.Color.length-1).split(",");
            bgChanged = true;
            setTopBarConfig({
                ...topBar,
                title: albumDetails.Album,
                bgColor: `rgba(${initColor[0]},${initColor[1]},${initColor[2]},0.3)`
            });
            // setTopTitle(albumDetails.Album);
            // setBgColor(`rgba(${initColor[0]},${initColor[1]},${initColor[2]},0.3)`);
        }
        if (albummain.current.scrollTop < 300 && bgChanged) {
        // if (mainscreen.current.scrollTop < 300 && bgChanged === true) {
            bgChanged = false;
            setTopBarConfig({
                ...topBar,
                title: "",
                bgColor: "transparent"
            });
            // setTopTitle("");
            // setBgColor("transparent");
        }
        if (actualIsOpen) {
            setOpenerDetails({
                ...openerDetails,
                open: false
            });
        }
    };

    const goBack = () => {
        if (routes.length > 1) {
            routes.splice(routes.length-1,1);
            setRoutes(routes);
        }
        // checkForLeftPanel();
        setTopBarConfig({
            ...topBar,
            button: false,
            title: "",
            bgColor: "transparent"
        });
        setRedirectValue({ status: true, to: routes[routes.length - 1] });
    };

    const call = async () => {
        let res = await sendRequest({
            method: "POST",
            endpoint: `/getAlbumDetails`,
            data: {
                album: params.name
            }
        });
        if (res) {
            setTopBarConfig({
                ...topBar,
                button: true,
                buttonFunc: goBack
            });
            // setKeepButton(true);
            // setOnClickFunc(goBack);
            // setBgColor("transparent")
            setAlbumDetails(res.album);
            setMoreAlbums(res.moreAlbums);
            setIsLoading(false);
        }
    };

    const playButton = (albumDetails) => {
        if (decidePlayOrPause()) {
            pauseOrPlay();
        } else {
            const main = albumDetails.Type === "Album" ? albumDetails.Tracks : [albumDetails];
            if (!playing) setPlaying(true);
            if (albumDetails.Type === "Single") {
                setQueue(main);
                setAlbumForPlayer(main[0]);
            } else {
                main.forEach(song => {
                    song.Album = albumDetails.Album;
                    song.Thumbnail = albumDetails.Thumbnail;
                    song.Color = albumDetails.Color;
                    song.Year = albumDetails.Year;
                });
                setQueue(main);
                setAlbumForPlayer(main[0]);
            }
            localStorage.setItem("queue",JSON.stringify(main));
            setSongPaused(true);
        }
    };

    const addAlbumToQueue = () => {
        // if (!added) {
            const main = albumDetails.Type === "Album" ? albumDetails.Tracks : [albumDetails];
            const mainQueue = queue;
            const index = mainQueue.indexOf(albumSong);
            if (index === -1) return;
            if (albumDetails.Type === "Single") {
                mainQueue.push(main[0]);
                // mainQueue.splice(index,0,main[0]);
                localStorage.setItem("queue",JSON.stringify(mainQueue));
                setQueue(mainQueue);
                // setAlbumForPlayer(main[0]);
                setResObj({ open: true, msg: "Added single to queue" });
            } else {
                // let i = 0;
                main.forEach(song => {
                    song.Album = albumDetails.Album;
                    song.Color = albumDetails.Color;
                    song.Thumbnail = albumDetails.Thumbnail;
                    song.Year = albumDetails.Year;
                    mainQueue.push(song);
                    // mainQueue.splice(index+i,0,song);
                    // ++i;
                });
                localStorage.setItem("queue",JSON.stringify(mainQueue));
                setQueue(mainQueue);
                setResObj({ open: true, msg: "Added album to queue" });
                // setAlbumForPlayer(main[0]);
            }
            setAdded(true);
            setOpenerDetails({
                ...openerDetails,
                open: false
            });
        // }
    };

    const playAlbumNext = () => {
        if (queue.length !== 0) {
            const index = queue.indexOf(albumSong);
            if (albumDetails.Type === "Single") {
                queue.splice(index+1,0,albumDetails);
            } else {
                albumDetails.Tracks.forEach((song,i) => {
                    song.Album = albumDetails.Album;
                    song.Color = albumDetails.Color;
                    song.Thumbnail = albumDetails.Thumbnail;
                    song.Year = albumDetails.Year;
                    queue.splice(index+1+i,0,song);
                });
            }
            localStorage.setItem("queue",JSON.stringify(queue));
            setQueue(queue);
            setResObj({ open: true, msg: `Playing '${albumDetails.Album}' next` });
        }
        setOpenerDetails({
            ...openerDetails,
            open: false
        });
    };

    const displayDirect = (album) => {
        if (Object.keys(album).length > 0) {
            const type = album.Type === "Album";
            const dur = type ? album.Tracks[0].Duration.split(": ") : album.Duration.split(": ");
            const sec = parseInt(dur[1]);
            return `${dur[0]} min${ sec !== 0 ? ` ${sec} sec` : `` }`;
        }
    };

    const addAndDisplay = (album) => {
        if (Object.keys(album).length > 0) {
            let min = 0, sec = 0;
            album.Tracks.forEach(track => {
                const dur = track.Duration.split(": ");
                min += parseInt(dur[0]);
                sec += parseInt(dur[1]);
            });
            min += Math.floor(sec/60);
            sec = sec%60;
            return `${min} min${ sec !== 0 ? ` ${sec} sec` : `` }`;
        }
    };

    const decidePlayOrPause = () => {
        let sameAlbum = false;
        const titleInSong = albumSong.Title || false;
        if (!titleInSong && albumDetails.Type === "Album") {
            return false;
        }
        if (!titleInSong && albumDetails.Type === "Single") {
            return albumSong.Album === albumDetails.Album;
        }
        albumDetails.Tracks && albumDetails.Tracks.every(song => {
            if (song.Title === titleInSong) {
                sameAlbum = true;
                return false;
            }
            return true;
        });
        return sameAlbum;
    };

    const handleClick = (e) => {
        const list = ["opener","rowinmenu","rowtext"];
        if (list.indexOf(e.target.className) === -1 && actualIsOpen) {
            mainscreen.style.overflow = "overlay";
            setOpenerDetails({
                open: false,
                xValue: 0,
                yValue: 0,
                type: null
            });
        }
    };

    const change = (color) => {
        // color = color.split(",");
        // color[3] = "0.5)";
        // color = color.join(",");
        // console.log("color",color);
        return color;
    };

    const handleMenu = (e) => {
        e.stopPropagation();
        setOpenerDetails({
            open: !actualIsOpen,
            yValue: e.clientY + 10,
            xValue: e.clientX + 10,
            type: "album",
            data: [
                {
                    name: "Add album to queue",
                    func: addAlbumToQueue
                },
                {
                    name: `Play ${albumDetails.Type.toLowerCase()} next`,
                    func: playAlbumNext
                }
            ]
        });
    };

    const compare = (a,b) => {
        if (a.Title > b.Title) return 1;
        return -1;
    };

    useEffect(() => {
        if (isLoading) {
            setTopBarConfig({
                ...topBar,
                button: false,
                title: "",
                bgColor: "transparent"
            });
            call();
        } else {
            setTopBarConfig({
                ...topBar,
                button: true,
                buttonFunc: goBack
            });
            mainscreen = document.querySelector(".albummain");
            document.addEventListener("mousedown",handleClick);
        }
        return () => {
            setRedirectValue({ ...redirectValue, status: false });
            document.removeEventListener("mousedown",handleClick);
        };
    },[isLoading]);


    if (redirectValue.status) {
        return <Redirect to={`${redirectValue.to}`} />
    }
    if (isLoading) {
        return <MidPanelLoader/>
    }
    return(
        <div className="albummain" onScroll={scrollHandler} ref={albummain}>
            <div className="topview"
            style={{background: `linear-gradient(to bottom, ${change(albumDetails.Color || "")}, #121212)`}}
            >
                <div className="albumcontainer">
                    <div className="albumart" style={{
                        backgroundImage: `url(${Placeholder})`,
                        backgroundSize: "cover"
                    }}>
                        <img src={albumDetails.Thumbnail || ""} alt="albumart" />
                    </div>
                    <div className="titlecontainer">
                        <div className="albumtype">
                            {(albumDetails.Type && albumDetails.Type.toUpperCase()) || ""}
                        </div>
                        <div className={albumDetails.Album && albumDetails.Album.length > 22 ? "albumname-extrasmall" :
                            albumDetails.Album && albumDetails.Album.length > 18 ? "albumname-small" : "albumname-large"}>
                        {/* <div className={albumDetails.Album && albumDetails.Album.length > 22 ? "albumname-extrasmall" :
                            albumDetails.Album && albumDetails.Album.length > 18 ? "albumname-extrasmall" : "albumname-extrasmall"}> */}
                            <p>{albumDetails.Album}</p>
                        </div>
                        <div className="albumartist">
                            {
                                Object.keys(albumDetails).length > 0 ?
                                albumDetails.AlbumArtist.split(", ").map((item,i) => {
                                    return(
                                        <>
                                            <div className="albumartistname"
                                            onMouseOver={(e) => checkArtist(item,e,"albumartist")}>
                                                {item || ""}
                                            </div>
                                            {
                                                i !== albumDetails.AlbumArtist.split(", ").length - 1 ?
                                                <div className="separator"></div> : ""
                                            }
                                        </>
                                    );
                                }) : ""
                            }
                            <div className="separator"></div>
                            <div className="year">{albumDetails.Year || ""}</div>
                            <div className="separator"></div>
                            <div className="noofsongs">
                                {
                                    albumDetails.Type === "Album" ? 
                                    albumDetails.Tracks.length === 1 ? `1 Song` : `${albumDetails.Tracks.length} Songs` : "1 Song"
                                }
                            </div>
                            <div className="separator"></div>
                            <div className="noofsongs">
                                {
                                    albumDetails.Tracks && albumDetails.Tracks.length >= 1 ? addAndDisplay(albumDetails) : displayDirect(albumDetails)
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bottomview">
                <div className="bottomcontainer">
                    <div className={ decidePlayOrPause() && !songPaused ? "playcontainerpause" : "playcontainer" }
                    // style={{backgroundColor: albumDetails.Color || ""}}
                    // style={{backgroundColor: "rgba(127,255,212,0.9)"}}
                    onClick={() => playButton(albumDetails)}>
                        <img src={ decidePlayOrPause() && !songPaused ? pause : play } alt="Play" />
                    </div>
                    <div className="openercontrol" onClick={handleMenu}>
                        <div className="opener1"></div>
                        <div className="opener2"></div>
                        <div className="opener3"></div>
                    </div>
                    {/* <div className="addqueuebutton" onClick={addAlbumToQueue}>
                        {
                            added ? `Added to queue` : `Add ${albumDetails.Album} to queue`
                        }
                    </div>  */}
                </div>
                <div className="table">
                    <div className="innertable">
                        <div className="titlerow">
                            <div className="hash">#</div>
                            <div className="nameofthesong">TITLE</div>
                            <div className="duration">DURATION</div>
                        </div>
                        {
                            albumDetails.Type === "Album" ?
                            albumDetails.Tracks.sort(compare).map((song,i) => {
                                return <SongRow song={song} index={i} type="Album" album={albumDetails} albummainDiv={mainscreen}/>
                            }) : 
                            <SongRow song={albumDetails} index={0} type="Single" album={albumDetails}/>
                        }
                    </div>        
                </div>
                <div className="copyright1">
                    <img src={copyright} alt="" />
                    All the songs on Studio are pirated and we are aware of this being illegal.
                </div>
                <div className="copyright2">
                    <img src={copyright} alt="" />
                    We do not own any of the songs. This is just a project. Please do not sue us.
                </div>
                {/* <div className="dummy"></div> */}
                <ShowMoreAlbum moreAlbums={moreAlbums} albumartist={albumDetails.AlbumArtist}/>
            </div>
        </div>
    );
};
const SongRow = ({ song, index, type, album }) => {
    const artistArr = song.Artist ? song.Artist.split(", ") : [];
    const [playing, setPlaying] = CustomUseState(playingGlobal);
    const [albumSong, setAlbumForPlayer] = CustomUseState(albumGlobal);
    const [queue, setQueue] = CustomUseState(queueGlobal);
    const [songPaused, setSongPaused] = CustomUseState(songIsPausedGlobal);
    const [hidden, setHide] = useState(true);
    const [openerDetails, setOpenerDetails] = CustomUseState(openerGlobal);
    const [,setResObj] = CustomUseState(responseBar);
    const [isOpen, setIsOpen] = useState(false);
    actualIsOpen = openerDetails.open;
    if (!actualIsOpen && isOpen) setIsOpen(false);


    const setUpPlayer = (song) => {
        if (!playing) setPlaying(true);
        let newQueue = [];
        if (album.Type === "Album") {
            album.Tracks.forEach(each => {
                each.Album = album.Album;
                each.Color = album.Color;
                each.Thumbnail = album.Thumbnail;
            });
            newQueue = album.Tracks;
        }
        if (album.Type === "Single") {
            song.Color = album.Color;
            song.Thumbnail = album.Thumbnail;
            newQueue.push(song);
        }
        setQueue(newQueue);
        localStorage.setItem("queue",JSON.stringify(newQueue));
        if (albumSong !== song) setSongPaused(true);
        setAlbumForPlayer(song);
    };

    const addSongToQueue = () => {
        if (album.Type === "Album") {
            song.Album = album.Album;
        }
        song.Color = album.Color;
        song.Thumbnail = album.Thumbnail;
        song.Year = album.Year;
        queue.push(song);
        localStorage.setItem("queue",JSON.stringify(queue));
        setQueue(queue);
        setResObj({ open: true, msg: `Added '${song.Title || song.Album}' to queue` });
        setOpenerDetails({
            ...openerDetails,
            open: false
        });
    };

    const playNextInQueue = () => {
        if (queue.length !== 0) {
            if (album.Type === "Album") {
                song.Album = album.Album;
            }
            song.Color = album.Color;
            song.Thumbnail = album.Thumbnail;
            song.Year = album.Year;
            const index = queue.indexOf(albumSong);
            queue.splice(index+1,0,song);
            localStorage.setItem("queue",JSON.stringify(queue));
            setQueue(queue);
            setResObj({ open: true, msg: `Playing '${song.Title || song.Album}' next` });
        }
        setOpenerDetails({
            ...openerDetails,
            open: false
        });
    };

    const isCurrentlyPlaying = () => {
        const titleInSong = song.Title || false;
        const titleInAlbumSong = albumSong.Title || false;
        if (titleInSong && titleInAlbumSong) {
            return song.Title === albumSong.Title;
        } else if (!titleInSong && !titleInAlbumSong) {
            return song.Album === albumSong.Album;
        }
    };

    const handleSongMenu = (e) => {
        e.stopPropagation();
        setIsOpen(true);
        setOpenerDetails({
            open: !actualIsOpen,
            yValue: e.clientY + 10,
            xValue: e.clientX - 200,
            type: "song",
            data: [
                {
                    name: "Add song to queue",
                    func: addSongToQueue
                },
                {
                    name: "Play next",
                    func: playNextInQueue
                }
            ]
        });
    };

    const decide = () => {
        if (isOpen && openerDetails.open) {
            return false;
        } else {
            return hidden;
        }
    };


    return(
        <div className="songrow" onClick={() => setUpPlayer(song)}
        onMouseOver={() => setHide(false)} onMouseOut={() => setHide(true)}
        style={{ backgroundColor: decide() ? "transparent" : "rgba(255,255,255,0.1)" }}>
            <div className="number">
                {
                    isCurrentlyPlaying() && !songPaused ?
                    <div className="playinganim">
                        <div className="div1"></div>
                        <div className="div2"></div>
                        <div className="div3"></div>
                        <div className="div4"></div>
                    </div> : index+1
                }
            </div>
            <div className="songname">
                <div className="song" style={{ color: `${ isCurrentlyPlaying() && !songPaused ? "aquamarine" : "white" }` }}>
                    {
                        type === "Album" ? song.Title : song.Album
                    }
                </div>
                <div className="artistlist">
                    {
                        artistArr.map((artist,i) => {
                            return(
                                <>
                                    <p className="artistpara"
                                    onMouseOver={(e) => checkArtist(artist,e,"artist")}>{artist}</p>
                                    {
                                        artistArr.length > 1 && i !== artistArr.length-1 ?
                                        <div className="artistseparator"></div> : ""
                                    }
                                </>
                            );
                        })
                    }
                </div>
            </div>
            <div className="songduration">
                <div className={ decide() ? "beforesongduration hidden" : "beforesongduration" } onClick={handleSongMenu}>
                    <div className="songopenercontrol">
                        <div className="songopener1"></div>
                        <div className="songopener2"></div>
                        <div className="songopener3"></div>
                    </div>
                </div>
                {song.Duration || ""}
            </div>
        </div>
    );
};


const NewSongRow = ({ song, index, album, openerFunc }) => {
    const [hovered, setHovered] = useState(false);
    const [currentSong, setCurrentSong] = useContext(AlbumContext);
    const [songPaused, setSongPaused] = useContext(SongIsPausedContext);
    const [playing, setPlaying] = useContext(PlayerContext);
    const [queue, setQueue] = useContext(QueueContext);
    const [resp, setResp] = useContext(ResponseBarContext); 

    const isItSame = () => song._trackId === currentSong._trackId;

    const setUpPlayer = (song) => {
        if (isItSame()) {
            pauseOrPlay();
            return;
        }

        if (!playing) setPlaying(true);
        const newQueue = [];
        let playingSong;
        if (album.Type === "Album") {
            album.Tracks.forEach((each,i) => {
                const obj = { ...each, ...album };
                delete obj.Tracks;
                obj.id = global.id = i;
                if (obj._trackId === song._trackId) playingSong = obj;
                newQueue.push(obj);
            });
        }
        if (album.Type === "Single") {
            newQueue.push(song);
            playingSong = song;
        }
        setQueue(newQueue);
        localStorage.setItem("queue",JSON.stringify(newQueue));
        setSongPaused(true);
        setCurrentSong(playingSong);
        // setResp({
        //     ...resp,
        //     open: true,
        //     msg: `Playing '${song.Title || song.Album}' now`
        // });
    };

    const playButton = () => {
        // if (isItSame()) {
        //     pauseOrPlay();
        // }
        // if (decidePlayOrPause()) {
        //     pauseOrPlay();
        // } else {
        //     const main = album.Type === "Album" ? album.Tracks : [album];
        //     if (!playing) setPlaying(true);
        //     if (album.Type === "Single") {
        //         setQueue(main);
        //         setPlayingSong(main[0]);
        //     } else {
        //         main.forEach(song => {
        //             song.Album = album.Album;
        //             song.Thumbnail = album.Thumbnail;
        //             song.Color = album.Color;
        //             song.Year = album.Year;
        //         });
        //         setQueue(main);
        //         setPlayingSong(main[0]);
        //     }
        //     localStorage.setItem("queue",JSON.stringify(main));
        //     setSongPaused(true);
        // }
    };

    const handleMenu = e => {
        e.stopPropagation();
        const dimensions = { x: e.clientX, y: e.clientY };
        const windowDim = { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight };
        openerFunc(e, { dimensions, windowDim, song });
    };

    return(
        <div className="newsongrow" onMouseOver={() => setHovered(true)} onMouseOut={() => setHovered(false)}
        style={{ backgroundColor: `${ isItSame() ? "#202020" : "transparent" }` }}>
            <div className="outerindex">
                <img className={ hovered || isItSame() ? "outerindeximg" : "outerindeximg hidden" }
                src={ isItSame() && !songPaused ? PauseWhite : PlayWhite} alt="" onClick={() => setUpPlayer(song)}
                title={ isItSame() && !songPaused ? "Pause" : "Play" } />
                {
                    !hovered && !isItSame() ?
                    <div className="index">{index+1}</div> : ""
                }
            </div>
            <div className="songnameview">
                <div>{album.Type === "Album" ? song.Title : album.Album}</div>
            </div>
            <div className="artistnameview">
                <div>{album.Type === "Album" ? song.Artist : album.Artist}</div>
            </div>
            <div className="streams"></div>
            <div className="durationview">
                <div className="opener-container">
                    <div className={ hovered ? "openercontrol" : "openercontrol hidden" } style={{marginLeft: "0px"}}
                    onClick={handleMenu}
                    title="More Options">
                        <div className="opener1"></div>
                        <div className="opener2"></div>
                        <div className="opener3"></div>
                    </div>
                </div>
                <div className="durationcontainer">
                    <div>{album.Type === "Album" ? song.Duration : album.Duration}</div>
                </div>
            </div>
        </div>
    );
};

const NewActualAlbumView = () => {
    const params = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [album, setAlbum] = useState({});
    const [releaseDate, setReleaseDate] = useState("");
    const [playingSong, setPlayingSong] = useContext(AlbumContext);
    const [openerDetails, setOpenerDetails] = useContext(MenuContext);
    const [playing, setPlaying] = useContext(PlayerContext);
    const [songPaused, setSongPaused] = useContext(SongIsPausedContext);
    const [queue, setQueue] = useContext(QueueContext);
    const [,setResObj] = useContext(ResponseBarContext);
    const topDiv = useRef(null);
    const hist = useHistory();
    const currentLocation = useLocation();
    const list = ["tileopener","tileopener1","tileopener2","tileopener3"];
    isOpen = openerDetails.open;


    const decidePlayOrPause = () => playingSong._albumId === album._albumId;

    const addAlbumToQueue = () => {
        const main = album.Type === "Album" ? [ ...album.Tracks ] : { ...album };
        const mainQueue = [ ...queue ];
        const len = mainQueue.length;
        if (len === 0) return;
        if (album.Type === "Single") {
            main.id = ++global.id;
            mainQueue.push(main);
            localStorage.setItem("queue",JSON.stringify(mainQueue));
            setQueue(mainQueue);
            setResObj(prev => {
                return { ...prev, open: true, msg: `Added single to queue` };
            });
        } else {
            main.forEach(song => {
                const obj = { ...song, ...album, id: ++global.id };
                delete obj.Tracks;
                mainQueue.push(obj);
            });
            localStorage.setItem("queue",JSON.stringify(mainQueue));
            setQueue(mainQueue);
            setResObj(prev => {
                return { ...prev, open: true, msg: `Added album to queue` };
            });
        }
    };

    const playAlbumNext = () => {
        setOpenerDetails(prev => {
            return { ...prev, open: false };
        });
        const len = queue.length;
        if (len === 0) return;

        const index = queue.indexOf(playingSong);
        const mainQueue = [ ...queue ];
        if (album.Type === "Single") {
            album.id = ++global.id;
            mainQueue.splice(index+1, 0, { ...album });
        } else {
            album.Tracks.forEach((song,i) => {
                const obj = { ...song, ...album, id: ++global.id };
                delete obj.Tracks;
                mainQueue.splice(index+1+i, 0, obj);
            });
        }
        localStorage.setItem("queue",JSON.stringify(mainQueue));
        setQueue(mainQueue);
        setResObj(prev => {
            return { ...prev, open: true, msg: `Playing ${album.Album} next` };
        });
        // setOpenerDetails(prev => {
        //     return { ...prev, open: false };
        // });
    };

    const goBack = () => hist.goBack();

    const playButton = () => {
        if (decidePlayOrPause()) {
            pauseOrPlay();
            return;
        }

        const main = album.Type === "Album" ? [ ...album.Tracks ] : { ...album };
        if (!playing) setPlaying(true);
        if (album.Type === "Single") {
            main.id = global.id = 0;
            setQueue([main]);
            setPlayingSong(main);
        } else {
            for (let i=0; i<main.length; i++) {
                const obj = { ...album };
                delete obj.Tracks;
                main[i].id = global.id = i;
                main[i] = { ...main[i], ...obj };
            }
            setQueue(main);
            setPlayingSong(main[0]);
        }
        localStorage.setItem("queue",JSON.stringify(main));
        setSongPaused(true);
    };

    const call = async () => {
        const res = await sendRequest({
            method: "GET",
            endpoint: `/getAlbumDetails?albumId=${params.albumId}`
        });
        if (res) {
            setReleaseDate(dateToString(res.album.releaseDate));
            setAlbum(res.album);
            // setMoreAlbums(res.moreAlbums);
            setIsLoading(false);
            return;
        }
        hist.push(`${prefix}${basename}/homescreen`);
    };

    const addAndDisplay = () => {
        let min = 0, sec = 0;
        if (album.Type === "Album") {
            album.Tracks.forEach(track => {
                const dur = track.Duration.split(": ");
                min += parseInt(dur[0]);
                sec += parseInt(dur[1]);
            });
            min += Math.floor(sec/60);
            sec = sec%60;
        } else {
            const div = album.Duration.split(": ");
            min = parseFloat(div[0]);
            sec = parseFloat(div[1]);
        }
        return `${min} minutes${ sec !== 0 ? ` ${sec} seconds` : `` }`;
    };

    const shareAlbum = () => {
        setOpenerDetails(prev => {
            return { ...prev, open: false };
        });
        setResObj(prev => {
            return {
                ...prev,
                open: true,
                msg: "Album link copied to clipboard"
            };
        });
        navigator.clipboard.writeText(`${sharingBaseLink}/album/${album._albumId}`);
    };

    const handleMenu = e => {
        e.stopPropagation();
        const dimensions = { x: e.clientX, y: e.clientY };
        const data = [
            {
                name: `Play next in queue`,
                func: playAlbumNext
            },
            {
                name: "Share album",
                func: shareAlbum
            }
        ];
        setOpenerDetails(prev => {
            return {
                ...prev,
                open: true,
                xValue: dimensions.x + 5,
                yValue: dimensions.y + 5,
                data
            };
        });
    };

    const addTrackToQueue = each => {
        setOpenerDetails(prev => {
            return { ...prev, open: false };
        });
        const dummy = [ ...queue ];
        const len = dummy.length;
        if (len === 0) return;

        if (album.Type === "Album") {
            const obj = { ...each, ...album };
            delete obj.Tracks;
            each = obj;
        }
        dummy[len] = { ...each, id: ++global.id };
        setQueue(dummy);
        setResObj(prev => {
            return { ...prev, open: true, msg: `Added ${each.Title || each.Album} to queue` };
        });
    };

    const playTrackNext = each => {
        setOpenerDetails(prev => {
            return { ...prev, open: false };
        });
        if (queue.length === 0) return;

        // const curIndex = queue.indexOf(playingSong);
        const curIndex = queue.findIndex(e => e.id === playingSong.id);
        const dummy = [ ...queue ];
        if (album.Type === "Album") {
            const obj = { ...each, ...album };
            delete obj.Tracks;
            each = obj;
        }
        dummy.splice(curIndex+1, 0, { ...each, id: ++global.id });
        setQueue(dummy);
        setResObj(prev => {
            return { ...prev, open: true, msg: `Playing ${each.Title || each.Album} next` };
        });
    };

    const shareTrack = selectedSong => {
        setOpenerDetails(prev => {
            return { ...prev, open: false };
        });
        setResObj(prev => {
            return {
                ...prev,
                open: true,
                msg: "Track link copied to clipboard"
            };
        });
        navigator.clipboard.writeText(`${sharingBaseLink}/track/${album._albumId}/${selectedSong._trackId}`);
    };

    const handleEachMenu = (e, { dimensions, windowDim, song: selectedSong }) => {
        e.stopPropagation();
        const data = [
            {
                name: "Add track to queue",
                func: () => addTrackToQueue(selectedSong)
            },
            {
                name: "Play track next",
                func: () => playTrackNext(selectedSong)
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

    const documentClick = e => {
        if (!list.includes(e.target.className) && isOpen) {
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
        setIsLoading(true);
    }, [currentLocation.pathname]);

    useEffect(() => {
        if (isLoading) {
            call();
        }
        topDiv.current = document.querySelector(".newalbum");
        // document.addEventListener("click", documentClick);
        // topDiv.current && topDiv.current.addEventListener("scroll", documentScroll);
        return () => {
            // document.removeEventListener("click", documentClick);
            // topDiv.current && topDiv.current.removeEventListener("scroll", documentScroll);
        };
    }, [isLoading]);


    if (isLoading) {
        return <MidPanelLoader/>;
    }
    return (
        <div className="newalbum">
            <div className="topalbumview">
                {/* <div className="backbuttoncontainer">
                    <div className="backbuttonview" onClick={goBack}>
                        <img src={BackButton} alt="" />
                    </div>
                </div> */}
                <div className="coverview">
                    <img src={album.Thumbnail} alt="" />
                </div>
                <div className="detailsview">
                    <div className="innerdetailsview">
                        <div className="albumnameview">{album.Album}</div>
                        <div style={{width: "100%", height: "10px"}}></div>
                        <div className="detailsoneview">
                            <div className="albumtype">{album.Type}</div>
                            <div className="content-separator"><div></div></div>
                            {
                                album.AlbumArtist.split(", ").length > 1 ? 
                                album.AlbumArtist.split(", ").map((each,i) => {
                                    return (
                                        <>
                                            <div className="albumartistview">{each}</div>
                                            {
                                                i !== album.AlbumArtist.split(", ").length-1 ?
                                                <div className="content-separator"><div></div></div> : ""
                                            }
                                        </>
                                    );
                                }) :
                                <div className="albumartistview">{album.AlbumArtist}</div>
                            }
                            <div className="content-separator"><div></div></div>
                            <div className="albumyear">{album.Year}</div>
                        </div>
                        <div className="detailsoneview">
                            <div className="albumtype">
                                { album.Type === "Single" ? "1 Song" : album.Tracks.length > 1 ? `${album.Tracks.length} songs` : "1 song" }
                            </div>
                            <div className="content-separator"><div></div></div>
                            <div className="albumtype">{addAndDisplay()}</div>
                        </div>
                        <div style={{width: "100%", height: "10px"}}></div>
                        <div className="detailsoneview">
                            <div className="albumtype">
                                {releaseDate}
                            </div>
                        </div>
                        <div style={{width: "100%", height: "30px"}}></div>
                        <div className="buttonholder">
                            <Button className="playbuttonview" onClick={playButton}>
                                {
                                    decidePlayOrPause() && !songPaused ?
                                    <><img src={Pause} alt="" /><p>PAUSE</p></> :
                                    <><img src={Play} alt="" /><p>PLAY</p></>
                                }
                            </Button>
                            <Button className="addtoqueue" onClick={addAlbumToQueue}>
                                <img src={AddButton} alt="" />
                                ADD TO QUEUE
                            </Button>
                            <div className="opener-holder">
                                <div className="tileopener" title="More Options" onClick={handleMenu}>
                                    <div className="tileopener1"></div>
                                    <div className="tileopener2"></div>
                                    <div className="tileopener3"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div style={{width: "100%", height: "50px"}}></div>
            <div className="bottomalbumview">
                {
                    album.Type === "Single" ?
                    <NewSongRow song={album} index={0} album={album} openerFunc={handleEachMenu} /> :
                    album.Tracks.map((each,i) => {
                        return <NewSongRow song={each} index={i} album={album} openerFunc={handleEachMenu} />
                    })
                }
            </div>
            <div style={{width: "100%", height: "20px"}}></div>
            <div className="copyright1">
                <img src={copyright} alt="" />
                {`All the songs on Studio Music ${String.fromCharCode(8482)} are pirated and we are aware of this being illegal.`}
            </div>
            <div className="copyright2">
                <img src={copyright} alt="" />
                We do not own any of the songs. This is just a project. Please do not sue us.
            </div>
            { playing ? <div style={{width: "100%", height: "100px"}}></div> : null }
        </div>
    );
};



export default NewActualAlbumView;