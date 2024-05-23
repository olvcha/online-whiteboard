import { toolTypes } from "../../constants";
import rough from "roughjs/bundled/rough.esm";

const generator = rough.generator();

const generateRectangle = ({ x1, y1, x2, y2, color }) => {
  return generator.rectangle(x1, y1, x2 - x1, y2 - y1, { stroke: color });
};

const generateLine = ({ x1, y1, x2, y2, color }) => {
  return generator.line(x1, y1, x2, y2, { stroke: color });
};

export const createElement = ({ x1, y1, x2, y2, toolType, color, id, text }) => {
  let roughElement;

  switch (toolType) {
    case toolTypes.RECTANGLE:
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
    case toolTypes.PENCIL:
      return {
        id,
        type: toolType,
        points: [{ x: x1, y: y1 }],
        color,
      };
    case toolTypes.LINE:
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
    case toolTypes.TEXT:
      return {
        id,
        type: toolType,
        x1,
        y1,
        x2,
        y2,
        color,
        text: text || '',
      };
    default:
      throw new Error("Something went wrong when creating element");
  }
};
