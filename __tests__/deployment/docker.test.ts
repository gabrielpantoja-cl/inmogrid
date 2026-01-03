/**
 * Docker Configuration Tests
 *
 * Validates Dockerfile optimization and best practices
 * for fast, secure deployments.
 */

import fs from 'fs';
import path from 'path';

describe('Deployment: Docker Configuration', () => {
  let dockerfileContent: string;

  beforeAll(() => {
    const dockerfilePath = path.join(process.cwd(), 'Dockerfile');
    dockerfileContent = fs.readFileSync(dockerfilePath, 'utf-8');
  });

  describe('Node Version', () => {
    it('should use Node 22 Alpine', () => {
      expect(dockerfileContent).toContain('node:22-alpine');
    });

    it('should NOT use Node 18 (outdated)', () => {
      expect(dockerfileContent).not.toContain('node:18-alpine');
    });
  });

  describe('Multi-stage Build', () => {
    it('should have deps stage', () => {
      expect(dockerfileContent).toMatch(/FROM node:22-alpine AS deps/);
    });

    it('should have builder stage', () => {
      expect(dockerfileContent).toMatch(/FROM node:22-alpine AS builder/);
    });

    it('should have runner stage', () => {
      expect(dockerfileContent).toMatch(/FROM node:22-alpine AS runner/);
    });
  });

  describe('Security Best Practices', () => {
    it('should create non-root user (nextjs)', () => {
      expect(dockerfileContent).toContain('adduser');
      expect(dockerfileContent).toContain('nextjs');
    });

    it('should switch to non-root user', () => {
      expect(dockerfileContent).toMatch(/USER nextjs/);
    });

    it('should NOT run as root user', () => {
      // After USER nextjs, should not have USER root
      const userNextjsIndex = dockerfileContent.indexOf('USER nextjs');
      const afterUserNextjs = dockerfileContent.substring(userNextjsIndex);

      expect(afterUserNextjs).not.toContain('USER root');
    });
  });

  describe('Optimization', () => {
    it('should copy package files first (for caching)', () => {
      const packageCopyIndex = dockerfileContent.indexOf('COPY package');
      const prismaGenerateIndex = dockerfileContent.indexOf('prisma generate');

      // Package files should be copied before Prisma generate
      expect(packageCopyIndex).toBeLessThan(prismaGenerateIndex);
    });

    it('should generate Prisma client', () => {
      expect(dockerfileContent).toContain('prisma generate');
    });

    it('should use npm ci (not npm install)', () => {
      expect(dockerfileContent).toContain('npm ci');

      // Should not use npm install
      expect(dockerfileContent).not.toMatch(/npm install(?! --global)/);
    });

    it('should have production environment variables', () => {
      expect(dockerfileContent).toContain('NODE_ENV=production');
    });
  });

  describe('Health Check', () => {
    it('should have HEALTHCHECK configured', () => {
      expect(dockerfileContent).toMatch(/HEALTHCHECK/i);
    });

    it('should check /api/health endpoint', () => {
      expect(dockerfileContent).toContain('/api/health');
    });
  });

  describe('Standalone Mode', () => {
    it('should use standalone server.js', () => {
      expect(dockerfileContent).toContain('server.js');
    });

    it('should NOT use npm start (use node server.js instead)', () => {
      // Should use CMD ["node", "server.js"] not CMD ["npm", "start"]
      expect(dockerfileContent).toMatch(/CMD \["node", "server\.js"\]/);
    });

    it('should copy standalone output', () => {
      expect(dockerfileContent).toContain('.next/standalone');
    });

    it('should copy static files', () => {
      expect(dockerfileContent).toContain('.next/static');
    });
  });

  describe('Port Configuration', () => {
    it('should expose port 3000', () => {
      expect(dockerfileContent).toContain('EXPOSE 3000');
    });

    it('should set PORT environment variable', () => {
      expect(dockerfileContent).toContain('PORT=3000');
    });

    it('should set HOSTNAME to 0.0.0.0', () => {
      expect(dockerfileContent).toContain('HOSTNAME="0.0.0.0"');
    });
  });

  describe('Dockerignore', () => {
    it('should have .dockerignore file', () => {
      const dockerignorePath = path.join(process.cwd(), '.dockerignore');
      expect(fs.existsSync(dockerignorePath)).toBe(true);
    });

    it('should ignore node_modules', () => {
      const dockerignorePath = path.join(process.cwd(), '.dockerignore');
      const dockerignoreContent = fs.readFileSync(dockerignorePath, 'utf-8');

      expect(dockerignoreContent).toContain('node_modules');
    });

    it('should ignore .next directory', () => {
      const dockerignorePath = path.join(process.cwd(), '.dockerignore');
      const dockerignoreContent = fs.readFileSync(dockerignorePath, 'utf-8');

      expect(dockerignoreContent).toContain('.next');
    });

    it('should ignore .git directory', () => {
      const dockerignorePath = path.join(process.cwd(), '.dockerignore');
      const dockerignoreContent = fs.readFileSync(dockerignorePath, 'utf-8');

      expect(dockerignoreContent).toContain('.git');
    });
  });

  describe('Dependencies Optimization', () => {
    it('should use --legacy-peer-deps flag', () => {
      expect(dockerfileContent).toContain('--legacy-peer-deps');
    });

    it('should use --prefer-offline for faster builds', () => {
      expect(dockerfileContent).toContain('--prefer-offline');
    });
  });

  describe('Layer Caching Strategy', () => {
    it('should copy package files before source code', () => {
      const packageCopyIndex = dockerfileContent.indexOf('COPY package');
      const sourceCodeCopyIndex = dockerfileContent.lastIndexOf('COPY . .');

      // Package files should be copied first
      expect(packageCopyIndex).toBeLessThan(sourceCodeCopyIndex);
    });

    it('should copy Prisma schema before source code', () => {
      const prismaCopyIndex = dockerfileContent.indexOf('COPY prisma');
      const sourceCodeCopyIndex = dockerfileContent.lastIndexOf('COPY . .');

      // Prisma should be copied before source code
      expect(prismaCopyIndex).toBeLessThan(sourceCodeCopyIndex);
    });
  });
});
