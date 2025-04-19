import React, { useState } from 'react';

// Simple Medical Translator without complex dependencies
const SimpleMedicalTranslator: React.FC = () => {
  console.log("Rendering SimpleMedicalTranslator");
  const [term, setTerm] = useState('');
  const [translation, setTranslation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate translation without actual API call
    const mockTranslations: Record<string, string> = {
      'carcinoma': 'A type of cancer that starts in cells that make up the skin or the tissue lining organs.',
      'metastasis': 'The spread of cancer cells from the place where they first formed to another part of the body.',
      'dysphagia': 'Difficulty or discomfort in swallowing.',
      'endoscopy': 'A procedure where a special instrument is used to look inside the body.',
      'biopsy': 'A procedure to remove a piece of tissue or a sample of cells from your body to be analyzed in a laboratory.',
    };
    
    setTranslation(mockTranslations[term.toLowerCase()] || 
      'Translation not found. Please try another medical term.');
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '0 auto', 
      fontFamily: 'Arial, sans-serif' 
    }}>
      <h1 style={{ color: '#333', fontSize: '24px', marginBottom: '20px' }}>
        Simple Medical Terminology Translator
      </h1>
      <p style={{ marginBottom: '16px', lineHeight: '1.5' }}>
        Enter a medical term to get a simple, patient-friendly explanation.
      </p>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="term" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Medical Term:
          </label>
          <input
            id="term"
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
            placeholder="Enter a medical term (e.g., carcinoma, metastasis)"
          />
        </div>
        
        <button 
          type="submit"
          style={{
            background: '#1890ff',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Translate
        </button>
      </form>
      
      {translation && (
        <div style={{ 
          background: '#f9f9f9', 
          border: '1px solid #eee', 
          borderRadius: '4px', 
          padding: '16px', 
          marginBottom: '20px' 
        }}>
          <h2 style={{ fontSize: '18px', marginBottom: '8px' }}>Translation:</h2>
          <p style={{ margin: 0 }}>{translation}</p>
        </div>
      )}
      
      <div style={{ 
        marginTop: '32px',
        padding: '16px',
        background: '#e6f7ff',
        border: '1px solid #91d5ff',
        borderRadius: '4px'
      }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>
          Note: This is a simplified version of the Medical Terminology Translator.
        </p>
      </div>
    </div>
  );
};

export default SimpleMedicalTranslator;