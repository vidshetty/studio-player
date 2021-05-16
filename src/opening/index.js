import { useState, useEffect, useRef } from "react";
import { Redirect } from "react-router-dom";
// import "../css/openingstyles.css";
import "../css/opening2styles.css";
// import "../css/loginstyles.css";
// import "../css/signupstyles.css";
// import logo2 from "../assets/colouredlogo.svg";
// import logo2 from "../assets/aquamarinelogo.svg";
// import logo2 from "../assets/bluelogo.svg";
import logo2 from "../assets/latest-whiteblack.svg";
import logo from "../assets/blackandwhitelogo.svg";
import {
    wait,
    CustomUseState,
    homeClass,
    tabGlobal,
    playingGlobal,
    albumGlobal,
    queueGlobal,
    sendRequest,
    keepServersActive,
    // keepButtonGlobal
    topBarGlobal,
    prefix
} from "../common";
let topBar, setup;


const Error = ({ msg }) => {
    return(
        <div className="errordiv">
            <p>Error: {msg}</p>
        </div>
    );
};

// const Login = ({ shiftPage, setRedirectValue, setMainClass }) => {
//     const [compClass, setCompClass] = useState("loginmain-fadein");
//     const [type, setType] = useState("password");
//     const [checkClass, setCheckClass] = useState("checkbox-start");
//     const [smallBallClass, setSmallBallClass] = useState("smallball-password");
//     const [loginErr, setLoginErr] = useState(false);
//     const [isLoading, setIsLoading] = useState("Log In");
//     const [errMsg, setErrMsg] = useState("");
//     const emailRef = useRef();
//     const passwordRef = useRef();

//     const change = () => {
//         if(type === "text") {
//             setType("password");
//             setSmallBallClass("smallball-password");
//         } else {
//             setType("text");
//             setSmallBallClass("smallball-text");
//         }
//     };

//     const checkbox = () => {
//         if(checkClass === "checkbox-start") setCheckClass("checkbox-end");
//         else setCheckClass("checkbox-start");
//     };

//     const submit = async () => {
//         if(emailRef.current.value == "") {
//             setErrMsg("Can't leave email empty");
//             setLoginErr(true);
//         } else if (passwordRef.current.value == "") {
//             setErrMsg("Can't leave password empty");
//             setLoginErr(true);
//         } else {
//             setIsLoading("Loading");
//             const res = await axios({
//                 method: "POST",
//                 url: `${baseLink}/login`,
//                 data: {
//                     em: emailRef.current.value,
//                     pass: passwordRef.current.value
//                 }
//             });
//             setIsLoading("Log In");
//             if (res.data.status === "allowed") {
//                 if (checkClass === "checkbox-end") {
//                     localStorage.setItem("email",emailRef.current.value)
//                     localStorage.setItem("password",passwordRef.current.value)
//                 }
//                 setMainClass("main-end");
//                 setTimeout(() => {
//                     setRedirectValue(true);
//                 },1000);
//             } else {
//                 setErrMsg("Invalid credentials");
//                 setLoginErr(true);
//             }
//         }
//     };

//     const changePage = () => {
//         setCompClass("loginmain-fadeout");
//         setTimeout(() => {
//             shiftPage(false);
//         },500);
//     };

//     const remError = () => {
//         if(loginErr) {
//             setTimeout(() => {
//                 setLoginErr(false);
//             },3000);
//         }
//     };
//     remError();

//     useEffect(() => {
//         const email = localStorage.getItem("email");
//         const password = localStorage.getItem("password");
//         if (email != null && password != null) {
//             emailRef.current.value = email;
//             passwordRef.current.value = password;
//             setCheckClass("checkbox-end");
//         }
//     },[]);

//     return(
//         <div className={compClass}>
//             <div className="logintitle">
//                 <p>Log in to continue.</p>
//             </div>
//             { loginErr ? <Error msg={errMsg}/> : <div className="empty"></div> 
//             }
//             <div className="email">
//                 <input type="email" placeholder="Email" spellCheck="false" ref={emailRef} />
//             </div>
//             <div className="password">
//                 <div className="join">
//                     <input type={type} placeholder="Password" spellCheck="false" ref={passwordRef} />
//                     <div className="viewdiv" onClick={change}>
//                         <div className={smallBallClass}></div>
//                     </div>
//                 </div>
//             </div>
//             <div className="remember">
//                 <p>Remember Me?</p>
//                 <div className={checkClass} onClick={checkbox}>
//                     <div className="ball"></div>
//                 </div>
//             </div>
//             <div className="login">
//                 <button onClick={submit}>{isLoading}</button>
//             </div>
//             <div className="gotosignup">
//                 <p>Not on Studio?</p>
//                 <p onClick={changePage}>Sign Up</p>
//             </div>
//         </div>
//     );
// };

