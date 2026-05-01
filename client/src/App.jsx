import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [dbStatus, setDbStatus] = useState('Checking connection...');
  const [dbTime, setDbTime] = useState('');

  useEffect(() => {
    // Thanks to the Vite proxy in vite.config.js, we don't need http://localhost:5000
    // This request is automatically forwarded to the backend container!
    axios.get('/api/v1/test')
      .then((response) => {
        setDbStatus(response.data.message);
        setDbTime(response.data.db_time);
      })
      .catch((error) => {
        console.error("Connection Error:", error);
        setDbStatus('Failed to connect. Check terminal for errors.');
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">
          GymBro System Status
        </h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-100 rounded border-l-4 border-blue-500 text-left">
            <p className="text-sm text-gray-500 font-semibold uppercase">API Status</p>
            <p className="text-lg font-medium text-gray-800">{dbStatus}</p>
          </div>

          <div className="p-4 bg-gray-100 rounded border-l-4 border-green-500 text-left">
            <p className="text-sm text-gray-500 font-semibold uppercase">Database Time</p>
            <p className="text-md text-gray-800 font-mono">
              {dbTime ? new Date(dbTime).toLocaleString() : 'Waiting...'}
            </p>
          </div>
        </div>

        <button 
          onClick={() => window.location.reload()}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200"
        >
          Refresh Test
        </button>
      </div>
    </div>
  );
}

export default App;