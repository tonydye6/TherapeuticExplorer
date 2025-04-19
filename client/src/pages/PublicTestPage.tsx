import React from 'react';

const PublicTestPage: React.FC = () => {
  console.log("Rendering PublicTestPage");
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Public Test Page</h1>
      <p className="mb-4">This is a simple test page that doesn't require authentication.</p>
      <div className="p-4 bg-green-100 rounded-md">
        <p>If you can see this box, the page is rendering correctly.</p>
      </div>
    </div>
  );
};

export default PublicTestPage;