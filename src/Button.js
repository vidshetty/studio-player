import "./css/teststyles.css";


const Button = props => {
    const createRipple = e => {
        const button = e.currentTarget;
        const circle = document.createElement("span");
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;
        const dimen = button.getBoundingClientRect();
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${e.clientX - (dimen.left + radius)}px`;
        circle.style.top = `${e.clientY - (dimen.top + radius)}px`;
        circle.classList.add("ripple");
        const ripple = button.getElementsByClassName("ripple")[0];
        if (ripple) {
            ripple.remove();
        }
        button.appendChild(circle);
    };

    const handleClick = e => {
        createRipple(e);
        props.onClick(e);
    };

    return(
        <button className={props.className} onClick={handleClick} title={props.title}
        style={{ outline: "none", position: "relative", overflow: "hidden" }}>
            {props.children}
        </button>
    );
};


export default Button;