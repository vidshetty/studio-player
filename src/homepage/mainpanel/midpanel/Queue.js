import "../../../css/queuestyles.css";
import { useState, useEffect } from "react";
import Close from "../../../assets/deletewhite.svg";
import Placeholder from "../../../assets/placeholder.svg";
import { MidPanelLoader } from "./index";
import {
    CustomUseState,
    queueGlobal,
    queueOpenedGlobal,
    songIsPausedGlobal,
    albumGlobal,
    responseBar,
    // keepButtonGlobal,
    // onClickFuncGlobal
    topBarGlobal
} from "../../../common";
let finalQueue = [], queueLength, songIndex, smallArr;
let actualQueue, firstpart, lastpart, topBar;



const NowPlaying = ({ songIsPaused, song }) => {
    return(
        <div className="nowplaying">
            <div className="innernowplaying">
                <div className="firstpart">
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
                </div>
                <div className="nowplayingart">
                    <img src={song.Thumbnail} alt=""/>
                </div>
                <div className="queuesongdetails">
                    <div className="startingpart">
                        <div className="playingsongname"
                        style={{ color: "aquamarine" }}>{song.Title || song.Album}</div>
                        <div className="playingsongartist">{song.Artist}</div>
                    </div>
                    <div className="centerpart">
                        {/* {song.Album} */}
                    </div>
                    <div className="lastpart">
                        <div className="lastpartduration">{song.Duration}</div>
                        <div className="removesong">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const NowPlaying2 = () => {
    return(
        <div className="nowplaying2">
            <div className="innernowplaying2"></div>
        </div>
    );
};


const Queue = () => {
    const [, setQueueOpened] = CustomUseState(queueOpenedGlobal);
    const [songIsPaused, setSongIsPaused] = CustomUseState(songIsPausedGlobal);
    const [song, setSong] = CustomUseState(albumGlobal);
    const [queue, setQueue] = CustomUseState(queueGlobal);
    const [update, setUpdate] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [,setResBar] = CustomUseState(responseBar);
    // const [,setKeepButton] = CustomUseState(keepButtonGlobal);
    // const [,setOnClickFunc] = CustomUseState(onClickFuncGlobal);
    const [topBarConfig, setTopBarConfig] = CustomUseState(topBarGlobal);
    actualQueue = queue;
    topBar = topBarConfig;
    queueLength = queue.length;
    songIndex = actualQueue.indexOf(song);
    firstpart = actualQueue.slice(0,songIndex);
    lastpart = actualQueue.slice(songIndex+1,queueLength);

    const clearQueue = (e) => {
        e.stopPropagation();
        const index = actualQueue.indexOf(song);
        actualQueue = [actualQueue[index]];
        localStorage.setItem("queue",JSON.stringify(actualQueue));
        setQueue(actualQueue);
        setResBar({ open: true, msg: "Queue cleared" });
        setUpdate(!update);
    };
    
    const initial = () => {
        finalQueue = [];
        if (queueLength === 1) {
            return;
        }
        songIndex = queue.indexOf(song);
        if (songIndex === 0) {
            finalQueue = queue.slice(1,queueLength);
            return;
        }
        if (songIndex === queueLength-1) {
            finalQueue = queue.slice(0,queueLength-1);
            return;
        }
        finalQueue = queue.slice(songIndex+1,queueLength);
        smallArr = queue.slice(0,songIndex);
        smallArr.forEach(each => {
            finalQueue.push(each);
        });
        return;
    };

    const close = () => {
        setTopBarConfig({
            ...topBar,
            button: false
        });
        setQueueOpened(false);
    };

    const call = () => {
        // setTopBarConfig({
        //     button: true,
        //     buttonFunc: close,
        //     bgColor: "transparent",
        //     title: ""
        // });
        // setKeepButton(true);
        // setOnClickFunc(close);
        setTopBarConfig({
            button: true,
            title: "",
            bgColor: "transparent",
            buttonFunc: close
        });
    };

    const removeSong = (song,e) => {
        e.stopPropagation();
        const removeIndex = actualQueue.indexOf(song);
        if (removeIndex !== -1) {
            actualQueue.splice(removeIndex, 1);
            localStorage.setItem("queue",JSON.stringify(actualQueue));
            setQueue(actualQueue);
            setUpdate(!update);
        }
    };

    const albumName = () => {
        const index = songIndex+1 < actualQueue.length ? songIndex+1 : 0;
        return actualQueue[index].Album;
    };

    // initial();

    const lessen = (num) => {
        if (song.Color) {
            let color = song.Color.split(",");
            color[3] = `${num})`;
            color = color.join(",");
            return color;
        }
    };

    useEffect(() => {
        call();
        setIsLoading(false);
        return () => {
            // setTopBarConfig({
            //     button: false,
            //     buttonFunc: () => {},
            //     title: "",
            //     bgColor: "transparent"
            // });
            // setKeepButton(false);
            // setOnClickFunc(() => {});
            setTopBarConfig({
                ...topBar,
                button: false
            });
        };
    }, [update]);


    if (isLoading) {
        return <MidPanelLoader/>
    }
    return(
        <div className="queue"
        style={{ backgroundImage: `linear-gradient(to right,${lessen(0.2)},#121212,#121212,#121212)`}}
        >
            <div className="queuetitle">Now Playing</div>
            <div className="bottomqueue">
                <div className="leftqueuepart">
                    <div className="leftalbumcontainer" style={{
                        backgroundImage: `url(${Placeholder})`,
                        backgroundSize: "cover",
                    }}>
                        <img src={song.Thumbnail} alt="" 
                        // style={{boxShadow: `0px 0px 20px ${lessen(0.5)}`}}
                        />
                    </div>
                </div>
                <div className="rightqueuepart">
                    <div className="nowplayingtitle">Now Playing</div>
                    <NowPlaying songIsPaused={songIsPaused} song={song}/>
                    {/* <NowPlaying2/> */}
                    { actualQueue.length !== 1 ?
                        <div className="nowplayingtitle">
                            <div className="frontblock">Next from: {albumName()}</div>
                            <div className="backblock" onClick={clearQueue}>Clear queue</div>
                        </div> : ""
                    }
                    {
                        lastpart.length !== 0 ?
                        <div className="queuelist">
                            {
                                lastpart.map((each,i) => {
                                    return(
                                        <div className="queuelistsong" onClick={() => {
                                            console.log("songindex",songIndex,"i",i);
                                            // if (songIndex !== i) {
                                                console.log("lastpart clicked");
                                                setSong(each);
                                                setSongIsPaused(true);
                                            // }
                                        }}>
                                            <div className="dummyanim">{songIndex+i+2}</div>
                                            <div className="nowplayingart" style={{
                                                backgroundImage: `url(${Placeholder})`,
                                                backgroundSize: "cover"
                                            }}>
                                                <img src={each.Thumbnail} alt=""/>
                                            </div>
                                            <div className="queuesongdetails">
                                                <div className="startingpart">
                                                    <div className="queuesongname">{each.Title || each.Album}</div>
                                                    <div className="queuesongartist">{each.Artist}</div>
                                                </div>
                                                <div className="centerpart">
                                                    {/* {each.Album} */}
                                                </div>
                                                <div className="lastpart">
                                                    <div className="lastpartduration">{each.Duration}</div>
                                                    <div className="removesong">
                                                        <div className="destroyplayer" onClick={(e) => removeSong(each,e)}>
                                                            <img src={Close} alt="" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            }
                        </div> : ""
                    }
                    {
                        firstpart.length !== 0 ?
                        <div className="queuelist">
                            {
                                firstpart.map((each,i) => {
                                    return(
                                        <div className="queuelistsong" onClick={() => {
                                            if (songIndex !== i) {
                                                console.log("firspart click");
                                                setSong(each);
                                                setSongIsPaused(true);
                                            }
                                        }}>
                                            <div className="dummyanim">{i+1}</div>
                                            <div className="nowplayingart" style={{
                                                backgroundImage: `url(${Placeholder})`,
                                                backgroundSize: "cover"
                                            }}>
                                                <img src={each.Thumbnail} alt=""/>
                                            </div>
                                            <div className="queuesongdetails">
                                                <div className="startingpart">
                                                    <div className="queuesongname">{each.Title || each.Album}</div>
                                                    <div className="queuesongartist">{each.Artist}</div>
                                                </div>
                                                <div className="centerpart">
                                                    {/* {each.Album} */}
                                                </div>
                                                <div className="lastpart">
                                                    <div className="lastpartduration">{each.Duration}</div>
                                                    <div className="removesong">
                                                        <div className="destroyplayer" onClick={(e) => removeSong(each,e)}>
                                                            <img src={Close} alt="" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            }
                        </div> : ""
                    }
                </div>
            </div>
        </div>
    );
};


export default Queue;