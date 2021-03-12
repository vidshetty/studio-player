import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import Opening from "./opening";
import Home from "./homepage";
import {
    keepServersActive,
    fullScreenGlobal,
    playingGlobal,
    CustomUseState
} from "./common";
import { HashRouter as Router, Route } from "react-router-dom";
// const { ipcRenderer } = window.electron;


const App = () => {
    const [screen, setScreen] = CustomUseState(fullScreenGlobal);
    const [playing,] = CustomUseState(playingGlobal);
    let screenLocal = screen;
    let playingLocal = playing;

    setInterval(keepServersActive, 5*60*1000);

    const screenSet = () => {
        setScreen({
            ...screenLocal,
            show: !screenLocal.show
        });
        // ipcRenderer.send("full");
    };

    const keyDown = e => {
        if (e.keyCode === 122 || e.keyCode === 27) {
            e.preventDefault();
        }
        if (e.keyCode === 70) {
            e.preventDefault();
            if (playingLocal) {
                screenSet();
            }
        }
    };

    useEffect(() => {
        document.addEventListener("keydown",keyDown);
        return () => {
            document.removeEventListener("keydown",keyDown);
        }
    });

    return(
        <Router>
            <Route exact path="/" component={Opening} />
            <Route path="/home" component={Home} />
        </Router>
    )
};

ReactDOM.render(<App/>, document.getElementById("root"));