import { Request, Response, NextFunction } from 'express';
import { securityService } from '../services/securityService';
import { storage } from '../storage';

interface AuthenticatedRequest extends Request {
  user?: any;
}

/**
 * Express middleware to authenticate requests using JWT tokens
 */
export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Get the auth header
    const authHeader = req.headers['authorization'];
    
    // Extract token (Bearer format expected)
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Verify token
    const payload = securityService.verifyToken(token);
    if (!payload) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    
    // Get user from storage
    const user = await storage.getUser(payload.id);
    if (!user) {
      return res.status(403).json({ message: 'User not found' });
    }
    
    // Attach user to request object
    req.user = user;
    
    // Log successful authentication
    await securityService.logSecurityEvent('authentication_success', user.id, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      endpoint: req.originalUrl
    });
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({ message: 'Authentication failed' });
  }
};

/**
 * Middleware to require specific permissions
 */
export const requirePermission = (permission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!securityService.hasPermission(req.user, permission)) {
      // Log permission denied
      securityService.logSecurityEvent('permission_denied', req.user.id, {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        endpoint: req.originalUrl,
        permission
      });
      
      return res.status(403).json({ message: 'Permission denied' });
    }
    
    next();
  };
};

/**
 * Middleware to encrypt sensitive response data
 */
export const encryptSensitiveData = (req: Request, res: Response, next: NextFunction) => {
  // Store the original res.json method
  const originalJson = res.json;
  
  // Override the res.json method to encrypt sensitive data
  res.json = function(body: any) {
    // Determine if this endpoint returns sensitive data
    const sensitiveEndpoints = [
      '/api/user/profile',
      '/api/user/medical-records',
      '/api/treatments'
    ];
    
    const isSensitiveEndpoint = sensitiveEndpoints.some(endpoint => 
      req.originalUrl.startsWith(endpoint)
    );
    
    if (isSensitiveEndpoint && body) {
      // Process sensitive fields
      if (Array.isArray(body)) {
        body = body.map(item => encryptSensitiveFields(item));
      } else {
        body = encryptSensitiveFields(body);
      }
    }
    
    // Call the original json method
    return originalJson.call(this, body);
  };
  
  next();
};

/**
 * Helper function to encrypt sensitive fields in an object
 */
function encryptSensitiveFields(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sensitiveFields = [
    'socialSecurityNumber', 'ssn', 'medicalRecordNumber',
    'insuranceNumber', 'geneticData'
  ];
  
  const result = { ...obj };
  
  for (const key of Object.keys(result)) {
    if (sensitiveFields.includes(key) && typeof result[key] === 'string') {
      // Encrypt the field value
      result[key] = securityService.encryptData(result[key]);
    } else if (typeof result[key] === 'object' && result[key] !== null) {
      // Recursively process nested objects
      result[key] = encryptSensitiveFields(result[key]);
    }
  }
  
  return result;
}

/**
 * Rate limiting middleware to prevent brute force attacks
 */
export const rateLimit = (windowMs: number, maxRequests: number) => {
  const requests = new Map<string, { count: number, resetTime: number }>();
  
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || 'unknown';
    const currentTime = Date.now();
    
    // Get or initialize request count for this IP
    let requestData = requests.get(ip);
    if (!requestData || currentTime > requestData.resetTime) {
      requestData = { count: 0, resetTime: currentTime + windowMs };
      requests.set(ip, requestData);
    }
    
    // Increment request count
    requestData.count++;
    
    // Check if limit exceeded
    if (requestData.count > maxRequests) {
      // Log potential brute force attack
      securityService.logSecurityEvent('rate_limit_exceeded', null, {
        ipAddress: ip,
        userAgent: req.headers['user-agent'],
        endpoint: req.originalUrl,
        count: requestData.count
      });
      
      return res.status(429).json({
        message: 'Too many requests',
        retryAfter: Math.ceil((requestData.resetTime - currentTime) / 1000)
      });
    }
    
    next();
  };
};

/**
 * HIPAA compliance headers middleware
 */
export const hipaaSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Set security headers
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; object-src 'none'");
  res.setHeader('Referrer-Policy', 'same-origin');
  
  // Remove headers that might leak information
  res.removeHeader('X-Powered-By');
  
  next();
};