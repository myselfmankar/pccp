// src/components/PCCPModal.jsx
import { useState, useRef, useEffect } from 'react';

function PCCPModal({ imageUrl, onSelectionComplete, onClose }) {
    const [coordinates, setCoordinates] = useState([]);
    const canvasRef = useRef(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        drawPoints();
    }, [coordinates, imageUrl]);

    const drawPoints = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            // Draw grid
            const gridSize = 50; // Adjust grid size as needed
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)'; // Light grid lines
            for (let x = 0; x < canvas.width; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            coordinates.forEach(point => {
                ctx.beginPath();
                ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = 'red';
                ctx.fill();
            });
        };

        if (img.complete) {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            // Draw grid
            const gridSize = 50; // Adjust grid size as needed
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)'; // Light grid lines
            for (let x = 0; x < canvas.width; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            coordinates.forEach(point => {
                ctx.beginPath();
                ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = 'red';
                ctx.fill();
            });
        }
    };

    const handleCanvasClick = (e) => {
        if (coordinates.length < 3) {
            const x = e.offsetX;
            const y = e.offsetY;
            setCoordinates([...coordinates, { x, y }]);
            setErrorMessage('');
        }
    };

    const handleDone = () => {
        if (coordinates.length === 3) {
            onSelectionComplete(coordinates);
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