import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import PCCPModal from "./PCCPModal";

function Login({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const [user_email, setUser_email] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pccpImage, setPccpImage] = useState("");
  const [coordinates, setCoordinates] = useState([]);
  const [showPCCPModal, setShowPCCPModal] = useState(false);

  useEffect(() => {
    console.log("Updated coordinates:", coordinates);
  }, [coordinates]);

  const handleSetPCCP = async () => {
    setLoading(true);
    try {
      const response = await api.getPCCPImageForLogin(user_email);
      if (response.data && response.data.image_url) {
        setPccpImage(response.data.image_url);
        setShowPCCPModal(true);
      } else {
        setError("Failed to fetch PCCP image.");
      }
    } catch (error) {
      setError("An error occurred while fetching PCCP image.");
      console.error(error);
    }
    setLoading(false);
  };

  const handlePCCPSelection = (selectedCoordinates) => {
    setCoordinates(selectedCoordinates);
    setShowPCCPModal(false);
  };

  useEffect(() => {
    if (coordinates.length > 0) {
      handleLogin();
    }
  }, [coordinates]);

  
  const handleLogin = async () => {
    const payload = {
      user_email: user_email,
      password: password,
      coordinates: [...coordinates],
    };

    
    console.log("Login payload:", payload);

    try {
      console.log("entered the try block");
      const response = await api.login(user_email, password, coordinates);
      console.log("await done");
      if (response.data && response.data.token) {
        console.log("Login successful:", response.data.token);
        localStorage.setItem("token", response.data.token);
        console.log("setIsAuthenticated", setIsAuthenticated);
        setIsAuthenticated(true);
        navigate("/dashboard");
      } else {
        console.log("Login failed:", response.data);
        setError(response.data.message || "Login failed.");
      }
    } catch (error) {
      setError("Login failed. Please check your credentials.");
      console.error(error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    handleSetPCCP();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-semibold text-center mb-6 text-gray-800">
          Sign In
        </h2>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="user_email"
            >
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

          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="****"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              type="submit"
              disabled={loading}
            >
              {loading ? "Loading..." : "Sign In"}
            </button>
            <Link
              to="/register"
              className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
            >
              Create Account
            </Link>
          </div>
        </form>
      </div>
      {showPCCPModal && (
        <PCCPModal
          imageUrl={pccpImage}
          onSelectionComplete={handlePCCPSelection}
          onClose={() => setShowPCCPModal(false)}
        />
      )}
    </div>
  );
}

export default Login;
