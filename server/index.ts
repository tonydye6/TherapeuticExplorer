import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { hipaaSecurityHeaders, rateLimit } from "./middleware/authMiddleware";
import { securityService } from "./services/securityService";
import helmet from "helmet";
import cookieParser from "cookie-parser";

// Initialize express app
const app = express();

// Security enhancements
app.use(helmet({
  contentSecurityPolicy: false, // We'll handle CSP in our own middleware
})); 
app.use(hipaaSecurityHeaders); // Add HIPAA-specific security headers for CSP
app.use(cookieParser()); // For secure cookie handling

// Rate limiting for sensitive endpoints
app.use('/api/login', rateLimit(15 * 60 * 1000, 5)); // 5 requests per 15 minutes
app.use('/api/register', rateLimit(60 * 60 * 1000, 3)); // 3 requests per hour
app.use('/api/user', rateLimit(5 * 60 * 1000, 20)); // 20 requests per 5 minutes

// Standard middleware
app.use(express.json({ limit: '1mb' })); // Limit body size to prevent DoS attacks
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