// const SignUp = ({ shiftPage }) => {
//     const [compClass, setCompClass] = useState("signupmain-fadein");
//     const [loginErr, setLoginErr] = useState(false);
//     const [type, setType] = useState("password");
//     const [smallBallClass, setSmallBallClass] = useState("smallball-password");
//     const [errMsg, setErrMsg] = useState("");
//     const emailRef = useRef();
//     const passwordRef = useRef();
//     const nameRef = useRef();
//     const [isLoading, setIsLoading] = useState("Continue");

//     const change = () => {
//         if(type === "text") {
//             setType("password");
//             setSmallBallClass("smallball-password");
//         } else {
//             setType("text");
//             setSmallBallClass("smallball-text");
//         }
//     };

//     const submit = async () => {
//         if(emailRef.current.value === "") {
//             setErrMsg("Can't leave email empty");
//             setLoginErr(true);
//         } else if (passwordRef.current.value === "") {
//             setErrMsg("Can't leave password empty");
//             setLoginErr(true);
//         } else if (nameRef.current.value === "") {
//             setErrMsg("Can't leave username empty");
//             setLoginErr(true);
//         } else {
//             setIsLoading("Loading");
//             const res = await axios({
//                 method: "POST",
//                 url: `${baseLink}/signup`,
//                 data: {
//                     em: emailRef.current.value,
//                     pass: passwordRef.current.value,
//                     name: nameRef.current.value
//                 }
//             });
//             setIsLoading("Continue");
//             if (res.data.status === "registered") {
//                 changePage();
//             } else {
//                 setErrMsg("Email already exists");
//                 setLoginErr(true);
//             }
//         }
//     };

//     const changePage = () => {
//         setCompClass("signupmain-fadeout");
//         setTimeout(() => {
//             shiftPage(true);
//         },500);
//     };

//     const remError = () => {
//         if(loginErr) {
//             setTimeout(() => {
//                 setLoginErr(false);
//             },3000);
//         }
//     };
//     remError();

//     return(
//         <div className={compClass}>
//             <div className="title">
//                 <p>Sign up for free.</p>
//             </div>
//             { loginErr ? <Error msg={errMsg}/> : <div className="empty"></div> 
//             }
//             <div className="email">
//                 <input type="email" placeholder="Email" spellCheck="false" ref={emailRef} />
//             </div>
//             <div className="password">
//                 <div className="join">
//                     <input type={type} placeholder="Password" spellCheck="false" ref={passwordRef} />
//                     <div className="viewdiv" onClick={change}>
//                         <div className={smallBallClass}></div>
//                     </div>
//                 </div>
//             </div>
//             <div className="username">
//                 <input type="text" placeholder="What do we call you?" spellCheck="false" ref={nameRef} />
//             </div>
//             <div className="signup">
//                 <button onClick={submit}>{isLoading}</button>
//             </div>
//             <div className="gotologin">
//                 <p>Already on Studio?</p>
//                 <p onClick={changePage}>Log In</p>
//             </div>
//         </div>
//     );
// };

// const Opening = () => {
//     const [logoClass, setLogoClass] = useState("logo-start");
//     const [barClass, setBarClass] = useState("bar-initial");
//     const [mainClass, setMainClass] = useState("main-start");
//     const [redirectValue, setRedirectValue] = useState(false);
//     const [logInScreen, setLogInScreen] = useState(true);

//     const firstCheck = async () => {
//         await setTimeout(async () => {
//             // let res = { data: { status: "" } };
//             let res;
//             res = await axios({
//                 method: "GET",
//                 url: `${baseLink}/activateCheck`
//             });
//             // res.data.status = "active";
//             if (res.data.status === "active") {
//                 const token = localStorage.getItem("access");
//                 if (token === "allowed") {
//                     setMainClass("main-end");
//                     setTimeout(() => {
//                         setRedirectValue(true);
//                     },1000);
//                 } else {
//                     setLogoClass("logo-mid");
//                     setBarClass("bar-start");
//                 }
//             }
//         },2000);
//     };

