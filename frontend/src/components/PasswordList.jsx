import { useState } from 'react';
import PCCPVerificationModal from './PCCPVerificationModal';
import api from '../services/api';

function PasswordList({ passwords, onGetPassword }) {
  const [revealedPasswords, setRevealedPasswords] = useState({});
  const [verificationModalData, setVerificationModalData] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);
  const [error, setError] = useState('');

  const startPasswordReveal = async (id) => {
    try {
      // If password is already revealed, just hide it
      if (revealedPasswords[id]) {
        const { [id]: _, ...rest } = revealedPasswords;
        setRevealedPasswords(rest);
        return;
      }

      setVerifyingId(id);
      const passwordItem = passwords.find(item => item.id === id);
      
      if (!passwordItem) return;
      
      // Get the current user email from localStorage
      const userEmail = localStorage.getItem('userEmail');
      
      // Call the API to get the password and PCCP verification data
      const response = await api.getPassword(userEmail, passwordItem.site_url);
      
      if (response.status === 200) {
        // Show PCCP verification modal with the image and coordinates
        setVerificationModalData({
          password: response.data.password,
          imageUrl: response.data.master_image_url,
          expectedCoordinates: JSON.parse(response.data.master_coordinates)
        });
      } else {
        // Handle error cases
        setError(`Failed to retrieve password: ${response.data.message}`);
        setVerifyingId(null);
      }
    } catch (error) {
      console.error('Failed to get password:', error);
      setError('An error occurred while retrieving the password');
      setVerifyingId(null);
    }
  };

  const handleVerificationComplete = (success) => {
    if (success && verifyingId !== null) {
      // If verification is successful, reveal the password
      setRevealedPasswords({ 
        ...revealedPasswords, 
        [verifyingId]: verificationModalData.password 
      });
    } else if (!success) {
      setError('PCCP verification failed. Please try again.');
    }
    
    // Close the modal and reset state
    setVerificationModalData(null);
    setVerifyingId(null);
  };

  const handleCloseModal = () => {
    setVerificationModalData(null);
    setVerifyingId(null);
  };

  return (
    <>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button 
            className="float-right" 
            onClick={() => setError('')}
          >
            &times;
          </button>
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Website</th>
              <th className="py-3 px-6 text-left">Username</th>
              <th className="py-3 px-6 text-left">Password</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            {passwords.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-4 px-6 text-center">
                  No passwords stored yet.
                </td>
              </tr>
            ) : (
              passwords.map((item) => (
                <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6 text-left">
                    <a href={item.site_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      {item.site_url}
                    </a>
                  </td>
                  <td className="py-3 px-6 text-left">{item.username}</td>
                  <td className="py-3 px-6 text-left font-mono">
                    {revealedPasswords[item.id] || item.password}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <button
                      onClick={() => startPasswordReveal(item.id)}
                      className={`${
                        verifyingId === item.id
                          ? 'bg-gray-400 cursor-wait'
                          : 'bg-gray-200 hover:bg-gray-300'
                      } text-gray-800 font-bold py-1 px-2 rounded text-xs`}
                      disabled={verifyingId === item.id}
                    >
                      {verifyingId === item.id 
                        ? 'Loading...' 
                        : revealedPasswords[item.id] 
                          ? 'Hide' 
                          : 'Reveal'
                      }
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {verificationModalData && (
        <PCCPVerificationModal
          imageUrl={verificationModalData.imageUrl}
          expectedCoordinates={verificationModalData.expectedCoordinates}
          onVerificationComplete={handleVerificationComplete}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}

export default PasswordList;