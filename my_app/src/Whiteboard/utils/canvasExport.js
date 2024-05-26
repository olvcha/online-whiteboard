const exportCanvas = (canvasRef) => {
    const canvas = canvasRef.current;
    if (canvas) {
        // Create a temporary canvas element
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        // Set the dimensions of the temporary canvas
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;

        // Fill the temporary canvas with white background
        tempCtx.fillStyle = 'white';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        // Draw the existing canvas onto the temporary canvas
        tempCtx.drawImage(canvas, 0, 0);

        // Get the data URL of the temporary canvas
        const dataUrl = tempCanvas.toDataURL('image/jpeg');

        // Create a download link for the image
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'whiteboard.jpg';
        link.click();
    }
};

export default exportCanvas;
