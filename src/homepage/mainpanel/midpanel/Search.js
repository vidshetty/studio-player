import React, { useState, useEffect, useContext } from "react";
import { useHistory, useLocation } from "react-router-dom";
import "../../../css/searchstyles.css";
import "../../../css/homestyles.css";
import "../../../css/hometeststyles.css";
import Play from "../../../assets/playbutton-white.svg";
import Pause from "../../../assets/pausebutton-white.svg";
import Button from "../../../Button";
import { MidPanelLoader } from "./index";
import { pauseOrPlay } from "../../index";

import {
    sendRequest,
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
    SearchInputContext,
    SongIsPausedContext
} from "../../../index";


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
                        <div className="keep-each-song-dummyshadow">
                            <Button className="each-button" onClick={handlePlayPause}>
                                {
                                    determine() ?
                                    <img src={ songIsPaused ? Play : Pause } alt="" /> :
                                    <img src={Play} alt="" />
                                }
                            </Button>
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
        <div className="each-list-song" onMouseOver={() => setHovered(true)} onMouseOut={() => setHovered(false)}>
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

};

const SongsList = ({ songs, openerFunc, openerDetails, setOpenerDetails, songsOpenerFunc }) => {

    const [playingSong, setPlayingSong] = useContext(AlbumContext);
    const [songIsPaused, setSongIsPaused] = useContext(SongIsPausedContext);
    const [playing, setPlaying] = useContext(PlayerContext);
    const [,setQueue] = useContext(QueueContext);

    const handleMenu = e => {
        e.stopPropagation();
        const dimensions = { x: e.clientX, y: e.clientY };
        const windowDim = { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight };
        songsOpenerFunc(e, { dimensions, windowDim });
    };

    return(
        <div className="songs-list">
            <div className="songs-list-title">
                <p>Songs</p>
                <div className="each-list-opener">
                    <div className="tileopener" onClick={handleMenu}>
                        <div className="tileopener1"></div>
                        <div className="tileopener2"></div>
                        <div className="tileopener3"></div>
                    </div>
                </div>
            </div>
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
            <div className="songs-list-title">
                <p>Albums</p>
            </div>
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
    const [player, setPlayer] = useContext(PlayerContext);
    const [queue, setQueue] = useContext(QueueContext);
    const [,setResObj] = useContext(ResponseBarContext);
    const [isLoading, setIsLoading] = useState(true);
    const [songsList, setSongsList] = useState([]);
    const [albumsList, setAlbumsList] = useState([]);
    const hist = useHistory();
    const location = useLocation();

    const call = async () => {
        const searchValue = location.search.replace("q","name");
        const res = await sendRequest({
            method: "GET",
            endpoint: `/search${searchValue}`
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

    const sharePlayableTrack = song => {
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
        navigator.clipboard.writeText(`${sharingBaseLink}/track/${song._albumId}/${song._trackId}/playable`);
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
            },
            {
                name: "Share playable track",
                func: () => sharePlayableTrack(album)
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
            setQueue(mainQueue);
            setResObj({ open: true, msg: `Added single to queue` });
        } else {
            const newmain = [ ...main ];
            newmain.forEach(song => {
                const obj = { ...song, ...album, id: ++global.id };
                delete obj.Tracks;
                mainQueue.push(obj);
            });
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

    const sharePlayableAlbum = item => {
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
        navigator.clipboard.writeText(`${sharingBaseLink}/album/${item._albumId}/playable`);
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
            },
            {
                name: "Share playable album",
                func: () => sharePlayableAlbum(album)
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

    const playList = e => {
        setOpenerDetails(prev => {
            return { ...prev, open: false };
        });

        const list = [];
        songsList.forEach((each,i) => {
            const obj = { ...each };
            obj.id = global.id = i;
            list.push(obj);
        });
        if (!player) setPlayer(true);
        setPlayingSong(list[0]);
        setQueue(list);
        setResObj(prev => {
            return { ...prev, open: true, msg: "Playing all tracks" };
        });
    };

    const addToList = e => {
        setOpenerDetails(prev => {
            return { ...prev, open: false };
        });
        if (!player) return;

        const list = [];
        songsList.forEach(each => {
            const obj = { ...each };
            obj.id = ++global.id;
            list.push(obj);
        });
        setQueue(prev => {
            return [ ...prev, ...list ];
        });
        setResObj(prev => {
            return { ...prev, open: true, msg: "Added all tracks to queue" };
        });
    };

    const playNextInList = e => {
        setOpenerDetails(prev => {
            return { ...prev, open: false };
        });
        if (!player) return;

        const list = [];
        songsList.forEach(each => {
            const obj = { ...each };
            obj.id = ++global.id;
            list.push(obj);
        });
        setQueue(prev => {
            const currentPlayingIndex = prev.findIndex(each => {
                return each.id === playingSong.id;
            });
            if (currentPlayingIndex === -1) return prev;
            prev.splice(currentPlayingIndex+1, 0, ...list);
            return prev;
        });
        setResObj(prev => {
            return { ...prev, open: true, msg: "Playing all tracks next" };
        });
    };

    const handleRootSongsMenu = (e, { dimensions, windowDim }) => {
        const data = [
            {
                name: "Play this list",
                func: playList
            },
            {
                name: "Add this list to queue",
                func: addToList
            },
            {
                name: "Play this list next",
                func: playNextInList
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


    useEffect(() => {
        setIsLoading(true);
        call();
    }, [location.search]);

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
                        openerDetails={openerDetails} setOpenerDetails={setOpenerDetails}
                        songsOpenerFunc={handleRootSongsMenu} /> : null
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