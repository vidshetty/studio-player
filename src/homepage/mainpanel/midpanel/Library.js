import "../../../css/teststyles.css";
import React, { useState, useEffect, useRef, useContext } from "react";
import { useHistory } from "react-router-dom";
import { MidPanelLoader } from "./index";
import { pauseOrPlay } from "../../../homepage";
import Play from "../../../assets/playbutton-white.svg";
import Pause from "../../../assets/pausebutton-white.svg";
import Button from "../../../Button";

import {
    checkX,
    checkY,
    prefix,
    basename,
    global,
    sharingBaseLink
} from "../../../common";

import {
    AlbumContext,
    MenuContext,
    PlayerContext,
    QueueContext,
    ResponseBarContext,
    SongIsPausedContext
} from "../../../index";
import { APIService } from "../../../api-service";

// Library view
let isOpen = null, moreLocal = null;


const EachAlbum = ({
    each,
    openerFunc,
    playingSong,
    setAlbumForPlayer,
    setQueue,
    playing,
    setPlaying,
    songPaused,
    setSongPaused
}) => {

    let songPausedLocal = songPaused;
    const hist = useHistory();

    const goToAlbum = () => {
        setTimeout(() => {
            hist.push(`${prefix}${basename}/album/${each._albumId}`);
        },500);
    };

    const goToAlbumName = e => {
        hist.push(`${prefix}${basename}/album/${each._albumId}`);
    };

    const handleMenu = e => {
        e.stopPropagation();
        const dimensions = { x: e.clientX, y: e.clientY };
        const windowDim = { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight };
        openerFunc(e, { dimensions, windowDim, each });
    };

    const handlePlayPause = (e) => {
        e.stopPropagation();
        if (playingSong._albumId === each._albumId) {
            pauseOrPlay();
            return;
        }
        const main = each.Type === "Album" ? each.Tracks : each;
        if (!playing) setPlaying(true);
        if (each.Type === "Single") {
            main.id = global.id = 0;
            setQueue([main]);
            setAlbumForPlayer(main);
        } else {
            const dummy = [ ...main ];
            dummy.forEach((song,i) => {
                song.id = global.id = i;
                song.Album = each.Album;
                song.Thumbnail = each.Thumbnail;
                song.Color = each.Color;
                song.Year = each.Year;
            });
            setQueue(dummy);
            setAlbumForPlayer(dummy[0]);
        }
        setSongPaused(true);
    };

    return(
        <div className="innerineach">
            <Button className="eachartcover" onClick={goToAlbum} title={each.Album}>
                <div className="eachshadow"></div>
                <div className={ (playingSong.Album === each.Album) ? "showplaybuttonfixed" : "showplaybutton" }>
                    <Button className="innerplaybutton" onClick={handlePlayPause}
                    title={ (!songPausedLocal && playingSong.Album === each.Album) ? "Pause" : "Play" } >
                        <img src={ (!songPausedLocal && playingSong.Album === each.Album) ? Pause : Play } alt="" />
                    </Button>
                </div>
                <div className="library-opener" onClick={handleMenu} title="More Options">
                    <div className="library-opener1"></div>
                    <div className="library-opener2"></div>
                    <div className="library-opener3"></div>
                </div>
                <img src={each.Thumbnail} alt="" className="eachalbumart" />
            </Button>
            <div className="eachalbumname" onClick={goToAlbumName}>{each.Album}</div>
            <span className="eachbottom">
                <span>{each.AlbumArtist}</span>
            </span>
        </div> 
    );
};

// const Between = props => {

//     const [element, setElement] = useState(null);
//     const [show, setShow] = useState(false);

//     const observer = new IntersectionObserver(([entry]) => {
//         const { isIntersecting } = entry;
//         setShow(isIntersecting);
//     }, { threshold: 0 });

//     useEffect(() => {
//         const currentElement = element;
//         const currentObserver = observer;
//         if (currentElement) {
//             currentObserver.observe(currentElement);
//         }

