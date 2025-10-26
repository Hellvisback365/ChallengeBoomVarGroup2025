import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ReturnToWorkflowButton() {
  const navigate = useNavigate();
  return (
    <button 
      className="fixed bottom-8 right-8 bg-gray-800 text-white text-xl font-semibold px-6 py-3 rounded-full shadow-custom-dark hover:bg-gray-700 transition-all duration-300 z-20"
      onClick={() => navigate('/')}
    >
      Torna al workflow
    </button>
  );
}
