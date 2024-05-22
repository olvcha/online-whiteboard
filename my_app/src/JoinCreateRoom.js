import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import './JoinCreateRoom.css';

const JoinCreateRoom = ({ uuid, setUser, setRoomJoined }) => {
    const [roomId, setRoomId] = useState(uuid());
    const [name, setName] = useState("");
    const [joinName, setJoinName] = useState("");
    const [joinRoomId, setJoinRoomId] = useState("");

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        if (!name) return toast("Please enter your name!");

        setUser({
            roomId,
            userId: uuid(),
            userName: name,
        });
        setRoomJoined(true);
    };

    const handleJoinSubmit = (e) => {
        e.preventDefault();
        if (!joinName) return toast("Please enter your name!");

        setUser({
            roomId: joinRoomId,
            userId: uuid(),
            userName: joinName,
        });
        setRoomJoined(true);
    };

    return (
        <div className="container">
            <ToastContainer /> {}
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
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="input-group margin-y-small">
                            <input
                                type="text"
                                className="input-field no-border no-outline"
                                value={roomId}
                                readOnly
                            />
                            <div className="input-group-append">
                                <button
                                    className="button button-outline-primary no-border button-small"
                                    type="button"
                                    onClick={() => setRoomId(uuid())}
                                >
                                    Generate
                                </button>
                                &nbsp;&nbsp;
                                <button
                                    className="button button-outline-dark no-border button-small"
                                    type="button"
                                    onClick={() => {
                                        navigator.clipboard.writeText(roomId);
                                        toast.success("Room Id Copied To Clipboard!");
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
                                onChange={(e) => setJoinName(e.target.value)}
                            />
                        </div>
                        <div className="form-group margin-y-small">
                            <input
                                type="text"
                                className="input-field no-outline"
                                value={joinRoomId}
                                onChange={(e) => setJoinRoomId(e.target.value)}
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
