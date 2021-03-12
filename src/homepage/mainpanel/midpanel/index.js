import "../../../css/homestyles.css";
import "../../../css/albumview.css";
import { Route, Switch } from "react-router-dom";
import HomeScreen from "./HomeScreen";
import AlbumView from "./AlbumView";
import Library from "./Library";
import Radio from "./Radio";
import Search from "./Search";
import back from "../../../assets/backbutton.png";
import dropdown from "../../../assets/dropdown.png";
import SearchIcon from "../../../assets/searchicon.svg";
import Close from "../../../assets/blackclose.png";
import { 
    CustomUseState,
    openerGlobal,
    homeClass,
    wait,
    sendRequest,
    albumGlobal,
    topBarGlobal,
    searchBarGlobal,
} from "../../../common";
import { useEffect, useState } from "react";
import { Redirect } from "react-router-dom";
let actualIsOpen, topBar, timeout = undefined, searchBar;
// const { ipcRenderer } =  window.electron;


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

const NewReleases = () => {
    return(
        <div className="third"></div>
    );
};

const SearchBar = () => {
    const [searchConfig, setSearchConfig] = CustomUseState(searchBarGlobal);
    searchBar = searchConfig;

    const call = async () => {
        timeout = undefined;
        let res;
        if (searchBar.input !== "") {
            setSearchConfig({
                ...searchBar,
                callLoading: true
            });
            res = await sendRequest({
                method: "GET",
                endpoint: `/search?name=${searchBar.input}`
            });
            console.log("res",res);
            setSearchConfig({
                ...searchBar,
                result: res,
                callLoading: false
            });
        } else {
            setSearchConfig({
                ...searchBar,
                callLoading: false
            });
        }
    };

    const handleInput = e => {
        if (e.target.value) {
            setSearchConfig({
                ...searchBar,
                input: e.target.value,
                callLoading: true,
                result: {}
            }); 
        } else {
            setSearchConfig({
                ...searchBar,
                input: e.target.value,
                callLoading: true
            });
        }
        // setInput(e.target.value);
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(call,500);
    };

    const clearInput = e => {
        // setInput("");
        // setResult({ songs: {}, albums: {} });
        setSearchConfig({
            ...searchBar,
            input: "",
            result: { songs: {}, albums: {} }
        });
        timeout = undefined;
    };

    if (searchBar.show) {
        return(
            <div className="searchrelated">
                <div className="searchbar">
                    <div className="searchimg">
                        <img src={SearchIcon} alt="" />
                    </div>
                    <input type="text" value={searchBar.input} placeholder="Search for Songs or Albums"
                    className="searchinput" spellCheck="false" onInput={handleInput} autoFocus={true}/>
                    {
                        searchBar.input !== "" ?
                        <div className="clearinput">
                            <img src={Close} alt="" onClick={clearInput} />
                        </div> : <div style={{ width: "50px", height: "100%" }}></div>
                    }
                </div>
            </div>
        );
    }
    return <></>;
};

const ProfileBar = () => {
    const userName = localStorage.getItem("username");
    const [openerDetails, setOpenerDetails] = CustomUseState(openerGlobal);
    const [redirectValue, setRedirectValue] = useState({ status: false, to: "" });
    const [,setClass] = CustomUseState(homeClass);
    const [,setSong] = CustomUseState(albumGlobal);
    const [topBarConfig,] = CustomUseState(topBarGlobal);
    actualIsOpen = openerDetails.open;
    topBar = topBarConfig;
    let { button, buttonFunc, title, bgColor } = topBar;

    const min = () => {
        // ipcRenderer.send("minimize");
        // ipcRenderer.send("full");
    };

    // const max = () => {
    //     ipcRenderer.send("maximize");
    // };

    const close = () => {
        // ipcRenderer.send("close");
    };

    const handleClick = (e) => {
        const list = ["rowinmenu","rowtext"];
        if (list.indexOf(e.target.className) === -1 && actualIsOpen) {
            setOpenerDetails({
                open: false,
                xValue: 0,
                yValue: 0,
                type: null
            });
        }
        // setOpenerDetails({ ...openerDetails, open: false });
    };

    const modifyLocalStorage = async () => {
        let text = localStorage.getItem("email");
        let password = localStorage.getItem("password");
        await wait(1000);
        localStorage.clear();
        localStorage.setItem("email",text);
        localStorage.setItem("password",password);
        await wait(1000);
        sessionStorage.clear();
    };

    const logOut = async () => {
        modifyLocalStorage();
        sendRequest({
            method: "GET",
            endpoint: `/logout`
        });
        setClass("homemain end");
        setSong({});
        await wait(500);
        setRedirectValue({ status: true, to: "/" });
        setOpenerDetails({ ...openerDetails, open: false });
    };

    const openNew = async () => {
        // ipcRenderer.send("opennew");
    };

    const handleMenu = (e) => {
        e.stopPropagation();
        setOpenerDetails({
            open: !actualIsOpen,
            yValue: e.clientY + 10,
            xValue: e.clientX - 200,
            type: "album",
            data: [
                // {
                //     name: "Account",
                //     func: openNew
                // },
                {
                    name: "Log out",
                    func: logOut
                }
            ]
        });
    };

    useEffect(() => {
        document.addEventListener("mousedown",handleClick);
        return () => {
            document.removeEventListener("mousedown",handleClick);
        }
    },[]);


    if (redirectValue.status) {
        return <Redirect to={redirectValue.to} />
    }
    return(
        <div className="entiretop"
        style={ bgColor === "transparent" ? { backgroundColor: "transparent" } : { backgroundColor: "#121212" } }
        >
            <div className="topbar" style={{backgroundColor: bgColor}}>
                <SearchBar/>
                { button ?
                    <div className="backbutton" onClick={buttonFunc}>
                        <img src={back} alt=""/>
                    </div> : ""
                }
                {
                    title ? 
                    <div className="toptitlediv">{title}</div> : ""
                }
                <div className="profilebardiv">
                    <div className="name">{userName}</div>
                    <div className="logoutbutton">
                        <img src={dropdown} alt="" onClick={handleMenu}/>
                    </div>
                </div>
                <div className="topbuttons">
                    <div onClick={min} className="minimize"></div>
                    {/* <div onClick={max} className="maximize"></div> */}
                    <div onClick={close} className="close"></div>
                </div>
            </div>
        </div>
    );
};

const Mid = () => {
    const [playing,] = useState(false);

    return(
        <div className={ playing ? "midmain-with-player" : "midmain-without-player" }>
            <ProfileBar/>
            <Switch>
                <Route path="/home/homescreen"><HomeScreen/></Route>
                <Route path="/home/search"><Search/></Route>
                <Route path="/home/new-releases"><NewReleases/></Route>
                <Route path="/home/album/:name"><AlbumView/></Route>
                <Route path="/home/library"><Library/></Route>
                <Route path="/home/radio"><Radio/></Route>
            </Switch>
        </div>
    );
};

export default Mid;