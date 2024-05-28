import React from "react";
import { useSelector } from "react-redux";
import cursor from "../resources/icons/selection.svg";
import './CursorOverlay.css';

const CursorOverlay = () => {
    // Get the cursor data from the Redux store
    const cursors = useSelector((state) => state.cursor.cursors);

    return (
        <>
            {cursors.map((c) => (
                <div
                    key={c.userId} // Unique key for each cursor
                    className="cursor-container" // Apply styling from CSS
                    style={{ position: "absolute", left: c.x, top: c.y }} // Position the cursor based on its coordinates
                >
                    <img
                        className="cursor-image" // Apply styling from CSS
                        src={cursor} // Source of the cursor image
                        alt="cursor" // Alt text for the image
                    />
                    <div className="cursor-name">
                        {c.userName}
                        {/* Display the username associated with the cursor */}
                    </div>
                </div>
            ))}
        </>
    );
};

export default CursorOverlay;
