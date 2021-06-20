import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import Opening from "./opening";
import Home from "./homepage";
import {
    keepServersActive,
    fullScreenGlobal,
    playingGlobal,
    CustomUseState,
    queueOpenedGlobal,
    openerGlobal,
    prefix,
    httpCheck,
    global
} from "./common";
import { BrowserRouter as Router, Route } from "react-router-dom";
let queueOpenedLocal, intervalTimeout = null, playingLocal, screenLocal;


const App = () => {
    httpCheck();
    const [screen, setScreen] = CustomUseState(fullScreenGlobal);
    const [queueOpened, setQueueOpened] = CustomUseState(queueOpenedGlobal);
    const [openerDetails, setOpenerDetails] = CustomUseState(openerGlobal);
    const [playing,] = CustomUseState(playingGlobal);
    screenLocal = screen;
    playingLocal = playing;
    queueOpenedLocal = queueOpened;

    if (intervalTimeout === null) {
        intervalTimeout = setInterval(() => {
            keepServersActive();
        }, 3*60*1000);
    }

    const screenSet = () => {
        setScreen({
            ...screenLocal,
            show: !screenLocal.show
        });
    };

    const keyDown = e => {
        // if (e.keyCode === 122 || e.keyCode === 27) {
        //     e.preventDefault();
        // }
        if (e.keyCode === 70 && !global.searchBarOpen) {
            e.preventDefault();
            if (playingLocal) {
                // screenSet();
            }
        }
    };

    const check = e => {
        if (queueOpenedLocal) {
            setQueueOpened(false);
        }
        setOpenerDetails({ ...openerDetails, open: false });
    };

    useEffect(() => {
        document.addEventListener("keydown",keyDown);
        window.addEventListener("popstate",check);
        return () => {
            document.removeEventListener("keydown",keyDown);
            window.removeEventListener("popstate",check);
        }
    },[]);

    return(
        <Router>
            <Route exact path={ prefix === "" ? "/" : prefix } component={Opening} />
            <Route path={`${prefix}/home`} component={Home} />
        </Router>
    )
};

ReactDOM.render(<App/>, document.getElementById("root"));