import "../../../css/homestyles.css";
import "../../../css/teststyles.css";
import "../../../css/albumview.css";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Route, Switch } from "react-router-dom";
import HomeScreen from "./HomeScreen";
import AlbumView from "./AlbumView";
import TrackView from "./TrackView";
import Library from "./Library";
import Search from "./Search";
import Queue from "./Queue";

import {
    prefix,
    basename
} from "../../../common";

import {
    MenuContext,
    PlayerContext
} from "../../../index";


// Mid
let openLocal = null;
let scrollTimeout = null;


// const NewReleases = () => {
//     return(
//         <div className="third"></div>
//     );
// };


const Mid = () => {

    const [openerDetails,] = useContext(MenuContext);
    const [playing,] = useContext(PlayerContext);
    const [scroll, setScroll] = useState(null);
    openLocal = openerDetails.open;
    const scrollRef = useRef(null);

    const removeClass = () => {
        scrollRef.current.classList.remove("scrolling");
    };

    const handleScroll = e => {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollRef.current.classList.add("scrolling");
        scrollTimeout = setTimeout(removeClass, 1000);
    };

    useEffect(() => {
        scrollRef.current = document.querySelector(".main-outer-container");
        scrollRef.current && scrollRef.current.addEventListener("scroll", handleScroll);

        return () => {
            scrollRef.current && scrollRef.current.removeEventListener("scroll", handleScroll);
        };
    }, []);

    useEffect(() => {
        scrollRef.current = document.querySelector(".main-outer-container");
        if (openLocal) {
            setScroll(scrollRef.current.style.overflowY);
            scrollRef.current.style.overflowY = "hidden";
        } else {
            scrollRef.current.style.overflowY = scroll;
        }
    }, [openLocal]);

    return(
        <div className="midmain-without-player">
            { playing ? <Queue/> : null }
            <div className="main-outer-container">
                <Switch>
                    <Route path={`${prefix}${basename}/homescreen`}><HomeScreen/></Route>
                    <Route path={`${prefix}${basename}/search`}><Search/></Route>
                    <Route path={`${prefix}${basename}/album/:albumId/playable`}><AlbumView/></Route>
                    <Route path={`${prefix}${basename}/album/:albumId`}><AlbumView/></Route>
                    <Route path={`${prefix}${basename}/track/:albumId/:trackId/playable`}><TrackView/></Route>
                    <Route path={`${prefix}${basename}/track/:albumId/:trackId`}><TrackView/></Route>
                    <Route path={`${prefix}${basename}/library`}><Library/></Route>
                    {/* <Route path={`${prefix}${basename}/new-releases`}><NewReleases/></Route> */}
                </Switch>
            </div>
        </div>
    );

};


export const MidPanelLoader = () => {
    return(
        <div className="loader">
            <div className="loaderinner">
                <div className="one"></div>
                <div className="two"></div>
                <div className="three"></div>
            </div>
        </div>
    );
};

export default Mid;