import React from 'react';

// Super simple component with zero dependencies on other components
const SimpleTestPage: React.FC = () => {
  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '0 auto', 
      fontFamily: 'Arial, sans-serif' 
    }}>
      <h1 style={{ color: '#333', fontSize: '24px', marginBottom: '20px' }}>
        Simple Test Page
      </h1>
      <p style={{ marginBottom: '16px', lineHeight: '1.5' }}>
        This is an extremely simple test page with no dependencies on other components or systems.
        If you can see this content, basic rendering is working.
      </p>
      <div style={{ 
        background: '#e6f7ff', 
        border: '1px solid #91d5ff', 
        borderRadius: '4px', 
        padding: '16px', 
        marginBottom: '20px' 
      }}>
        <p style={{ margin: 0 }}>
          <strong>Status:</strong> This component is rendering correctly!
        </p>
      </div>
      <button 
        onClick={() => alert('Button click works!')}
        style={{
          background: '#1890ff',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Click Me
      </button>
    </div>
  );
};

export default SimpleTestPage;