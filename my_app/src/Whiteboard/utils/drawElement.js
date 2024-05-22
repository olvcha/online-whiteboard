import { toolTypes } from "../../constants";
import { getStroke } from "perfect-freehand"; 
import { getSvgPathFromStroke } from "./getSvgPathFromStroke";

const imageCache = new Map(); // Cache do przechowywania obrazów

const drawPencilElement = (context, element) => {
  const myStroke = getStroke(element.points, {
    size: 10,
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
  context.fillText(element.text, element.x1, element.y1);
};

const drawImageElement = (context, element) => {
  return new Promise((resolve) => {
    if (imageCache.has(element.data)) { // Sprawdzanie, czy obraz jest w cache
      const img = imageCache.get(element.data);
      context.drawImage(img, element.x1, element.y1);
      resolve();
    } else {
      const img = new Image();
      img.src = element.data;
      img.onload = () => {
        imageCache.set(element.data, img); // Cache'owanie obrazu
        context.drawImage(img, element.x1, element.y1);
        resolve();
      };
    }
  });
};

const drawElementSync = ({ roughCanvas, context, element }) => {
  switch (element.type) {
    case toolTypes.RECTANGLE:
      context.strokeStyle = element.color;
      context.fillStyle = element.color;
      roughCanvas.color = element.color;
      roughCanvas.draw(element.roughElement);
      break;
    case toolTypes.LINE:
      context.strokeStyle = element.color;
      context.fillStyle = element.color;
      roughCanvas.color = element.color;
      roughCanvas.draw(element.roughElement);
      break;
    case toolTypes.PENCIL:
      drawPencilElement(context, element);
      break;
    case toolTypes.TEXT:
      drawTextElement(context, element);
      break;
    default:
      throw new Error("Something went wrong when drawing element");
  }
};

export const drawElement = async ({ roughCanvas, context, element }) => {
  if (element.type === toolTypes.IMAGE) {
    await drawImageElement(context, element); // Użycie await dla obrazów
  } else {
    drawElementSync({ roughCanvas, context, element }); // Rysowanie synchroniczne dla pozostałych elementów
    return Promise.resolve(); // Dodano, aby zwrócić Promise dla elementów nie będących obrazami
  }
};