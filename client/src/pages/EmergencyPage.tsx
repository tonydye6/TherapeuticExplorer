import React from 'react';
import { Link } from 'wouter';

const EmergencyPage: React.FC = () => {
  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '0 auto', 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      lineHeight: 1.5
    }}>
      <h1 style={{ 
        fontSize: '28px', 
        fontWeight: 'bold', 
        marginBottom: '20px',
        color: '#333'
      }}>
        THRIVE Emergency Recovery Mode
      </h1>
      
      <div style={{
        padding: '15px',
        backgroundColor: '#f0f9ff',
        borderRadius: '6px',
        marginBottom: '20px',
        border: '1px solid #bae6fd'
      }}>
        <p>
          The application is currently in emergency recovery mode due to authentication issues.
          This minimal interface allows access to critical functionality without the complex components
          that may be causing problems.
        </p>
      </div>
      
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>Available Features:</h2>
      
      <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '20px' }}>
        <li style={{ marginBottom: '10px' }}>
          <Link href="/simple-medical" style={{ color: '#0284c7', textDecoration: 'underline' }}>
            Simple Medical Term Translator
          </Link>
        </li>
        <li style={{ marginBottom: '10px' }}>
          <Link href="/simple-test" style={{ color: '#0284c7', textDecoration: 'underline' }}>
            System Test Page
          </Link>
        </li>
      </ul>
      
      <div style={{
        marginTop: '40px',
        padding: '15px',
        backgroundColor: '#fff7ed',
        borderRadius: '6px',
        border: '1px solid #fed7aa'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#9a3412' }}>
          Developer Information
        </h3>
        <p style={{ marginBottom: '10px' }}>
          Authentication system has been temporarily disabled to ensure basic functionality.
          Please work with your development team to resolve the authentication issues and
          restore full application functionality.
        </p>
        <p>
          Error: Authentication components causing rendering failures throughout the application.
        </p>
      </div>
    </div>
  );
};

export default EmergencyPage;