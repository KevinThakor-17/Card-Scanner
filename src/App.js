// App.js
import React from 'react';
import DetailScanner from './Storage/DetailScanner';

const App = () => {
  return (
    <div className='App container-fluid'>
      <h2 className='text-center text-success bg-dark py-1 rounded mt-2'>Card Scanner App</h2>
      <DetailScanner />
    </div>
  );
};

export default App;