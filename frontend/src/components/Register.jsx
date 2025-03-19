// src/components/Register.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import PCCPModal from './PCCPModal';

function Register({ isAuthenticated }) {
    const navigate = useNavigate();
    const [user_email, setUser_email] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [pccpImage, setPccpImage] = useState('');
    const [coordinates, setCoordinates] = useState([]);
    const [pccpSet, setPccpSet] = useState(false);
    const [showPCCPModal, setShowPCCPModal] = useState(false);
    const canvasRef = useRef(null); // Reference to the canvas

    useEffect(() => {
        if (showPCCPModal) {
            drawPoints();
        }
    }, [coordinates, showPCCPModal]);

    const drawPoints = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

        const img = new Image();
        img.src = pccpImage;
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            coordinates.forEach(point => {
                ctx.beginPath();
                ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI); // Draw circle for each point
                ctx.fillStyle = 'red';
                ctx.fill();
            });
        };
    };

    if (isAuthenticated) {
        navigate('/dashboard');
        return null;
    }

    const handleSetPCCP = async () => {
        setLoading(true);
        try {
            const response = await api.getPCCPImage();
            if (response.data && response.data.image_url) {
                setPccpImage(response.data.image_url);
                setShowPCCPModal(true);
            } else {
                setError('Failed to fetch PCCP image.');
            }
        } catch (error) {
            setError('An error occurred while fetching PCCP image.');
            console.error(error);
        }
        setLoading(false);
    };

    const handlePCCPSelection = (selectedCoordinates) => {
      setCoordinates(selectedCoordinates);
      setPccpSet(true);
      setShowPCCPModal(false);
  };

  const handlePCCPModalClose = () => {
      setShowPCCPModal(false);
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
      }
      if (!pccpSet) {
          setError('Please set PCCP password first.');
          setLoading(false);
          return;
      }

      try {
          await api.register(user_email, password, coordinates, pccpImage);
          navigate('/login');
      } catch (error) {
          setError('Registration failed');
          console.error(error);
      }
      setLoading(false);
  };

  
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-3xl font-semibold text-center mb-6 text-gray-800">Create Account</h2>
                <form onSubmit={handleSubmit}>
                    {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="user_email">
                            Email
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="user_email"
                            type="email"
                            placeholder="Email"
                            value={user_email}
                            onChange={(e) => setUser_email(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="password"
                            type="password"
                            placeholder="******************"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirm-password">
                            Confirm Password
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="confirm-password"
                            type="password"
                            placeholder="******************"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <button
                            type="button"
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            onClick={handleSetPCCP}
                            disabled={loading}
                        >
                            {loading ? 'Loading...' : 'Set PCCP Password'}
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <button
                            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            type="submit"
                            disabled={loading || !pccpSet}
                        >
                            {loading ? 'Loading...' : 'Register'}
                        </button>
                        <Link to="/login" className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
                            Sign In
                        </Link>
                    </div>
                </form>
            </div>
            {showPCCPModal && (
                <PCCPModal
                    imageUrl={pccpImage}
                    onSelectionComplete={handlePCCPSelection}
                    onClose={handlePCCPModalClose}
                />
            )}
        </div>
    );
}

export default Register;