import { toolTypes } from "../../constants";
import { getStroke } from "perfect-freehand"; 
import { getSvgPathFromStroke } from "./getSvgPathFromStroke";
 
const drawPencilElement = (context, element) => {
  const myStroke = getStroke(element.points, {
    size:10,
  });

  const pathData = getSvgPathFromStroke(myStroke);

  const myPath = new Path2D(pathData);
  context.fillStyle = element.color;
  context.fill(myPath);
};

const drawTextElement = (context, element) => {
  context.textBaseline = "top";
  context.font = "24px sans-serif";
  context.fillStyle = element.color;
  context.fillText(element.text,element.x1,element.y1);
};

const drawImageElement = (context, element) => {
  const img = new Image();
  img.src = element.data;
  console.log("Draw element x", element.x1, " Y ", element.y1);
  img.onload = () => {
    context.drawImage(img, element.x1, element.y1);
  };
};

export const drawElement = ({ roughCanvas, context, element }) => {
  switch (element.type) {
    case toolTypes.RECTANGLE:
      context.strokeStyle = element.color;
      context.fillStyle = element.color;
      roughCanvas.color=element.color;
      return roughCanvas.draw(element.roughElement);
    case toolTypes.LINE:
      context.strokeStyle = element.color;
      context.fillStyle = element.color;
      return roughCanvas.draw(element.roughElement);
    case toolTypes.PENCIL:
      drawPencilElement(context, element);
      break;
    case toolTypes.TEXT:
      drawTextElement(context, element);
      break;
    case toolTypes.IMAGE:
      drawImageElement(context, element);
      break;
    default:
      throw new Error("Something went wrong when drawing element");
  }
};
