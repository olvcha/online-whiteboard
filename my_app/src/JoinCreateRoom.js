import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import './JoinCreateRoom.css';

const JoinCreateRoom = ({ uuid, setUser, setRoomJoined }) => {
    const [roomId, setRoomId] = useState(uuid()); // State to store the room ID for creating a new room
    const [name, setName] = useState(""); // State to store the user's name for creating a room
    const [joinName, setJoinName] = useState(""); // State to store the user's name for joining a room
    const [joinRoomId, setJoinRoomId] = useState(""); // State to store the room ID for joining an existing room

    useEffect(() => {
        // Add the class to the body element when the component mounts
        document.body.classList.add('join-create-room-background');

        // Remove the class when the component unmounts
        return () => {
            document.body.classList.remove('join-create-room-background');
        };
    }, []);

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        if (!name) return toast("Please enter your name!"); // Show a toast message if the name is not entered

        // Set the user information and mark the room as joined
        setUser({
            roomId,
            userId: uuid(),
            userName: name,
        });
        setRoomJoined(true);
    };

    const handleJoinSubmit = (e) => {
        e.preventDefault();
        if (!joinName) return toast("Please enter your name!"); // Show a toast message if the join name is not entered

        // Set the user information and mark the room as joined
        setUser({
            roomId: joinRoomId,
            userId: uuid(),
            userName: joinName,
        });
        setRoomJoined(true);
    };

    return (
        <div className="container">
            <ToastContainer />
            <div className="row">
                <div className="column-full">
                    <h1 className="text-center margin-y-large">Welcome To Collaborative Whiteboard Tool!</h1>
                </div>
            </div>
            <div className="row margin-x-large margin-top-large">
                <div className="column-half padding-large border">
                    <h1 className="text-center custom-text-primary margin-bottom-large">Create Whiteboard</h1>
                    <form onSubmit={handleCreateSubmit}>
                        <div className="form-group margin-y-small">
                            <input
                                type="text"
                                placeholder="Name"
                                className="input-field"
                                value={name}
                                onChange={(e) => setName(e.target.value)} // Update the name state on input change
                            />
                        </div>
                        <div className="input-group margin-y-small">
                            <input
                                type="text"
                                className="input-field no-border no-outline"
                                value={roomId}
                                readOnly // Make the room ID input read-only
                            />
                            <div className="input-group-append">
                                <button
                                    className="button button-outline-primary no-border button-small"
                                    type="button"
                                    onClick={() => setRoomId(uuid())} // Generate a new room ID
                                >
                                    Generate
                                </button>
                                &nbsp;&nbsp;
                                <button
                                    className="button button-outline-dark no-border button-small"
                                    type="button"
                                    onClick={() => {
                                        navigator.clipboard.writeText(roomId);
                                        toast.success("Room Id Copied To Clipboard!"); // Copy the room ID to the clipboard and show a success message
                                    }}
                                >
                                    Copy
                                </button>
                            </div>
                        </div>
                        <div className="form-group margin-top-large">
                            <button type="submit" className="input-field button button-dark">
                                Create
                            </button>
                        </div>
                    </form>
                </div>
                <div className="column-half padding-large border">
                    <h1 className="text-center custom-text-primary margin-bottom-large">Join Whiteboard</h1>
                    <form onSubmit={handleJoinSubmit}>
                        <div className="form-group margin-y-small">
                            <input
                                type="text"
                                placeholder="Name"
                                className="input-field"
                                value={joinName}
                                onChange={(e) => setJoinName(e.target.value)} // Update the join name state on input change
                            />
                        </div>
                        <div className="form-group margin-y-small">
                            <input
                                type="text"
                                className="input-field no-outline"
                                value={joinRoomId}
                                onChange={(e) => setJoinRoomId(e.target.value)} // Update the join room ID state on input change
                                placeholder="Room Id"
                            />
                        </div>
                        <div className="form-group margin-top-large">
                            <button type="submit" className="input-field button button-dark">
                                Join
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default JoinCreateRoom;
