import "../../../css/homestyles.css";
import "../../../css/teststyles.css";
import "../../../css/hometeststyles.css";
import { MidPanelLoader } from "./index";
import React, { useEffect, useState } from "react";
import { Redirect, useHistory } from "react-router-dom";
import playbutton from "../../../assets/playwhite.png";
import pausebutton from "../../../assets/pausewhite.png";
import Close from "../../../assets/deletewhite.svg";
import Play from "../../../assets/playbutton-white.svg";
import Pause from "../../../assets/pausebutton-white.svg";
import Placeholder from "../../../assets/placeholder.svg";
import {
    CustomUseState,
    routesGlobal,
    queueOpenedGlobal,
    sendRequest,
    topBarGlobal,
    openerGlobal,
    albumGlobal,
    songIsPausedGlobal,
    playingGlobal,
    queueGlobal,
    topBgColorGlobal,
    modifyLibrary,
    checkX,
    checkY,
    prefix,
    global,
    responseBar,
    radioGlobal
} from "../../../common";
import Queue from "./Queue";
import Button from "../../../Button";
import { pauseOrPlay } from "../../../homepage";
let topBar, actualIsOpen;


const EachInList = ({ addCloseButton, closeFunc, item }) => {
    const [routes, setRoutes] = CustomUseState(routesGlobal);
    const [redirectTo, setRedirectTo] = useState("");
    const [song, setAlbumForPlayer] = CustomUseState(albumGlobal);
    const [songPaused, setSongPaused] = CustomUseState(songIsPausedGlobal);
    const [playing, setPlaying] = CustomUseState(playingGlobal);
    const [, setQueue] = CustomUseState(queueGlobal);
    let songPausedLocal = songPaused;


    const display = item => {
        routes.push(`/home/album/${item.Album}`);
        setRoutes(routes);
        setRedirectTo(`${item.Album}`);
    };

    const handlePlayPause = (e) => {
        e.stopPropagation();
        if (song.Album === item.Album) {
            pauseOrPlay();
            return;
        }
        const main = item.Type === "Album" ? item.Tracks : [item];
        if (!playing) setPlaying(true);
        if (item.Type === "Single") {
            setQueue(main);
            setAlbumForPlayer(main[0]);
        } else {
            main.forEach(song => {
                song.Album = item.Album;
                song.Thumbnail = item.Thumbnail;
                song.Color = item.Color;
            });
            setQueue(main);
            setAlbumForPlayer(main[0]);
        }
        localStorage.setItem("queue",JSON.stringify(main));
        setSongPaused(true);
    };

    const handleMenu = (e) => {
        e.preventDefault();
    };

    if (redirectTo !== "") {
        return <Redirect to={`/home/album/${redirectTo}`} />
    }
    return(
        <div className="cover">
            {
                addCloseButton ? 
                <div className="crossinsearch" onClick={() => closeFunc(item)}>
                    <img src={Close} alt="" />
                </div> : ""
            }
            <div className="inner" 
            onClick={() => display(item)}
            onContextMenu={handleMenu}
            >
                {
                    // noBg ?
                    // <img src={item.Thumbnail} alt="" className="innercoverimg"/> :
                    // <div className="coverimg"
                    // style={{ backgroundImage: `url(${Placeholder})`, backgroundSize: "cover" }}
                    // >
                        <img src={item.Thumbnail} alt="" className="innercoverimg"/>
                    // </div>
                }
                <p className="album">{item.Album}</p>
                <p className="artist">{item.AlbumArtist}</p>
                {/* <div className={ show ? "blackblurtop" : "blackblurtop hidden" }></div>
                <div className={ show ? "blackblurbottom" : "blackblurbottom hidden" }></div> */}
                <div className={ (!songPausedLocal && song.Album === item.Album) ? "floater-stay" : "floater" }>
                    <div className="rowplaybutton" onClick={handlePlayPause}>
                        <img src={ !songPausedLocal && song.Album === item.Album ? pausebutton : playbutton } alt="" />
                    </div>
                </div>
            </div>
        </div>
    );
};
export const HorizontalList = ({ list, addCloseButton = false, closeFunc = ()=>{} }) => {
    // const [redirectTo, setRedirectTo] = useState("");
    // const [, setTab] = CustomUseState(tabGlobal);
    // const [routes, setRoutes] = CustomUseState(routesGlobal);
    // const [openerDetails, setOpenerDetails] = CustomUseState(openerGlobal);
    // actualIsOpen = openerDetails.open;

    // const handleMenu = (e) => {
    //     e.stopPropagation();
    //     e.preventDefault();
    //     setOpenerDetails({
    //         open: !actualIsOpen,
    //         yValue: e.clientY,
    //         xValue: e.clientX,
    //         type: "album",
    //         data: [
    //             {
    //                 name: "Add album to queue",
    //                 func: () => {}
    //             },
    //             {
    //                 name: `Play next`,
    //                 func: () => {}
    //             }
    //         ]
    //     });
    // };

    // if (redirectTo !== "") {
    //     return <Redirect to={`/home/album/${redirectTo}`} />
    // }
    return(
        <>
        <div className="innerlist">
            {
                list.map((item,i) => {
                    if (i<5) {
                        return(
                            <EachInList addCloseButton={addCloseButton} closeFunc={closeFunc} item={item} />
                        );
                    }
                    return null;
                })
            }
        </div>
        </>
    );
};
const EachTile = ({ mouseOver, mouseOut, album }) => {
    let songPausedLocal;
    const [redirectTo, setRedirectTo] = useState("");
    const [routes, setRoutes] = CustomUseState(routesGlobal);
    const [song, setAlbumForPlayer] = CustomUseState(albumGlobal);
    const [songPaused, setSongPaused] = CustomUseState(songIsPausedGlobal);
    const [playing, setPlaying] = CustomUseState(playingGlobal);
    const [, setQueue] = CustomUseState(queueGlobal);
    songPausedLocal = songPaused;

    const moveOver = (album,e) => {
        e.stopPropagation();
        routes.push(`/home/album/${album}`);
        setRoutes(routes);
        setRedirectTo(`${album}`);
    };
    
    const handlePlayPause = (e) => {
        e.stopPropagation();
        // console.log("album",album,"song",song);
        if (song.Album === album.Album) {
            pauseOrPlay();
            return;
        }
        const main = album.Type === "Album" ? album.Tracks : [album];
        if (!playing) setPlaying(true);
        if (album.Type === "Single") {
            setQueue(main);
            setAlbumForPlayer(main[0]);
        } else {
            main.forEach(song => {
                song.Album = album.Album;
                song.Thumbnail = album.Thumbnail;
                song.Color = album.Color;
            });
            setQueue(main);
            setAlbumForPlayer(main[0]);
        }
        localStorage.setItem("queue",JSON.stringify(main));
        setSongPaused(true);
    };

    if (redirectTo !== "") {
        return <Redirect to={`/home/album/${redirectTo}`} />
    }
    return(
        <div className="rowfirst"
        onMouseOver={() => mouseOver(album.Color)}
        onClick={(e) => moveOver(album.Album,e)}
        onMouseOut={mouseOut}>
            <img src={album.Thumbnail} alt="" className="rowimage" />
            <div className="rowname">{album.Album}</div>
            <div className={  (!songPausedLocal && song.Album === album.Album) ? 
            "rowplaybuttoncontainer-stay" : "rowplaybuttoncontainer" }>
                <div className="rowplaybutton" onClick={handlePlayPause}>
                    <img src={ !songPausedLocal && song.Album === album.Album ? pausebutton : playbutton } alt="" />
                </div>
            </div>
        </div>
    );
};
const EachRow = ({ row, mouseOver, mouseOut }) => {
    return(
        <div className="row">
            {
                row.map(each => {
                    return(
                        <EachTile mouseOver={mouseOver} mouseOut={mouseOut} album={each} />
                    );
                })
            }
            {/* <div className="rowfirst"></div>
            <div className="rowfirst"></div> */}
        </div>
    );
};
const TopDisplay = ({ mostPlayed, mouseOver, mouseOut }) => {
    const { title, list } = mostPlayed;

    return(
        <div className="shortcuts">
            <div className="bigmaintitle">
                <p>{title}</p>
            </div>
            <div style={{ width: "100%", height: "15px" }}></div>
            {
                Object.keys(list).map(each => {
                    return(
                        <EachRow row={list[each]} mouseOver={mouseOver} mouseOut={mouseOut}/>
                    );
                })
            }
            <div style={{ width: "100%", height: "15px" }}></div>
        </div>
    );
};
const ActualHomeScreen = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [all, setAll] = useState({});
    const [played, setPlayed] = useState({});
    const [topBarConfig, setTopBarConfig] = CustomUseState(topBarGlobal);
    const [bg, setBg] = useState("");
    const [openerDetails, setOpenerDetails] = CustomUseState(openerGlobal);
    const [, setTopBgColor] = CustomUseState(topBgColorGlobal);
    actualIsOpen = openerDetails.open;
    topBar = topBarConfig;

    const mouseOut = () => {
        const { list } = played;
        if (Object.keys(list).length === 0) {
            // setBg(`#121212`);
            // setTopBgColor("#202020");
            setTopBgColor("#252525");
            return;
        }
        let color = list[0][0].Color.split(",");
        let another = color;
        color[3] = "0.3)";
        color = color.join(",");
        setBg(color);
        another[3] = "0.3)";
        another = another.join(",");
        setTopBgColor(another);
        // return color;
    };

    const mouseOver = (color) => {
        let changedColor = color.split(",");
        changedColor[3] = "0.3)";
        changedColor = changedColor.join(",");
        setBg(changedColor);
    };

    const scrollHandler = (e) => {
        const top = e.currentTarget.scrollTop;
        sessionStorage.setItem("home-scroll",top);
        if (Object.keys(played.list).length === 0) {
            setTopBarConfig({
                ...topBar,
                // bgColor: bg
                bgColor: "#252525"
            });
            return;
        }
        if (top > 200 && topBar.bgColor === "transparent") {
            setTopBarConfig({
                ...topBar,
                bgColor: bg
            });
        }
        if (top < 200 && topBar.bgColor !== "transparent") {
            setTopBarConfig({
                ...topBar,
                bgColor: "transparent"
            });
        }
        if (actualIsOpen) {
            setOpenerDetails({
                ...openerDetails,
                open: false
            });
        }
    };

    useEffect(() => {
        const call = async () => {
            const res = await sendRequest({
                method: "GET",
                endpoint: `/getHomeAlbums`
            });
            setAll(res.albums);
            setPlayed(res.mostPlayed);
            setIsLoading(false);
        };
        if (isLoading) {
            call();
        } else {
            const main = document.querySelector(".main");
            main.scrollTop = sessionStorage.getItem("home-scroll") || 0;
            mouseOut();
        }
        setTopBarConfig({
            ...topBar,
            button: false,
            bgColor: "transparent"
        });
    }, [isLoading]);

    const list = ["New Releases","Recently Added","Most Played","On Loop","More Like DIVINE"];

    if (isLoading) {
        return <MidPanelLoader />
    }
    return(
        <div className="homescreen">
            <div className="main" onScroll={scrollHandler}>
                <div className="colourtop"
                style={ Object.keys(played.list).length !== 0 ?
                    // { backgroundImage: `linear-gradient(${bg},#121212)` } : 
                    { backgroundColor: `${bg}` } : 
                    // { backgroundImage: `linear-gradient(rgba(127,255,212,0.2),#121212,#121212,#121212)` } }
                    // { backgroundColor: `#121212` } }
                    { backgroundColor: `#252525` } }
                >
                    <div className="forblur"></div>
                </div>
                <div className="noncolour">
                    {
                        Object.keys(played.list).length !== 0 ? <TopDisplay mostPlayed={played} mouseOver={mouseOver} mouseOut={mouseOut}/> : ""
                    }
                    {   
                        Object.keys(all).map((key,i) => {
                            if (all[key].length !== 0) {
                                return(
                                    <div className="outline">
                                        <div className={ i === 0 && Object.keys(played.list).length === 0 ? "bigmaintitle" : "maintitle" }>
                                            <p>{key}</p>
                                            {/* { all[key].length > 5 ?
                                                <div className="viewmore">
                                                    <p>VIEW MORE</p>
                                                </div> : ""
                                            } */}
                                        </div>
                                        <div className="list">
                                            <HorizontalList list={all[key]} />
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })
                    }
                </div>
            </div>
        </div>
    );
};
const QuickPickRow = ({ row }) => {
    return(
        <div className="quickpickrow">
            {
                row.map(item => {
                    return <EachInQuickPick song={item} />
                })
            }
        </div>
    );
};


const EachInQuickPick = ({
    song,
    openerFunc,
    openerDetails,
    setOpenerDetails,
    playing,
    setPlaying,
    queue,
    setQueue,
    songIsPaused,
    setSongIsPaused,
    playingSong,
    setPlayingSong,
    radio,
    setRadio,
    setResObj
}) => {
    const [hovered, setHovered] = useState(false);

    const handleMenu = e => {
        e.stopPropagation();
        const dimensions = { x: e.clientX, y: e.clientY };
        const windowDim = { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight };
        openerFunc(e, { dimensions, windowDim, song });
    };

    const determine = () => {
        const nameOfSong = song.Title || song.Album;
        const nameOfPlayingSong = playingSong.Title || playingSong.Album;
        if (nameOfSong === nameOfPlayingSong) {
            return true;
        }
        return false;
    };

    const handlePlayPause = async e => {
        e.stopPropagation();
        if (openerDetails.open) {
            setOpenerDetails({ ...openerDetails, open: false });
        }
        if (determine()) {
            pauseOrPlay();
            return;
        }
        const main = { ...song };
        if (!playing) setPlaying(true);
        main.id = global.id = 0;
        const newqueue = [main];
        setQueue([main]);
        setPlayingSong(main);
        localStorage.setItem("queue",JSON.stringify([main]));
        setSongIsPaused(true);
        if (!radio) {
            setResObj({ open: true, msg: "Starting radio...." });
            setRadio(true);
            const songList = await sendRequest({
                method: "GET",
                endpoint: `/startradio?exclude=${song.Title || song.Album}`
            });
            songList.forEach(each => {
                each.id = ++global.id;
            });
            newqueue.push(...songList);
            setQueue(newqueue);
            localStorage.setItem("queue",JSON.stringify(newqueue));
            setRadio(false);
        }
    };

    return(
        <div className="eachinquick" onMouseOver={() => setHovered(true)} onMouseOut={() => setHovered(false)}>
            <div className="tile-art">
                <img src={song.Thumbnail || ""} alt="" />
                <div className="tiledummyshadow">
                    {/* <img src={Play} alt="" /> */}
                    <Button className="tile-button" onClick={handlePlayPause}>
                        {
                            determine() ?
                            <img src={ songIsPaused ? Play : Pause } alt="" /> :
                            <img src={Play} alt="" />
                        }
                    </Button>
                </div>
                {
                    !hovered && determine() ? 
                    <div className="anim-cover">
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
            <div className={ hovered ? "tile-details-short" : "tile-details" }>
                <div className="tile-title">{song.Title || song.Album}</div>
                <div className="tile-artist">
                    <p>{song.Artist}</p>
                    <div className="home-separator"><div></div></div>
                    <p>{song.Album}</p>
                </div>
            </div>
            <div className={ hovered ? "tile-last" : "tile-last-hidden" }>
                <div className="tileopener" onClick={handleMenu}>
                    <div className="tileopener1"></div>
                    <div className="tileopener2"></div>
                    <div className="tileopener3"></div>
                </div>
            </div>
        </div>
    );
};

const StartRadio = (props) => {
    const { picks } = props;

    return(
        <>
            <div className="hugetitlename">
                <div className="top-title">START RADIO FROM A SONG</div>
                <div className="bottom-title">Quick Picks</div>
            </div>
            <div className="quickpick-container">
                <div className="quickpick-grid">
                    {
                        picks.map(item => {
                            return <EachInQuickPick song={item} {...props} />
                        })
                    }
                </div>
            </div>
        </>
    );
};

const EachAlbum = ({ item }) => {
    const [song,] = CustomUseState(albumGlobal);
    const [songPaused,] = CustomUseState(songIsPausedGlobal);
    let songPausedLocal = songPaused;

    const handleMenu = e => {};

    const handlePlayPause = e => {};

    if (Object.keys(item).length > 0) {
        return(
            <div className="homealbum">
                <div className="innerhomealbum">
                    <div className="homeartcover">
                        <div className="homedummyshadow"></div>
                        <div className={ (song.Album === item.Album) ? "homeplaybuttonfixed" : "homeplaybutton" }>
                            <Button className="innerhomeplaybutton" onClick={handlePlayPause}>
                                <img src={ (!songPausedLocal && song.Album === item.Album) ? Pause : Play} alt="" />
                            </Button>
                        </div>
                        <div className="libraryopener" onClick={handleMenu}>
                            <div className="libraryopener1"></div>
                            <div className="libraryopener2"></div>
                            <div className="libraryopener3"></div>
                        </div>
                        <img src={item.Thumbnail || ""} alt="" />
                    </div>
                    <div className="homealbumname">{item.Title || item.Album}</div>
                    <span className="homeartistname">
                        <span>{item.AlbumArtist}</span>
                    </span>
                </div>
            </div>
        );
    }
    return <div style={{ width: "15%", height: "100%" }}></div>
};

const NewActualHomeScreen = () => {
    const [openerDetails, setOpenerDetails] = CustomUseState(openerGlobal);
    const [playingSong, setPlayingSong] = CustomUseState(albumGlobal);
    const [queue, setQueue] = CustomUseState(queueGlobal);
    const [playing, setPlaying] = CustomUseState(playingGlobal);
    const [songIsPaused, setSongIsPaused] = CustomUseState(songIsPausedGlobal);
    const [,setResObj] = CustomUseState(responseBar);
    const [radio, setRadio] = CustomUseState(radioGlobal);
    // const [redirectTo, setRedirectTo] = useState("");
    // const [routes, setRoutes] = CustomUseState(routesGlobal);
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState({});
    const [picks, setPicks] = useState({});
    const list = ["tileopener","tileopener1","tileopener2","tileopener3"];
    const hist = useHistory();
    actualIsOpen = openerDetails.open;

    const call = async () => {
        let res = await sendRequest({
            method: "GET",
            endpoint: `/getHomeAlbums`
        });
        if (res) {
            // res.albums = modifyLibrary(res.albums,6);
            setData(res.albums);
            setPicks(res.quickPicks);
            // setPlayed(res.mostPlayed);
            // ipcRenderer.send("response",res.albums);
            setIsLoading(false);
        }
    };

    const goToAlbum = song => {
        // routes.push(`/home/album/${song.Album}`);
        // setRoutes(routes);
        setOpenerDetails({ ...openerDetails, open: false });
        hist.push(`${prefix}/home/album/${song.Album}`);
        // hist.push(`/`);
        // setRedirectTo(`${song.Album}`);
    };

    const addTrackToQueue = song => {
        setOpenerDetails({ ...openerDetails, open: false });
        const dummy = [ ...queue ];
        const len = dummy.length;
        if (len === 0) return;
        dummy[len] = { ...song, id: ++global.id };
        setQueue(dummy);
        setResObj({ open: true, msg: `Added ${song.Title || song.Album} to queue` });
    };

    const playTrackNext = song => {
        setOpenerDetails({ ...openerDetails, open: false });
        if (queue.length === 0) return;
        const curIndex = queue.indexOf(playingSong);
        const dummy = [ ...queue ];
        dummy.splice(curIndex+1, 0, { ...song, id: ++global.id });
        setQueue(dummy);
        setResObj({ open: true, msg: `Playing ${song.Title || song.Album} next` });
    };

    const handleMenu = (e, { dimensions, windowDim, song: album }) => {
        const data = [
            {
                name: "Go to album",
                func: () => goToAlbum(album)
            },
            {
                name: "Add to queue",
                func: () => addTrackToQueue(album)
            },
            {
                name: "Play next",
                func: () => playTrackNext(album)
            }
        ];
        e.stopPropagation();
        setOpenerDetails({
            ...openerDetails,
            open: true,
            xValue: checkX(dimensions.x, windowDim.width),
            yValue: checkY(dimensions.y, windowDim.height, data.length),
            data
        });
    };

    const documentClick = e => {
        if (!list.includes(e.target.className) && actualIsOpen) {
            setOpenerDetails({
                ...openerDetails,
                open: false
            });
        }
    };

    useEffect(() => {
        if (isLoading) {
            call();
        }
        // document.addEventListener("click",documentClick);
        return () => {
            // document.removeEventListener("click",documentClick);
        };
    },[isLoading]);

    
    if (isLoading) {
        return <MidPanelLoader/>
    }
    return(
        <div className="newhome" style={{ overflowY: `${ openerDetails.open ? "hidden" : "overlay" }` }}>
            {
                picks.length !== 0 ?
                <StartRadio picks={picks} openerFunc={handleMenu} openerDetails={openerDetails} setOpenerDetails={setOpenerDetails}
                playing={playing} setPlaying={setPlaying} playingSong={playingSong} setPlayingSong={setPlayingSong}
                queue={queue} setQueue={setQueue} songIsPaused={songIsPaused} setSongIsPaused={setSongIsPaused}
                radio={radio} setRadio={setRadio} setResObj={setResObj} /> : null
            }
            {
                Object.keys(data).map(each => {
                    if (data[each].length !== 0) {
                        return(
                            <>
                            <div className="titlename">{each}</div>
                            <div className="homecontainer">
                                {
                                    data[each].map(item => {
                                        return <EachAlbum item={item} />;
                                    })
                                }
                            </div>
                            </>
                        );
                    }
                    return null;
                })
            }
        </div>
    );
};


const Trial = () => {
    return (
        <div className="full">
            <div className="holder">
                <img src="https://lh3.googleusercontent.com/6QoxkfogQhGl7_QvGaOh1g5jqf5Y_3Vyo1wPMSJJMhHUxGgaSdsyLhiyGwyeZUo3c2P0045fn5eLza0n=w544-h544-l90-rj"
                alt="" />
            </div>
        </div>
    );
};


const HomeScreen = () => {
    // const [queueOpened,] = CustomUseState(queueOpenedGlobal);

    // if (queueOpened) {
    //     return <Queue/>
    // }
    return <NewActualHomeScreen/>
    // return <Trial/>
};

export default HomeScreen;