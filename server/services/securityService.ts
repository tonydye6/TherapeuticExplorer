import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '@shared/schema';

/**
 * Security Service
 * Handles authentication, encryption, and security auditing
 */
class SecurityService {
  // JWT configuration
  private JWT_SECRET: string;
  private JWT_EXPIRY: string = '24h';
  
  // Encryption configuration
  private ENCRYPTION_KEY: Buffer;
  private ENCRYPTION_IV: Buffer;
  private ENCRYPTION_ALGORITHM: string = 'aes-256-cbc';
  
  // Password configuration
  private SALT_ROUNDS: number = 10;
  
  constructor() {
    // In production, these should be environment variables
    this.JWT_SECRET = process.env.JWT_SECRET || '7ab58ce0a98e4fe4f26ceb6a28e8bcabc82ea3a64d3889c17be06c1e8b8f0fd0';
    
    // If JWT_SECRET is not set, log a warning
    if (!process.env.JWT_SECRET) {
      console.warn('JWT_SECRET not set, using fallback. This is not secure for production.');
    }
    
    // Create encryption key and IV from environment or fallback
    const encKey = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'; // 32 bytes (256 bits)
    const encIv = process.env.ENCRYPTION_IV || '1234567890123456'; // 16 bytes (128 bits)
    
    this.ENCRYPTION_KEY = Buffer.from(encKey, 'utf8');
    this.ENCRYPTION_IV = Buffer.from(encIv, 'utf8');
  }
  
  /**
   * Hash a password
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }
  
  /**
   * Verify a password against a hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
  
  /**
   * Generate a JWT token for a user
   */
  generateToken(user: User): string {
    const payload = {
      id: user.id,
      username: user.username,
      // Do not include sensitive information in the token
    };
    
    return jwt.sign(payload, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRY });
  }
  
  /**
   * Verify a JWT token
   */
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.JWT_SECRET);
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