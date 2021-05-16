import { useState, useEffect } from "react";
import "../../../css/searchstyles.css";
import "../../../css/homestyles.css";
import SearchIcon from "../../../assets/searchicon.svg";
import Close from "../../../assets/blackclose.png";
import Play from "../../../assets/playwhite.png";
import {
    sendRequest,
    queueOpenedGlobal,
    CustomUseState,
    searchBarGlobal,
    topBarGlobal,
    topBgColorGlobal
} from "../../../common";
import Queue from "./Queue";
import { MidPanelLoader } from "./index";
import { HorizontalList } from "./HomeScreen";
let timeout = undefined, searchBar, topBar, topBgColorLocal, setcolor = false;



const InnerSongList = ({ obj }) => {
    const [hidden, setHidden] = useState(true);

    const decide = () => {
        if (hidden) {
            return true;
        }
        return false;
    };

    return(
        <div className="leftlist" onMouseOver={() => setHidden(false)} onMouseOut={() => setHidden(true)}
        style={{ backgroundColor: decide() ? "#181818" : "rgba(255,255,255,0.1)" }}>
            <div className="leftalbumart">
                {/* <div className="innerleftalbumart"> */}
                    <img src={obj.Thumbnail} alt="" />
                {/* </div> */}
            </div>
            <div className="names">
                <div className="songtitlename">{obj.Title || obj.Album}</div>
                <div className="songartist">{obj.Artist}</div>
            </div>
            <div className={ decide() ? "songplay hidden" : "songplay" }>
                <div className="innersongplay">
                    <img src={Play} alt="" className="img"/>
                </div>
            </div>
            <div className={ decide() ? "beforesongresult hidden" : "beforesongresult" }>
                <div className="customopener">
                    <div className="opener1"></div>
                    <div className="opener2"></div>
                    <div className="opener3"></div>
                </div>
            </div>
        </div>
    );
};

const SongList = ({ list }) => {
    return(
        <div className="songlist">
            {
                list.map(each => {
                    return <InnerSongList obj={each} />;
                })
            }
        </div>
    );
};

