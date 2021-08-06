import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import "../../../css/searchstyles.css";
import "../../../css/homestyles.css";
import "../../../css/hometeststyles.css";
import SearchIcon from "../../../assets/searchicon.svg";
import Close from "../../../assets/blackclose.png";
import Play from "../../../assets/playbutton-white.svg";
import Pause from "../../../assets/pausebutton-white.svg";
import {
    sendRequest,
    queueOpenedGlobal,
    CustomUseState,
    searchBarGlobal,
    searchInputGlobal,
    topBarGlobal,
    topBgColorGlobal,
    albumGlobal,
    songIsPausedGlobal,
    openerGlobal,
    checkX,
    checkY,
    prefix,
    basename,
    playingGlobal,
    queueGlobal,
    responseBar,
    global,
    sharingBaseLink
} from "../../../common";
import Queue from "./Queue";
import Button from "../../../Button";
import { MidPanelLoader } from "./index";
import { HorizontalList } from "./HomeScreen";
import { pauseOrPlay } from "../../index";
import {
    AlbumContext,
    MenuContext,
    PlayerContext,
    QueueContext,
    ResponseBarContext,
    SearchInputContext,
    SongIsPausedContext
} from "../../../index";
let timeout = undefined, searchBar, topBar, topBgColorLocal, setcolor = false;



const InnerSongList = ({ obj }) => {
    const [hidden, setHidden] = useState(true);

    const decide = () => {
        if (hidden) {
            return true;
        }
        return false;
    };

    return(
        <div className="leftlist" onMouseOver={() => setHidden(false)} onMouseOut={() => setHidden(true)}
        style={{ backgroundColor: decide() ? "#181818" : "rgba(255,255,255,0.1)" }}>
            <div className="leftalbumart">
                {/* <div className="innerleftalbumart"> */}
                    <img src={obj.Thumbnail} alt="" />
                {/* </div> */}
            </div>
            <div className="names">
                <div className="songtitlename">{obj.Title || obj.Album}</div>
                <div className="songartist">{obj.Artist}</div>
            </div>
            <div className={ decide() ? "songplay hidden" : "songplay" }>
                <div className="innersongplay">
                    <img src={Play} alt="" className="img"/>
                </div>
            </div>
            <div className={ decide() ? "beforesongresult hidden" : "beforesongresult" }>
                <div className="customopener">
                    <div className="opener1"></div>
                    <div className="opener2"></div>
                    <div className="opener3"></div>
                </div>
            </div>
        </div>
    );
};

const SongList = ({ list }) => {
    return(
        <div className="songlist">
            {
                list.map(each => {
                    return <InnerSongList obj={each} />;
                })
            }
        </div>
    );
};