//     useEffect(() => {
//         firstCheck();
//     },[]);

//     if(redirectValue) {
//         return ( <Redirect to="/home/homescreen" /> );
//     }
//     return(
//         <div className={mainClass}>
//             <div className={logoClass}>
//                 <div className="left">
//                     <img className="logoimg" src={logo} alt="logo"/>
//                 </div>
//                 <div className="right">
//                     <p>Studio</p>
//                 </div>
//             </div>
//             <div className={barClass}>
//                 <div className="logincontainer">
//                     { logInScreen ? 
//                         <Login 
//                             shiftPage={setLogInScreen}
//                             setRedirectValue={setRedirectValue}
//                             setMainClass={setMainClass}
//                         /> : 
//                         <SignUp 
//                             shiftPage={setLogInScreen}
//                         /> }
//                 </div>
//             </div>
//         </div>
//     );
// };

const Login2 = ({ setGoToLogin, setGoToSignUp, setMainClass, setRedirectValue }) => {
    const [loginClass, setLoginClass] = useState("loginscreen-in");
    const [smallBallClass, setSmallBallClass] = useState("ball-password");
    const [type, setType] = useState("password");
    const [isError, setIsError] = useState(false);
    const [button, setButton] = useState("Log In");
    const [loginButton, setLoginButton] = useState("loginbutton");
    const [link, setLink] = useState("gotosignup");
    const [msg, setMsg] = useState("");
    const [checkClass, setCheckClass] = useState("checkbox-start");
    const [,setClass] = CustomUseState(homeClass);
    const [tab, setTab] = CustomUseState(tabGlobal);
    // const [,setKeepButton] = CustomUseState(keepButtonGlobal);
    const [topBarConfig, setTopBarConfig] = CustomUseState(topBarGlobal);
    topBar = topBarConfig;
    const emailRef = useRef();
    const passwordRef = useRef();

    const fillIn = () => {
        const text = localStorage.getItem("email");
        const pwd = localStorage.getItem("password");
        if (text !== null && pwd !== null) {
            emailRef.current.value = text;
            passwordRef.current.value = pwd;
            setCheckClass("checkbox-end");
        }
    };

    useEffect(() => {
        fillIn();
    },[]);

    const change = async () => {
        setLoginClass("loginscreen-out");
        await wait(100);
        setGoToLogin(false);
        setGoToSignUp(true);
    };

    const goToMain = async () => {
        // await setup();
        setClass("homemain start");
        setMainClass("mainwindow-end");
        if (tab !== "Home") setTab("Home");
        setTopBarConfig({
            ...topBar,
            button: false,
            buttonFunc: () => {},
            title: "",
            bgColor: "transparent"
        });
        // setKeepButton(false);
        await wait(500);
        setRedirectValue(true);
    };

    const shift = () => {
        if (type === "password") {
            setType("text");
            setSmallBallClass("ball-text");
        } else {
            setType("password");
            setSmallBallClass("ball-password");
        }
    };

    const checkbox = () => {
        setCheckClass( checkClass === "checkbox-start" ?
            "checkbox-end" : "checkbox-start" );
    };

    const submit = async () => {
        if (emailRef.current.value === "") {
            setIsError(true);
            setMsg("Cannot leave email empty!")
            return;
        }
        if (passwordRef.current.value === "") {
            setIsError(true);
            setMsg("Cannot leave password empty!");
            return;
        }
        setButton("Logging you in....");
        setLoginButton("loginbutton-loading");
        setLink("gotosignup-loading");
        let res = await sendRequest({
            method: "POST",
            endpoint: "/login",
            data: {
                text: emailRef.current.value,
                password: passwordRef.current.value
            }
        });
        if (res.status === "loggedin") {
            localStorage.setItem("token",res.status);
            localStorage.setItem("username",res.username);
            localStorage.setItem("userId",res.userId);
            if (checkClass === "checkbox-end") {
                localStorage.setItem("email",emailRef.current.value);
                localStorage.setItem("password",passwordRef.current.value);
            }
            goToMain();
        } else {
            setIsError(true);
            setMsg(res.error);
            setButton("Log In");
            setLoginButton("loginbutton");
            setLink("gotosignup");
        }
    };

    const remError = () => {
        if (isError) {
            setTimeout(() => {
                setIsError(false);
            },3000);
        }
    };
    remError();

    return(
        <div className={loginClass}>
            <div className="logocontainer">
                <div className="leftlogo">
                    <img src={logo} alt="Studio" />
                </div>
                <div className="rightlogo">
                    <p>Studio</p>
                </div>
            </div>
            <div className="title">
                <p>Log in to continue.</p>
            </div>
            <div className="inputfields">
                {
                    isError ? <Error msg={msg}/> : <div className="errordivreplacement">
                    </div>
                }
                <div className="email">
                    <input type="text" name="email" placeholder="Email / Username" spellCheck="false" ref={emailRef}/>
                </div>
                <div className="password">
                    <input type={type} name="password" placeholder="Password" ref={passwordRef}/>
                    <div className="viewer">
                        <div className={smallBallClass} onClick={shift}></div>
                    </div>
                </div>
                <div className="remember">
                    <p>Remember Me?</p>
                    <div className={checkClass} onClick={checkbox}>
                        <div className="ball"></div>
                    </div>
                </div>
            </div>
            <div className={loginButton}>
                <button onClick={submit}>{button}</button>
            </div>
            <div className={link}>
                <p>Not on Studio?</p><p onClick={change}>Sign Up</p>
            </div>
        </div>
    );
};

