import { useState, useRef } from 'react';

function PCCPVerification({ imageUrl, expectedCoordinates, onVerificationComplete }) {
  const [clickedPoints, setClickedPoints] = useState([]);
  const [currentPointIndex, setCurrentPointIndex] = useState(0);
  const imageRef = useRef(null);

  const handleImageClick = (e) => {
    if (currentPointIndex >= expectedCoordinates.length) {
      return;
    }

    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newClickedPoints = [...clickedPoints, { x, y }];
    setClickedPoints(newClickedPoints);
    setCurrentPointIndex(currentPointIndex + 1);
    
    if (newClickedPoints.length === expectedCoordinates.length) {
      verifyPoints(newClickedPoints);
    }
  };

  const verifyPoints = (points) => {
    // Define a tolerance radius in pixels
    const toleranceRadius = 20;
    
    // Check if each clicked point is within tolerance of the expected coordinates
    const isWithinTolerance = points.every((point, index) => {
      const expected = expectedCoordinates[index];
      
      // Calculate Euclidean distance between clicked point and expected point
      const distance = Math.sqrt(
        Math.pow(point.x - expected.x, 2) + Math.pow(point.y - expected.y, 2)
      );
      
      // Return true if the distance is within tolerance
      return distance <= toleranceRadius;
    });
    
    // Pass verification result to the callback
    onVerificationComplete(isWithinTolerance);
  };
  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl">
      <h2 className="text-2xl font-bold mb-4 text-center">PCCP Verification</h2>
      <p className="mb-4 text-gray-700">
        Please click on your previously selected points in the correct order.
      </p>
      
      <div className="relative mb-4">
        <img
          ref={imageRef}
          src={imageUrl}
          alt="PCCP Verification"
          className="w-full h-auto rounded-lg cursor-crosshair"
          onClick={handleImageClick}
        />
        
        {clickedPoints.map((point, index) => (
          <div
            key={index}
            className="absolute w-4 h-4 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: point.x, top: point.y }}
          />
        ))}
      </div>
      
      <div className="text-center">
        <p className="text-gray-700">
          Click point {currentPointIndex + 1} of {expectedCoordinates.length}
        </p>
      </div>
    </div>
  );
}

export default PCCPVerification;
