// import "../../../css/library.css";
import "../../../css/teststyles.css";
import { useState, useEffect, useRef } from "react";
import { Redirect, useHistory } from "react-router-dom";
import { MidPanelLoader } from "./index";
import { pauseOrPlay } from "../../../homepage";
import { HorizontalList } from "./HomeScreen";
import Play from "../../../assets/playbutton-white.svg";
import Pause from "../../../assets/pausebutton-white.svg";
import {
    wait,
    queueOpenedGlobal,
    CustomUseState,
    sendRequest,
    topBarGlobal,
    topBgColorGlobal,
    modifyLibrary,
    routesGlobal,
    albumGlobal,
    songIsPausedGlobal,
    playingGlobal,
    queueGlobal,
    openerGlobal,
    checkX,
    checkY,
    responseBar,
    prefix
} from "../../../common";
import Queue from "./Queue";
let topBar, isOpen = null;


const ActualLibrary = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [library, setLibrary] = useState({});
    const [topBarConfig, setTopBarConfig] = CustomUseState(topBarGlobal);
    const [topBgColor, setBgColor] = CustomUseState(topBgColorGlobal);
    topBar = topBarConfig;
    // let scrolled = false;

    const scrollHandler = (e) => {
        const top = e.currentTarget.scrollTop;
        sessionStorage.setItem("library-scroll",top);
        if (top > 200 && topBar.bgColor === "transparent") {
            setTopBarConfig({
                ...topBar,
                button: false,
                bgColor: topBgColor
            });
        } else if (top < 200 && topBar.bgColor !== "transparent") {
            setTopBarConfig({
                ...topBar,
                button: false,
                bgColor: "transparent"
            });
        }
    };

    useEffect(() => {
        const call = async () => {
            const saved = JSON.parse(sessionStorage.getItem("library"));
            if (saved !== null) {
                setLibrary(saved);
                setIsLoading(false);
                return;
            }
            const res = await sendRequest({
                method: "GET",
                endpoint: `/getLibrary`
            });
            await wait(500);
            sessionStorage.setItem("library",JSON.stringify(res));
            setLibrary(res);
            setIsLoading(false);
        };
        if (isLoading) {
            call();
        } else {
            const main = document.querySelector(".main");
            main.scrollTop = sessionStorage.getItem("library-scroll") || 0;
        }
        setTopBarConfig({
            ...topBar,
            button: false,
            // bgColor: "transparent"
        });
        // return () => {
        //     setTopBarConfig({
        //         ...topBar,
        //         button: false,
        //         bgColor: "transparent"
        //     }); 
        // };
    },[isLoading]);

    if (isLoading) {
        return <MidPanelLoader/>
    }
    return(
        <div className="library">
            <div className="main" onScroll={scrollHandler}>
                <div className="librarytop"
                style={{ backgroundColor: `${topBgColor}` }}
                >
                    <div className="innerlibrarytop">
                        <div className="forblur"></div>
                        <div className="bigtitle">Library</div>
                    </div>
                </div>
                <div className="librarybottom">
                    <div className="outline">
                        {/* <div className="bigmaintitle">
                            <p>Library</p>
                        </div> */}
                        {   
                            Object.keys(library).map(key => {
                                if (library[key].length !== 0) {
                                    return(
                                        <div className="list">
                                            <HorizontalList list={library[key]}/>
                                        </div>
                                    );
                                }
                                return null;
                            })
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

const EachAlbum = ({ each, openerFunc }) => {
    const [song, setAlbumForPlayer] = CustomUseState(albumGlobal);
    const [playing, setPlaying] = CustomUseState(playingGlobal);
    const [songPaused, setSongPaused] = CustomUseState(songIsPausedGlobal);
    const [, setQueue] = CustomUseState(queueGlobal); 
    let songPausedLocal = songPaused;
    const [element, setElement] = useState(null);
    const [show, setShow] = useState(true);
    const hist = useHistory();

    const observer = useRef(new IntersectionObserver(([entry]) => {
        const { isIntersecting } = entry;
        setShow(isIntersecting);
    }, { threshold: 0.1 }));


    useEffect(() => {
        const currentElement = element;
        const currentObserver = observer.current;
        if (currentElement) {
            currentObserver.observe(currentElement);
        }

        return () => {
            if (currentElement) {
                currentObserver.unobserve(currentElement);
            }
        };
    }, [element]);

    const display = () => {
        // routes.push(`/home/album/${each.Album}`);
        // window.history.pushState({},"",`/home/album/${each.Album}`);
        // setRoutes(routes);
        hist.push(`${prefix}/home/album/${each.Album}`);
        // setRedirectTo(`${each.Album}`);
    };

    const handleMenu = e => {
        e.stopPropagation();
        const dimensions = { x: e.clientX, y: e.clientY };
        const windowDim = { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight };
        openerFunc(e, { dimensions, windowDim, each });
    };

    const handlePlayPause = (e) => {
        e.stopPropagation();
        if (song.Album === each.Album) {
            pauseOrPlay();
            return;
        }
        const main = each.Type === "Album" ? each.Tracks : [each];
        if (!playing) setPlaying(true);
        if (each.Type === "Single") {
            setQueue(main);
            setAlbumForPlayer(main[0]);
        } else {
            main.forEach(song => {
                song.Album = each.Album;
                song.Thumbnail = each.Thumbnail;
                song.Color = each.Color;
                song.Year = each.Year;
            });
            setQueue(main);
            setAlbumForPlayer(main[0]);
        }
        localStorage.setItem("queue",JSON.stringify(main));
        setSongPaused(true);
    };

    
    return(
        <div className="eachinrow" ref={setElement}>
            { show ?
                <div className="innerineach">
                    <div className="eachartcover" onClick={display}>
                        <div className="eachshadow"></div>
                        <div className={ (song.Album === each.Album) ? "showplaybuttonfixed" : "showplaybutton" }>
                            <div className="innerplaybutton" onClick={handlePlayPause}
                            title={ (!songPausedLocal && song.Album === each.Album) ? "Pause" : "Play" } >
                                <img src={ (!songPausedLocal && song.Album === each.Album) ? Pause : Play } alt="" />
                            </div>
                        </div>
                        <div className="library-opener" onClick={handleMenu} title="More Options">
                            <div className="library-opener1"></div>
                            <div className="library-opener2"></div>
                            <div className="library-opener3"></div>
                        </div>
                        <img src={each.Thumbnail} alt="" className="eachalbumart" />
                    </div>
                    <div className="eachalbumname" onClick={display}>{each.Album}</div>
                    <span className="eachbottom">
                        <span>{each.AlbumArtist}</span>
                    </span>
                </div> :
                ""
            }
        </div>
    );
};

const CreateRow = ({ row, openerFunc }) => {
    return(
        <div className="createrow">
            {
                row.map((each,i) => {
                    // if (i<6) {
                        if (Object.keys(each).length > 0) {
                            return <EachAlbum each={each} openerFunc={openerFunc} />
                        }
                        return <div className="eachinrow"></div>
                    // }
                    // return "";
                })
            }
        </div>
    );
};

const CreateAnotherRow = ({ row }) => {
    return(
        <div className="createanotherrow">

        </div>
    );
};

const NewActualLibrary = () => {
    const [library, setLibrary] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [openerDetails, setOpenerDetails] = CustomUseState(openerGlobal);
    const [playingSong,] = CustomUseState(albumGlobal);
    const [queue, setQueue] = CustomUseState(queueGlobal);
    const [, setResObj] = CustomUseState(responseBar);
    const topDiv = useRef(null);
    isOpen = openerDetails.open;
    const list = ["libraryopener","libraryopener1","libraryopener2","libraryopener3"];


    const addAlbumToQueue = each => {
        const main = each.Type === "Album" ? each.Tracks : [each];
        const mainQueue = queue;
        const index = mainQueue.indexOf(playingSong);
        if (index === -1) return;
        if (each.Type === "Single") {
            mainQueue.push(main[0]);
            localStorage.setItem("queue",JSON.stringify(mainQueue));
            setQueue(mainQueue);
            setResObj({ open: true, msg: `Added single to queue` });
        } else {
            main.forEach(song => {
                song.Album = each.Album;
                song.Color = each.Color;
                song.Thumbnail = each.Thumbnail;
                song.Year = each.Year;
                mainQueue.push(song);
            });
            localStorage.setItem("queue",JSON.stringify(mainQueue));
            setQueue(mainQueue);
            setResObj({ open: true, msg: `Added album to queue` });
        }
    };

    const playAlbumNext = each => {
        if (queue.length !== 0) {
            const index = queue.indexOf(playingSong);
            if (each.Type === "Single") {
                queue.splice(index+1,0,each);
            } else {
                each.Tracks.forEach((song,i) => {
                    song.Album = each.Album;
                    song.Color = each.Color;
                    song.Thumbnail = each.Thumbnail;
                    song.Year = each.Year;
                    queue.splice(index+1+i,0,song);
                });
            }
            localStorage.setItem("queue",JSON.stringify(queue));
            setQueue(queue);
            setResObj({ open: true, msg: `Playing ${each.Album} next` });
        }
    };

    const handleMenu = (e, { dimensions, windowDim, each: album }) => {
        e.stopPropagation();
        setOpenerDetails({
            ...openerDetails,
            open: true,
            xValue: checkX(dimensions.x, windowDim.width),
            yValue: checkY(dimensions.y, windowDim.height, 3),
            data: [
                {
                    name: "Add to queue",
                    func: () => addAlbumToQueue(album)
                },
                {
                    name: "Play next",
                    func: () => playAlbumNext(album)
                },
                {
                    name: "Start radio",
                    func: ()=>{}
                }
            ]
        });
    };

    const documentClick = e => {
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
        const call = async () => {
            const saved = JSON.parse(sessionStorage.getItem("library"));
            // const saved = null;
            if (saved !== null) {
                setLibrary(saved);
                setIsLoading(false);
                return;
            }
            const res = await sendRequest({
                method: "GET",
                endpoint: `/getLibrary`
            });
            if (res) {
                sessionStorage.setItem("library",JSON.stringify(res));
                setLibrary(res);
                setIsLoading(false);
            }
        };
        if (isLoading) {
            call();
        }
        topDiv.current = document.querySelector(".dummymid");
        topDiv.current && topDiv.current.addEventListener("scroll", documentScroll);
        document.addEventListener("click", documentClick);
        return () => {
            topDiv.current && topDiv.current.removeEventListener("scroll", documentScroll);
            document.removeEventListener("click", documentClick);
        };
    }, [isLoading]);

    if (isLoading) {
        return <MidPanelLoader/>
    }
    return(
        // <div className="dummymid" style={{ overflowY: `${ isOpen ? "hidden" : "overlay" }` }}>
            <div className="dummymid">
                <div className="libraryname">Library</div>
                <div className="librarycontainer">
                    <div className="librarygrid">
                        {
                            library.map(item => {
                                return <EachAlbum each={item} openerFunc={handleMenu} />
                            })
                        }
                    </div>
                </div>
            </div>
        // </div>
    );
};

const Library = () => {
    // const [queueOpened,] = CustomUseState(queueOpenedGlobal);
    
    // if (queueOpened) {
    //     return <Queue/>
    // }
    return <NewActualLibrary/>
};


export default Library;