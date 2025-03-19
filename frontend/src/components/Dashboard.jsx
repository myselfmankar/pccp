import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PasswordList from './PasswordList';
import AddPasswordModal from './AddPasswordModal';
import api from '../services/api';

function Dashboard({ onLogout }) {
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const userEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    // In a real app, you'd fetch the passwords from the backend
    // For demo purposes, we'll use mock data
    setPasswords([
      { id: 1, site_url: 'https://example.com', username: 'user1', password: '••••••••' },
      { id: 2, site_url: 'https://github.com', username: 'user2', password: '••••••••' },
    ]);
    setLoading(false);
  }, []);

  const handleAddPassword = async (newPassword) => {
    try {
      // In a real app, you'd call the API to store the password
      // For demo purposes, we'll just update the state
      setPasswords([...passwords, { 
        id: passwords.length + 1, 
        site_url: newPassword.site_url, 
        username: newPassword.username, 
        password: '••••••••' 
      }]);
      setIsModalOpen(false);
    } catch (error) {
      setError('Failed to add password');
      console.error(error);
    }
  };

  const handleGetPassword = async (id) => {
    // In a real app, you'd call the API to get the decrypted password
    // For demo purposes, we'll just return a mock password
    return 'password123';
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">PCCP Password Manager</h1>
        <div>
          <span className="mr-4">{userEmail}</span>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="mb-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add New Password
        </button>
      </div>

      <PasswordList passwords={passwords} onGetPassword={handleGetPassword} />

      {isModalOpen && (
        <AddPasswordModal
          onClose={() => setIsModalOpen(false)}
          onAddPassword={handleAddPassword}
        />
      )}
    </div>
  );
}

export default Dashboard;