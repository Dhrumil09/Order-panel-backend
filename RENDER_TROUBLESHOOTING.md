# Render Deployment Troubleshooting Guide

## Common Issues and Solutions

### 1. "Cannot find module" Errors

**Problem**: `Error: Cannot find module '/opt/render/project/dist/src/index.js'`

**Root Cause**: Path traversal issues in start commands or incorrect file paths.

**Solutions Applied**:

- ✅ Simplified `startCommand` in `render.yaml` to `node dist/index.js`
- ✅ Removed `./` from package.json start script
- ✅ Ensured `main` field in package.json points to correct path
- ✅ Added verification script to debug deployment issues

### 2. Build Output Location Issues

**Problem**: Compiled files not in expected location.

**Solutions Applied**:

- ✅ Verified TypeScript `outDir` is set to `./dist`
- ✅ Confirmed `rootDir` is set to `./src`
- ✅ Added build verification step

### 3. Root Directory Configuration

**Problem**: For monorepo projects, wrong root directory.

**Solution**: Set `rootDir: ./` in render.yaml (already correct).

## Current Configuration

### render.yaml

```yaml
services:
  - type: web
    name: order-panel-backend
    runtime: node
    plan: free
    rootDir: ./
    buildCommand: npm ci && npm run build && npm run verify
    startCommand: node dist/index.js
    # ... other config
```

### package.json

```json
{
  "main": "./dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "verify": "node scripts/verify-deployment.js"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

## Verification Steps

1. **Local Build Test**:

   ```bash
   npm run build
   npm run verify
   npm start
   ```

2. **Deployment Verification**:
   - Check Render build logs for verification output
   - Ensure `dist/index.js` exists and is accessible
   - Verify start command executes successfully

## Debugging Commands

### Check File Structure

```bash
ls -la dist/
node scripts/verify-deployment.js
```

### Test Start Command

```bash
node dist/index.js
curl http://localhost:3000/health
```

## Environment Variables

Ensure these are set in Render:

- `NODE_ENV=production`
- `PORT=10000`
- `JWT_SECRET` (auto-generated)
- Database connection variables

## Common Fixes Applied

1. **Simplified Build Command**: Removed debug commands that could cause issues
2. **Path Consistency**: Ensured all paths use consistent format
3. **Verification Script**: Added deployment verification for debugging
4. **Start Command**: Simplified to avoid path traversal issues

## References

- [Render Community - Module Not Found Error](https://community.render.com/t/error-cannot-find-module-opt-render-project-dist-src-index-js/17808/2)
- [Render Community - App.js Not Found](https://community.render.com/t/error-cannot-find-module-opt-render-project-src-app-js/7195)

## Next Steps

1. Deploy to Render using the updated configuration
2. Monitor build logs for verification output
3. Test the deployed application
4. If issues persist, check Render logs for specific error messages