const Each = ({ each }) => {
    const [hover, setHover] = useState(false);
    // let hoverLocal = hover;

    const lessen = (value) => {
        let colors = each.Color.split(",");
        colors[3] = `${value})`;
        colors = colors.join(",");
        return colors;
    };

    return(
        <div className="eachitem">
            <div className="songitem"
            // style={{ backgroundColor: `${ hover ? lessen(0.1) : lessen(0.7) }` }}
            // style={{ backgroundImage: `url(${each.Thumbnail})`, backgroundSize: "cover" }}
            onMouseOver={() => setHover(true)}
            onMouseOut={() => setHover(false)}
            >
                <div className="innersongitem"
                style={{ backgroundImage: `url(${each.Thumbnail})`, backgroundSize: "cover" }}
                >
                    <div className="fullscreen"
                    style={{ backgroundColor: `${ hover ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.7)" }` }}>
                        <div className="actualcontents">
                            {/* <img src={each.Thumbnail} className="itemart" alt="" /> */}
                            <div className="itemalbum">{each.Album}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const RecommendedRow = ({ row }) => {
    return(
        <div className="recommendedrow">
            {
                row.map(each => {
                    return(
                        <Each each={each} />
                    );
                })
            }
        </div>
    );
};

const ActualSearch = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [searchConfig, setSearchConfig] = CustomUseState(searchBarGlobal);
    const [topBarConfig, setTopBarConfig] = CustomUseState(topBarGlobal);
    const [topBgColor, setTopBgColor] = CustomUseState(topBgColorGlobal);
    const [recents, setRecents] = useState([]);
    const [recommended, setRecommended] = useState({});
    searchBar = searchConfig;
    topBar = topBarConfig;
    topBgColorLocal = topBgColor;
    let { result, input, callLoading } = searchBar;

    const recentSearches = async () => {
        const res = await sendRequest({
            method: "GET",
            endpoint: "/getRecentSearch"
        });
        setIsLoading(false);
        setRecents(res.recents);
        setRecommended(res.recommended);
        // setTopBarConfig({
        //     ...topBar,
        //     // bgColor: "#121212"
        //     bgColor: topBgColor
        // });
    };

    const closeFunc = async (item) => {
        const res = await sendRequest({
            method: "POST",
            endpoint: "/removeFromRecents",
            data: {
                item
            }
        });
    };

    const scrollHandler = (e) => {
        const top = e.currentTarget.scrollTop;
        if (top > 100 && !setcolor) {
            setTopBarConfig({
                ...topBar,
                bgColor: topBgColorLocal
            });
            setcolor = true;
        }
        if (top < 100 && setcolor) {
            setTopBarConfig({
                ...topBar,
                // bgColor: "#121212"
                bgColor: "transparent"
            });
            setcolor = false;
        }
    };

    useEffect(() => {
        setSearchConfig({
            ...searchBar,
            show: true,
            // input: "",
            result: {}
        });
        setTopBarConfig({
            ...topBar,
            // bgColor: "#121212"
            bgColor: "transparent"
        });
        recentSearches();
        return () => {
            setSearchConfig({
                ...searchBar,
                input: "",
                show: false,
                callLoading: false
            });

        }
    },[]);

    if (isLoading) {
        return <MidPanelLoader/>
    }
    return(
        <div className="searchmain" onScroll={scrollHandler}>
            <div className="librarytop"
            style={{ backgroundColor: topBgColor }}
            >
                <div className="innerlibrarytop">
                    <div className="forblur"></div>
                    <div className="bigtitle">Search</div>
                </div>
            </div>
            <div className="noncolour">
            {
                callLoading ? <MidPanelLoader/> : ""
            }
            {
                recents.length !== 0 && !callLoading && input === "" ?
                <>
                    <div style={{ width: "100%", height: "10px" }}/>
                    <div className="outline">
                        <div className="maintitle">
                            <p>Recent Searches</p>
                            <div className="viewmore">
                                <p>Clear All</p>
                            </div>
                        </div>
                        <div className="list">
                            <HorizontalList list={recents} addCloseButton={true} closeFunc={closeFunc}/>
                        </div>
                    </div>
                </> : ""
            }
            {
                Object.keys(recommended).length !== 0 && !callLoading && input === "" ?
                <div className="outline">
                    <div className="maintitle">
                        <p>Recommended</p>
                    </div>
                    <div style={{ width: "100%", height: "0px" }}></div>
                    {/* {
                        Object.keys(recommended).map(row => {
                            return(
                                <RecommendedRow row={recommended[row]} />
                            );
                        })
                    } */}
                    {
                        Object.keys(recommended).map(each => {
                            return(
                                <div className="list">
                                    <HorizontalList list={recommended[each]} />
                                </div>
                            );
                        })
                    }
                </div> : ""
            }
            {
                result.noResults && !callLoading && input !== "" ?
                <div className="noresults">No results found for "{input}"</div> : ""
            }
            {   
                Object.keys(result).length > 1 && input !== "" ?
                <div className="smain">
                    <div className="outline">
                        {
                            Object.keys(result.songs).length !== 0 ?
                            <div className="maintitle">
                                <p>Songs</p>
                            </div> : ""
                        }
                        {   
                            Object.keys(result.songs).map(each => {
                                return(
                                    // <div className="list">
                                        <SongList list={result.songs[each]}/>
                                    // </div>
                                );
                            })
                        }
                        {
                            Object.keys(result.albums).length !== 0 ?
                            <div style={{ width: "100%", height: "15px" }}></div> : ""
                        }
                        {
                            Object.keys(result.albums).length !== 0 ?
                            <div className="maintitle">
                                <p>Albums</p>
                            </div> : ""
                        }
                        {   
                            Object.keys(result.albums).map(each => {
                                return(
                                    <div className="list">
                                        <HorizontalList list={result.albums[each]}/>
                                    </div>
                                );
                            })
                        }
                    </div>
                </div> 
                : ""
            }
            </div>
        </div>
    );
};



const EachInSongList = ({
    song,
    playingSong,
    setPlayingSong,
    songIsPaused,
    openerFunc,
    playing,
    setPlaying,
    setSongIsPaused,
    setQueue,
    openerDetails,
    setOpenerDetails
}) => {
    const [hovered, setHovered] = useState(false);

    const determine = () => playingSong._trackId === song._trackId;

    const handlePlayPause = e => {
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
        setQueue([main]);
        setPlayingSong(main);
        localStorage.setItem("queue",JSON.stringify([main]));
        setSongIsPaused(true);
    };

    const handleMenu = e => {
        e.stopPropagation();
        const dimensions = { x: e.clientX, y: e.clientY };
        const windowDim = { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight };
        openerFunc(e, { dimensions, windowDim, song });
    };

    return(
        <div className="each-list-song" onMouseOver={() => setHovered(true)} onMouseOut={() => setHovered(false)}
        style={{ backgroundColor: `${ determine() ? "#202020" : "" }` }}
        >
            <div className="each-list-song-cover">
                <div className="each-list-song-cover-inner">
                    <img className="each-list-song-cover-inner-img" src={song.Thumbnail} alt="" />
                    <div className="each-song-dummyshadow">
                        <Button className="each-button" onClick={handlePlayPause}>
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
            </div>
            <div className={ hovered ? "each-list-song-details short" : "each-list-song-details" }>
                <div className="each-list-song-title">{song.Title || song.Album}</div>
                <div className="each-list-song-below">
                    <p>Song</p>
                    <div className="search-separator"><div></div></div>
                    <p>{song.Artist}</p>
                    <div className="search-separator"><div></div></div>
                    <p>{song.Album}</p>
                    <div className="search-separator"><div></div></div>
                    <p>{song.Duration}</p>
                </div>
            </div>
            <div className={ hovered ? "each-list-opener" : "each-list-opener hidden" }>
                <div className="tileopener" onClick={handleMenu}>
                    <div className="tileopener1"></div>
                    <div className="tileopener2"></div>
                    <div className="tileopener3"></div>
                </div>
            </div>
        </div>
    );
};

const EachInAlbumList = ({
    album,
    playingSong,
    setPlayingSong,
    songIsPaused,
    setSongIsPaused,
    openerFunc,
    playing,
    setPlaying,
    setQueue,
    openerDetails,
    setOpenerDetails
}) => {
    const hist = useHistory();
    const [hovered, setHovered] = useState(false);

    const display = e => {
        setTimeout(() => {
            hist.push(`${prefix}${basename}/album/${album._albumId}`);
        },500);
    };

    const determine = () => playingSong._albumId === album._albumId;

    const handlePlayPause = e => {
        e.stopPropagation();
        if (openerDetails.open) {
            setOpenerDetails({ ...openerDetails, open: false });
        }
        if (determine()) {
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
                const obj = { ...main[i], ...album };
                obj.id = global.id = i;
                delete obj.Tracks;
                main[i] = obj;
            }
            setQueue(main);
            setPlayingSong(main[0]);
        }
        localStorage.setItem("queue",JSON.stringify(main));
        setSongIsPaused(true);
    };

    const handleMenu = e => {
        e.stopPropagation();
        const dimensions = { x: e.clientX, y: e.clientY };
        const windowDim = { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight };
        openerFunc(e, { dimensions, windowDim, song: album });
    };

    return(
        <Button className="each-album-button" onClick={display}>
        <div className="each-list-song" onMouseOver={() => setHovered(true)} onMouseOut={() => setHovered(false)}
        // style={{ backgroundColor: `${ hovered ? "#202020" : "" }` }}
        >
            <div className="each-list-song-cover">
                <div className="each-list-song-cover-inner">
                    <img className="each-list-song-cover-inner-img" src={album.Thumbnail} alt="" />
                    <div className="each-song-dummyshadow">
                        <Button className="each-button" onClick={handlePlayPause}>
                            {
                                determine() ?
                                <img src={ songIsPaused ? Play : Pause } alt="" /> :
                                <img src={Play} alt="" />
                            }
                        </Button>
                    </div>
                </div>
            </div>
            <div className={ hovered ? "each-list-song-details short" : "each-list-song-details" }>
                <div className="each-list-song-title">{album.Title || album.Album}</div>
                <div className="each-list-song-below">
                    <p>{album.Type}</p>
                    <div className="search-separator"><div></div></div>
                    <p>{album.AlbumArtist}</p>
                    <div className="search-separator"><div></div></div>
                    <p>{album.Year}</p>
                </div>
            </div>
            <div className={ hovered ? "each-list-opener" : "each-list-opener hidden" }>
                <div className="tileopener" onClick={handleMenu}>
                    <div className="tileopener1"></div>
                    <div className="tileopener2"></div>
                    <div className="tileopener3"></div>
                </div>
            </div>
        </div>
        </Button>
    );
    // return(
    //     <div className="each-list-album">
    //         <div className="each-list-album-inner">
    //             <Button className="eachartcover" onClick={display} title={album.Album}>
    //                 <div className="eachshadow"></div>
    //                 <div className={ (playingSong.Album === album.Album) ? "showplaybuttonfixed" : "showplaybutton" }>
    //                     <Button className="innerplaybutton" onClick={handlePlayPause}
    //                     title={ (!songIsPaused && playingSong.Album === album.Album) ? "Pause" : "Play" } >
    //                         <img src={ (!songIsPaused && playingSong.Album === album.Album) ? Pause : Play } alt="" />
    //                     </Button>
    //                 </div>
    //                 <div className="library-opener" onClick={handleMenu} title="More Options">
    //                     <div className="library-opener1"></div>
    //                     <div className="library-opener2"></div>
    //                     <div className="library-opener3"></div>
    //                 </div>
    //                 <img src={album.Thumbnail} alt="" className="eachalbumart" />
    //             </Button>
    //             <div className="eachalbumname" onClick={display}>{album.Album}</div>
    //             <span className="eachbottom">
    //                 <span>{album.AlbumArtist}</span>
    //             </span>
    //         </div>
    //     </div>
    // );
};