const SignUp2 = ({ setGoToLogin, setGoToSignUp }) => {
    const [signUpClass, setSignUpClass] = useState("signupscreen-in");
    const [isError, setIsError] = useState(false);
    const [button, setButton] = useState("Sign Up");
    const [signUpButton, setSignUpButton] = useState("signupbutton");
    const [link, setLink] = useState("gotologin");
    const [msg, setMsg] = useState("");
    const [type, setType] = useState("password");
    const [smallBallClass, setSmallBallClass] = useState("ball-password");
    const emailRef = useRef();
    const passwordRef = useRef();
    const usernameRef = useRef();

    const change = async () => {
        setSignUpClass("signupscreen-out");
        await wait(100);
        setGoToSignUp(false);
        setGoToLogin(true);
    };

    const shift = () => {
        if (type === "password") {
            setType("text");
            setSmallBallClass("ball-text");
        } else {
            setType("password");
            setSmallBallClass("ball-password");
        }
    };

    const submit = async () => {
        if (usernameRef.current.value === "") {
            setIsError(true);
            setMsg("Cannot leave username empty!")
            return;
        }
        if (emailRef.current.value === "") {
            setIsError(true);
            setMsg("Cannot leave email empty!")
            return;
        }
        const pattern = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
        if (!pattern.test(emailRef.current.value)) {
            setIsError(true);
            setMsg("Invalid email!");
            return;
        }
        if (passwordRef.current.value === "") {
            setIsError(true);
            setMsg("Cannot leave password empty!");
            return;
        }
        setButton("Signing you up....");
        setSignUpButton("signupbutton-loading");
        setLink("gotologin-loading");
        let res = await sendRequest({
            method: "POST",
            endpoint: `/signup`,
            data: {
                username: usernameRef.current.value,
                email: emailRef.current.value,
                password: passwordRef.current.value
            }
        });
        if (res.status === "registered") {
            change();
        } else {
            setIsError(true);
            setMsg(res.error);
            setButton("Sign Up");
            setSignUpButton("signupbutton");
            setLink("gotologin");
        }
    };

    const remError = () => {
        if (isError) {
            setTimeout(() => {
                setIsError(false);
            },3000);
        }
    };
    remError();

    return(
        <div className={signUpClass}>
            <div className="logocontainer">
                <div className="leftlogo">
                    <img src={logo} alt="Studio" />
                </div>
                <div className="rightlogo">
                    <p>Studio</p>
                </div>
            </div>
            <div className="title">
                <p>Sign up for free.</p>
            </div>
            <div className="inputfields">
                {
                    isError ? <Error msg={msg}/> : <div className="errordivreplacement">
                    </div>
                }
                <div className="username">
                    <input type="text" name="username" placeholder="Username" spellCheck="false" ref={usernameRef} />
                </div>
                <div className="email">
                    <input type="email" name="email" placeholder="Email" spellCheck="false" ref={emailRef}/>
                </div>
                <div className="password">
                    <input type={type} name="password" placeholder="Password" ref={passwordRef}/>
                    <div className="viewer">
                        <div className={smallBallClass} onClick={shift}></div>
                    </div>
                </div>
            </div>
            <div className={signUpButton}>
                <button onClick={submit}>{button}</button>
            </div>
            <div className={link}>
                <p>Already on Studio?</p><p onClick={change}>Log In</p>
            </div>
        </div>
    );
};

