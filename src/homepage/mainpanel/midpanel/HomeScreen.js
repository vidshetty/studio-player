import "../../../css/homestyles.css";
import { MidPanelLoader } from "./index";
import { useEffect, useState } from "react";
import { Redirect } from "react-router-dom";
import playbutton from "../../../assets/playwhite.png";
import pausebutton from "../../../assets/pausewhite.png";
import Close from "../../../assets/deletewhite.svg";
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
    topBgColorGlobal
} from "../../../common";
import Queue from "./Queue";
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

const HomeScreen = () => {
    const [queueOpened,] = CustomUseState(queueOpenedGlobal);

    if (queueOpened) {
        return <Queue/>
    }
    return <ActualHomeScreen/>
};

export default HomeScreen;