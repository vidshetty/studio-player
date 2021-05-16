import Mid, { MidPanelLoader } from "./midpanel";
import { Link, useLocation, useHistory } from "react-router-dom";
import { useState, useEffect } from "react";
// import logo from "../../assets/bluelogo.svg";
import logo from "../../assets/latest-whiteblack.svg";
// import logo from "../../assets/aquamarinelogo.svg";
// import logo from "../../assets/blackandwhitelogo.svg";
import home from "../../assets/homewhite.svg";
import search from "../../assets/searchwhite.svg";
import library from "../../assets/librarywhite.svg";
import homelight from "../../assets/homelight.svg";
import searchlight from "../../assets/searchlight.svg";
import librarylight from "../../assets/librarylight.svg";
import radio from "../../assets/radio2.svg";
// import radio from "../../assets/mainshuffle.svg";
import radiolight from "../../assets/radiolight2.svg";
import dropdown from "../../assets/dropdown.png";
// import radiolight from "../../assets/mainshufflelight.svg";
import tick from "../../assets/tickmark.svg";
import "../../css/homestyles.css";
import "../../css/teststyles.css";
import "../../css/searchstyles.css";
import {
    CustomUseState,
    playingGlobal,
    tabGlobal,
    routesGlobal,
    queueOpenedGlobal,
    topBarGlobal,
    searchBarGlobal,
    prefix,
    profileOpener
} from "../../common";
let topBar, tabLocal, queueOpenedLocal;


