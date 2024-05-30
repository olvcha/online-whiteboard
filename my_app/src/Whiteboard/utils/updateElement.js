import { createElement } from "./index"; // Import the createElement function from the index module
import { toolTypes } from "../../constants"; // Import tool types from constants
import { store } from "../../store/store"; // Import the Redux store
import { setElements } from "../whiteboardSlice"; // Import the setElements action from whiteboardSlice
import { emitElementUpdate } from "../../socketConn/socketConn"; // Import the emitElementUpdate function for socket communication

/**
 * Updates the points of a pencil element when it is being moved.
 * 
 * @param {Object} param0 - The parameters for updating the pencil element.
 * @param {number} param0.index - The index of the element to update.
 * @param {Array} param0.newPoints - The new points to update the element with.
 * @param {Array} elements - The current list of elements.
 */
export const updatePencilElementsWhenMoving = ({ index, newPoints }, elements) => {
  // Create a copy of the elements array
  const elementsCopy = [...elements];

  // Update the points of the pencil element at the specified index
  elementsCopy[index] = {
    ...elementsCopy[index],
    points: newPoints,
  };

  // Get the updated pencil element
  const updatedPencilElement = elementsCopy[index];

  // Dispatch the updated elements to the Redux store
  store.dispatch(setElements(elementsCopy));

  // Emit the updated pencil element through the socket connection
  emitElementUpdate(updatedPencilElement);
};

/**
 * Updates an element in the elements array based on its type and new properties.
 * 
 * @param {Object} param0 - The parameters for updating the element.
 * @param {string} param0.id - The ID of the element.
 * @param {number} param0.x1 - The new x1 coordinate of the element.
 * @param {number} param0.x2 - The new x2 coordinate of the element.
 * @param {number} param0.y1 - The new y1 coordinate of the element.
 * @param {number} param0.y2 - The new y2 coordinate of the element.
 * @param {string} param0.type - The type of the element.
 * @param {number} param0.index - The index of the element to update.
 * @param {string} [param0.text] - The new text for the text element (if applicable).
 * @param {string} [param0.color] - The new color for the element (if applicable).
 * @param {Array} [param0.points] - The new points for the pencil element (if applicable).
 * @param {Array} elements - The current list of elements.
 */
export const updateElement = (
    { id, x1, x2, y1, y2, type, index, text, color, points, pencilSize },
    elements
) => {
  console.log('updateElement called with elements:', elements);

  // Ensure elements is an array
  if (!Array.isArray(elements)) {
    console.error('Elements is not an array:', elements);
    throw new Error("Elements must be an array");
  }

  // Create a copy of the elements array
  const elementsCopy = [...elements];

  switch (type) {
    case toolTypes.LINE:
    case toolTypes.RECTANGLE:
      // Create a new line or rectangle element with the updated properties
      const updatedElement = createElement({
        id,
        x1,
        y1,
        x2,
        y2,
        toolType: type,
        color,
      });

      // Update the element in the copied array
      elementsCopy[index] = updatedElement;

      // Dispatch the updated elements to the Redux store
      store.dispatch(setElements(elementsCopy));

      // Emit the updated element through the socket connection
      emitElementUpdate(updatedElement);
      break;

    case toolTypes.PENCIL:
      // Update the points of the pencil element, or append new points
      elementsCopy[index] = {
        ...elementsCopy[index],
        points: points ? points : [
          ...elementsCopy[index].points,
          { x: x2, y: y2 },
          pencilSize,
        ]
      };

      // Get the updated pencil element
      const updatedPencilElement = elementsCopy[index];

      // Dispatch the updated elements to the Redux store
      store.dispatch(setElements(elementsCopy));

      // Emit the updated pencil element through the socket connection
      emitElementUpdate(updatedPencilElement);
      break;

    case toolTypes.TEXT:
      // Calculate the dimensions of the text element
      const textWidth = document.getElementById('canvas')
          .getContext('2d').measureText(text).width;
      const textHeight = 24; // Assuming a fixed height for simplicity

      // Create a new text element with the updated properties
      elementsCopy[index] = {
        ...createElement({
          id,
          x1,
          y1,
          x2: x1 + textWidth,
          y2: y1 + textHeight,
          toolType: type,
          text,
        }),
      };

      // Get the updated text element
      const updatedTextElement = elementsCopy[index];

      // Dispatch the updated elements to the Redux store
      store.dispatch(setElements(elementsCopy));

      // Emit the updated text element through the socket connection
      emitElementUpdate(updatedTextElement);
      break;

    case toolTypes.IMAGE:
      // Skip updating image elements
      break;

    default:
      throw new Error("Something went wrong when updating element");
  }
};
