import './header.css'
import Utilities from "../../Utilities/Utilities";
import DarkModeSwitch from "../../Utilities/DarkModeSwitch";
import {useNavigate} from "react-router-dom";
import {
    Search,
    SearchIconWrapper,
    SearchIconWrapperEnd, SearchMobile,
    StyledInputBase,
} from "../../Utilities/Search";
import {CloseIcon, MenuIcon, SearchIcon} from "../../Images/Icons/Icons";
import {useEffect, useRef, useState} from "react";
import {Divider} from "@mui/material";
import SignUpModal from "../Modals/SignUpModal";
import SignInModal from "../Modals/SignInModal";

const useOutsideHandler = (ref, toExpand, setToExpand) => {
    useEffect(() => {
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target) && toExpand) {
                setToExpand(false);
            }
        }

        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref, setToExpand, toExpand]);
}

const Header = ({notify, dummy}) => {

    const navigate = useNavigate();
    const handleChange = () => {
        Utilities.toggleDarkMode(notify, dummy);
    }
    const [toExpand, setToExpand] = useState(false);
    const [isMobileSearchFocused, setIsMobileSearchFocused] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const inputRef = useRef(null);
    const wrapperRef = useRef(null);
    const modalRef = useRef(null);
    useOutsideHandler(wrapperRef, toExpand, setToExpand);
    useOutsideHandler(modalRef, isModalOpen, setIsModalOpen);
    const gamesSelector = {
        width: '92px',
        left: 'calc(123px + 8%)',
        display: 'block',
    };
    const categoriesSelector = {
        width: '100px',
        left: 'calc(215px + 8%)',
        display: 'block',
    };
    const url = window.location.href.split('/');

    let styles;

    if (url[url.length - 1] === 'games') {
        styles = gamesSelector;
    } else if (url[url.length - 1] === 'categories') {
        styles = categoriesSelector;
    } else {
        styles = {};
    }


    const onMobileSearch = () => {
        setIsMobileSearchFocused(true);
        const timeout = setTimeout(() => {
            inputRef.current.focus();
        }, 10);

        return () => {
            clearTimeout(timeout);
        };
    }

    const handleSignUp = (isSignUp) => {
        setIsModalOpen(true);
        setIsSignUp(isSignUp);
    }

    return (
        <div ref={wrapperRef}>
            <div className={`header ${Utilities.isDarkMode ? 'dark-mode' : 'light-mode'}`}>
                <div className='title' style={{display: isMobileSearchFocused ? 'none' : 'flex'}}>
                    <div className='menu-icon' onClick={() => setToExpand(!toExpand)}>
                        {toExpand ? <CloseIcon/> : <MenuIcon/>}
                    </div>
                    <h3 onClick={() => navigate('/')}>Game On Star</h3>
                </div>
                <div className='tabs'>
                    <p className='tab' onClick={() => navigate('/games')}>All Games</p>
                    <p className='tab' onClick={() => navigate('/categories')}>Categories</p>
                    <div className='selected' style={styles}/>
                </div>
                <div className='control' style={{display: isMobileSearchFocused ? 'none' : 'flex'}}>
                    <Search className='search'>
                        <SearchIconWrapper sx={{zIndex: 1}}>
                            <SearchIcon/>
                        </SearchIconWrapper>
                        <StyledInputBase
                            placeholder="Search…"
                            inputProps={{'aria-label': 'search'}}
                        />
                    </Search>
                    <div className='search-icon' onClick={onMobileSearch}>
                        <SearchIcon/>
                    </div>
                    <DarkModeSwitch sx={{m: 1}} checked={Utilities.isDarkMode} onChange={handleChange}/>
                    {/*<button className='btn btn-secondary button-sign-up'>Log In</button>*/}
                    <button className='btn btn-primary button-sign-up' onClick={() => handleSignUp(true)}>Sign Up
                    </button>
                </div>
                <div className='search-mobile' style={{
                    display: isMobileSearchFocused ? 'flex' : 'none',
                    marginLeft: 10,
                    marginRight: 10,
                    width: '100%'
                }}>
                    <SearchMobile>
                        <SearchIconWrapper sx={{zIndex: 1}}>
                            <SearchIcon/>
                        </SearchIconWrapper>
                        <StyledInputBase
                            placeholder="Search…"
                            inputProps={{'aria-label': 'search'}}
                            inputRef={inputRef}
                            onBlur={() => setIsMobileSearchFocused(false)}
                            onKeyDown={e => {
                                if (e.key === 'Escape') {
                                    setIsMobileSearchFocused(false);
                                }
                            }}
                        />
                        <SearchIconWrapperEnd sx={{zIndex: 1}}>
                            <div className='escape'>
                                Esc
                            </div>
                        </SearchIconWrapperEnd>
                    </SearchMobile>
                </div>
                <div className={`nav-list ${Utilities.isDarkMode ? 'dark-mode2' : 'light-mode'}`}
                     style={{maxHeight: toExpand ? '500px' : 0}}>
                    <div className='tabs-mobile'>
                        <p className='tab-mobile' onClick={() => {
                            setToExpand(false);
                            navigate('/games');
                        }}>All Games</p>
                        <p className='tab-mobile' onClick={() => {
                            setToExpand(false);
                            navigate('/categories');
                        }}>Categories</p>
                    </div>
                    <div className='divider'>
                        <Divider variant='fullWidth' color={Utilities.isDarkMode ? 'white' : '#E0E0E0'}/>
                    </div>
                    <div className='button-mobile'>
                        <button className='btn btn-secondary' onClick={() => handleSignUp(false)}>Sign In</button>
                        <button className='btn btn-primary' onClick={() => handleSignUp(true)}>Sign Up</button>
                    </div>
                </div>
            </div>
            <div className='modal-container' style={isModalOpen ? {display: 'block'} : {}}>
                {isSignUp ?
                    <SignUpModal modalRef={modalRef} setIsSignUp={setIsSignUp}/> :
                    <SignInModal modalRef={modalRef} setIsSignUp={setIsSignUp}/>
                }
            </div>
        </div>

    );
};

export default Header;
