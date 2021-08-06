import React, { useEffect, useContext } from "react";
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
    basename,
    httpCheck,
    global
} from "./common";
import { BrowserRouter as Router, Route } from "react-router-dom";
import {
    FullScreenContext,
    QueueOpenedContext,
    MenuContext,
    PlayerContext,
    AlbumContext
} from "./index";
let queueOpenedLocal, intervalTimeout = null, playingLocal, screenLocal;


const App = () => {
    httpCheck();
    const [screen, setScreen] = useContext(FullScreenContext);
    const [queueOpened, setQueueOpened] = useContext(QueueOpenedContext);
    const [openerDetails, setOpenerDetails] = useContext(MenuContext);
    const [playing,] = useContext(PlayerContext);
    screenLocal = screen;
    playingLocal = playing;
    queueOpenedLocal = queueOpened;

    if (intervalTimeout === null) {
        intervalTimeout = setInterval(() => {
            keepServersActive();
        }, 3*60*1000);
    }

    const screenSet = () => {
        setScreen({ ...screen, show: !screen.show });
    };

    function keyDown(e) {
        // if (e.keyCode === 122 || e.keyCode === 27) {
        //     e.preventDefault();
        // }
        if (e.keyCode === 70 && !global.searchBarOpen) {
            e.preventDefault();
            if (playingLocal) {
                // screenSet();
            }
        }
    }

    function check(e) {
        if (queueOpenedLocal) {
            setQueueOpened(false);
        }
        setOpenerDetails(prev => {
            return { ...prev, open: false };
        });
    }

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
            <Route path={`${prefix}${basename}`} component={Home} />
        </Router>
    )
};

export default App;