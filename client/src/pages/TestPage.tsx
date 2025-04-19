import React from 'react';

const TestPage: React.FC = () => {
  console.log("Rendering TestPage");
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Test Page</h1>
      <p className="mb-4">This is a simple test page to verify rendering.</p>
      <div className="p-4 bg-blue-100 rounded-md">
        <p>If you can see this box, the page is rendering correctly.</p>
      </div>
    </div>
  );
};

export default TestPage;