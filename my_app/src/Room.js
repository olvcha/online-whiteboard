import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setRoomId } from "./Whiteboard/whiteboardSlice";
import { connectWithSocketServer, joinRoom } from "./socketConn/socketConn";
import PropTypes from 'prop-types';
import Whiteboard from './Whiteboard/Whiteboard';
import CursorOverlay from "./CursorOverlay/CursorOverlay";

const Room = ({ user }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        // Establish connection with the socket server
        const socket = connectWithSocketServer();

        // If user and roomId are available, set the roomId in the store and join the room
        if (user && user.roomId) {
            dispatch(setRoomId(user.roomId));
            joinRoom(user.roomId);
        }

        // Clean up the socket connection when the component unmounts
        return () => {
            socket.disconnect();
        };
    }, [user, dispatch]);

    return (
        <div>
            <Whiteboard user={user} />
            <CursorOverlay />
        </div>
    );
};

// Define prop types for the Room component
Room.propTypes = {
    user: PropTypes.shape({
        roomId: PropTypes.string.isRequired,
        userId: PropTypes.string.isRequired,
        userName: PropTypes.string.isRequired,
    }).isRequired,
};

export default Room;
