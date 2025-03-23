// src/components/PCCPModal.jsx
import { useState, useRef, useEffect } from 'react';

function PCCPModal({ imageUrl, onSelectionComplete, onClose }) {
    const [coordinates, setCoordinates] = useState([]);
    const canvasRef = useRef(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [gridSize, setGridSize] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
            const area = img.width * img.height;
            const calculatedGridSize = Math.round(Math.sqrt(0.2 * area));
            console.log("Calculated gridSize:", calculatedGridSize);
            setGridSize(calculatedGridSize);
        };
    }, [imageUrl]);

    useEffect(() => {
        drawPoints();
    }, [coordinates, imageUrl, gridSize]);

    useEffect(() => {
        console.log("Coordinates state updated:", coordinates);
    }, [coordinates]);

    const drawPoints = () => {
        if (!canvasRef.current) return;
    
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        // Load the image once globally
        if (!drawPoints.img) {
            drawPoints.img = new Image();
            drawPoints.img.src = imageUrl;
            drawPoints.img.onload = () => {
                canvas.width = drawPoints.img.width;
                canvas.height = drawPoints.img.height;
                drawImageAndGrid(ctx, canvas);
            };
        } else {
            drawImageAndGrid(ctx, canvas);
        }
    };
    
    const drawImageAndGrid = (ctx, canvas) => {
        const gridSizeX = canvas.width * 0.2;
        const gridSizeY = canvas.height * 0.2;

        ctx.drawImage(drawPoints.img, 0, 0);

        // Draw grid lines
        ctx.strokeStyle = 'rgba(0, 0, 0, 1.0)';
        ctx.lineWidth = 1;

        for (let x = 0; x < canvas.width; x += gridSizeX) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }

        for (let y = 0; y < canvas.height; y += gridSizeY) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        // Draw selected points at the CENTER of the grid cell
        coordinates.forEach(point => {
            ctx.beginPath();
            ctx.arc(
                (point.x * gridSizeX) + (gridSizeX / 2),  // Center X
                (point.y * gridSizeY) + (gridSizeY / 2),  // Center Y
                5,  // Circle radius
                0,
                2 * Math.PI
            );
            ctx.fillStyle = 'red';
            ctx.fill();
        });
    };
    
    const handleCanvasClick = (e) => {
        if (coordinates.length < 3 && canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const gridSizeX = canvasRef.current.width * 0.2; // 20% of canvas width
            const gridSizeY = canvasRef.current.height * 0.2; // 20% of canvas height

            // Correct gridX and gridY calculation
            const gridX = Math.floor(x / gridSizeX);
            const gridY = Math.floor(y / gridSizeY);

            console.log(`Grid cell selected: (${gridX}, ${gridY})`);

            const newCoordinate = { x: gridX, y: gridY };

            setCoordinates((prevCoordinates) => {
                if (!prevCoordinates.some(coord => coord.x === newCoordinate.x && coord.y === newCoordinate.y)) {
                    return [...prevCoordinates, newCoordinate]; // Add new coordinate
                } else {
                    setErrorMessage("Coordinate already selected."); // Show error if duplicate
                    return prevCoordinates; // Keep the same state (no changes)
                }
            });
        }
    };

    const handleDone = () => {
        if (coordinates.length === 3) {
            setLoading(true);
            setTimeout(() => {
                onSelectionComplete(coordinates);
                setLoading(false);
            }, 100);
        } else {
            setErrorMessage('Please select exactly 3 points.');
        }
    };   

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-semibold mb-4">Select 3 PCCP Points</h2>
                {errorMessage && <p className="text-red-500 mb-2">{errorMessage}</p>}
                <div id="pccp-container">
                    <canvas
                        ref={canvasRef}
                        onClick={handleCanvasClick}
                        className="cursor-pointer max-w-full max-h-[500px] border border-gray-300 rounded"
                        style={{ maxWidth: '100%', maxHeight: '500px' }}
                    />
                </div>
                <div className="flex justify-between mt-4">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        onClick={handleDone}
                        disabled={coordinates.length !== 3}
                    >
                        Done
                    </button>
                    <button
                        className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PCCPModal;