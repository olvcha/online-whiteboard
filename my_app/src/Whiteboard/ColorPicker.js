import React from "react";
import { useDispatch } from "react-redux";
import { setColor } from "./whiteboardSlice";

const colors = ["#000000", "#6495ed", "#50c878", "#ffe6a8", "#e97451", "#ef5fbe"]; 

const ColorPicker = ({ onClose }) => {
    const dispatch = useDispatch();

    const handleColorChange = (color) => {
        dispatch(setColor(color));
        onClose();
    };

    return (
        <div className="color-picker">
            {colors.map(color => (
                <div
                    key={color}
                    className="color-picker-item"
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorChange(color)}
                />
            ))}
        </div>
    );
};

export default ColorPicker;
