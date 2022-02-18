import Mid from "./midpanel";
import { useLocation, useHistory } from "react-router-dom";
import React, { useState, useEffect, useRef, useContext } from "react";
import logo from "../../assets/latest-blueblack.svg";
import BackButton from "../../assets/backbutton-909090.svg";
import Close from "../../assets/delete-909090.svg";
import "../../css/homestyles.css";
import "../../css/teststyles.css";
import "../../css/searchstyles.css";

import { APIService } from "../../api-service";

import {
    prefix,
    basename,
    global
} from "../../common";

import {
    ProfileContext,
    QueueOpenedContext,
    SearchContext,
    SearchInputContext,
    UserContext
} from "../../index";


// Top bar
let tabLocal = null, queueOpenedLocal = null;

// Search Bar
let numLocal = null, showListLocal = null;
let listLocal = null;


const TopSearchBar = () => {

    const [queueOpen, setQueueOpen] = useContext(QueueOpenedContext);
    const [,setSearchConfig] = useContext(SearchContext);
    const [,setInput] = useContext(SearchInputContext);
    const [value, setValue] = useState("");
    const [showList, setShowList] = useState(true);
    const [num, setNum] = useState(-1);
    const search = useRef(null);
    const location = useLocation();
    const hist = useHistory();
    const [list, setList] = useState(
        JSON.parse((localStorage.getItem("searches") || "[]"))
    );
    numLocal = num;
    showListLocal = showList;
    listLocal = list;

    const goBack = e => {
        global.searchBarOpen = false;
        setSearchConfig(prev => {
            return { ...prev, open: false };
        });
    };

    const clear = e => {
        e.stopPropagation();
        setValue("");
        document.querySelector(".search-input").focus();
    };

    const click = e => {
        if (
            !(e.target === search.current ||
                search.current.contains(e.target))
        ) {
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

        listLocal = [ ...list ];
        if (value && !listLocal.includes(value)) {
            listLocal.unshift(value);
            while (listLocal.length > 8) listLocal.pop();
            setList(prev => {
                localStorage.setItem("searches", JSON.stringify(listLocal));
                return listLocal;
            });
        }

        if (queueOpen) setQueueOpen(false);
        setInput(value);
        setNum(-1);
        setShowList(false);

        if (location.search !== `?q=${value}`) {
            hist.push(`${prefix}${basename}/search?q=${value}`);
        }
    };

    const setThis = (val,e) => {
        e.stopPropagation();
        setValue(val);
        setShowList(false);
        setNum(-1);
        
        if (queueOpen) setQueueOpen(false);
        setInput(val);
        if (location.search !== `?q=${val}`) {
            hist.push(`${prefix}${basename}/search?q=${val}`);
        }
    };

    const keyDown = e => {
        if (e.keyCode === 40 && showListLocal) {
            if (numLocal+1 >= listLocal.length) {
                numLocal = 0;
                setNum(0);
                return;
            }
            setNum(numLocal+1);
        } else if (e.keyCode === 38 && showListLocal) {
            if (numLocal-1 < 0) {
                numLocal = listLocal.length - 1;
                setNum(numLocal);
                return;
            }
            setNum(numLocal-1);
        }
    };

    useEffect(() => {
        if (num < 0) {
            return;
        }
        setValue(list[numLocal]);
    }, [num]);

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
                                        <div className={ i === numLocal ? "each-list-highlight" : "each-list" } onClick={(e) => setThis(each,e)}>
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
            setSearchConfig(prev => {
                return { ...prev, open: true, prevTab: currentTab };
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
        const res = await APIService.whosThis();
        if (res) setUser(res);
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

    return(
        <div className="mainpanel-without-player">
            <TopNav/>
            <Mid/>
        </div>
    );

};


export default MainPanel;