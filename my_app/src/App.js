import React, { useEffect, useState } from 'react';
import { connectWithSocketServer } from "./socketConn/socketConn";
import { ToastContainer } from "react-toastify";
import JoinCreateRoom from "./JoinCreateRoom";
import Room from "./Room";
// index.js or App.js
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
    const [userNo, setUserNo] = useState(0);
    const [roomJoined, setRoomJoined] = useState(false);
    const [user, setUser] = useState({});
    const [users, setUsers] = useState([]);

    const uuid = () => {
        var S4 = () => {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };
        return (
            S4() +
            S4() +
            "-" +
            S4() +
            "-" +
            S4() +
            "-" +
            S4() +
            "-" +
            S4() +
            S4() +
            S4()
        );
    };

    useEffect(() => {
        connectWithSocketServer();
    }, []);

    return (
        <div className="home">
            <ToastContainer />
            {roomJoined ? (
                <Room
                    user={user}
                    userNo={userNo}
                    setUsers={setUsers}
                    setUserNo={setUserNo}
                />
            ) : (
                <JoinCreateRoom
                    uuid={uuid}
                    setRoomJoined={setRoomJoined}
                    setUser={setUser}
                />
            )}
        </div>
    );
};

export default App;
