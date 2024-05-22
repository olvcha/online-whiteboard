import React, { useState, useEffect } from "react";
import rectangleIcon from "../resources/icons/rectangle.svg";
import lineIcon from "../resources/icons/line.svg";
import pencilIcon from "../resources/icons/pencil.svg";
import rubberIcon from "../resources/icons/rubber.svg";
import textIcon from "../resources/icons/text.svg";
import selectionIcon from "../resources/icons/selection.svg";
import imgIcon from "../resources/icons/img.svg";
import colorIcon from "../resources/icons/color.svg";
import ColorPicker from "./ColorPicker";
import { toolTypes } from "../constants";
import { useDispatch, useSelector } from "react-redux";
import { setElements, setToolType, setImage } from "./whiteboardSlice";
import { emitClearWhiteboard } from "../socketConn/socketConn";

const IconButton = ({ src, type, isRubber }) => {
    const dispatch = useDispatch();
    const selectedToolType = useSelector((state) => state.whiteboard.tool);

    const handleToolChange = () => {
        if (!isRubber) {
            dispatch(setToolType(type));
        }
    };

    const handleClearCanvas = () => {
        dispatch(setElements([]));
        emitClearWhiteboard();
    };

    return (
        <button
            onClick={isRubber ? handleClearCanvas : handleToolChange}
            className={
                selectedToolType === type ? "menu_button_active" : "menu_button"
            }
        >
            <img width="80%" height="80%" src={src} alt={type} />
        </button>
    );
};

const Menu = ({ onResize, initialCanvasSize }) => {
    const dispatch = useDispatch();
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [width, setWidth] = useState(initialCanvasSize.width);
    const [height, setHeight] = useState(initialCanvasSize.height);

    useEffect(() => {
        setWidth(initialCanvasSize.width);
        setHeight(initialCanvasSize.height);
    }, [initialCanvasSize]);

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (evt) {
                dispatch(setImage(evt.target.result));
                dispatch(setToolType(toolTypes.IMAGE));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleResize = () => {
        onResize(parseInt(width, 10), parseInt(height, 10));
    };

    return (
        <div className="menu_container">
            <div className="resize_form">
                <label>
                    Width:
                    <input
                        type="number"
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        className="width_input"
                    />
                </label>
                <label>
                    Height:
                    <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="height_input"
                    />
                </label>
                <button onClick={handleResize}>Resize</button>
            </div>
            <IconButton src={rectangleIcon} type={toolTypes.RECTANGLE} />
            <IconButton src={lineIcon} type={toolTypes.LINE} />
            <IconButton src={pencilIcon} type={toolTypes.PENCIL} />
            <IconButton src={rubberIcon} isRubber />
            <IconButton src={textIcon} type={toolTypes.TEXT} />
            <IconButton src={selectionIcon} type={toolTypes.SELECTION} />
            <label className="menu_button">
                <img width="70%" height="70%" src={imgIcon} alt="Upload" />
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                />
            </label>
            <button
                className="menu_button"
                onClick={() => setShowColorPicker(!showColorPicker)}
            >
                <img width="80%" height="80%" src={colorIcon} alt="Color Picker" />
            </button>
            {showColorPicker && <ColorPicker onClose={() => setShowColorPicker(false)} />}
        </div>
    );
};

export default Menu;
