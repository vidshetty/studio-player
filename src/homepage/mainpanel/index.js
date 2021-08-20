import Mid, { MidPanelLoader } from "./midpanel";
import { Link, useLocation, useHistory } from "react-router-dom";
import React, { useState, useEffect, useRef, useContext } from "react";
// import logo from "../../assets/bluelogo.svg";
// import logo from "../../assets/latest-whiteblack.svg";
// import logo from "../../assets/latest-bluewhite.svg";
import logo from "../../assets/latest-blueblack.svg";
// import logo from "../../assets/latest-bluetransparent.svg";
// import logo from "../../assets/aquamarinelogo.svg";
// import logo from "../../assets/blackandwhitelogo.svg";
import home from "../../assets/homewhite.svg";
import search from "../../assets/searchwhite.svg";
import library from "../../assets/librarywhite.svg";
import homelight from "../../assets/homelight.svg";
import searchlight from "../../assets/searchlight.svg";
import librarylight from "../../assets/librarylight.svg";
import radio from "../../assets/radio2.svg";
// import BackButton from "../../assets/backbutton-white.svg";
import BackButton from "../../assets/backbutton-909090.svg";
import Close from "../../assets/delete-909090.svg";
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
    searchInputGlobal,
    prefix,
    basename,
    profileOpener,
    global,
    sendRequest
} from "../../common";
import Button from "../../Button";
import {
    PlayerContext,
    ProfileContext,
    QueueOpenedContext,
    SearchContext,
    SearchInputContext,
    UserContext
} from "../../index";
let topBar, tabLocal, queueOpenedLocal, searchInputTimeout = null, noLocal, showListLocal;


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
    const [queueOpen, setQueueOpen] = useContext(QueueOpenedContext);
    const [searchConfig, setSearchConfig] = useContext(SearchContext);
    const [input, setInput] = useContext(SearchInputContext);
    const [value, setValue] = useState("");
    const [showList, setShowList] = useState(true);
    const [no, setNo] = useState(-1);
    const search = useRef(null);
    const location = useLocation();
    const hist = useHistory();
    const list = JSON.parse((localStorage.getItem("searches") || "[]")).reverse();
    noLocal = no;
    showListLocal = showList;

    const goBack = e => {
        global.searchBarOpen = false;
        setSearchConfig({
            ...searchConfig,
            open: false
        });
    };

    const clear = e => {
        e.stopPropagation();
        setValue("");
        document.querySelector(".search-input").focus();
    };

    const click = e => {
        if (!(e.target === search.current || search.current.contains(e.target))) {
            global.searchBarOpen = false;
            setSearchConfig(prev => {
                return { ...prev, open: false };
            });
        }
    };

    const handleInput = e => {
        setValue(e.target.value);
        if (!showList) {
            setShowList(true);
        }
    };

    const handleSearch = e => {
        e.preventDefault();

        const list = JSON.parse((localStorage.getItem("searches") || "[]"));
        if (value && !list.includes(value)) {
            const len = list.length;
            if (len > 7) {
                for (let i=0; i<len-7; i++) list.shift();
            }
            list.push(value);
        }
        localStorage.setItem("searches", JSON.stringify(list));

        if (queueOpen) setQueueOpen(false);
        setInput(value);
        setNo(-1);
        setShowList(false);
        // if (location.pathname !== `${prefix}${basename}/search`) {
        //     hist.push(`${prefix}${basename}/search`);
        // }
        if (location.search !== `?q=${value}`) {
            hist.push(`${prefix}${basename}/search?q=${value}`);
        }
    };

    const setThis = (val,e) => {
        e.stopPropagation();
        setValue(val);
        setShowList(false);
        setNo(-1);
        
        if (queueOpen) setQueueOpen(false);
        setInput(val);
        if (location.search !== `?q=${val}`) {
            hist.push(`${prefix}${basename}/search?q=${val}`);
        }
    };

    const keyDown = e => {
        if (e.keyCode === 40 && showListLocal) {
            if (noLocal+1 > 8) {
                noLocal = 0;
                setNo(0);
                return;
            }
            setNo(noLocal+1);
        } else if (e.keyCode === 38 && showListLocal) {
            if (noLocal === -1) {
                noLocal = 7;
                setNo(7);
                return;
            }
            setNo(noLocal-1);
        }
    };

    useEffect(() => {
        if (no === -1) {
            return;
        }
        setValue(list[noLocal]);
    }, [no]);

    useEffect(() => {
        search.current = document.querySelector(".search-bar");
        document.addEventListener("click",click);
        document.addEventListener("keydown",keyDown);
        document.querySelector(".search-input").focus();
        return () => {
            document.removeEventListener("click",click);
            document.removeEventListener("keydown",keyDown);
        };
    }, []);

    return(
        <div className="top-search-bar-container">
            <div className="search-bar">
                <div className="search-top-row">
                    <div className="back-container">
                        <button className="back-button" title="Back" onClick={goBack}>
                            <img src={BackButton} alt="" />
                        </button>
                    </div>
                    <div className="input-container">
                        <form onSubmit={handleSearch}>
                            <input type="text" className="search-input" placeholder="Search" align="middle"
                            onChange={handleInput} value={value} spellCheck="false" />
                        </form>
                    </div>
                    <div className="close-container">
                        {
                            value !== "" ?
                            <button className="back-button" title="Clear" onClick={clear}>
                                <img src={Close} alt="" />
                            </button> : null
                        }
                    </div>
                </div>
                {
                    list.length !== 0 && showList ?
                    <div className="list-container">
                        {
                            list.map((each,i) => {
                                if (i<8) {
                                    return(
                                        <div className={ i === noLocal ? "each-list-highlight" : "each-list" } onClick={(e) => setThis(each,e)}>
                                            <div className="first-each-list">{each}</div>
                                            <div className="last-each-list"></div>
                                        </div> 
                                    );
                                }
                                return null;
                            })
                        }
                    </div> : null
                }
            </div>
        </div>
    );
};