const SongsList = ({ songs, openerFunc, openerDetails, setOpenerDetails }) => {
    const [playingSong, setPlayingSong] = useContext(AlbumContext);
    const [songIsPaused, setSongIsPaused] = useContext(SongIsPausedContext);
    const [playing, setPlaying] = useContext(PlayerContext);
    const [,setQueue] = useContext(QueueContext);

    return(
        <div className="songs-list">
            <div className="songs-list-title">Songs</div>
            <div className="songs-list-container">
                {
                    songs.map(each => {
                        return <EachInSongList song={each} playingSong={playingSong} setPlayingSong={setPlayingSong}
                                songIsPaused={songIsPaused} openerFunc={openerFunc} playing={playing} setPlaying={setPlaying}
                                setSongIsPaused={setSongIsPaused} setQueue={setQueue}
                                openerDetails={openerDetails} setOpenerDetails={setOpenerDetails} />;
                    })
                }
            </div>
        </div>
    );
};

const AlbumsList = ({ albums, openerFunc, openerDetails, setOpenerDetails }) => {
    const [playingSong, setPlayingSong] = useContext(AlbumContext);
    const [songIsPaused, setSongIsPaused] = useContext(SongIsPausedContext);
    const [playing, setPlaying] = useContext(PlayerContext);
    const [,setQueue] = useContext(QueueContext);

    return(
        <div className="songs-list">
            <div className="songs-list-title">Albums</div>
            {/* <div className="albums-list-grid"> */}
            <div className="albums-list-container">
                {
                    albums.map(each => {
                        return <EachInAlbumList album={each} playingSong={playingSong} setPlayingSong={setPlayingSong}
                                songIsPaused={songIsPaused} playing={playing} setPlaying={setPlaying}
                                setSongIsPaused={setSongIsPaused} setQueue={setQueue} openerFunc={openerFunc}
                                openerDetails={openerDetails} setOpenerDetails={setOpenerDetails} />;
                    })
                }
            </div>
        </div>
    );
};

