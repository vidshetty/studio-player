import "../../../css/homestyles.css";
import "../../../css/teststyles.css";
import "../../../css/hometeststyles.css";
import { MidPanelLoader } from "./index";
import React, { useEffect, useState, useContext } from "react";
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
    basename,
    global,
    responseBar,
    radioGlobal,
    sharingBaseLink
} from "../../../common";
import Queue from "./Queue";
import Button from "../../../Button";
import { pauseOrPlay } from "../../../homepage";
import {
    AlbumContext,
    MenuContext,
    PlayerContext,
    QueueContext,
    RadioContext,
    ResponseBarContext,
    SongIsPausedContext
} from "../../../index";
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
    playingSong,
    setPlayingSong,
    setQueue,
    songIsPaused,
    setSongIsPaused,
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

    const determine = () => playingSong._trackId === song._trackId;

    const handlePlayPause = async e => {
        e.stopPropagation();
        if (openerDetails.open) {
            setOpenerDetails(prev => {
                return { ...prev, open: false };
            });
        }
        if (determine()) {
            pauseOrPlay();
            return;
        }
        const main = { ...song };
        main.id = global.id = 0;
        const newqueue = [main];
        setQueue(newqueue);
        setPlayingSong(main);
        if (!playing) setPlaying(true);
        localStorage.setItem("queue",JSON.stringify([main]));
        setSongIsPaused(true);
        if (!radio) {
            setResObj(prev => {
                return { ...prev, open: true, msg: "Starting radio...." };
            });
            setRadio(true);
            const songList = await sendRequest({
                method: "GET",
                endpoint: `/startradio?exclude=${song._trackId}&type=qr`
            });
            if (songList) {
                songList.forEach(each => {
                    each.id = ++global.id;
                });
                newqueue.push(...songList);
                setQueue(newqueue);
                localStorage.setItem("queue",JSON.stringify(newqueue));
            }
            setRadio(false);
        }
    };

    return(
        <div className="eachinquick" onMouseOver={() => setHovered(true)} onMouseOut={() => setHovered(false)} title={song.Title || song.Album}>
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
                    <div className="keepdummyshadow">
                        <Button className="tile-button" onClick={handlePlayPause}>
                            {
                                determine() ?
                                <img src={ songIsPaused ? Play : Pause } alt="" /> :
                                <img src={Play} alt="" />
                            }
                        </Button>
                    </div> : null
                }
                {/* {
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
                } */}
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
                <div className="tileopener" onClick={handleMenu} title="More Options">
                    <div className="tileopener1"></div>
                    <div className="tileopener2"></div>
                    <div className="tileopener3"></div>
                </div>
            </div>
        </div>
    );
};

