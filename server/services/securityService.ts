import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { storage } from '../storage';
import { User } from '@shared/schema';

/**
 * Service for handling security concerns including encryption, authentication, and authorization
 */
export class SecurityService {
  private JWT_SECRET: string;
  private JWT_EXPIRY: string;
  private ENCRYPTION_KEY: Buffer;
  private ENCRYPTION_IV: Buffer;
  private ENCRYPTION_ALGORITHM: string;
  
  constructor() {
    // Check for required environment variables
    if (!process.env.JWT_SECRET) {
      console.warn('JWT_SECRET not set, using fallback. This is not secure for production.');
    }
    
    // Initialize security parameters (in production, these should come from environment variables)
    this.JWT_SECRET = process.env.JWT_SECRET || 'thrive_development_secret_key';
    this.JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';
    
    // For encryption (using AES-256-CBC)
    const encryptionKey = process.env.ENCRYPTION_KEY || 'thrive_development_encryption_key_32ch';
    this.ENCRYPTION_KEY = Buffer.from(encryptionKey.padEnd(32).slice(0, 32));
    this.ENCRYPTION_IV = Buffer.from(process.env.ENCRYPTION_IV || '1234567890abcdef');
    this.ENCRYPTION_ALGORITHM = 'aes-256-cbc';
  }
  
  /**
   * Generate a secure hash for a password using Argon2 or PBKDF2
   */
  async hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Generate a random salt
      const salt = crypto.randomBytes(16).toString('hex');
      
      // Use PBKDF2 for password hashing
      crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
        if (err) {
          reject(err);
          return;
        }
        
        // Format: algorithm:iterations:salt:hash
        const hash = `pbkdf2:100000:${salt}:${derivedKey.toString('hex')}`;
        resolve(hash);
      });
    });
  }
  
  /**
   * Verify a password against a stored hash
   */
  async verifyPassword(password: string, storedHash: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // Parse stored hash components
      const parts = storedHash.split(':');
      if (parts.length !== 4 || parts[0] !== 'pbkdf2') {
        reject(new Error('Invalid hash format'));
        return;
      }
      
      const iterations = parseInt(parts[1]);
      const salt = parts[2];
      const hash = parts[3];
      
      // Verify using PBKDF2
      crypto.pbkdf2(password, salt, iterations, 64, 'sha512', (err, derivedKey) => {
        if (err) {
          reject(err);
          return;
        }
        
        resolve(derivedKey.toString('hex') === hash);
      });
    });
  }
  
  /**
   * Generate a JWT token for a user
   */
  generateToken(user: User): string {
    const payload = {
      id: user.id,
      username: user.username,
      // Do not include sensitive information in the token payload
    };
    
    // Create secret key buffer for jwt.sign
    const secretKey = Buffer.from(this.JWT_SECRET, 'utf-8');
    
    return jwt.sign(payload, secretKey, { expiresIn: this.JWT_EXPIRY });
  }
  
  /**
   * Verify a JWT token
   */
  verifyToken(token: string): any {
    try {
      // Create secret key buffer for jwt.verify
      const secretKey = Buffer.from(this.JWT_SECRET, 'utf-8');
      return jwt.verify(token, secretKey);
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }
  
  /**
   * Encrypt sensitive data
   */
  encryptData(data: string): string {
    try {
      const cipher = crypto.createCipheriv(
        this.ENCRYPTION_ALGORITHM, 
        this.ENCRYPTION_KEY, 
        this.ENCRYPTION_IV
      );
      
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Data encryption failed');
    }
  }
  
  /**
   * Decrypt sensitive data
   */
  decryptData(encryptedData: string): string {
    try {
      const decipher = crypto.createDecipheriv(
        this.ENCRYPTION_ALGORITHM, 
        this.ENCRYPTION_KEY, 
        this.ENCRYPTION_IV
      );
      
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Data decryption failed');
    }
  }
  
  /**
   * Mask sensitive patient data for logging
   */
  maskSensitiveData(data: any): any {
    if (!data) return data;
    
    const clonedData = { ...data };
    
    // Fields to mask
    const sensitiveFields = [
      'password', 'ssn', 'socialSecurityNumber', 'dateOfBirth', 'dob',
      'address', 'phoneNumber', 'email', 'healthInsuranceNumber'
    ];
    
    // Recursively mask fields
    const maskObject = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      
      Object.keys(obj).forEach(key => {
        if (sensitiveFields.includes(key.toLowerCase())) {
          if (typeof obj[key] === 'string') {
            const len = obj[key].length;
            if (len > 4) {
              obj[key] = '****' + obj[key].substring(len - 4);
            } else {
              obj[key] = '****';
            }
          } else {
            obj[key] = '****';
          }
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          maskObject(obj[key]);
        }
      });
    };
    
    maskObject(clonedData);
    return clonedData;
  }
  
  /**
   * Create an audit log entry for security events
   */
  async logSecurityEvent(eventType: string, userId: number | null, details: any): Promise<void> {
    try {
      // Mask any sensitive data before logging
      const maskedDetails = this.maskSensitiveData(details);
      
      const logEntry = {
        timestamp: new Date().toISOString(),
        eventType,
        userId,
        ipAddress: details.ipAddress || 'unknown',
        userAgent: details.userAgent || 'unknown',
        details: JSON.stringify(maskedDetails)
      };
      
      // In a real implementation, this would be saved to a database or secure logging service
      console.log(`SECURITY EVENT: ${JSON.stringify(logEntry)}`);
      
      // Here you would store this in the database
      // await securityLogsRepository.create(logEntry);
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
  
  /**
   * Check if user has the required permissions
   */
  hasPermission(user: User | null, requiredPermission: string): boolean {
    if (!user) return false;
    
    // In a real implementation, you would check against the user's roles or permissions
    // For now, just assume that only certain user types have certain permissions
    const userRoles = ['patient']; // In reality, this would come from the user object
    
    // Simple permission map
    const permissionMap: Record<string, string[]> = {
      'view_research': ['patient', 'doctor', 'researcher'],
      'edit_treatment': ['doctor'],
      'view_treatment': ['patient', 'doctor', 'nurse'],
      'admin': ['admin']
    };
    
    return permissionMap[requiredPermission]?.some(role => userRoles.includes(role)) || false;
  }
}

export const securityService = new SecurityService();