//         return () => {
//             if (currentElement) {
//                 currentObserver.unobserve(currentElement);
//             }
//         };
//     }, [element]);

//     return(
//         <div className="eachinrow" ref={setElement} key={props.keyId}>
//             { show ? <EachAlbum { ...props } /> : null }
//         </div>
//     );
// };

const Between = props => {

    const { init, observer } = props;

    const element = useRef(null);
    const [show, setShow] = useState(false);

    const set = () => {
        init(element.current.id, setShow);
    };

    useEffect(() => {
        if (element.current) {
            set();
            observer.observe(element.current);
        }
        return () => {
            if (element.current) {
                observer.unobserve(element.current);
            }
        };
    }, []);

    return(
        <div className="eachinrow" ref={element} key={props.keyId}
        id={props.keyId}>
            { show ? <EachAlbum { ...props } /> : null }
        </div>
    );

};

const IO = props => {

    const { library = [] } = props;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const { isIntersecting } = entry;
            entry.target.children[0].style.display = isIntersecting ? "" : "none";
        });
    }, { threshold: 0 });

    useEffect(() => {
        const rows = document.querySelectorAll(".eachinrow");
        rows.forEach(row => {
            observer.observe(row);
        });
        return () => {
            rows.forEach(row => {
                observer.unobserve(row);
            });
        };
    }, [library]);

    return(
        <>
            {
                library.map(item => {
                    return(
                        <div className="eachinrow" key={item.keyId}>
                            <EachAlbum each={item} { ...props } />
                        </div>
                    );
                })
            }
        </>
    );

};

