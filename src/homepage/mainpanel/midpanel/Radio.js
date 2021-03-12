import { useState, useEffect } from "react";
import "../../../css/radiostyles.css";
import {
    CustomUseState,
    radioGlobal,
    playingGlobal,
    queueGlobal,
    albumGlobal,
    queueOpenedGlobal,
    // topBarGlobal,
    sendRequest
} from "../../../common";
import { MidPanelLoader } from "./index";
import Queue from "./Queue";


const ActualRadio = () => {
    const [isRadioOn,] = CustomUseState(radioGlobal);
    // const [song, setSong] = CustomUseState(albumGlobal);
    const [queue, setQueue] = CustomUseState(queueGlobal);
    // const [, setPlaying] = CustomUseState(playingGlobal);
    // const [topBarConfig, setTopBarConfig] = CustomUseState(topBarGlobal);
    const [isLoading, setIsLoading] = useState(true);

    const decide = (color) => {
        color = color.split(",");
        color[3] = "0.5)";
        color = color.join(",");
        return color;
    };

    const call = async () => {
        const res = await sendRequest({
            method: "GET",
            endpoint: `/shuffle`
        });
        setQueue(res);
        setIsLoading(false);
        // setPlaying(true);
        // setSong(res.data[0]);
        // setRadioOn(true);
    };

    useEffect(() => {
        if (!isRadioOn) {
            call();
        } else {
            setIsLoading(false);
        }
        // setTopBarConfig({
        //     buttonFunc: () => {},
        //     title: "",
        //     bgColor: "transparent",
        //     button: false
        // });
    }, []);

    if (isLoading) {
        return <MidPanelLoader/>
    }
    return(
        <div className="radio"
        // style={{ backgroundColor: `${decide(queue[1].Color)}` }}
        >
            <div className="topdiv">
                <div className="firstalbum">
                    <img src={queue[0].Thumbnail} alt=""/>
                </div>
                <div className="mainalbum">
                    <img src={queue[1].Thumbnail} alt=""/>
                </div>
                <div className="secondalbum">
                    <img src={queue[2].Thumbnail} alt=""/>
                </div>
            </div>
        </div>
    );
};

const Radio = () => {
    const [queueOpened,] = CustomUseState(queueOpenedGlobal);

    if (queueOpened) {
        return <Queue/>
    }
    return <ActualRadio/>
};


export default Radio;