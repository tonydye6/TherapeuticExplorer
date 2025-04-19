// Minimal App version with absolute minimum dependencies
import React from 'react';

// Super minimal App component with no routing or external dependencies
function App() {
  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '0 auto', 
      fontFamily: 'Arial, sans-serif' 
    }}>
      <h1 style={{ color: '#1d4ed8', fontSize: '28px', marginBottom: '24px' }}>
        THRIVE Emergency Mode
      </h1>
      
      <div style={{ 
        background: '#f0f9ff', 
        border: '1px solid #bae6fd', 
        borderRadius: '6px', 
        padding: '20px', 
        marginBottom: '24px' 
      }}>
        <p style={{ marginBottom: '16px', lineHeight: '1.5' }}>
          This is an emergency recovery mode with minimal dependencies.
          We've stripped out all routing and external components to identify rendering issues.
        </p>
      </div>
      
      <button 
        onClick={() => alert('Interactive elements work!')}
        style={{
          background: '#2563eb',
          color: 'white',
          border: 'none',
          padding: '10px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Test Interactivity
      </button>
    </div>
  );
}

export default App;
