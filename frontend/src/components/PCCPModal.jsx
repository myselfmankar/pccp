import { useState, useRef, useEffect } from 'react';

function PCCPModal({ imageUrl, onSelectionComplete, onClose }) {
  const [coordinates, setCoordinates] = useState([]);
  const [error, setError] = useState('');
  const imageRef = useRef(null);
  const [gridSizeX, setGridSizeX] = useState(0);
  const [gridSizeY, setGridSizeY] = useState(0);

  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      const maxHeight = window.innerHeight * 0.6; // 60% of viewport height
      const width = img.width;
      const height = img.height;
      const aspectRatio = width / height;
      
      let newHeight = Math.min(maxHeight, height);
      let newWidth = newHeight * aspectRatio;
      
      if (imageRef.current) {
        imageRef.current.style.width = `${newWidth}px`;
        imageRef.current.style.height = `${newHeight}px`;
      }
      
      setGridSizeX(newWidth * 0.2);
      setGridSizeY(newHeight * 0.2);
    };
  }, [imageUrl]);

  const handleImageClick = (e) => {
    if (coordinates.length >= 3) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const gridX = Math.floor(x / gridSizeX);
    const gridY = Math.floor(y / gridSizeY);

    setCoordinates([...coordinates, { x: gridX, y: gridY }]);
  };

  const handleReset = () => {
    setCoordinates([]);
  };

  const handleDone = () => {
    if (coordinates.length === 3) {
      onSelectionComplete(coordinates);
    } else {
      setError('Please select exactly 3 points');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-[90vw] w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Select 3 PCCP Points</h2>
        {error && (
          <div className="text-red-500 mb-4">{error}</div>
        )}
        <div className="relative mb-4 flex justify-center items-center">
          <div className="relative inline-block">
            <img
              ref={imageRef}
              src={imageUrl}
              alt="PCCP Selection"
              className="rounded-lg cursor-crosshair max-h-[60vh] object-contain mx-auto"
              onClick={handleImageClick}
            />
            {/* Grid overlay with darker lines */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <div
                  key={`v-${i}`}
                  className="absolute border-r border-white"
                  style={{
                    left: `${i * 20}%`,
                    top: 0,
                    bottom: 0,
                    width: '2px',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    boxShadow: '0 0 4px rgba(0,0,0,0.8)'
                  }}
                />
              ))}
              {[...Array(5)].map((_, i) => (
                <div
                  key={`h-${i}`}
                  className="absolute border-b border-white"
                  style={{
                    top: `${i * 20}%`,
                    left: 0,
                    right: 0,
                    height: '2px',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    boxShadow: '0 0 4px rgba(0,0,0,0.8)'
                  }}
                />
              ))}
            </div>
            {/* Selected points */}
            {coordinates.map((point, index) => (
              <div
                key={index}
                className="absolute w-3 h-3 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                style={{ 
                  left: point.x * gridSizeX + gridSizeX / 2, 
                  top: point.y * gridSizeY + gridSizeY / 2,
                  boxShadow: '0 0 0 2px white, 0 0 4px rgba(0,0,0,0.8)'
                }}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div>Selected points: {coordinates.length}/3</div>
          <div className="space-x-2">
            <button
              onClick={handleReset}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
            >
              Reset
            </button>
            <button
              onClick={onClose}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleDone}
              disabled={coordinates.length !== 3}
              className={`${
                coordinates.length === 3
                  ? 'bg-blue-500 hover:bg-blue-700'
                  : 'bg-blue-300 cursor-not-allowed'
              } text-white font-bold py-2 px-4 rounded`}
            >
              Confirm Points
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PCCPModal;