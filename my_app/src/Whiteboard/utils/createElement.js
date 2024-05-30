import { toolTypes } from "../../constants"; // Import tool types constants
import rough from "roughjs/bundled/rough.esm"; // Import rough.js for drawing

const generator = rough.generator(); // Create a rough.js generator instance

// Function to generate a rough.js rectangle
const generateRectangle = ({ x1, y1, x2, y2, color }) => {
  return generator.rectangle(x1, y1, x2 - x1, y2 - y1, { stroke: color });
};

// Function to generate a rough.js line
const generateLine = ({ x1, y1, x2, y2, color }) => {
  return generator.line(x1, y1, x2, y2, { stroke: color });
};

// Function to create an element based on the tool type
export const createElement = ({ x1, y1, x2, y2, toolType, color, id, text, pencilSize }) => {
  let roughElement;

  // Switch case to handle different tool types
  switch (toolType) {
    case toolTypes.RECTANGLE: // Create a rectangle
      roughElement = generateRectangle({ x1, y1, x2, y2, color });
      return {
        id,
        roughElement,
        type: toolType,
        x1,
        y1,
        x2,
        y2,
        color,
      };
    case toolTypes.PENCIL: // Create a pencil drawing
      return {
        id,
        type: toolType,
        points: [{ x: x1, y: y1 }],
        color,
        pencilSize: pencilSize,
      };
    case toolTypes.LINE: // Create a line
      roughElement = generateLine({ x1, y1, x2, y2, color });
      return {
        id,
        roughElement,
        type: toolType,
        x1,
        y1,
        x2,
        y2,
        color,
      };
    case toolTypes.TEXT: // Create a text element
      return {
        id,
        type: toolType,
        x1,
        y1,
        color,
        text: text || '',
      };
    default: // Handle unsupported tool types
      throw new Error("Something went wrong when creating element");
  }
};
