import React, { useRef, useLayoutEffect, useState } from "react";
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
import { updateElement as updateElementInStore, setImage } from "./whiteboardSlice";
import { emitCursorPosition, emitElementUpdate, emitImageUpload } from "../socketConn/socketConn";
import PropTypes from 'prop-types';

let emitCursor = true;
let lastCursorPosition;

const Whiteboard = ({ user }) => {
    console.log('Whiteboard component rendered'); // Log to check if the component is rendered

    const canvasRef = useRef();
    const textAreaRef = useRef();
    const toolType = useSelector((state) => state.whiteboard.tool);
    const elements = useSelector((state) => state.whiteboard.elements);
    const imageToInsert = useSelector((state) => state.whiteboard.image);

    const [action, setAction] = useState(null);
    const [selectedElement, setSelectedElement] = useState(null);

    const dispatch = useDispatch();

    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const roughCanvas = rough.canvas(canvas);

        elements.forEach((element) => {
            console.log('Draw ',element.type);
            drawElement({ roughCanvas, context: ctx, element });
        });
    }, [elements]);

  /*  const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (evt) {
                setImageToInsert(evt.target.result);
            };
            reader.readAsDataURL(file);
        }
    };*/
    /*wklejanie zdjęcia
    const handlePaste = (event)=>{
        const items = event.clipboardData.items;
        for(const item of items){
            if(item.type.startsWith('image/')){
                const blob = item.getAsFile();
                const reader = new FileReader();
                reader.onload = function(evt){
                    const imageData={
                        id:uuid(),
                        type:'image',
                        data: evt.target.result,
                        x1: 100, // default position
                        y1: 100,
                    };
                    dispatch(updateElementInStore(imageData));
                    emitImageUpload({ ...imageData, roomId: user.roomId });
                };
                reader.readAsDataURL(blob);
            }
        }

    }*/

    const handleMouseDown = (event) => {
        const { clientX, clientY } = event;

        if (selectedElement && action === actions.WRITING) {
            return;
        }
        console.log('Mouse down');
        switch (toolType) {
            case toolTypes.RECTANGLE:
            case toolTypes.LINE:
            case toolTypes.PENCIL: {
                const element = createElement({
                    x1: clientX,
                    y1: clientY,
                    x2: clientX,
                    y2: clientY,
                    toolType,
                    id: uuid(),
                });
                setAction(actions.DRAWING);
                setSelectedElement(element);
                dispatch(updateElementInStore(element));
                break;
            }
            case toolTypes.TEXT: {
                const element = createElement({
                    x1: clientX,
                    y1: clientY,
                    x2: clientX,
                    y2: clientY,
                    toolType,
                    id: uuid(),
                });
                setAction(actions.WRITING);
                setSelectedElement(element);
                dispatch(updateElementInStore(element));
                break;
            }
            case toolTypes.SELECTION:{
                const element = getElementAtPosition(clientX, clientY, elements)

                if(element && element.type === toolTypes.RECTANGLE){
                    setAction(
                        element.position === cursorPositions.INSIDE ? actions.MOVING : actions.RESIZING);

                    const offsetX = clientX - element.x1;
                    const offsetY = clientY - element.y1;

                    setSelectedElement({...element, offsetX, offsetY});
                }
                break;
                
            }
            case toolTypes.IMAGE: {
                if (imageToInsert) {
                    const element = {
                        id: uuid(),
                        type: toolTypes.IMAGE, // Ustaw typ na IMAGE
                        data: imageToInsert,
                        x1: clientX,
                        y1: clientY,
                    };
                    dispatch(updateElementInStore(element));
                    emitImageUpload({ ...element, roomId: user.roomId });
                  //  setImageToInsert(null); // Reset image after placing it
                    dispatch(setImage(null)); 
                }
                break;
            }

        }
        
        //emitElementUpdate({ ...element, roomId: user.roomId }); // Emit element update with room context
    };

    const handleMouseUp = () => {
        const selectedElementIndex = elements.findIndex(
            (el) => el.id === selectedElement?.id
        );

        if (selectedElementIndex !== -1) {
            if (action === actions.DRAWING || action === action.RESIZING) {
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
            emitCursorPosition({ x: clientX, y: clientY, userId: user.userId, userName: user.userName, roomId: user.roomId }); // Emit cursor position with user context
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
                        x2: clientX,
                        y2: clientY,
                        type: elements[index].type,
                    },
                    elements
                );
                emitElementUpdate({ ...elements[index], roomId: user.roomId }); // Emit element update with room context
            }
        }
        if (toolType === toolTypes.SELECTION){
            const element = getElementAtPosition(clientX, clientY, elements);
           
            event.target.style.cursor = element ? getCursorForPosition(element.position) : "default";
            
        }
        if(toolType === toolTypes.SELECTION && 
            action === actions.MOVING && 
            selectedElement){
            const{id, x1, x2, y1, y2, type, offsetX, offsetY} = selectedElement;

            const width = x2 - x1;
            const height = y2 - y1;

            const newX1 = clientX - offsetX;
            const newY1 = clientY - offsetY;

            const index = elements.findIndex((el)=>el.id === selectedElement.id);
            if(index !== -1){
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
        if(toolType === toolTypes.SELECTION && 
            action === actions.RESIZING && 
            selectedElement){
                const{id, type, position, ...coordinates} = selectedElement;
                const {x1, y1, x2, y2} = getResizedCoordinates(
                    clientX,
                    clientY,
                    position,
                    coordinates
                );
                const selectedElementIndex = elements.findIndex(
                    (el)=>el.id === selectedElement.id);
                if(selectedElementIndex !== -1){
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
                //onPaste={handlePaste}
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