const Left = () => {
    const topList = ["Home", "Search", "Library"];
    const normalList = ["Home","Search","New Releases","Albums","Artists","Shuffle"];
    const playlists = ["Most Played","Favorites","New Releases","Liked"];
    // const playlists = [];
    // const [playing, setPlaying] = CustomUseState(playingGlobal);
    const [playing,] = useState(false);
    const [tab, setTab] = CustomUseState(tabGlobal);
    const [,setRoutes] = CustomUseState(routesGlobal);
    const [searchConfig, setSearchConfig] = CustomUseState(searchBarGlobal);
    let searchBar = searchConfig;
    // const [keepButton, setKeepButton] = CustomUseState(keepButtonGlobal);
    // const [,setOnClickFunc] = CustomUseState(onClickFuncGlobal);
    // const [topTitle, setTopTitle] = CustomUseState(topTitleGlobal);
    // const [topColor, setBgColor] = CustomUseState(topBgColor);
    const [topBarConfig, setTopBarConfig] = CustomUseState(topBarGlobal);
    const [queueOpened, setQueueOpened] = CustomUseState(queueOpenedGlobal);
    topBar = topBarConfig;
    tabLocal = tab;


    (() => {
        let loc;
        if (window.location.hash !== "") {
            loc = window.location.hash.split("/")[2];
        } else {
            loc = window.location.pathname.split("/")[2];
        }
        if (queueOpened) {
            setTab("");
            return;
        }
        switch(loc) {
            case "homescreen":
                if (tabLocal === loc) break;
                setTab("Home");
                break;
            case "search":
                if (tabLocal === loc) break;
                setTab("Search");
                break;
            case "library":
                if (tabLocal === loc) break;
                setTab("Library");
                break;
            case "radio":
                if (tabLocal === loc) break;
                setTab("Radio");
                break;
            case "new-releases":
                if (tabLocal === loc) break;
                setTab("New Releases");
                break;
            default:
                if (tabLocal === "") break;
                setTab("");
                break;
        }
    })();

    const goToHome = () => {
        setTopBarConfig({
            button: false,
            buttonFunc: () => {},
            title: "",
            bgColor: "transparent"
        });
        // setKeepButton(false);
        // setOnClickFunc(() => {});
        // setTopTitle("");
        // setBgColor("transparent");
        setQueueOpened(false);
        setTab("Home");
        setRoutes(["/home/homescreen"]);
    };

    const calc = (item) => {
        if(item === "Home") return "/home/homescreen";
        else if(item === "Search") return "/home/search";
        else if(item === "New Releases") return "/home/new-releases";
        else if(item === "Library") return "/home/library";
        else if(item === "Radio") return "/home/radio";
        return "/home/homescreen";
    };

    const setFuncs = (item) => {
        if (item === tabLocal) {
            return;
        }
        console.log("clicked")
        setTopBarConfig({
            button: false,
            buttonFunc: () => {},
            title: "",
            bgColor: "transparent"
        });
        if (item !== "Search" && searchBar.show) {
            setSearchConfig({
                ...searchBar,
                show: false
            });
        } 
        setQueueOpened(false);
        sessionStorage.setItem("home-scroll",0);
        sessionStorage.setItem("library-scroll",0);
    };

    const setRouteFunc = (item) => {
        if(item === "Home") setRoutes(["/home/homescreen"]);
        else if(item === "Search") setRoutes(["/home/search"]);
        else if(item === "New Releases") setRoutes(["/home/new-releases"]);
        else if(item === "Library") setRoutes(["/home/library"]);
        else if(item === "Radio") setRoutes(["/home/radio"]);
        else if(item === "Most Played") setRoutes(["/home/mostplayed"]);
        else setRoutes(["/home/homescreen"]);
    };

    const setIcon = (item) => {
        if (item === "Home") return item === tab ? home : homelight;
        else if (item === "Search") return item === tab ? search : searchlight;
        else if (item === "Library") return item === tab ? library : librarylight;
        else if (item === "Radio") return item === tab ? radio : radiolight;
    };

    const onMouseOver = (item, e) => {
        if (item === "Home") {
            e.currentTarget.children[0].src = home;
        } else if (item === "Search") {
            e.currentTarget.children[0].src = search;
        } else if (item === "Library") {
            e.currentTarget.children[0].src = library;
        } else if (item === "Radio") {
            e.currentTarget.children[0].src = radio;
        } else {
            e.currentTarget.children[0].src = "";
        }
    };
    
    const onMouseOut = (item, e) => {
        if (item === "Home") {
            e.currentTarget.children[0].src = item === tab ? home : homelight;
        } else if (item === "Search") {
            e.currentTarget.children[0].src = item === tab ? search : searchlight;
        } else if (item === "Library") {
            e.currentTarget.children[0].src = item === tab ? library : librarylight;
        } else if (item === "Radio") {
            e.currentTarget.children[0].src = item === tab ? radio : radiolight;
        } else {
            e.currentTarget.children[0].src = "";
        }
    };

    const resetTop = () => {
        // if (keepButton === true) {
        //     setKeepButton(false);
        // }
        // if (topColor !== "transparent") {
        //     setBgColor("transparent");
        // }
        // if (topTitle !== "") {
        //     setTopTitle("");
        // }
    };

    return(
        <div className={ playing ? "leftmain-with-player" : "leftmain-without-player" }
        // onClick={resetTop}
        >
            <Link to="/home/homescreen" style={{ textDecoration: "none" }}>
                <div className="logodiv">
                    <img src={logo} alt="logo" onClick={goToHome}/>
                    <p onClick={goToHome}>Studio</p>
                </div>
            </Link>
            <div className="headlist">
                {
                    topList.map(item => {
                        return(
                            <Link to={calc(item)} style={{ textDecoration: "none" }} onClick={() => setFuncs(item)}>
                                <div onClick={() => {
                                    setRouteFunc(item);
                                    setTab(item);
                                    }} className={ item === tab ? "eachactive" : "each" }
                                    onMouseOver={(e) => onMouseOver(item, e)}
                                    onMouseOut={(e) => onMouseOut(item,e)}
                                    >
                                    <img src={setIcon(item)} alt=""/>
                                    <p>{item}</p>
                                </div>
                            </Link>
                        )
                    })
                }
            </div>
            <div className="divider"></div>
            {
                playlists.length !== 0 ? <div className="playlisttitle">PLAYLISTS</div> : ""
            }
            {
                playlists.map(item => {
                    return(
                        <Link to={calc(item)} style={{ textDecoration: "none" }}>
                            <div onClick={() => {
                                    console.log("item",item)
                                    setRouteFunc(item);
                                    setTab(item);
                                }}
                                className={ item === tab ? "playlist active1" : "playlist" }>
                                <p>{item}</p>
                            </div>
                        </Link>
                    )
                })
            }
            {/* <div className="playlisttitlebutton">+ CREATE PLAYLIST</div> */}
        </div>
    );
};


const TopSearchBar = () => {
    return(
        <div className="top-search-bar-container">
            <div className="search-bar">
                <div className="back-container"></div>
                <div className="input-container"></div>
                <div className="close-container"></div>
            </div>
        </div>
    );
};

