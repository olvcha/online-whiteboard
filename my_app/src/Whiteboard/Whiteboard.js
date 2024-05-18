import React, { useRef, useLayoutEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Menu from "./Menu";
import rough from "roughjs/bundled/rough.esm";
import { actions, toolTypes } from "../constants";
import {
    createElement,
    updateElement,
    drawElement,
    adjustmentRequired,
    adjustElementCoordinates,
} from "./utils";
import { v4 as uuid } from "uuid";
import { updateElement as updateElementInStore } from "./whiteboardSlice";
import { emitCursorPosition, emitElementUpdate} from "../socketConn/socketConn";
import PropTypes from 'prop-types';

let emitCursor = true;
let lastCursorPosition;

const Whiteboard = ({ user }) => {
    const canvasRef = useRef();
    const textAreaRef = useRef();
    const toolType = useSelector((state) => state.whiteboard.tool);
    const elements = useSelector((state) => state.whiteboard.elements);

    const [action, setAction] = useState(null);
    const [selectedElement, setSelectedElement] = useState(null);

    const dispatch = useDispatch();

    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const roughCanvas = rough.canvas(canvas);

        elements.forEach((element) => {
            drawElement({ roughCanvas, context: ctx, element });
        });
    }, [elements]);

    const handleMouseDown = (event) => {
        const { clientX, clientY } = event;

        if (selectedElement && action === actions.WRITING) {
            return;
        }

        const element = createElement({
            x1: clientX,
            y1: clientY,
            x2: clientX,
            y2: clientY,
            toolType,
            id: uuid(),
        });

        switch (toolType) {
            case toolTypes.RECTANGLE:
            case toolTypes.PENCIL:
            case toolTypes.LINE: {
                setAction(actions.DRAWING);
                break;
            }
            case toolTypes.TEXT: {
                setAction(actions.WRITING);
                break;
            }
            default:
                break;
        }
        setSelectedElement(element);
        dispatch(updateElementInStore(element));
        emitElementUpdate({ ...element, roomId: user.roomId }); // Emit element update with room context
    };

    const handleMouseUp = () => {
        const selectedElementIndex = elements.findIndex(
            (el) => el.id === selectedElement?.id
        );

        if (selectedElementIndex !== -1) {
            if (action === actions.DRAWING) {
                if (adjustmentRequired(elements[selectedElementIndex].type)) {
                    const { x1, y1, x2, y2 } = adjustElementCoordinates(
                        elements[selectedElementIndex]
                    );

                    updateElement(
                        {
                            id: selectedElement.id,
                            index: selectedElementIndex,
                            x1,
                            x2,
                            y1,
                            y2,
                            type: elements[selectedElementIndex].type,
                        },
                        elements
                    );
                }
            }
        }

        setAction(null);
        setSelectedElement(null);
    };

    const handleMouseMove = (event) => {
        const { clientX, clientY } = event;

        lastCursorPosition = { x: clientX, y: clientY };

        if (emitCursor) {
            emitCursorPosition({ x: clientX, y: clientY, roomId: user.roomId }); // Emit cursor position with room context
            emitCursor = false;

            setTimeout(() => {
                emitCursor = true;
                emitCursorPosition(lastCursorPosition);
            }, 50);
        }

        if (action === actions.DRAWING) {
            const index = elements.findIndex((el) => el.id === selectedElement.id);

            if (index !== -1) {
                updateElement(
                    {
                        index,
                        id: elements[index].id,
                        x1: elements[index].x1,
                        y1: elements[index].y1,
                        x2: clientX,
                        y2: clientY,
                        type: elements[index].type,
                    },
                    elements
                );
                emitElementUpdate({ ...elements[index], roomId: user.roomId }); // Emit element update with room context
            }
        }
    };

    const handleTextareaBlur = (event) => {
        const { id, x1, y1, type } = selectedElement;
        const index = elements.findIndex((el) => el.id === selectedElement.id);
        if (index !== -1) {
            const updatedElement = {
                id,
                x1,
                y1,
                type,
                text: event.target.value,
                index,
            };
            updateElement(updatedElement, elements);
            dispatch(updateElementInStore(updatedElement));
            emitElementUpdate({ ...updatedElement, roomId: user.roomId }); // Emit element update with room context
            setAction(null);
            setSelectedElement(null);
        }
    };

    return (
        <>
            <Menu />
            {action === actions.WRITING ? (
                <textarea
                    ref={textAreaRef}
                    onBlur={handleTextareaBlur}
                    style={{
                        position: 'absolute',
                        top: selectedElement.y1 - 3,
                        left: selectedElement.x1,
                        font: '24px sans-serif',
                        margin: 0,
                        padding: 0,
                        border: 0,
                        outline: 0,
                        resize: 'auto',
                        overflow: 'hidden',
                        whiteSpace: 'pre',
                        background: 'transparent',
                    }}
                />
            ) : null}
            <canvas
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                ref={canvasRef}
                width={window.innerWidth}
                height={window.innerHeight}
                id="canvas"
            />
        </>
    );
};

Whiteboard.propTypes = {
    user: PropTypes.shape({
        roomId: PropTypes.string.isRequired,
        userId: PropTypes.string.isRequired,
        userName: PropTypes.string.isRequired,
    }).isRequired,
};

export default Whiteboard;
