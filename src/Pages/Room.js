import Utilities from "../Utilities/Utilities";
import {server} from "../config";
import {io} from "socket.io-client";
import {useEffect, useRef, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import Cookies from 'js-cookie';
import UserService from "../Service/UserService";
import RoomService from "../Service/RoomService";
import LeaveModal from "../Components/Modals/LeaveModal";
import {useOutsideHandler} from "../Utilities/useOutSideHandler";
import GameCardMini from "../Components/GameCard/GameCardMini";
import UserAvatar from "../Components/Avatar/UserAvatar";
import {toast} from "react-toastify";
import {allGames} from "./AllGames";

const Room = () => {
    const params = useParams();
    const socket = useRef(null);
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [currentUsers, setCurrentUsers] = useState([]);
    const [room, setRoom] = useState(null);
    const modalRef = useRef(null);
    const [gameSelected, setGameSelected] = useState(-1);
    const [showPrompt, setShowPrompt] = useState(false);
    useOutsideHandler(modalRef, showPrompt, setShowPrompt);
    const [text, setText] = useState('');
    const [messages, setMessages] = useState([]);
    const handleClick = () => {
        if (text.replace(/\s/g, '') && room && user) {
            // setMessages([...messages, {sender: user.email, text: text}]);
            socket.current.emit('send-message', room._id, user.email, text);
        }
    }


    useEffect(() => {
        UserService.getUserByCookie(Cookies.get('game_on_star_cookie'))
            .then(user => {
                if (user) {
                    setUser(user);
                    if (!socket.current) {
                        socket.current = io(server);
                        socket.current.emit('join-room', params.roomId, user.email);
                    }
                } else {
                    navigate('/');
                }
            });
    }, [navigate, params.roomId]);

    useEffect(() => {
        RoomService.getRoom(params.roomId)
            .then(response => {
                if (!response.data.room) {
                    navigate('/online');
                    socket.current.disconnect();
                } else {
                    setRoom(response.data.room);
                    setGameSelected(response.data.room.gameSelected);
                    if (currentUsers.length === 0) {
                        setCurrentUsers(response.data.room.members);
                    }
                }
            });
    }, [currentUsers.length, navigate, params.roomId, user]);

    useEffect(() => {
        if (socket.current) {
            socket.current.on('receive-message', (userId, message) => {
                setMessages([...messages, {sender: userId, text: message}]);
            });
            socket.current.on('join-room', userId => {
                console.log("Join", userId)
                if (!currentUsers.includes(userId)) {
                    setCurrentUsers([...currentUsers, userId]);
                }
            });
            socket.current.on('leave-room', userId => {
                console.log("Leave")
                setCurrentUsers(currentUsers.filter(current => current !== userId));
            });
            socket.current.on('game-select', index => {
                setGameSelected(index);
            });
            return () => {
                socket.current.off('receive-message');
                socket.current.off('join-room');
                socket.current.off('leave-room');
                socket.current.off('game-select');
            }
        }
    });

    const onLeaveRoom = () => {
        RoomService.leaveRoom(room._id, user.email)
            .then(() => {
                socket.current.emit('leave-room', room._id, user.email);
                socket.current.disconnect();
                navigate('/online');
            });
    }

    const handleOnSelect = (index) => {
        if (socket.current && room && user) {
            if (user.email === room.host) {
                socket.current.emit('game-select', room._id, index);
            } else if (gameSelected !== index) {
                toast.info('Only host can select the game');
            }
        }
    };

    const handleOnStart = () => {
        if (socket.current && room && user) {
            if (user.email === room.host) {
                if (gameSelected === -1) {
                    toast.info('Please select a game first');
                } else {

                }
            } else {
                toast.info('Only host can start the game');
            }
        }
    }

    return (
        <div>
            <div className='modal-container' style={showPrompt ? {display: 'block'} : {}}>
                <LeaveModal cancelNavigation={() => setShowPrompt(false)} confirmNavigation={onLeaveRoom}
                            modalRef={modalRef} room={room} user={user}/>
            </div>
            <div className={`page ${Utilities.isDarkMode ? 'page-dark-mode' : 'page-light-mode'}`}>
                <div className='control-container'>
                    <button className='btn btn-secondary' onClick={() => setShowPrompt(true)}>Leave Room</button>
                    <button className='btn btn-primary' style={{marginLeft: 20}} onClick={handleOnStart}>Start Game</button>
                </div>
                <div className='room-container'>
                    <div className='users-container'>
                        {currentUsers.map(current => <UserAvatar email={current} key={current}/>)}
                    </div>
                    <div className='game-selection-container'>
                        <div className='card-list'>
                            {allGames.map((game, index) =>
                                <GameCardMini title='Tic Tac Toe' key={index}
                                              src='https://demos.creative-tim.com/soft-ui-design-system-pro/assets/img/nastuh.jpg'
                                              isSelected={gameSelected === index} select={() => handleOnSelect(index)}/>
                            )}
                        </div>
                    </div>
                </div>
                {/*<div>*/}
                {/*    <p>current users: {currentUsers.join(', ')}</p>*/}
                {/*    <input value={text} onChange={event => setText(event.target.value)}/>*/}
                {/*    <button onClick={handleClick}>send</button>*/}
                {/*    {*/}
                {/*        messages.map((message, id) => <p key={id}>{message.sender}: {message.text}</p>)*/}
                {/*    }*/}
                {/*</div>*/}
            </div>
        </div>
    );
}

export default Room;