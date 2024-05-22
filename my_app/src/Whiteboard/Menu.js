import React from "react";
import rectangleIcon from "../resources/icons/rectangle.svg";
import lineIcon from "../resources/icons/line.svg";
import pencilIcon from "../resources/icons/pencil.svg";
import rubberIcon from "../resources/icons/rubber.svg";
import textIcon from "../resources/icons/text.svg";
import selectionIcon from "../resources/icons/selection.svg";
import imgIcon from "../resources/icons/img.svg";

import { toolTypes } from "../constants";
import { useDispatch, useSelector } from "react-redux";
import { setElements, setToolType, setImage } from "./whiteboardSlice";
import { emitClearWhiteboard } from "../socketConn/socketConn";

const IconButton = ({ src, type, isRubber }) => {
    const dispatch = useDispatch();

    const selectedToolType = useSelector((state) => state.whiteboard.tool);

    const handleToolChange = () => {
        dispatch(setToolType(type));
    };

    const handleClearCanvas = () => {
        dispatch(setElements([]));

        emitClearWhiteboard();
    }


    return (
        <button
            onClick={isRubber ? handleClearCanvas : handleToolChange}
            className={
                selectedToolType === type ? "menu_button_active" : "menu_button"
            }
        >
            <img width="80%" height="80%" src={src} />
        </button>
    );
};

const Menu = () => {
    const dispatch = useDispatch();

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (evt) {
                dispatch(setImage(evt.target.result)); // Przekaż obraz do Redux
                dispatch(setToolType(toolTypes.IMAGE)); // Ustaw narzędzie na IMAGE
            };
            reader.readAsDataURL(file);
        }
    };
    return (
        <div className="menu_container">
            <IconButton src={rectangleIcon} type={toolTypes.RECTANGLE} />
            <IconButton src={lineIcon} type={toolTypes.LINE} />
            <IconButton src={pencilIcon} type={toolTypes.PENCIL} />
            <IconButton src={rubberIcon} isRubber />
            <IconButton src={textIcon} type={toolTypes.TEXT} />
            <IconButton src={selectionIcon} type={toolTypes.SELECTION} />
            <label className="menu_button">
                <img width="80%" height="80%" src={imgIcon} />
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                />
            </label>
        </div>
    );
};

export default Menu;