const Each = ({ each }) => {
    const [hover, setHover] = useState(false);
    // let hoverLocal = hover;

    const lessen = (value) => {
        let colors = each.Color.split(",");
        colors[3] = `${value})`;
        colors = colors.join(",");
        return colors;
    };

    return(
        <div className="eachitem">
            <div className="songitem"
            // style={{ backgroundColor: `${ hover ? lessen(0.1) : lessen(0.7) }` }}
            // style={{ backgroundImage: `url(${each.Thumbnail})`, backgroundSize: "cover" }}
            onMouseOver={() => setHover(true)}
            onMouseOut={() => setHover(false)}
            >
                <div className="innersongitem"
                style={{ backgroundImage: `url(${each.Thumbnail})`, backgroundSize: "cover" }}
                >
                    <div className="fullscreen"
                    style={{ backgroundColor: `${ hover ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.7)" }` }}>
                        <div className="actualcontents">
                            {/* <img src={each.Thumbnail} className="itemart" alt="" /> */}
                            <div className="itemalbum">{each.Album}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const RecommendedRow = ({ row }) => {
    return(
        <div className="recommendedrow">
            {
                row.map(each => {
                    return(
                        <Each each={each} />
                    );
                })
            }
        </div>
    );
};

const ActualSearch = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [searchConfig, setSearchConfig] = CustomUseState(searchBarGlobal);
    const [topBarConfig, setTopBarConfig] = CustomUseState(topBarGlobal);
    const [topBgColor, setTopBgColor] = CustomUseState(topBgColorGlobal);
    const [recents, setRecents] = useState([]);
    const [recommended, setRecommended] = useState({});
    searchBar = searchConfig;
    topBar = topBarConfig;
    topBgColorLocal = topBgColor;
    let { result, input, callLoading } = searchBar;

    const recentSearches = async () => {
        const res = await sendRequest({
            method: "GET",
            endpoint: "/getRecentSearch"
        });
        setIsLoading(false);
        setRecents(res.recents);
        setRecommended(res.recommended);
        // setTopBarConfig({
        //     ...topBar,
        //     // bgColor: "#121212"
        //     bgColor: topBgColor
        // });
    };

    const closeFunc = async (item) => {
        // console.log("item",item);
        const res = await sendRequest({
            method: "POST",
            endpoint: "/removeFromRecents",
            data: {
                item
            }
        });
        console.log("res",res);
    };

    const scrollHandler = (e) => {
        const top = e.currentTarget.scrollTop;
        if (top > 100 && !setcolor) {
            setTopBarConfig({
                ...topBar,
                bgColor: topBgColorLocal
            });
            setcolor = true;
        }
        if (top < 100 && setcolor) {
            setTopBarConfig({
                ...topBar,
                // bgColor: "#121212"
                bgColor: "transparent"
            });
            setcolor = false;
        }
    };

    useEffect(() => {
        setSearchConfig({
            ...searchBar,
            show: true,
            // input: "",
            result: {}
        });
        setTopBarConfig({
            ...topBar,
            // bgColor: "#121212"
            bgColor: "transparent"
        });
        recentSearches();
        return () => {
            setSearchConfig({
                ...searchBar,
                input: "",
                show: false,
                callLoading: false
            });

        }
    },[]);

    if (isLoading) {
        return <MidPanelLoader/>
    }
    return(
        <div className="searchmain" onScroll={scrollHandler}>
            <div className="librarytop"
            style={{ backgroundColor: topBgColor }}
            >
                <div className="innerlibrarytop">
                    <div className="forblur"></div>
                    <div className="bigtitle">Search</div>
                </div>
            </div>
            <div className="noncolour">
            {
                callLoading ? <MidPanelLoader/> : ""
            }
            {
                recents.length !== 0 && !callLoading && input === "" ?
                <>
                    <div style={{ width: "100%", height: "10px" }}/>
                    <div className="outline">
                        <div className="maintitle">
                            <p>Recent Searches</p>
                            <div className="viewmore">
                                <p>Clear All</p>
                            </div>
                        </div>
                        <div className="list">
                            <HorizontalList list={recents} addCloseButton={true} closeFunc={closeFunc}/>
                        </div>
                    </div>
                </> : ""
            }
            {
                Object.keys(recommended).length !== 0 && !callLoading && input === "" ?
                <div className="outline">
                    <div className="maintitle">
                        <p>Recommended</p>
                    </div>
                    <div style={{ width: "100%", height: "0px" }}></div>
                    {/* {
                        Object.keys(recommended).map(row => {
                            return(
                                <RecommendedRow row={recommended[row]} />
                            );
                        })
                    } */}
                    {
                        Object.keys(recommended).map(each => {
                            return(
                                <div className="list">
                                    <HorizontalList list={recommended[each]} />
                                </div>
                            );
                        })
                    }
                </div> : ""
            }
            {
                result.noResults && !callLoading && input !== "" ?
                <div className="noresults">No results found for "{input}"</div> : ""
            }
            {   
                Object.keys(result).length > 1 && input !== "" ?
                <div className="smain">
                    <div className="outline">
                        {
                            Object.keys(result.songs).length !== 0 ?
                            <div className="maintitle">
                                <p>Songs</p>
                            </div> : ""
                        }
                        {   
                            Object.keys(result.songs).map(each => {
                                return(
                                    // <div className="list">
                                        <SongList list={result.songs[each]}/>
                                    // </div>
                                );
                            })
                        }
                        {
                            Object.keys(result.albums).length !== 0 ?
                            <div style={{ width: "100%", height: "15px" }}></div> : ""
                        }
                        {
                            Object.keys(result.albums).length !== 0 ?
                            <div className="maintitle">
                                <p>Albums</p>
                            </div> : ""
                        }
                        {   
                            Object.keys(result.albums).map(each => {
                                return(
                                    <div className="list">
                                        <HorizontalList list={result.albums[each]}/>
                                    </div>
                                );
                            })
                        }
                    </div>
                </div> 
                : ""
            }
            </div>
        </div>
    );
};

const Search = () => {
    // const [queueOpened,] = CustomUseState(queueOpenedGlobal);
    const [searchConfig, setSearchConfig] = CustomUseState(searchBarGlobal);

    // if (queueOpened) {
    //     return <Queue/>
    // }
    // return <ActualSearch/>
    useEffect(() => {
        console.log("search page");
        return () => {
            setSearchConfig({
                ...searchConfig,
                open: false
            });
        };
    }, []);

    return <></>
};


export default Search;