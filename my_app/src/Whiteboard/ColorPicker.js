import React from "react";
import { useDispatch } from "react-redux";
import { setColor } from "./whiteboardSlice"; // Import the setColor action from the whiteboardSlice file

/// Array of colors for the color picker
const colors = ["#000000", "#6495ed", "#50c878", "#ffe6a8", "#e97451", "#ef5fbe"]; 

// ColorPicker component
// It takes an onClose function as a prop to close the color picker after a color is selected
const ColorPicker = ({ onClose }) => {
    const dispatch = useDispatch(); // Get the dispatch function from the Redux store


    // Function to handle color change: dispatch setColor action and close the picker
    const handleColorChange = (color) => {
        dispatch(setColor(color));
        onClose();
    };

    return (
        <div className="color-picker"> // Color picker container
            {colors.map(color => ( // Map through colors and create a div for each
                <div
                    key={color} // Unique key for each color
                    className="color-picker-item" // Styling class
                    style={{ backgroundColor: color }} // Set background color
                    onClick={() => handleColorChange(color)}  // Click handler to change color
                />
            ))}
        </div>
    );
};

export default ColorPicker; // Export ColorPicker component
