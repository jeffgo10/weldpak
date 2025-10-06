# Quick Setup for CSRF Fix

## 🚀 **Quick Fix for 403 Forbidden Errors**

### 1. **Create Environment File**
```bash
cp env.example .env.local
```

### 2. **Update .env.local**
Add this line to your `.env.local` file:
```env
CSRF_SECRET=development-csrf-secret-key-change-in-production
```

### 3. **Start Development Server**
```bash
npm run dev
```

### 4. **Test the Fix**
```bash
npm run test:csrf
```

## 🧪 **What Should Happen**

1. **CSRF token fetched**: Client automatically gets token from `/api/csrf`
2. **Token included in headers**: `X-CSRF-Token` header sent with requests
3. **Server validates**: No more 403 Forbidden errors
4. **File processing works**: Upload and process files successfully

## 🔍 **Check Browser Console**

Look for these logs:
```
Fetching CSRF token for Next.js API route
CSRF token obtained: Success
CSRF token added to request headers
```

## 🐛 **If Still Getting 403 Errors**

1. **Check server logs** for CSRF validation messages
2. **Verify .env.local** has CSRF_SECRET
3. **Restart development server** after adding environment variables
4. **Run test script**: `npm run test:csrf`

The CSRF implementation is now complete and should resolve the 403 Forbidden errors!
