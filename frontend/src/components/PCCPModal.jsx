// src/components/PCCPModal.jsx
import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';

function PCCPModal({ imageUrl, onSelectionComplete, onClose }) {
    const [coordinates, setCoordinates] = useState([]);
    const canvasRef = useRef(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [gridSizeX, setGridSizeX] = useState(0);
    const [gridSizeY, setGridSizeY] = useState(0);

    useEffect(() => {
        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
            if (canvasRef.current) {
                const canvas = canvasRef.current;
                canvas.width = img.width;
                canvas.height = img.height;
                setGridSizeX(canvas.width * 0.2);
                setGridSizeY(canvas.height * 0.2);
                drawPoints();
            }
        };
    }, [imageUrl]);

    useEffect(() => {
        drawPoints();
    }, [coordinates]);

    const drawPoints = () => {
        if (!canvasRef.current) return;
    
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        // Draw image
        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
            ctx.drawImage(img, 0, 0);

            // Draw grid
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 1;

            for (let x = gridSizeX; x < canvas.width; x += gridSizeX) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }

            for (let y = gridSizeY; y < canvas.height; y += gridSizeY) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            // Draw selected points
            coordinates.forEach(point => {
                const centerX = (point.x * gridSizeX) + (gridSizeX / 2);
                const centerY = (point.y * gridSizeY) + (gridSizeY / 2);
                
                ctx.beginPath();
                ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
                ctx.fillStyle = 'red';
                ctx.fill();
                ctx.strokeStyle = 'white';
                ctx.stroke();
            });
        };
    };

    const handleCanvasClick = (e) => {
        if (coordinates.length >= 3) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const gridX = Math.floor(x / gridSizeX);
        const gridY = Math.floor(y / gridSizeY);

        const isDuplicate = coordinates.some(coord => 
            coord.x === gridX && coord.y === gridY
        );

        if (!isDuplicate) {
            setCoordinates(prev => [...prev, { x: gridX, y: gridY }]);
            setErrorMessage('');
        } else {
            setErrorMessage('This grid point has already been selected.');
        }
    };

    const handleDone = () => {
        if (coordinates.length === 3) {
            setLoading(true);
            onSelectionComplete(coordinates);
            setLoading(false);
        } else {
            setErrorMessage('Please select exactly 3 points.');
        }
    };

    return (
        <Dialog 
            open={true} 
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { maxHeight: '90vh' }
            }}
        >
            <DialogTitle>Select 3 PCCP Points</DialogTitle>
            
            <DialogContent>
                {errorMessage && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>
                        {errorMessage}
                    </Alert>
                )}
                
                <Box sx={{ 
                    position: 'relative',
                    width: '100%',
                    '& canvas': {
                        width: '100%',
                        height: 'auto',
                        cursor: 'crosshair'
                    }
                }}>
                    <canvas
                        ref={canvasRef}
                        onClick={handleCanvasClick}
                    />
                </Box>

                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    Selected points: {coordinates.length}/3
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button 
                    onClick={() => setCoordinates([])}
                    disabled={coordinates.length === 0}
                >
                    Reset
                </Button>
                <Button
                    onClick={handleDone}
                    variant="contained"
                    disabled={coordinates.length !== 3 || loading}
                >
                    {loading ? <CircularProgress size={24} /> : 'Confirm Points'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default PCCPModal;