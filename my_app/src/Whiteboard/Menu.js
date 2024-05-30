import React, { useState, useEffect } from "react";
import rectangleIcon from "../resources/icons/rectangle.svg";
import lineIcon from "../resources/icons/line.svg";
import pencilIcon from "../resources/icons/pencil.svg";
import rubberIcon from "../resources/icons/rubber.svg";
import textIcon from "../resources/icons/text.svg";
import selectionIcon from "../resources/icons/selection.svg";
import imgIcon from "../resources/icons/img.svg";
import colorIcon from "../resources/icons/color.svg";
import downloadIcon from "../resources/icons/download.svg";
import ColorPicker from "./ColorPicker";
import { toolTypes } from "../constants";
import { useDispatch, useSelector } from "react-redux";
import { setElements, setToolType, setImage, setPencilSize, setTextSize } from "./whiteboardSlice";
import { emitClearWhiteboard } from "../socketConn/socketConn";
import exportCanvas from "../Whiteboard/utils/canvasExport";

// Component for individual tool buttons
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

// Menu component for whiteboard tools
const Menu = ({ canvasRef, onResize, initialCanvasSize }) => {
    const dispatch = useDispatch();
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [width, setWidth] = useState(initialCanvasSize.width);
    const [height, setHeight] = useState(initialCanvasSize.height);
    //const [pencilSizeOption, setPencilSizeOption] = useState(false); // State for pencil size option


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

    // Handle canvas resize
    const handleResize = () => {
        onResize(parseInt(width, 10), parseInt(height, 10));
    };

    // Handle pencil size change
    const handlePencilSizeChange = (size) => {
        //setPencilSizeOption(size);
        console.log("Pencil size changed to:", size);
        dispatch(setPencilSize(size));
      };

    // Handle text size change
    const handleTextSizeChange = (size) => {
        dispatch(setTextSize(size));
    }

    return (
        <div className="menu_container">

            <div className="pencil-size-section">
                <p>Choose Pencil Size:</p>
                <div>
                    <button onClick={() => handlePencilSizeChange(1)}>1</button>
                    <button onClick={() => handlePencilSizeChange(5)}>5</button>
                    <button onClick={() => handlePencilSizeChange(10)}>10</button>
                </div>
            </div>

            <div className="text-size-section">
                <p>Choose Text Size:</p>
                <div>
                    <button onClick={() => handleTextSizeChange(10)}>10</button>
                    <button onClick={() => handleTextSizeChange(20)}>20</button>
                    <button onClick={() => handleTextSizeChange(30)}>30</button>
                </div>
            </div>

            <div className="resize_form">
                <div className="resize_form_input">
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
                </div>
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
            <button
                className="menu_button"
                onClick={() => exportCanvas(canvasRef)}
            >
                <img width="80%" height="80%" src={downloadIcon} alt="Download" />
            </button>
        </div>
    );
};

export default Menu;