const TopNav = () => {
    const userName = localStorage.getItem("username");
    const picture = localStorage.getItem("picture");
    const topList = ["Home", "Library", "Search"];
    const [tab, setTab] = CustomUseState(tabGlobal);
    const [queueOpened, setQueueOpened] = CustomUseState(queueOpenedGlobal);
    const [searchConfig, setSearchConfig] = CustomUseState(searchBarGlobal);
    const [,setProfileOpen] = CustomUseState(profileOpener);
    const currentLocation = useLocation();
    const hist = useHistory();
    tabLocal = tab;
    queueOpenedLocal = queueOpened;

    const initial = () => {
        const loc = currentLocation.pathname.split("/")[2];
        if (queueOpened) {
            setTab("");
            return;
        }
        switch(loc) {
            case "homescreen":
                if (tabLocal === loc) break;
                setTab("Home");
                break;
            case "search":
                if (tabLocal === loc) break;
                setTab("Search");
                break;
            case "library":
                if (tabLocal === loc) break;
                setTab("Library");
                break;
            case "radio":
                if (tabLocal === loc) break;
                setTab("Radio");
                break;
            case "new-releases":
                if (tabLocal === loc) break;
                setTab("New Releases");
                break;
            default:
                if (tabLocal === "") break;
                setTab("");
                break;
        }
    };

    // useEffect(() => {
        initial();
    // },[tab]);

    const goToHome = () => {
        if (queueOpenedLocal) {
            setQueueOpened(false);
        }
        if (tabLocal !== "Home") {
            setTab("Home");
            hist.push(prefix+"/home/homescreen");
        }
    };

    const setFuncs = (item, currentTab) => {
        if (item === tabLocal) {
            return;
        }
        if (item === "Search") {
            setSearchConfig({
                ...searchConfig,
                open: true,
                prevTab: currentTab
            });
        }
        if (queueOpenedLocal) {
            setQueueOpened(false);
        }
    };

    const getCorrespondingRoute = item => {
        if(item === "Home") return `${prefix}/home/homescreen`;
        else if(item === "Search") return `${prefix}/home/search`;
        else if(item === "New Releases") return `${prefix}/home/new-releases`;
        else if(item === "Library") return `${prefix}/home/library`;
        else if(item === "Radio") return `${prefix}/home/radio`;
        else if(item === "Most Played") return `${prefix}/home/mostplayed`;
        else return `${prefix}/home/homescreen`;
    };

    const setRouteFunc = item => {
        const route = getCorrespondingRoute(item);
        hist.push(route);
    };

    const openProfile = e => {
        setProfileOpen(true);
    };


    return(
        <div className="dummyleft">
            <div className="logopart" onClick={goToHome}>
                <div className="logopartdiv" title="StudioMusic" >
                    <img src={logo} alt="logo" />
                    <p>Studio</p>
                </div>
            </div>
            <div className="middlepart">
                {
                    searchConfig.open ?
                    <TopSearchBar/> :
                    <div className="centermiddlepart">
                        {
                            topList.map(each => {
                                return(
                                    <div className={ tabLocal === each ? "tabs" : "lighttabs" }
                                    onClick={() => {
                                        setFuncs(each, tabLocal);
                                        setRouteFunc(each);
                                        setTab(each);
                                    }}>
                                        {each}
                                    </div>
                                ); 
                            })
                        }
                    </div>
                }
            </div>
            <div className="profilepart">
                {/* <div className="profilebardiv">
                    <div className="name">{userName}</div>
                    <div className="logoutbutton">
                        <img src={dropdown} alt=""/>
                    </div>
                </div>
                <div className="topbuttons">
                    <div className="minimize"></div>
                    <div className="close"></div>
                </div> */}
                {
                    picture ?
                    <div className="picture-container" onClick={openProfile}>
                        <img className="center-picture-img" src={picture} alt="" title={userName} />
                    </div> :
                    <div className="picture-container" onClick={openProfile} style={{ backgroundColor: "violet", color: "black", fontSize: "1em" }}>
                        {userName[0].toUpperCase()}
                    </div>
                }
            </div>
        </div>
    );
};



const MainPanel = () => {
    const [isPlaying,] = CustomUseState(playingGlobal);

    return(
        // <div className={ isPlaying ? "mainpanel-with-player" : "mainpanel-without-player" }>
        <div className="mainpanel-without-player">
            <TopNav/>
            <Mid/>
        </div>
    );
};

export default MainPanel;