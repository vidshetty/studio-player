import "../../../css/library.css";
import { useState, useEffect } from "react";
import { MidPanelLoader } from "./index";
import { HorizontalList } from "./HomeScreen";
import {
    wait,
    queueOpenedGlobal,
    CustomUseState,
    sendRequest,
    topBarGlobal,
    topBgColorGlobal
} from "../../../common";
import Queue from "./Queue";
let topBar;


const ActualLibrary = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [library, setLibrary] = useState({});
    const [topBarConfig, setTopBarConfig] = CustomUseState(topBarGlobal);
    const [topBgColor, setBgColor] = CustomUseState(topBgColorGlobal);
    topBar = topBarConfig;
    // let scrolled = false;

    const scrollHandler = (e) => {
        const top = e.currentTarget.scrollTop;
        sessionStorage.setItem("library-scroll",top);
        if (top > 200 && topBar.bgColor === "transparent") {
            setTopBarConfig({
                ...topBar,
                button: false,
                bgColor: topBgColor
            });
        } else if (top < 200 && topBar.bgColor !== "transparent") {
            setTopBarConfig({
                ...topBar,
                button: false,
                bgColor: "transparent"
            });
        }
    };

    useEffect(() => {
        const call = async () => {
            const saved = JSON.parse(sessionStorage.getItem("library"));
            if (saved !== null) {
                setLibrary(saved);
                setIsLoading(false);
                return;
            }
            const res = await sendRequest({
                method: "GET",
                endpoint: `/getLibrary`
            });
            await wait(500);
            sessionStorage.setItem("library",JSON.stringify(res));
            setLibrary(res);
            setIsLoading(false);
        };
        if (isLoading) {
            call();
        } else {
            const main = document.querySelector(".main");
            main.scrollTop = sessionStorage.getItem("library-scroll") || 0;
        }
        setTopBarConfig({
            ...topBar,
            button: false,
            // bgColor: "transparent"
        });
        // return () => {
        //     setTopBarConfig({
        //         ...topBar,
        //         button: false,
        //         bgColor: "transparent"
        //     }); 
        // };
    },[isLoading]);

    if (isLoading) {
        return <MidPanelLoader/>
    }
    return(
        <div className="library">
            <div className="main" onScroll={scrollHandler}>
                <div className="librarytop"
                style={{ backgroundColor: `${topBgColor}` }}
                >
                    <div className="innerlibrarytop">
                        <div className="forblur"></div>
                        <div className="bigtitle">Library</div>
                    </div>
                </div>
                <div className="librarybottom">
                    <div className="outline">
                        {/* <div className="bigmaintitle">
                            <p>Library</p>
                        </div> */}
                        {   
                            Object.keys(library).map(key => {
                                if (library[key].length !== 0) {
                                    return(
                                        <div className="list">
                                            <HorizontalList list={library[key]}/>
                                        </div>
                                    );
                                }
                                return null;
                            })
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

const Library = () => {
    const [queueOpened,] = CustomUseState(queueOpenedGlobal);
    
    if (queueOpened) {
        return <Queue/>
    }
    return <ActualLibrary/>
};


export default Library;