const TopNav = () => {
    const topList = ["Home", "Library", "Search"];
    // const [tab, setTab] = CustomUseState(tabGlobal);
    const [tab, setTab] = useState("");
    const [queueOpened, setQueueOpened] = useContext(QueueOpenedContext);
    const [searchConfig, setSearchConfig] = useContext(SearchContext);
    const [,setProfileOpen] = useContext(ProfileContext);
    const [user, setUser] = useContext(UserContext);
    const currentLocation = useLocation();
    const hist = useHistory();
    tabLocal = tab;
    queueOpenedLocal = queueOpened;

    const initial = () => {
        const split = currentLocation.pathname.split("/");
        const loc = prefix === "" || basename === "" ? split[2] : split[3];
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

    // initial();

    const goToHome = () => {
        if (queueOpenedLocal) {
            setQueueOpened(false);
        }
        if (tabLocal !== "Home") {
            setTab("Home");
            hist.push(`${prefix}${basename}/homescreen`);
        }
    };

    const setFuncs = (item, currentTab) => {
        if (item === "Search") {
            global.searchBarOpen = true;
            setSearchConfig({
                ...searchConfig,
                open: true,
                prevTab: currentTab
            });
        }
        if (item === tabLocal) {
            return;
        }
        if (queueOpenedLocal && item !== "Search") {
            setQueueOpened(false);
        }
    };

    const getCorrespondingRoute = item => {
        if(item === "Home") return `${prefix}${basename}/homescreen`;
        else if(item === "Search") return `${prefix}${basename}/search`;
        else if(item === "New Releases") return `${prefix}${basename}/new-releases`;
        else if(item === "Library") return `${prefix}${basename}/library`;
        else if(item === "Radio") return `${prefix}${basename}/radio`;
        else if(item === "Most Played") return `${prefix}${basename}/mostplayed`;
        else return `${prefix}${basename}/homescreen`;
    };

    const setRouteFunc = item => {
        const route = getCorrespondingRoute(item);
        if (item !== `Search`) hist.push(route);
    };

    const openProfile = e => {
        setProfileOpen(true);
    };

    const call = async () => {
        const res = await sendRequest({
            method: "GET",
            endpoint: "/whosthis"
        });
        if (res) {
            setUser(res);
        }
    };


    useEffect(() => {
        initial();
    }, [currentLocation.pathname, queueOpened]);

    useEffect(() => {
        call();
    }, []);

    return(
        <div className="dummyleft">
            <div className="logopart">
                <img src={logo} alt="logo" onClick={goToHome} title="StudioMusic" />
                <p onClick={goToHome} title="StudioMusic">Studio</p>
            </div>
            <div className="middlepart">
                {
                    searchConfig.open ?
                    <TopSearchBar /> :
                    // null :
                    <div className="centermiddlepart">
                        {
                            topList.map(each => {
                                return(
                                    <div className={ tabLocal === each ? "tabs" : "lighttabs" }
                                    onClick={() => {
                                        setFuncs(each, tabLocal);
                                        setRouteFunc(each);
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
                <div className="picture-container" onClick={openProfile}>
                    <img className="center-picture-img" src={user.picture} alt="" title={user.name} />
                </div>
            </div>
        </div>
    );
};



const MainPanel = () => {
    const [isPlaying,] = useContext(PlayerContext);

    return(
        // <div className={ isPlaying ? "mainpanel-with-player" : "mainpanel-without-player" }>
        <div className="mainpanel-without-player">
            <TopNav/>
            <Mid/>
        </div>
    );
};

export default MainPanel;