const NewSearch = () => {
    const [playingSong, setPlayingSong] = useContext(AlbumContext);
    const [input,] = useContext(SearchInputContext);
    const [openerDetails, setOpenerDetails] = useContext(MenuContext);
    const [queue, setQueue] = useContext(QueueContext);
    const [, setResObj] = useContext(ResponseBarContext);
    const [isLoading, setIsLoading] = useState(true);
    const [songsList, setSongsList] = useState([]);
    const [albumsList, setAlbumsList] = useState([]);
    const hist = useHistory();

    const call = async () => {
        const res = await sendRequest({
            method: "GET",
            endpoint: `/search?name=${input}`
        });
        setSongsList(res.songs);
        setAlbumsList(res.albums);
        setIsLoading(false);
    };

    const addTrackToQueue = (song) => {
        setOpenerDetails(prev => {
            return { ...prev, open: false };
        });
        const dummy = [ ...queue ];
        const len = dummy.length;
        if (len === 0) return;

        dummy[len] = { ...song, id: ++global.id };
        setQueue(dummy);
        setResObj(prev => {
            return { ...prev, open: true, msg: `Added ${song.Title || song.Album} to queue` };
        });
    };

    const playTrackNext = (song) => {
        setOpenerDetails(prev => {
            return { ...prev, open: false };
        });
        if (queue.length === 0) return;

        const curIndex = queue.indexOf(playingSong);
        const dummy = [ ...queue ];
        dummy.splice(curIndex+1, 0, { ...song, id: ++global.id });
        setQueue(dummy);
        setResObj({ open: true, msg: `Playing ${song.Title || song.Album} next` });
    };

    const goToAlbum = (song) => {
        setOpenerDetails({ ...openerDetails, open: false });
        hist.push(`${prefix}${basename}/album/${song._albumId}`);
    };

    const shareTrack = song => {
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
        navigator.clipboard.writeText(`${sharingBaseLink}/track/${song._albumId}/${song._trackId}`);
    };

    const handleSongMenu = (e, { dimensions, windowDim, song: album }) => {
        const data = [
            {
                name: "Add to queue",
                func: () => addTrackToQueue(album)
            },
            {
                name: "Play next",
                func: () => playTrackNext(album)
            },
            {
                name: "Go to album",
                func: () => goToAlbum(album)
            },
            {
                name: "Share track",
                func: () => shareTrack(album)
            }
            // {
            //     name: "Start radio",
            //     func: () => {}
            // }
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

    const addAlbumToQueue = (album) => {
        setOpenerDetails(prev => {
            return { ...prev, open: false };
        });
        const main = album.Type === "Album" ? album.Tracks : { ...album };
        const mainQueue = [ ...queue ];
        const len = mainQueue.length;
        if (len === 0) return;

        if (album.Type === "Single") {
            main.id = ++global.id;
            mainQueue.push(main);
            localStorage.setItem("queue",JSON.stringify(mainQueue));
            setQueue(mainQueue);
            setResObj({ open: true, msg: `Added single to queue` });
        } else {
            const newmain = [ ...main ];
            newmain.forEach(song => {
                const obj = { ...song, ...album, id: ++global.id };
                delete obj.Tracks;
                mainQueue.push(obj);
            });
            localStorage.setItem("queue",JSON.stringify(mainQueue));
            setQueue(mainQueue);
            setResObj({ open: true, msg: `Added album to queue` });
        }
    };

    const playAlbumNext = (album) => {
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
            const tracks = album.Tracks || [];
            [ ...tracks ].forEach((song,i) => {
                const obj = { ...song, ...album, id: ++global.id };
                delete obj.Tracks;
                mainQueue.splice(index+1+i, 0, obj);
            });
        }
        localStorage.setItem("queue",JSON.stringify(mainQueue));
        setQueue(mainQueue);
        setResObj({ open: true, msg: `Playing ${album.Album} next` });
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

    const handleAlbumMenu = (e, { dimensions, windowDim, song: album }) => {
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
        e.stopPropagation();
        setOpenerDetails({
            ...openerDetails,
            open: true,
            xValue: checkX(dimensions.x, windowDim.width),
            yValue: checkY(dimensions.y, windowDim.height, data.length),
            data
        });
    };

    useEffect(() => {
        setIsLoading(true);
        call();
    }, [input]);

    if (isLoading) {
        return <MidPanelLoader/>
    }
    return(
        <div className="search-page">
            <div className="inner-search-page">
                {
                    songsList.length !== 0 || albumsList.length !== 0 ?
                    <>
                    {
                        songsList.length !== 0 ?
                        <SongsList songs={songsList} openerFunc={handleSongMenu}
                        openerDetails={openerDetails} setOpenerDetails={setOpenerDetails} /> : null
                    }
                    <div style={{ width: "100%", height: "30px" }}></div>
                    {
                        albumsList.length !== 0 ?
                        <AlbumsList albums={albumsList} openerFunc={handleAlbumMenu}
                        openerDetails={openerDetails} setOpenerDetails={setOpenerDetails} /> : null
                    }
                    </> :
                    <div className="no-results">
                        <span>No results found for</span>
                        <p>'{input}'</p>
                    </div>
                }
            </div>
        </div>
    );
};



export default NewSearch;