import React from "react";
import { useSelector } from "react-redux";
import cursor from "../resources/icons/selection.svg";
import './CursorOverlay.css'; // Import the custom CSS file for styling

const CursorOverlay = () => {
    const cursors = useSelector((state) => state.cursor.cursors);

    return (
        <>
            {cursors.map((c) => (
                <div
                    key={c.userId}
                    className="cursor-container"
                    style={{ position: "absolute", left: c.x, top: c.y }}
                >
                    <img
                        className="cursor-image"
                        src={cursor}
                        alt="cursor"
                    />
                    <div className="cursor-name">
                        {c.userName}
                    </div>
                </div>
            ))}
        </>
    );
};

export default CursorOverlay;
