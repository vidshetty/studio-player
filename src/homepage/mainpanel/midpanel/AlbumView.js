import { useState, useEffect, useRef } from "react";
import "../../../css/albumview.css";
import {
    CustomUseState,
    playingGlobal,
    routesGlobal,
    tabGlobal,
    // keepButtonGlobal,
    // onClickFuncGlobal,
    // topTitleGlobal,
    // topBgColor,
    topBarGlobal,
    checkArtist,
    albumGlobal,
    queueGlobal,
    queueOpenedGlobal,
    songIsPausedGlobal,
    openerGlobal,
    responseBar,
    sendRequest
} from "../../../common";
import { MidPanelLoader } from "./index";
import { HorizontalList } from "./HomeScreen";
import { useParams, Redirect } from "react-router-dom";
import play from "../../../assets/playwhite.png";
import pause from "../../../assets/pausewhite.png";
import copyright from "../../../assets/copyright.png";
import Placeholder from "../../../assets/placeholder.svg";
import Queue from "./Queue";
import { pauseOrPlay } from "../../../homepage";
let mainscreen, actualIsOpen, bgChanged = false, topBar;


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

const AlbumView = () => {
    const [queueOpened,] = CustomUseState(queueOpenedGlobal);

    if (queueOpened) {
        return <Queue/>
    }
    return <ActualAlbumView/>
};


export default AlbumView;