import { useState, useRef, useEffect } from 'react';

function PCCPSelection({ imageUrl, onSelectionComplete }) {
  const [selectedPoints, setSelectedPoints] = useState([]);
  const imageRef = useRef(null);

  const handleImageClick = (e) => {
    if (selectedPoints.length >= 3) {
      return;
    }

    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setSelectedPoints([...selectedPoints, { x, y }]);
  };

  const handleSubmit = () => {
    if (selectedPoints.length === 3) {
      onSelectionComplete(selectedPoints);
    }
  };

  const handleReset = () => {
    setSelectedPoints([]);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl">
      <h2 className="text-2xl font-bold mb-4 text-center">Select Your PCCP Points</h2>
      <p className="mb-4 text-gray-700">
        Please click on 3 distinct points on the image that you'll remember. These will be used for future authentication.
      </p>
      
      <div className="relative mb-4">
        <img
          ref={imageRef}
          src={imageUrl}
          alt="PCCP Selection"
          className="w-full h-auto rounded-lg cursor-crosshair"
          onClick={handleImageClick}
        />
        
        {selectedPoints.map((point, index) => (
          <div
            key={index}
            className="absolute w-4 h-4 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: point.x, top: point.y }}
          />
        ))}
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={handleReset}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
        >
          Reset
        </button>
        
        <button
          onClick={handleSubmit}
          disabled={selectedPoints.length !== 3}
          className={`${
            selectedPoints.length === 3
              ? 'bg-blue-500 hover:bg-blue-700'
              : 'bg-blue-300 cursor-not-allowed'
          } text-white font-bold py-2 px-4 rounded`}
        >
          Confirm Points ({selectedPoints.length}/3)
        </button>
      </div>
    </div>
  );
}

export default PCCPSelection;