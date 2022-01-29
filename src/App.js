import React, { useEffect, useContext } from "react";
import Opening from "./opening";
import Home from "./homepage";
import {
    keepServersActive,
    prefix,
    basename
} from "./common";
import { BrowserRouter as Router, Route } from "react-router-dom";
import {
    QueueOpenedContext,
    MenuContext,
    PlayerContext
} from "./index";
let queueOpenedLocal, playingLocal;


const App = () => {

    const [queueOpened, setQueueOpened] = useContext(QueueOpenedContext);
    const [,setOpenerDetails] = useContext(MenuContext);
    const [playing,] = useContext(PlayerContext);
    playingLocal = playing;
    queueOpenedLocal = queueOpened;

    const callServersInterval = () => {
        setInterval(() => {
            keepServersActive();
        }, 3*60*1000);
    };

    function check(e) {
        if (queueOpenedLocal) {
            setQueueOpened(false);
        }
        setOpenerDetails(prev => {
            return { ...prev, open: false };
        });
    }

    function unload(e) {
        if (playingLocal) {
            e.preventDefault();
            e.returnValue = "";
        }
    }

    useEffect(() => {
        keepServersActive();
        callServersInterval();
        window.addEventListener("popstate",check);
        // window.addEventListener("beforeunload",unload);
        return () => {
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