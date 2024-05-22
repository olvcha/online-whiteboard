import React, { useRef, useLayoutEffect, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Menu from "./Menu";
import rough from "roughjs/bundled/rough.esm";
import { actions, cursorPositions, toolTypes } from "../constants";
import {
    createElement,
    updateElement,
    drawElement,
    adjustmentRequired,
    adjustElementCoordinates,
    getElementAtPosition,
    getCursorForPosition,
    getResizedCoordinates,
} from "./utils";
import { v4 as uuid } from "uuid";
import { updateElement as updateElementInStore, setImage, updateCanvasSize } from "./whiteboardSlice";
import { emitCursorPosition, emitElementUpdate, emitImageUpload, emitCanvasResize } from "../socketConn/socketConn";
import PropTypes from 'prop-types';

let emitCursor = true;
let lastCursorPosition;

const Whiteboard = ({ user }) => {
    const canvasRef = useRef();
    const textAreaRef = useRef();
    const toolType = useSelector((state) => state.whiteboard.tool);
    const elements = useSelector((state) => state.whiteboard.elements);
    const imageToInsert = useSelector((state) => state.whiteboard.image);
    const selectedColor = useSelector((state) => state.whiteboard.color);
    const canvasSize = useSelector((state) => state.whiteboard.canvasSize);

    const [action, setAction] = useState(null);
    const [selectedElement, setSelectedElement] = useState(null);

    const dispatch = useDispatch();

    useEffect(() => {
        const canvas = canvasRef.current;
        const width = canvas.width || 800;  // Default width
        const height = canvas.height || 600;  // Default height
        dispatch(updateCanvasSize({ width, height }));
    }, [dispatch]);

    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const roughCanvas = rough.canvas(canvas);

        const drawAllElements = async () => {
            for (const element of elements) {
                await drawElement({ roughCanvas, context: ctx, element });
            }
        };

        drawAllElements();

    }, [elements, canvasSize]);

    const handleResize = (width, height) => {
        const newSize = { width, height };
        dispatch(updateCanvasSize(newSize));
        emitCanvasResize(newSize);
    };

    const adjustForScroll = (clientX, clientY) => {
        const canvas = canvasRef.current;
        const { left, top } = canvas.getBoundingClientRect();
        return { x: clientX - left, y: clientY - top };
    };

    const handleMouseDown = (event) => {
        const { clientX, clientY } = event;
        const { x, y } = adjustForScroll(clientX, clientY);

        if (selectedElement && action === actions.WRITING) {
            return;
        }

        switch (toolType) {
            case toolTypes.RECTANGLE:
            case toolTypes.LINE:
            case toolTypes.PENCIL: {
                const element = createElement({
                    x1: x,
                    y1: y,
                    x2: x,
                    y2: y,
                    toolType,
                    id: uuid(),
                    color: selectedColor,
                });
                setAction(actions.DRAWING);
                setSelectedElement(element);
                dispatch(updateElementInStore(element));
                break;
            }
            case toolTypes.TEXT: {
                const element = createElement({
                    x1: x,
                    y1: y,
                    x2: x,
                    y2: y,
                    toolType,
                    id: uuid(),
                    color: selectedColor,
                });
                setAction(actions.WRITING);
                setSelectedElement(element);
                dispatch(updateElementInStore(element));
                break;
            }
            case toolTypes.SELECTION: {
                const element = getElementAtPosition(x, y, elements);

                if (element) {
                    setAction(
                        element.position === cursorPositions.INSIDE ? actions.MOVING : actions.RESIZING
                    );

                    const offsetX = x - element.x1;
                    const offsetY = y - element.y1;

                    setSelectedElement({ ...element, offsetX, offsetY });
                }
                break;
            }
            case toolTypes.IMAGE: {
                if (imageToInsert) {
                    const element = {
                        id: uuid(),
                        type: toolTypes.IMAGE,
                        data: imageToInsert,
                        x1: x,
                        y1: y,
                        x2: x + 100, // Add default width for the image
                        y2: y + 100, // Add default height for the image
                    };
                    dispatch(updateElementInStore(element));
                    emitImageUpload({ ...element, roomId: user.roomId });
                    dispatch(setImage(null));
                }
                break;
            }
            default:
                break;
        }
    };

    const handleMouseUp = () => {
        const selectedElementIndex = elements.findIndex(
            (el) => el.id === selectedElement?.id
        );

        if (selectedElementIndex !== -1) {
            if (action === actions.DRAWING || action === actions.RESIZING) {
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
                            color: elements[selectedElementIndex].color,
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
        const { x, y } = adjustForScroll(clientX, clientY);

        lastCursorPosition = { x, y };

        if (emitCursor) {
            emitCursorPosition({ x, y, userId: user.userId, userName: user.userName, roomId: user.roomId });
            emitCursor = false;

            setTimeout(() => {
                emitCursor = true;
                emitCursorPosition({ ...lastCursorPosition, userId: user.userId, userName: user.userName, roomId: user.roomId });
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
                        x2: x,
                        y2: y,
                        type: elements[index].type,
                        color: elements[index].color,
                    },
                    elements
                );
                emitElementUpdate({ ...elements[index], roomId: user.roomId });
            }
        }
        if (toolType === toolTypes.SELECTION) {
            const element = getElementAtPosition(x, y, elements);

            event.target.style.cursor = element ? getCursorForPosition(element.position) : "default";
        }
        if (toolType === toolTypes.SELECTION &&
            action === actions.MOVING &&
            selectedElement) {
            const { id, x1, x2, y1, y2, type, offsetX, offsetY } = selectedElement;

            const width = x2 - x1;
            const height = y2 - y1;

            const newX1 = x - offsetX;
            const newY1 = y - offsetY;

            const index = elements.findIndex((el) => el.id === selectedElement.id);
            if (index !== -1) {
                updateElement({
                        id,
                        x1: newX1,
                        y1: newY1,
                        x2: newX1 + width,
                        y2: newY1 + height,
                        type,
                        index,
                    },
                    elements
                );
            }
        }
        if (toolType === toolTypes.SELECTION &&
            action === actions.RESIZING &&
            selectedElement) {
            const { id, type, position, ...coordinates } = selectedElement;
            const { x1, y1, x2, y2 } = getResizedCoordinates(
                x,
                y,
                position,
                coordinates
            );
            const selectedElementIndex = elements.findIndex(
                (el) => el.id === selectedElement.id);
            if (selectedElementIndex !== -1) {
                updateElement({
                        x1,
                        x2,
                        y1,
                        y2,
                        type: selectedElement.type,
                        id: selectedElement.id,
                        index: selectedElementIndex,
                    },
                    elements
                );
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
                color: selectedColor,
            };
            updateElement(updatedElement, elements);
            dispatch(updateElementInStore(updatedElement));
            emitElementUpdate({ ...updatedElement, roomId: user.roomId });
            setAction(null);
            setSelectedElement(null);
        }
    };

    return (
        <>
            <Menu onResize={handleResize} initialCanvasSize={canvasSize} />
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
                        color: selectedElement.color,
                    }}
                />
            ) : null}
            <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                id="canvas"
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                style={{ border: '1px solid #000', background: '#fff' }}
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