const StartRadio = props => {
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

const EachAlbum = ({ item, openerFunc, playPauseFunc }) => {
    const [song,] = useContext(AlbumContext);
    const [songPaused,] = useContext(SongIsPausedContext);
    let songPausedLocal = songPaused;
    const hist = useHistory();

    const goToAlbum = () => {
        setTimeout(() => {
            hist.push(`${prefix}${basename}/album/${item._albumId}`);
        },500);
    };

    const goToAlbumName = e => {
        hist.push(`${prefix}${basename}/album/${item._albumId}`);
    };

    const handleMenu = e => {
        e.stopPropagation();
        const dimensions = { x: e.clientX, y: e.clientY };
        const windowDim = { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight };
        openerFunc(e, { dimensions, windowDim, album: item });
    };

    const handlePlayPause = e => {
        e.stopPropagation();
        playPauseFunc(item);
    };

    if (Object.keys(item).length > 0) {
        return(
            <div className="homealbum">
                <div className="innerhomealbum">
                    <Button className="homeartcover" onClick={goToAlbum} title={item.Album}>
                        <div className="homedummyshadow"></div>
                        <div className={ (song.Album === item.Album) ? "homeplaybuttonfixed" : "homeplaybutton" }>
                            <Button className="innerhomeplaybutton" onClick={handlePlayPause}
                            title={ (!songPausedLocal && song.Album === item.Album) ? "Pause" : "Play" }>
                                <img src={ (!songPausedLocal && song.Album === item.Album) ? Pause : Play} alt="" />
                            </Button>
                        </div>
                        <div className="homeopener" onClick={handleMenu} title="More Options">
                            <div className="homeopener1"></div>
                            <div className="homeopener2"></div>
                            <div className="homeopener3"></div>
                        </div>
                        <img src={item.Thumbnail || ""} alt="" />
                    </Button>
                    <div className="homealbumname" onClick={goToAlbumName}>{item.Title || item.Album}</div>
                    <span className="homeartistname">
                        <span>{item.AlbumArtist}</span>
                    </span>
                </div>
            </div>
        );
    }
    return <div style={{ width: "15%", height: "100%" }}></div>
};

const EachAlbumInRP = ({ album, songIsPaused, song, openerFunc, handlePlayPause }) => {
    const playPause = e => {
        e.stopPropagation();
        handlePlayPause(album);
    };

    const handleMenu = e => {
        e.stopPropagation();
        const dimensions = { x: e.clientX, y: e.clientY };
        const windowDim = { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight };
        openerFunc(e, { dimensions, windowDim, album });
    };

    return(
        <div className="homealbum">
            <div className="innerhomealbum">
                <div className="homeartcover" title={album.Album}>
                    <div className={ (song.Album === album.Album) ? "rpdummyshadowfixed" : "rpdummyshadow" }></div>
                    <div className={ (song.Album === album.Album) ? "rp-buttonfixed" : "rp-button" }>
                        <Button className="innerrpbutton" onClick={playPause}
                        title={ (!songIsPaused && song.Album === album.Album) ? "Pause" : "Play" }>
                            <img src={ (!songIsPaused && song.Album === album.Album) ? Pause : Play} alt="" />
                        </Button>
                    </div>
                    <div className="homeopener" onClick={handleMenu} title="More Options">
                        <div className="homeopener1"></div>
                        <div className="homeopener2"></div>
                        <div className="homeopener3"></div>
                    </div>
                    <img src={album.Thumbnail || ""} alt="" />
                </div>
                <div className="rpalbumname">{album.Title || album.Album}</div>
                <span className="homeartistname">
                    <span>{album.AlbumArtist}</span>
                </span>
            </div>
        </div>
    );
};

const RecentlyPlayed = (props) => {
    const { played } = props;

    return(
        <>
        <div className="hugetitlename">
            <div className="top-title">FROM YOUR HISTORY</div>
            <div className="bottom-title">Listen Again</div>
        </div>
        <div style={{width: "100%", height: "10px"}}></div>
        <div className="homecontainer">
            {
                played.map(each => {
                    return <EachAlbumInRP album={each} {...props} />;
                })
            }
        </div>
        </>
    );
};

const NewActualHomeScreen = () => {
    const [openerDetails, setOpenerDetails] = useContext(MenuContext);
    const [playing, setPlaying] = useContext(PlayerContext);
    const [playingSong, setPlayingSong] = useContext(AlbumContext);
    const [songIsPaused, setSongIsPaused] = useContext(SongIsPausedContext);
    const [queue, setQueue] = useContext(QueueContext);
    const [,setResObj] = useContext(ResponseBarContext);
    const [radio, setRadio] = useContext(RadioContext);
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState({});
    const [picks, setPicks] = useState({});
    const [recentlyPlayed, setRecentlyPlayed] = useState([]);
    const list = ["tileopener","tileopener1","tileopener2","tileopener3"];
    const hist = useHistory();
    actualIsOpen = openerDetails.open;

    const call = async () => {
        let res = await sendRequest({
            method: "GET",
            endpoint: `/getHomeAlbums`
        });
        if (res) {
            setData(res.albums);
            setPicks(res.quickPicks);
            setRecentlyPlayed(res.mostPlayed);
            setIsLoading(false);
        }
    };

    const goToAlbum = album => {
        setOpenerDetails(prev => {
            return { ...prev, open: false };
        });
        hist.push(`${prefix}${basename}/album/${album._albumId}`);
    };

    const addTrackToQueue = song => {
        setOpenerDetails(prev => {
            return { ...prev, open: false };
        });
        setQueue(prev => {
            if (prev.length === 0) return prev;
            prev.push({ ...song, id: ++global.id });
            return prev;
        });
        setResObj(prev => {
            return {
                ...prev,
                open: true,
                msg: `Added ${song.Title || song.Album} to queue`
            };
        });
    };

    const playTrackNext = song => {
        setOpenerDetails(prev => {
            return { ...prev, open: false };
        });
        setQueue(prev => {
            if (prev.length === 0) return prev;
            const curIndex = prev.findIndex(each => each.id === playingSong.id);
            prev.splice(curIndex+1, 0, { ...song, id: ++global.id });
            return prev;
        });
        setResObj(prev => {
            return { ...prev, open: true, msg: `Playing ${song.Title || song.Album} next` };
        });
    };

    const shareAlbum = item => {
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
        navigator.clipboard.writeText(`${sharingBaseLink}/album/${item._albumId}`);
    };

    const shareTrack = item => {
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
        navigator.clipboard.writeText(`${sharingBaseLink}/track/${item._albumId}/${item._trackId}`);
    };

    const handleMenuForPicks = (e, { dimensions, windowDim, song: album }) => {
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
            },
            {
                name: "Share track",
                func: () => shareTrack(album)
            }
        ];
        e.stopPropagation();
        setOpenerDetails(prev => {
            return {
                ...prev,
                open: true,
                xValue: checkX(dimensions.x, windowDim.width),
                yValue: checkY(dimensions.y, windowDim.height, data.length),
                data
            }
        });
    };

    const addAlbumToQueue = item => {
        setOpenerDetails(prev => {
            return { ...prev, open: false };
        });
        if (queue.length === 0) return;

        const album = { ...item };
        const main = [];
        if (album.Type === "Single") {
            album.id = ++global.id;
            main.push(album);
        } else if (album.Type === "Album") {
            album.Tracks.forEach(each => {
                const obj = { ...album, ...each, id: ++global.id };
                delete obj.Tracks;
                main.push(obj);
            });
        }
        setQueue(prev => {
            return [ ...prev, ...main ];
        });
        setResObj(prev => {
            return { ...prev, open: true, msg: `Added ${album.Type.toLowerCase()} to queue` };
        });
    };

    const playAlbumNext = item => {
        setOpenerDetails(prev => {
            return { ...prev, open: false };
        });
        if (queue.length === 0) return;
        
        const album = { ...item };
        const main = [];
        if (album.Type === "Single") {
            album.id = ++global.id;
            main.push(album);
        } else if (album.Type === "Album") {
            album.Tracks.forEach(each => {
                const obj = { ...album, ...each, id: ++global.id };
                delete obj.Tracks;
                main.push(obj);
            });
        }
        setQueue(prev => {
            const playingSongIndex = prev.findIndex(s => s.id === playingSong.id);
            prev.splice(playingSongIndex+1, 0, ...main);
            return prev;
        });
        setResObj(prev => {
            return { ...prev, open: true, msg: `Playing ${album.Title || album.Album} next` };
        });
    };

    const handleMenuForAlbums = (e, { dimensions, windowDim, album }) => {
        const data = [
            {
                name: "Add to queue",
                func: () => addAlbumToQueue(album)
            },
            {
                name: "Play next",
                func: () => playAlbumNext(album)
            },
            {
                name: "Share album",
                func: () => shareAlbum(album)
            }
        ];
        setOpenerDetails(prev => {
            return {
                ...prev,
                open: true,
                xValue: checkX(dimensions.x, windowDim.width),
                yValue: checkY(dimensions.y, windowDim.height, data.length),
                data
            }
        });
    };

    const handlePlayPause = item => {
        if (playingSong._albumId === item._albumId) {
            pauseOrPlay();
            return;
        }
        if (!playing) setPlaying(true);
        const album = { ...item };
        const main = [];
        if (album.Type === "Single") {
            album.id = global.id = 0;
            main.push(album);
        } else if (album.Type === "Album") {
            album.Tracks.forEach((each,i) => {
                const obj = { ...album, ...each };
                obj.id = global.id = i;
                delete obj.Tracks;
                main.push(obj);
            });
        }
        setQueue(main);
        setPlayingSong(main[0]);
        setSongIsPaused(true);
    };

    const handlePlayPauseForRP = async album => {
        if (openerDetails.open) {
            setOpenerDetails(prev => {
                return { ...prev, open: false };
            });
        }
        if (playingSong._albumId === album._albumId) {
            pauseOrPlay();
            return;
        }

        const main = [];
        if (album.Type === "Single") {
            const obj = { ...album };
            obj.id = global.id = 0;
            main.push(obj);
        } else if (album.Type === "Album") {
            album.Tracks.forEach((each,i) => {
                const obj = { ...album, ...each };
                obj.id = global.id = i;
                delete obj.Tracks;
                main.push(obj);
            });
        }

        setQueue(main);
        setPlayingSong(main[0]);
        if (!playing) setPlaying(true);
        localStorage.setItem("queue",JSON.stringify(main));
        setSongIsPaused(true);
        if (!radio) {
            setResObj(prev => {
                return { ...prev, open: true, msg: "Playing from your history...." };
            });
            setRadio(true);
            const songList = await sendRequest({
                method: "GET",
                endpoint: `/startradio?exclude=${album._albumId}&type=rp`
            });
            songList.forEach(each => {
                each.id = ++global.id;
            });
            main.push(...songList);
            setQueue(main);
            localStorage.setItem("queue",JSON.stringify(main));
            setRadio(false);
        }
    };

    const documentClick = e => {
        if (!list.includes(e.target.className) && actualIsOpen) {
            setOpenerDetails({
                ...openerDetails,
                open: false
            });
        }
    };

    const handleMenuForRP = (e, { dimensions, windowDim, album }) => {
        const data = [
            {
                name: "Go to album",
                func: () => goToAlbum(album)
            },
            {
                name: "Add to queue",
                func: () => addAlbumToQueue(album)
            },
            {
                name: "Play next",
                func: () => playAlbumNext(album)
            },
            {
                name: "Share album",
                func: () => shareAlbum(album)
            }
        ];
        e.stopPropagation();
        setOpenerDetails(prev => {
            return {
                ...prev,
                open: true,
                xValue: checkX(dimensions.x, windowDim.width),
                yValue: checkY(dimensions.y, windowDim.height, data.length),
                data
            }
        });
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
                recentlyPlayed.length !== 0 ?
                <RecentlyPlayed played={recentlyPlayed} songIsPaused={songIsPaused} song={playingSong}
                openerFunc={handleMenuForRP} handlePlayPause={handlePlayPauseForRP} /> : null
            }
            {
                picks.length !== 0 ?
                <StartRadio picks={picks} openerFunc={handleMenuForPicks} openerDetails={openerDetails} setOpenerDetails={setOpenerDetails}
                playing={playing} setPlaying={setPlaying} playingSong={playingSong} setPlayingSong={setPlayingSong}
                setQueue={setQueue} songIsPaused={songIsPaused} setSongIsPaused={setSongIsPaused}
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
                                        return <EachAlbum item={item} openerFunc={handleMenuForAlbums}
                                        playPauseFunc={handlePlayPause} />;
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



export default NewActualHomeScreen;