const Opening2 = () => {
    const [redirectValue, setRedirectValue] = useState(false);
    // const [mainClass, setMainClass] = useState("mainwindow-start");
    const [loaderClass, setLoaderClass] = useState("openingloader hidden");
    // const [goToLogin, setGoToLogin] = useState(false);
    // const [goToSignUp, setGoToSignUp] = useState(false);
    // const [,setClass] = CustomUseState(homeClass);
    const [,setIsPlaying] = CustomUseState(playingGlobal);
    const [,setSong] = CustomUseState(albumGlobal);
    const [,setQueue] = CustomUseState(queueGlobal);

    setup = async () => {
        const queue = JSON.parse(localStorage.getItem("queue"));
        if (queue) {
            setIsPlaying(true);
            let nowplaying = JSON.parse(localStorage.getItem("nowplaying"));
            if (nowplaying !== null) {
                const res = await sendRequest({
                    method: "POST",
                    endpoint: "/updateUrls",
                    data: {
                        list: queue.concat([nowplaying])
                    }
                });
                queue = res.slice(0,res.length - 1);
                nowplaying = res[res.length - 1];
                localStorage.setItem("queue",JSON.stringify(queue));
                localStorage.setItem("nowplaying",JSON.stringify(nowplaying));

                const index = queue.findIndex(each => {
                    if (each.Title && nowplaying.Title) {
                        return each.Title === nowplaying.Title;
                    } else {
                        return each.Album === nowplaying.Album;
                    }
                });
                if (nowplaying.url !== "") {
                    nowplaying.backup = nowplaying.url;
                    nowplaying.url = "";
                }
                queue[index] = nowplaying;
                setSong(nowplaying);
                setQueue(queue);
            } else {
                localStorage.removeItem("nowplaying");
                localStorage.removeItem("queue");
                setIsPlaying(false);
            }
        }
    };

    const call = async () => {
        await wait(2000);
        setLoaderClass("openingloader");
        let res;
        keepServersActive();
        res = await sendRequest({
            method: "GET",
            endpoint: "/activateCheck"
        });
        if (res.status === "active") {
            sendRequest({
                method: "GET",
                endpoint: "/recordTime"
            });
            // setClass("homemain start");
            // await wait(500);
            // await setup();
            // setLoaderClass("openingloader hidden");
            await wait(500);
            // setMainClass("mainwindow-end");
            // await wait(500);
            setRedirectValue(true);
        }
    };

    useEffect(() => {
        call();
    }, []);

    if (redirectValue) {
        return <Redirect to={prefix+"/home/homescreen"} />;
    }
    return(
        // <div className={mainClass}>
        <div className="mainwindow">
            {/* {
                !goToLogin && !goToSignUp ?
                <> */}
                    <div className="logoholder">
                        <img src={logo2} alt="Studio" />
                    </div>
                    <div className={loaderClass}>
                        <div className="firstcircle"></div>
                        <div className="secondcircle"></div>
                        <div className="thirdcircle"></div>
                        <div className="fourthcircle"></div>
                    </div>
                {/* </> : ""
            } */}
            {/* {
                goToLogin ? <Login2 setGoToLogin={setGoToLogin} setGoToSignUp={setGoToSignUp}
                    setMainClass={setMainClass} setRedirectValue={setRedirectValue}/> : ""
            }
            {
                goToSignUp ? <SignUp2 setGoToLogin={setGoToLogin} setGoToSignUp={setGoToSignUp}/> : ""
            } */}
        </div>
    );
};

export default Opening2;