const NewActualLibrary = () => {

    const [library, setLibrary] = useState([]);
    const [page, setPage] = useState(1);
    const [more, setMore] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [pageLoading, setPageLoading] = useState(false);
    const [scroll, setScroll] = useState(null);
    const [openerDetails, setOpenerDetails] = useContext(MenuContext);
    const [playingSong, setAlbumForPlayer] = useContext(AlbumContext);
    const [queue, setQueue] = useContext(QueueContext);
    const [, setResObj] = useContext(ResponseBarContext);
    const [playing, setPlaying] = useContext(PlayerContext);
    const [songPaused, setSongPaused] = useContext(SongIsPausedContext);
    const [elementIds, setElementIds] = useState({});
    const topDiv = useRef(null);
    const grid = useRef(null);
    isOpen = openerDetails.open;
    moreLocal = more;


    const addAlbumToQueue = each => {
        setOpenerDetails(prev => {
            return { ...prev, open: false };
        });
        if (queue.length === 0) return;

        const album = { ...each };
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

    const playAlbumNext = each => {
        setOpenerDetails(prev => {
            return { ...prev, open: false };
        });
        if (queue.length === 0) return;
        
        const album = { ...each };
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

    const shareAlbum = item => {
        setOpenerDetails(prev => {
            return { ...prev, open: false };
        });
        setResObj(prev => {
            return { ...prev, open: true, msg: "Album link copied to clipboard" };
        });
        navigator.clipboard.writeText(`${sharingBaseLink}/album/${item._albumId}`);
    };

    const sharePlayableAlbum = item => {
        setOpenerDetails(prev => {
            return { ...prev, open: false };
        });
        setResObj(prev => {
            return { ...prev, open: true, msg: "Album link copied to clipboard" };
        });
        navigator.clipboard.writeText(`${sharingBaseLink}/album/${item._albumId}/playable`);
    };

    const handleMenu = (e, { dimensions, windowDim, each: album }) => {
        e.stopPropagation();
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
            },
            {
                name: "Share playable album",
                func: () => sharePlayableAlbum(album)
            }
        ];
        setOpenerDetails({
            ...openerDetails,
            open: true,
            xValue: checkX(dimensions.x, windowDim.width),
            yValue: checkY(dimensions.y, windowDim.height, data.length),
            data
        });
    };

    const documentScroll = e => {
        const { scrollHeight, scrollTop, clientHeight } = topDiv.current;
        if (clientHeight + scrollTop > scrollHeight - 500) {
            if (!pageLoading && moreLocal) {
                setPageLoading(true);
            }
        }
    };

    const init = (id, setShow) => {
        setElementIds(prev => {
            prev[id] = setShow;
            return prev;
        });
    };

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            elementIds[entry.target.id](entry.isIntersecting);
        });
    }, { threshold: 0 });


    useEffect(() => {
        const call = async () => {
            const saved = JSON.parse(sessionStorage.getItem("library") || "[]");
            const nextPage = saved.filter(each => {
                return each.page === page;
            })[0];
            if (nextPage) {
                const { more, data } = nextPage.response;
                setLibrary(prev => {
                    return [ ...prev, ...data ];
                });
                setPageLoading(false);
                setPage(page+1);
                setMore(more);
                return;
            }
            const res = await APIService.getLibrary(page);
            if (res) {
                const { more, data } = res;
                const saved = JSON.parse(sessionStorage.getItem("library") || "[]");
                saved.push({ page, response: res });
                sessionStorage.setItem("library",JSON.stringify(saved));
                setLibrary(prev => {
                    return [ ...prev, ...data ];
                });
                setPageLoading(false);
                setPage(page+1);
                setMore(more);
            }
        };
        if (pageLoading) {
            call();
        }
    }, [pageLoading]);

    useEffect(() => {
        const call = async () => {
            const saved = JSON.parse(sessionStorage.getItem("library") || "[]");
            const firstPage = saved.filter(each => {
                return each.page === 1;
            })[0];
            if (firstPage) {
                const { more, data } = firstPage.response;
                setLibrary(data);
                setPage(page+1);
                setMore(more);
                setIsLoading(false);
                return;
            }
            const res = await APIService.getLibrary(page);
            if (res) {
                const { more, data } = res;
                sessionStorage.setItem("library",JSON.stringify([{ page: 1, response: res }]));
                setLibrary(data);
                setPage(page+1);
                setMore(more);
                setIsLoading(false);
            }
        };
        if (isLoading) {
            call();
        }

        topDiv.current = document.querySelector(".dummyoutermid");
        grid.current = document.querySelector(".librarygrid");
        topDiv.current && topDiv.current.addEventListener("scroll", documentScroll);
        return () => {
            topDiv.current && topDiv.current.removeEventListener("scroll", documentScroll);
        };

    }, [isLoading]);

    useEffect(() => {
        if (isLoading) return;
        
        topDiv.current = document.querySelector(".dummyoutermid");
        if (isOpen) {
            setScroll(topDiv.current.style.overflowY);
            topDiv.current.style.overflowY = "hidden";
        } else {
            topDiv.current.style.overflowY = scroll;
        }
    }, [isOpen]);


    if (isLoading) {
        return <MidPanelLoader/>
    }
    return(
        <div className="dummyoutermid">
            <div className="dummymid">
                <div className="libraryname">Library</div>
                <div className="librarycontainer">
                    <div className="librarygrid">
                        {
                            library.map(item => {
                                return <Between each={item} openerFunc={handleMenu} keyId={item.keyId}
                                playingSong={playingSong} setAlbumForPlayer={setAlbumForPlayer}
                                queue={queue} setQueue={setQueue} playing={playing} setPlaying={setPlaying}
                                songPaused={songPaused} setSongPaused={setSongPaused}
                                init={init} observer={observer} />;
                            })
                        }
                        {/* <IO library={library} openerFunc={handleMenu}
                            playingSong={playingSong} setAlbumForPlayer={setAlbumForPlayer}
                            queue={queue} setQueue={setQueue} playing={playing} setPlaying={setPlaying}
                            songPaused={songPaused} setSongPaused={setSongPaused} /> */}
                    </div>
                </div>
                {
                    pageLoading && more ?
                    <div className="page-load">
                        <div className="loaderinner">
                            <div className="one"></div>
                            <div className="two"></div>
                            <div className="three"></div>
                        </div>
                    </div> : null
                }
            </div>
        </div>
    );

};



export default NewActualLibrary;