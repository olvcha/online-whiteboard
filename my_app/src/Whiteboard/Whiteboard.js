import React, { useRef, useLayoutEffect, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Menu from "./Menu";
import rough from "roughjs/bundled/rough.esm";
import { actions, cursorPositions, toolTypes } from "../constants";
import {
    createElement,
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
import { updateElement } from "./utils"; // Import the updateElement function

let emitCursor = true; // Flag to control the frequency of cursor position updates
let lastCursorPosition; // Stores the last cursor position

const Whiteboard = ({ user }) => {
    const canvasRef = useRef(); // Ref for the canvas element
    const textAreaRef = useRef(); // Ref for the text area element
    const toolType = useSelector((state) => state.whiteboard.tool); // Selected tool type from Redux store
    const elements = useSelector((state) => state.whiteboard.elements); // Elements from Redux store
    const imageToInsert = useSelector((state) => state.whiteboard.image); // Image to insert from Redux store
    const selectedColor = useSelector((state) => state.whiteboard.color); // Selected color from Redux store
    const pencilSize = useSelector((state) => state.whiteboard.pencilSize); // Pencil size from Redux store
    const textSize = useSelector((state) => state.whiteboard.textSize); // Text size from Redux store
    const canvasSize = useSelector((state) => state.whiteboard.canvasSize); // Canvas size from Redux store

    const [action, setAction] = useState(null); // Current action state
    const [selectedElement, setSelectedElement] = useState(null); // Currently selected element

    const dispatch = useDispatch();

    // Set initial canvas size
    useEffect(() => {
        const canvas = canvasRef.current;
        const width = canvas.width || 800;  // Default width
        const height = canvas.height || 600;  // Default height
        dispatch(updateCanvasSize({ width, height }));
    }, [dispatch]);

     // Redraw elements on canvas when elements or canvas size changes
    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

        const roughCanvas = rough.canvas(canvas);

        const drawAllElements = async () => {
            for (const element of elements) {
                await drawElement({ roughCanvas, context: ctx, element });
            }
        };

        drawAllElements();

    }, [elements, canvasSize]);

    // Handle canvas resize
    const handleResize = (width, height) => {
        const newSize = { width, height };
        dispatch(updateCanvasSize(newSize));
        emitCanvasResize(newSize); // Emit canvas resize event to server
    };

    // Adjust coordinates for canvas scroll
    const adjustForScroll = (clientX, clientY) => {
        const canvas = canvasRef.current;
        const { left, top } = canvas.getBoundingClientRect();
        return { x: clientX - left, y: clientY - top };
    };

    // Handle mouse down event on canvas
    const handleMouseDown = (event) => {
        const { clientX, clientY } = event;
        const { x, y } = adjustForScroll(clientX, clientY);

        if (selectedElement && action === actions.WRITING) {
            return; // Prevent any action if a text element is being written
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
                    pencilSize: pencilSize,
                });
                setAction(actions.DRAWING); // Set action to drawing
                setSelectedElement(element); // Set the selected element
                dispatch(updateElementInStore(element)); // Dispatch action to store the element in Redux
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
                    textSize: textSize,
                });
                setAction(actions.WRITING); // Set action to writing
                setSelectedElement(element); // Set the selected element
                dispatch(updateElementInStore(element)); // Dispatch action to store the element in Redux
                break;
            }
            case toolTypes.SELECTION: {
                const element = getElementAtPosition(x, y, elements); // Get element at clicked position
                console.log("Clicked Element: ", element);
                

                if (element) {
                    // Set action to moving or resizing based on the cursor position
                    setAction(
                        element.position === cursorPositions.INSIDE ? actions.MOVING : actions.RESIZING
                    );

                    let offsetX, offsetY;
                    if (element.type === toolTypes.PENCIL) {
                        // For pencil, calculate the offset based on the first point
                        const firstPoint = element.points[0];
                        offsetX = x - firstPoint.x;
                        offsetY = y - firstPoint.y;
                    } else {
                        offsetX = x - element.x1;
                        offsetY = y - element.y1;
                    }

                    console.log("Selected Element for Moving/Resizing: ", { ...element, offsetX, offsetY });
                    setSelectedElement({ ...element, offsetX, offsetY }); // Set selected element with offsets
                } else {
                    setSelectedElement(null);
                    setAction(null);
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
                    dispatch(updateElementInStore(element)); // Dispatch action to store the element in Redux
                    emitImageUpload({ ...element, roomId: user.roomId }); // Emit image upload event to server
                    dispatch(setImage(null)); // Reset image to insert in Redux store
                }
                break;
            }
            default:
                break;
        }
    };


    // Handle mouse move event on canvas
    const handleMouseMove = (event) => {
        const { clientX, clientY } = event;
        const { x, y } = adjustForScroll(clientX, clientY);

        lastCursorPosition = { x, y }; // Update the last cursor position

        // Emit cursor position to server with a delay
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
                if (selectedElement.type === toolTypes.PENCIL) {
                    // Add new point to the pencil element's points array
                    const points = [...elements[index].points, { x, y }];
                    updateElement(
                        {
                            index,
                            id: elements[index].id,
                            points,
                            type: elements[index].type,
                            color: elements[index].color,
                            pencilSize: elements[index].pencilSize,
                        },
                        elements
                    );
                } else {
                    // Update the x2 and y2 coordinates of the element
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
                }
                emitElementUpdate({ ...elements[index], roomId: user.roomId }); // Emit element update event to server
            }
        }
        if (toolType === toolTypes.SELECTION) {
            const element = getElementAtPosition(x, y, elements); // Get element at cursor position

            // Update cursor style based on element position
            event.target.style.cursor = element ? getCursorForPosition(element.position) : "default";
        }
        if (toolType === toolTypes.SELECTION &&
            action === actions.MOVING &&
            selectedElement) {
            const { id, type, offsetX, offsetY } = selectedElement;

            if (type === toolTypes.PENCIL) {
                // Calculate new points for the pencil element based on movement
                const newPoints = selectedElement.points.map(point => ({
                    x: point.x + (x - selectedElement.offsetX),
                    y: point.y + (y - selectedElement.offsetY)
                }));

                const index = elements.findIndex((el) => el.id === selectedElement.id);
                if (index !== -1) {
                    updateElement({
                        id,
                        points: newPoints,
                        type,
                        index,
                    }, elements);
                    emitElementUpdate({ ...elements[index], roomId: user.roomId });
                }
            } else {
                // Calculate new coordinates for the element based on movement
                const { x1, x2, y1, y2 } = selectedElement;
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
                        color: selectedElement.color,
                    }, elements);
                    emitElementUpdate({ ...elements[index], roomId: user.roomId }); // Emit element update event to server
                }
            }
        }
        if (toolType === toolTypes.SELECTION &&
            action === actions.RESIZING &&
            selectedElement) {
            // Calculate new coordinates for the element based on resizing
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
                        color: selectedElement.color,
                    },
                    elements
                );
                emitElementUpdate({ ...elements[selectedElementIndex], roomId: user.roomId }); // Emit element update event to server
            }
        }
    };


    // Handle mouse up event on canvas
    const handleMouseUp = () => {
        if (!selectedElement) {
            setAction(null); // Reset action if no element is selected
            return;
        }

        const selectedElementIndex = elements.findIndex(
            (el) => el.id === selectedElement.id
        );

        if (selectedElementIndex !== -1) {
            if (action === actions.DRAWING || action === actions.RESIZING) {
                if (adjustmentRequired(elements[selectedElementIndex].type)) {
                    const adjustedCoordinates = adjustElementCoordinates(
                        elements[selectedElementIndex]
                    );
                    if (adjustedCoordinates) {
                        const { x1, y1, x2, y2 } = adjustedCoordinates;

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
                    } else {
                        console.error("Adjusted coordinates are undefined");
                    }
                }
            }
        }

        setAction(null); // Reset action state
        setSelectedElement(null); // Reset selected element
    };

    // Handle text area blur event
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
                textSize,
            };
            updateElement(updatedElement, elements);
            dispatch(updateElementInStore(updatedElement)); // Dispatch action to store the updated element in Redux
            emitElementUpdate({ ...updatedElement, roomId: user.roomId }); // Emit element update event to server
            setAction(null); // Reset action state
            setSelectedElement(null); // Reset selected element
        }
    };

    return (
        <>
            <Menu canvasRef={canvasRef}onResize={handleResize} initialCanvasSize={canvasSize} />
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
