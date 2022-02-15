import React, { useState, useEffect, useRef, useContext } from "react";
import "../../../css/albumview.css";
import { MidPanelLoader } from "./index";
import { useParams, useHistory, useLocation } from "react-router-dom";
import Play from "../../../assets/playbutton-black.svg";
import Pause from "../../../assets/pausebutton-black.svg";
import PlayWhite from "../../../assets/playbutton-white.svg";
import PauseWhite from "../../../assets/pausebutton-white.svg";
import AddButton from "../../../assets/addbutton-black.svg";
import copyright from "../../../assets/copyright.png";
import { pauseOrPlay } from "../../../homepage";
import Button from "../../../Button";

import { APIService } from "../../../api-service";

import {
    checkX,
    checkY,
    global,
    prefix,
    basename,
    dateToString,
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


const NewSongRow = ({ song, index, album, openerFunc }) => {

    const [hovered, setHovered] = useState(false);
    const [currentSong, setCurrentSong] = useContext(AlbumContext);
    const [songPaused, setSongPaused] = useContext(SongIsPausedContext);
    const [playing, setPlaying] = useContext(PlayerContext);
    const [,setQueue] = useContext(QueueContext);

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
        setSongPaused(true);
        setCurrentSong(playingSong);
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
    const [album, setAlbum] = useState(null);
    const [releaseDate, setReleaseDate] = useState("");
    const [playingSong, setPlayingSong] = useContext(AlbumContext);
    const [,setOpenerDetails] = useContext(MenuContext);
    const [playing, setPlaying] = useContext(PlayerContext);
    const [songPaused, setSongPaused] = useContext(SongIsPausedContext);
    const [queue, setQueue] = useContext(QueueContext);
    const [,setResObj] = useContext(ResponseBarContext);
    const topDiv = useRef(null);
    const buttonRef = useRef(null);
    const hist = useHistory();
    const currentLocation = useLocation();


    const decidePlayOrPause = () => playingSong._albumId === album._albumId;

    const addAlbumToQueue = () => {
        const main = album.Type === "Album" ? [ ...album.Tracks ] : { ...album };
        const mainQueue = [ ...queue ];
        const len = mainQueue.length;
        if (len === 0) return;
        if (album.Type === "Single") {
            main.id = ++global.id;
            mainQueue.push(main);
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
        setQueue(mainQueue);
        setResObj(prev => {
            return { ...prev, open: true, msg: `Playing ${album.Album} next` };
        });
    };

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
        setSongPaused(true);
    };

    const call = async () => {
        const res = await APIService.getAlbum(params.albumId);
        if (res === null) return;
        if (res && res.album) {
            setReleaseDate(dateToString(res.album.releaseDate));
            setAlbum(res.album);
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

    const sharePlayableAlbum = () => {
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
        navigator.clipboard.writeText(`${sharingBaseLink}/album/${album._albumId}/playable`);
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
            },
            {
                name: "Share playable album",
                func: sharePlayableAlbum
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

    const sharePlayableTrack = selectedSong => {
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
        navigator.clipboard.writeText(`${sharingBaseLink}/track/${album._albumId}/${selectedSong._trackId}/playable`);
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
            },
            {
                name: "Share playable track",
                func: () => sharePlayableTrack(selectedSong)
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

    const playAlbum = () => {
        buttonRef.current = document.querySelector(".playbuttonview");
        buttonRef.current && buttonRef.current.click();
    };


    useEffect(() => {
        setIsLoading(true);
    }, [currentLocation.pathname]);

    useEffect(() => {
        if (isLoading) call();
        else if (
            currentLocation.pathname.includes("playable") &&
            queue.length === 0 &&
            Object.keys(album).length > 0
        ) playAlbum();
        topDiv.current = document.querySelector(".newalbum");
    }, [isLoading]);


    if (isLoading) {
        return <MidPanelLoader/>;
    }
    return (
        <div className="newalbum">
            <div className="topalbumview">
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