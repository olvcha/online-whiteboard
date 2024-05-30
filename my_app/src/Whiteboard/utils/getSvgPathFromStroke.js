/**
 * Calculates the average of two numbers.
 * 
 * @param {number} a - The first number.
 * @param {number} b - The second number.
 * @returns {number} - The average of a and b.
 */
const average = (a, b) => (a + b) / 2;

/**
 * Generates an SVG path string from a given set of stroke points.
 * 
 * @param {Array} points - An array of points, where each point is an array [x, y].
 * @param {boolean} [closed=true] - Whether the path should be closed (i.e., form a loop).
 * @returns {string} - The SVG path string.
 */
export const getSvgPathFromStroke = (points, closed = true) => {
  const len = points.length;

  // If there are fewer than 4 points, return an empty string
  if (len < 4) {
    return ``;
  }

  // Initialize points for the quadratic curves
  let a = points[0];
  let b = points[1];
  const c = points[2];

  // Start building the path with Move to (M) and Quadratic Bezier curve (Q) commands
  let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(
    2
  )},${b[1].toFixed(2)} ${average(b[0], c[0]).toFixed(2)},${average(
    b[1],
    c[1]
  ).toFixed(2)} T`;

  // Iterate over the points to construct the smooth path
  for (let i = 2, max = len - 1; i < max; i++) {
    a = points[i];
    b = points[i + 1];
    result += `${average(a[0], b[0]).toFixed(2)},${average(a[1], b[1]).toFixed(
      2
    )} `;
  }

  // If the path should be closed, add the close path (Z) command
  if (closed) {
    result += "Z";
  }

  // Return the constructed SVG path string
  return result;
};
