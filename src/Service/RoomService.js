import axios from "axios";
import {server} from "../config";


const RoomService = {
    getAllRooms: (setRooms) => {
        axios.get(`${server}/rooms/all`)
            .then(response => {
                setRooms(response.data.rooms);
            });
    },
    getRoom: (roomId) => {
       return axios.get(`${server}/rooms/getRoom/${roomId}`)
    },
    createRooms: (email, roomName, capacity, description) => {
        const room = {
            host: email,
            roomName: roomName,
            capacity: capacity,
            description: description,
        };
        return axios.post(`${server}/rooms/create`, room);
    },
    joinRoom: (roomId, email) => {
        return axios.post(`${server}/rooms/join`, {id: roomId, email: email});
    },
    leaveRoom: (roomId, email) => {
        return axios.post(`${server}/rooms/leave`, {id: roomId, email: email});
    },
    deleteRoom: (roomId) => {
        return axios.delete(`${server}/rooms/delete/${roomId}`);
    },
}

export default RoomService;