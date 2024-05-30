import React, { useEffect, useState } from 'react'; // Import necessary modules from React
import { connectWithSocketServer } from "./socketConn/socketConn"; // Import the function to connect with the socket server
import { ToastContainer } from "react-toastify"; // Import the ToastContainer component from react-toastify
import JoinCreateRoom from "./JoinCreateRoom"; // Import the JoinCreateRoom component
import Room from "./Room"; // Import the Room component

function App() {
    // Define state variables using the useState hook
    const [userNo, setUserNo] = useState(0); // State variable for user number
    const [roomJoined, setRoomJoined] = useState(false); // State variable for room joined status
    const [user, setUser] = useState({}); // State variable for user information
    const [users, setUsers] = useState([]); // State variable for list of users in the room

    // Function to generate a unique identifier (UUID)
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

    // Effect hook to connect with the socket server when the component mounts
    useEffect(() => {
        connectWithSocketServer(); // Connect with the socket server
    }, []); // Empty dependency array means this effect runs only once, on mount

    return (
        <div className="home">
            <ToastContainer /> {/* Render the ToastContainer for displaying notifications */}
            {/* Conditionally render either the Room or JoinCreateRoom component based on roomJoined state */}
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

export default App; // Export the App component as the default export
