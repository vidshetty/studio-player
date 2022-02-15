import React, { useState, useEffect, useContext, useRef } from "react";
import { useHistory, useParams, useLocation } from "react-router-dom";
import "../../../css/albumview.css";
import Play from "../../../assets/playbutton-black.svg";
import Pause from "../../../assets/pausebutton-black.svg";
import AddButton from "../../../assets/addbutton-black.svg";
import copyright from "../../../assets/copyright.png";
import Button from "../../../Button";
import { pauseOrPlay } from "../../../homepage";
import { MidPanelLoader } from "./index";

import { APIService } from "../../../api-service";

import {
    prefix,
    basename,
    dateToString,
    global,
    sharingBaseLink
} from "../../../common";

import {
    SongIsPausedContext,
    AlbumContext,
    MenuContext,
    PlayerContext,
    ResponseBarContext,
    QueueContext
} from "../../../index";


const Trackview = () => {

    const [track, setTrack] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [releaseDate, setReleaseDate] = useState("");
    const [songPaused, setSongPaused] = useContext(SongIsPausedContext);
    const [playingSong, setPlayingSong] = useContext(AlbumContext);
    const [,setOpenerDetails] = useContext(MenuContext);
    const [,setResObj] = useContext(ResponseBarContext);
    const [queue, setQueue] = useContext(QueueContext);
    const [playing, setPlaying] = useContext(PlayerContext);
    const buttonRef = useRef(null);
    const params = useParams();
    const hist = useHistory();
    const location = useLocation();

    const decidePlayOrPause = () => playingSong._trackId === track._trackId;

    const playButton = e => {
        if (decidePlayOrPause()) {
            pauseOrPlay();
            return;
        }

        if (!playing) setPlaying(true);
        const item = { ...track };
        item.id = global.id = 0;
        setQueue([ item ]);
        setSongPaused(true);
        setPlayingSong(item);
    };

    const addTrackToQueue = e => {
        setOpenerDetails(prev => {
            return { ...prev, open: false };
        });
        const dummy = [ ...queue ];
        const len = dummy.length;
        if (len === 0) return;

        dummy[len] = { ...track, id: ++global.id };
        setQueue(dummy);
        setResObj(prev => {
            return { ...prev, open: true, msg: `Added ${track.Title} to queue` };
        });
    };

    const playTrackNext = () => {
        setOpenerDetails(prev => {
            return { ...prev, open: false };
        });
        if (queue.length === 0) return;

        const curIndex = queue.findIndex(e => e.id === playingSong.id);
        const dummy = [ ...queue ];
        dummy.splice(curIndex+1, 0, { ...track, id: ++global.id });
        setQueue(dummy);
        setResObj(prev => {
            return { ...prev, open: true, msg: `Playing ${track.Title} next` };
        });
    };

    const shareTrack = () => {
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
        navigator.clipboard.writeText(`${sharingBaseLink}/track/${track._albumId}/${track._trackId}`);
    };

    const sharePlayableTrack = () => {
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
        navigator.clipboard.writeText(`${sharingBaseLink}/track/${track._albumId}/${track._trackId}/playable`);
    };

    const goToAlbum = () => {
        setOpenerDetails(prev => {
            return { ...prev, open: false };
        });
        hist.push(`${prefix}${basename}/album/${track._albumId}`);
    };

    const handleMenu = e => {
        e.stopPropagation();
        const dimensions = { x: e.clientX, y: e.clientY };
        const data = [
            {
                name: `Play next in queue`,
                func: playTrackNext
            },
            {
                name: "Share track",
                func: shareTrack
            },
            {
                name: "Share playable track",
                func: sharePlayableTrack
            },
            {
                name: "Go to album",
                func: goToAlbum
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

    const addAndDisplay = () => {
        const div = track.Duration.split(": ");
        const min = parseFloat(div[0]);
        const sec = parseFloat(div[1]);
        return `${min} minutes${ sec !== 0 ? ` ${sec} seconds` : `` }`;
    };

    const call = async () => {
        const res = await APIService.getTrack(params.albumId, params.trackId);
        if (res === null) return;
        if (res && res.track) {
            setTrack(res.track);
            setReleaseDate(dateToString(res.track.releaseDate));
            setIsLoading(false);
            return;
        }
        hist.push(`${prefix}${basename}/homescreen`);
    };

    const playTrack = () => {
        buttonRef.current = document.querySelector(".playbuttonview");
        buttonRef.current && buttonRef.current.click();
    };


    useEffect(() => {
        if (isLoading) call();
        else if (
            location.pathname.includes("playable") &&
            queue.length === 0
        ) playTrack();
    }, [isLoading]);


    if (isLoading) {
        return <MidPanelLoader/>;
    }
    return (
        <div className="newalbum">
            <div className="topalbumview">
                <div className="coverview">
                    <img src={track.Thumbnail} alt="" />
                </div>
                <div className="detailsview">
                    <div className="innerdetailsview">
                        <div className="albumnameview">{track.Title || track.Album}</div>
                        <div style={{width: "100%", height: "10px"}}></div>
                        <div className="detailsoneview">
                            <div className="albumtype">{track.Type}</div>
                            <div className="content-separator"><div></div></div>
                            {
                                track.Artist.split(", ").length > 1 ? 
                                track.Artist.split(", ").map((each,i) => {
                                    return (
                                        <>
                                            <div className="albumartistview">{each}</div>
                                            {
                                                i !== track.Artist.split(", ").length-1 ?
                                                <div className="content-separator"><div></div></div> : ""
                                            }
                                        </>
                                    );
                                }) :
                                <div className="albumartistview">{track.Artist}</div>
                            }
                            <div className="content-separator"><div></div></div>
                            <div className="albumyear">{track.Year}</div>
                        </div>
                        <div className="detailsoneview">
                            <div className="albumtype">
                                {"1 Song"}
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
                            <Button className="addtoqueue" onClick={addTrackToQueue}>
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


export default Trackview;