import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="bg-gray-900 text-white flex flex-col items-center justify-center h-screen p-8">
      <div className="text-center">
        <i className="fas fa-dumbbell text-7xl text-blue-400"></i>
        <h1 className="text-4xl font-bold mt-6">AI 健身教练</h1>
        <p className="text-lg text-gray-400 mt-2">您的私人 AI 健身伙伴</p>
      </div>
      <div className="absolute bottom-16 w-full px-8">
        <Link to="/setup" className="block w-full bg-blue-500 text-white text-center font-bold py-4 rounded-lg hover:bg-blue-600 transition duration-300">
          开始
        </Link>
      </div>
    </div>
  );
};

export default Home;