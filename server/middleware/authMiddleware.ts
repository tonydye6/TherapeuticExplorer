import { Request, Response, NextFunction } from 'express';
import { securityService } from '../services/securityService';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

export interface AuthRequest extends Request {
  user?: any;
}

/**
 * Add HIPAA-compliant security headers
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
  xssFilter: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
});

/**
 * Rate limiter for sensitive endpoints
 */
export const sensitiveRouteRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for auth endpoints (more strict)
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth attempts per windowMs
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Extract token from Authorization header
 */
export function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.split(' ')[1];
}

/**
 * Middleware to verify JWT and attach user to request
 */
export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const token = extractToken(req);
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  const userData = securityService.verifyToken(token);
  
  if (!userData) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
  
  // Attach user data to request
  req.user = userData;
  next();
}

/**
 * Middleware to check if user has required permission
 */
export function requirePermission(permission: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!securityService.hasPermission(req.user, permission)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    next();
  };
}