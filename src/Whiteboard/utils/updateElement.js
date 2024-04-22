import { createElement } from "./index";
import { toolTypes } from "../../constants";
import { store } from "../../store/store";
import { setElements } from "../whiteboardSlice";
import { emitElementUpdate } from "../../socketConn/socketConn";

export const updateElement = (
  { id, x1, x2, y1, y2, type, index },
  elements
) => {
  const elementsCopy = [...elements];

  switch (type) {
    case toolTypes.RECTANGLE:
      const updatedElement = createElement({
        id,
        x1,
        y1,
        x2,
        y2,
        toolType: type,
      });

      elementsCopy[index] = updatedElement;

      store.dispatch(setElements(elementsCopy));

      emitElementUpdate(updatedElement)
      break;
    case toolTypes.PENCIL:
      elementsCopy[index] = {
        ...elementsCopy[index], //... -> get all of the elements
        points: [
          ...elementsCopy[index].points,
          {
            x: x2,
            y: y2,
          }
        ]
      }

      const updatedPencilElement = elementsCopy[index];

      store.dispatch(setElements(elementsCopy));

      emitElementUpdate(updatedPencilElement);
      break;
    default:
      throw new Error("Something went wrong when updating element");
  }
};
