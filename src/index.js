import React, { useState } from "react";
import ReactDOM from "react-dom";
import App from "./App";

export const PlayerContext = React.createContext();
export const AlbumContext = React.createContext();
export const QueueContext = React.createContext();
export const QueueOpenedContext = React.createContext();
export const SongIsPausedContext = React.createContext();
export const RepeatTypeContext = React.createContext();
export const RadioContext = React.createContext();
export const MenuContext = React.createContext();
export const ProfileContext = React.createContext();
export const ResponseBarContext = React.createContext();
export const MiniPlayerContext = React.createContext();
export const LyricsContext = React.createContext();
export const LyricsTextContext = React.createContext();
export const FullScreenContext = React.createContext();
export const SearchContext = React.createContext();
export const SearchInputContext = React.createContext();
export const KeyShortcutContext = React.createContext();
export const UserContext = React.createContext();


const MainApp = () => {
    const [playing, setPlaying] = useState(false);
    const [song, setSong] = useState({});
    const [queue, setQueue] = useState([]);
    const [queueOpened, setQueueOpened] = useState("");
    const [paused, setPaused] = useState(false);
    const [repeat, setRepeat] = useState(1);
    const [radio, setRadio] = useState(false);
    const [opener, setOpener] = useState({ open: false, yValue: 0, xValue: 0, type: null, data: [] });
    const [profile, setProfile] = useState(false);
    const [resp, setResp] = useState({ open: "", msg: "" });
    const [mini, setMini] = useState(false);
    const [lyrics, setLyrics] = useState([]);
    const [lyricsText, setLyricsText] = useState({});
    const [scr, setScr] = useState({ show: false });
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState({ open: false, input: "", prevTab: "" });
    const [openKeyShortcuts, setOpenKeyShortcuts] = useState(false);
    const [user, setUser] = useState({ name: "", email: "", picture: "", limit: "" });

    return(
        <PlayerContext.Provider value={[playing, setPlaying]}>
        <AlbumContext.Provider value={[song, setSong]}>
        <QueueContext.Provider value={[queue, setQueue]}>
        <QueueOpenedContext.Provider value={[queueOpened, setQueueOpened]}>
        <SongIsPausedContext.Provider value={[paused, setPaused]}>
        <RepeatTypeContext.Provider value={[repeat, setRepeat]}>
        <RadioContext.Provider value={[radio, setRadio]}>
        <MenuContext.Provider value={[opener, setOpener]}>
        <ProfileContext.Provider value={[profile, setProfile]}>
        <ResponseBarContext.Provider value={[resp, setResp]}>
        <MiniPlayerContext.Provider value={[mini, setMini]}>
        <LyricsContext.Provider value={[lyrics, setLyrics]}>
        <LyricsTextContext.Provider value={[lyricsText, setLyricsText]}>
        <FullScreenContext.Provider value={[scr, setScr]}>
        <SearchContext.Provider value={[search, setSearch]}>
        <SearchInputContext.Provider value={[searchInput, setSearchInput]}>
        <KeyShortcutContext.Provider value={[openKeyShortcuts, setOpenKeyShortcuts]}>
        <UserContext.Provider value={[user, setUser]}>
            <App/>
        </UserContext.Provider>
        </KeyShortcutContext.Provider>
        </SearchInputContext.Provider>
        </SearchContext.Provider>
        </FullScreenContext.Provider>
        </LyricsTextContext.Provider>
        </LyricsContext.Provider>
        </MiniPlayerContext.Provider>
        </ResponseBarContext.Provider>
        </ProfileContext.Provider>
        </MenuContext.Provider>
        </RadioContext.Provider>
        </RepeatTypeContext.Provider>
        </SongIsPausedContext.Provider>
        </QueueOpenedContext.Provider>
        </QueueContext.Provider>
        </AlbumContext.Provider>
        </PlayerContext.Provider>
    );
};


ReactDOM.render(<MainApp/>, document.getElementById("root"));