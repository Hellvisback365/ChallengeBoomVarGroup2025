# 🔒 SECURITY DOCUMENTATION

**Project:** ZENITH - VarGroup AI Workflow Suite  
**Version:** 1.0  
**Last Updated:** October 27, 2025  
**Status:** Development/Demo Repository

---

## ⚠️ IMPORTANT NOTICE

**This repository is for demonstration and review purposes only.**  
The code contains known security vulnerabilities that should be addressed before any production deployment.

---

## 📊 Security Vulnerability Summary

This application has been analyzed for security issues. The following vulnerabilities have been identified:

| Severity | Count | Status |
|----------|-------|--------|
| 🔴 **CRITICAL** | 2 | Documented |
| 🟠 **HIGH** | 4 | Documented |
| 🟡 **MEDIUM** | 4 | Documented |
| 🟢 **LOW** | 3 | Documented |

---

## 🚨 Critical Vulnerabilities

### 1. Hardcoded N8N Webhook URLs with Authentication Tokens

**Severity:** CRITICAL  
**Files Affected:**
- `src/AssistenteVarGroup.jsx` (Lines 4-5)
- `src/FaseTrascrizione.jsx` (Lines 5-6)
- `src/ReportFinale.jsx` (Line 3)

**Description:**  
Webhook URLs containing sensitive UUID authentication tokens are hardcoded directly in client-side JavaScript. These tokens are exposed in:
- Production bundle files
- Browser DevTools (Network & Sources tabs)
- Public GitHub repository
- Any user inspecting the source code

**Endpoints Configuration (now in environment variables):**
```javascript
// Chat AI Webhook
VITE_VARGROUP_URL=https://your-n8n-instance.com/webhook/YOUR_CHAT_WEBHOOK_ID/chat

// Report Upload Webhook
VITE_REPORT_URL=https://your-n8n-instance.com/webhook/YOUR_REPORT_WEBHOOK_ID

// Transcription Webhook
VITE_N8N_URL=https://your-n8n-instance.com/webhook/YOUR_TRANSCRIPTION_WEBHOOK_ID

// Final Report Webhook
VITE_FINAL_REPORT_URL=https://your-n8n-instance.com/webhook/YOUR_FINAL_REPORT_WEBHOOK_ID
```

**Risk:**
- Unauthorized access to N8N workflows
- Data manipulation by malicious actors
- Denial of Service attacks
- Potential data exfiltration
- Abuse of paid N8N cloud services

**Recommendation for Production:**
```javascript
// Move to environment variables
const VARGROUP_URL = import.meta.env.VITE_VARGROUP_URL;
const REPORT_URL = import.meta.env.VITE_REPORT_URL;
const N8N_URL = import.meta.env.VITE_N8N_URL;
const FINAL_REPORT_URL = import.meta.env.VITE_FINAL_REPORT_URL;

// Configure in .env.production (NOT committed to git)
// See .env.example for template
```

---

### 2. Sensitive Business Data Transmitted Without Additional Protection

**Severity:** CRITICAL  
**Files Affected:**
- `src/AssistenteVarGroup.jsx` (Lines 153-160, 204-208)
- `src/FaseTrascrizione.jsx` (Lines 68-76, 174-179)
- `src/ReportFinale.jsx` (Lines 51-58)

**Description:**  
While HTTPS is used (which is good), sensitive business data is transmitted via client-side fetch without additional encryption or validation:

**Sensitive Data Transmitted:**
- Consultant names (`consultantName`)
- Company names (`companyName`)
- Complete chat transcripts (`chatInput`, `storico`)
- Session identifiers (`sessionId`)
- Meeting transcriptions (`frase`)
- User messages (`userMessage`)

**Risk:**
- Data visible in browser DevTools Network tab
- No input sanitization before transmission
- Session hijacking if localStorage is compromised
- Business intelligence data exposed to client-side manipulation

**Recommendation for Production:**
- Implement backend API proxy to hide direct N8N communication
- Add request signing/HMAC validation
- Implement field-level encryption for sensitive data
- Add comprehensive input validation

---

## 🟠 High Severity Vulnerabilities

### 3. Cross-Site Scripting (XSS) via dangerouslySetInnerHTML

**Severity:** HIGH  
**Files Affected:**
- `src/AssistenteVarGroup.jsx` (Line 241)
- `src/App.jsx` (Line 167)

**Description:**  
The application uses `dangerouslySetInnerHTML` to render AI-generated content and help descriptions without proper sanitization.

**Code Example:**
```jsx
// Vulnerable code
<div dangerouslySetInnerHTML={{ __html: formatReportText(m.testo) }} />
<p dangerouslySetInnerHTML={{ __html: currentHelpStepContent.description.replace(/\n/g, '<br/>') }} />
```

**Risk:**
- Malicious script injection if AI responds with `<script>` tags
- Cookie theft via injected JavaScript
- Session hijacking
- Phishing attacks via injected forms/links
- DOM-based XSS attacks

**Recommendation for Production:**
```javascript
// Install DOMPurify
npm install dompurify

// Use DOMPurify to sanitize
import DOMPurify from 'dompurify';

<div dangerouslySetInnerHTML={{ 
  __html: DOMPurify.sanitize(formatReportText(m.testo), {
    ALLOWED_TAGS: ['h1', 'h2', 'h3', 'p', 'strong', 'em', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['class']
  }) 
}} />
```

---

### 4. Missing Content Security Policy (CSP) Headers

**Severity:** HIGH  
**Files Affected:**
- `vercel.json` (incomplete security headers)
- `index.html` (no CSP meta tag)

**Description:**  
The application lacks comprehensive Content Security Policy headers, which would help prevent XSS attacks and control resource loading.

**Current Headers:**
```json
{
  "key": "Permissions-Policy",
  "value": "microphone=(self)"
}
```

**Missing Critical Headers:**
- `Content-Security-Policy`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Strict-Transport-Security`
- `Referrer-Policy`

**Recommendation for Production:**
Add to `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://valeriolorito.app.n8n.cloud; frame-ancestors 'none';"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "microphone=(self), camera=(), geolocation=(), payment=()"
        }
      ]
    }
  ]
}
```

---

### 5. External CDN Dependency Without Subresource Integrity (SRI)

**Severity:** HIGH  
**File:** `src/AssistenteVarGroup.jsx` (Line 2)

**Description:**  
The application imports from an external CDN without integrity verification:

```javascript
import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';
```

**Risk:**
- Supply chain attack if CDN is compromised
- Malicious code injection if jsdelivr serves tampered files
- No version pinning
- Man-in-the-middle attacks (partially mitigated by HTTPS)

**Recommendation for Production:**
```bash
# Install the package locally instead
npm install @n8n/chat

# Then import from node_modules
import { createChat } from '@n8n/chat';
```

---

### 6. Insecure localStorage Usage for Sensitive Data

**Severity:** HIGH  
**Files Affected:**
- `src/AssistenteVarGroup.jsx` (Lines 111, 117-118, 123, 138)
- `src/FaseTrascrizione.jsx` (Lines 10, 172, 235)
- `src/App.jsx` (Lines 236-237)

**Description:**  
Sensitive conversation data is stored in `localStorage` without encryption:

```javascript
localStorage.setItem("chatVarGroup", JSON.stringify(chat));
localStorage.setItem("conversazione", newChat);
localStorage.setItem("chatSessionId", newSessionId);
```

**Stored Data:**
- Complete chat histories
- Full meeting transcriptions
- Session identifiers
- Consultant and company names

**Risk:**
- Data persists indefinitely even after session ends
- Accessible by any JavaScript code on the same origin
- No encryption - readable by malware/browser extensions
- XSS attacks can steal all localStorage data
- Shared computer risks

**Recommendation for Production:**
```javascript
// Install crypto-js
npm install crypto-js

import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_STORAGE_ENCRYPTION_KEY;

// Encrypt before storing
const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

// Decrypt when reading
const decryptData = (encryptedData) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

localStorage.setItem("chatVarGroup", encryptData(chat));
const chat = decryptData(localStorage.getItem("chatVarGroup"));
```

---

## 🟡 Medium Severity Vulnerabilities

### 7. Missing Input Validation and Sanitization

**Severity:** MEDIUM  
**Files Affected:** All components with user input

**Description:**  
User inputs are transmitted to backend without client-side validation:
- No length limits enforced
- No character filtering
- No format validation
- No SQL/NoSQL injection protection

**Recommendation for Production:**
```javascript
const MAX_INPUT_LENGTH = 5000;
const MAX_NAME_LENGTH = 100;

const validateInput = (text, maxLength = MAX_INPUT_LENGTH) => {
  if (!text || text.trim().length === 0) {
    return { valid: false, error: "Input cannot be empty" };
  }
  if (text.length > maxLength) {
    return { valid: false, error: `Input exceeds maximum length of ${maxLength}` };
  }
  // Add more validation rules as needed
  return { valid: true };
};
```

---

### 8. Missing Rate Limiting on Client Side

**Severity:** MEDIUM  
**Files Affected:** All components with API calls

**Description:**  
No throttling or debouncing on API requests allows users to spam N8N endpoints.

**Risk:**
- API abuse
- Cost implications (N8N cloud pricing based on executions)
- Performance degradation
- Potential DoS

**Recommendation for Production:**
```javascript
import { throttle } from 'lodash';

const throttledFetch = throttle(async (url, options) => {
  return await fetch(url, options);
}, 1000); // Max 1 request per second

// Or implement custom rate limiting
const rateLimiter = {
  requests: [],
  maxRequests: 10,
  timeWindow: 60000, // 1 minute
  
  canMakeRequest() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    return this.requests.length < this.maxRequests;
  },
  
  addRequest() {
    this.requests.push(Date.now());
  }
};
```

---

### 9. Hardcoded Google Drive Folder Link

**Severity:** MEDIUM  
**File:** `src/FaseTrascrizione.jsx` (Line 77)

**Description:**  
Google Drive folder ID is hardcoded in the application:
```
https://drive.google.com/drive/folders/YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE?usp=drive_link
```

**Risk:**
- Folder ID exposed in client code
- Cannot easily change without redeployment
- If folder permissions are misconfigured, unauthorized access possible

**Recommendation for Production:**
Move to environment variable:
```javascript
const DRIVE_FOLDER_URL = import.meta.env.VITE_DRIVE_FOLDER_URL;
```

---

### 10. Generic Error Handling

**Severity:** MEDIUM  
**Files Affected:** All components with fetch calls

**Description:**  
Error handling doesn't distinguish between different error types:

```javascript
catch (err) {
  setChat(prev => [...prev, { ruolo: "AI", testo: "Errore nell'assistente." }]);
}
```

**Recommendation for Production:**
```javascript
catch (err) {
  console.error('API Error:', err);
  
  let errorMessage = "Si è verificato un errore.";
  
  if (err.name === 'NetworkError') {
    errorMessage = "Errore di connessione. Verifica la tua connessione internet.";
  } else if (err.response?.status === 401) {
    errorMessage = "Errore di autenticazione. Riprova più tardi.";
  } else if (err.response?.status === 429) {
    errorMessage = "Troppe richieste. Attendi qualche secondo.";
  }
  
  setChat(prev => [...prev, { ruolo: "AI", testo: errorMessage }]);
}
```

---

## 🟢 Low Severity Issues

### 11. No HTTPS in Development Environment

**Severity:** LOW  
**File:** `vite.config.js`

**Description:**  
Development server runs on HTTP by default.

**Recommendation for Production:**
```javascript
import fs from 'fs';

export default defineConfig({
  server: {
    https: {
      key: fs.readFileSync('./certs/localhost-key.pem'),
      cert: fs.readFileSync('./certs/localhost.pem'),
    },
    port: 5173,
  }
});
```

---

### 12. Limited Permissions-Policy

**Severity:** LOW  
**File:** `vercel.json`

**Description:**  
Permissions-Policy only restricts microphone access. Other permissions (camera, geolocation, payment) are not explicitly restricted.

**Recommendation:** See recommendation in issue #4 above.

---

### 13. Source Maps in Production

**Severity:** LOW (Actually GOOD)  
**File:** `vite.config.js` (Line 7)

**Note:** The application correctly disables source maps in production:
```javascript
sourcemap: false
```

This is a GOOD security practice that prevents reverse engineering.

---

## ✅ Positive Security Practices Already Implemented

1. ✅ **HTTPS for all API calls** - All webhook URLs use `https://` protocol
2. ✅ **Source maps disabled** - Production builds don't expose source code
3. ✅ **Microphone permission policy** - Restricts microphone to same origin
4. ✅ **Private package** - `package.json` marked as `"private": true"`
5. ✅ **Environment files gitignored** - `.env` files excluded from git
6. ✅ **Modern React version** - React 19.1.1 with latest security patches
7. ✅ **Build minification** - Code minified with esbuild

---

## 🎯 Priority Action Plan for Production Deployment

### Phase 1: Critical Fixes (Week 1)
1. **Move all webhook URLs to environment variables**
   - Create `.env.production` from `.env.example`
   - Update all components to use `import.meta.env.VITE_*`
   - Add `.env.production` to `.gitignore`
   - Regenerate N8N webhook tokens

2. **Implement XSS protection**
   - Install and configure DOMPurify
   - Sanitize all HTML output

3. **Consider backend proxy architecture**
   - Evaluate implementing Node.js/Express proxy
   - Hide N8N endpoints completely from client

### Phase 2: High Priority (Week 2)
4. **Add comprehensive security headers** (see recommendation #4)
5. **Encrypt localStorage data** (see recommendation #6)
6. **Replace CDN import with npm package** (see recommendation #5)

### Phase 3: Medium Priority (Weeks 3-4)
7. **Implement input validation** (see recommendation #7)
8. **Add rate limiting** (see recommendation #8)
9. **Move Google Drive URL to env** (see recommendation #9)
10. **Improve error handling** (see recommendation #10)

### Phase 4: Low Priority (Ongoing)
11. **HTTPS in development** (see recommendation #11)
12. **Enhanced Permissions-Policy** (see recommendation #12)

---

## 📋 Pre-Production Checklist

Before deploying to production, ensure:

- [ ] All webhook URLs moved to environment variables
- [ ] `.env.production` created and configured on hosting platform
- [ ] `.env.production` added to `.gitignore`
- [ ] N8N webhook tokens regenerated
- [ ] DOMPurify installed and configured
- [ ] Security headers added to `vercel.json`
- [ ] localStorage encryption implemented
- [ ] CDN dependency replaced with npm package
- [ ] Input validation added
- [ ] Rate limiting implemented
- [ ] Error handling improved
- [ ] Security audit performed
- [ ] Penetration testing completed
- [ ] GDPR compliance verified (if handling EU data)
- [ ] Privacy policy and terms of service created

---

## 🔍 Security Testing Recommendations

Before production deployment:

1. **Static Application Security Testing (SAST)**
   ```bash
   npm install -g snyk
   snyk test
   ```

2. **Dependency Vulnerability Scanning**
   ```bash
   npm audit
   npm audit fix
   ```

3. **Manual Security Testing**
   - Test XSS vectors in all input fields
   - Verify CSP headers block unauthorized scripts
   - Test rate limiting effectiveness
   - Verify encrypted localStorage cannot be read
   - Test session timeout behavior

4. **Automated Security Scanning**
   - Use OWASP ZAP for automated vulnerability scanning
   - Configure GitHub Security Scanning
   - Enable Dependabot alerts

---

## 📞 Security Contact

For security issues or questions about this documentation:
- **Project:** ZENITH - VarGroup AI Workflow Suite
- **Repository:** https://github.com/Hellvisback365/ChallengeBoomVarGroup2025
- **Last Review:** October 27, 2025

---

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Vite Security Best Practices](https://vitejs.dev/guide/best-practices.html)
- [React Security Best Practices](https://react.dev/learn/security)
- [Content Security Policy Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Web Security Guidelines](https://cheatsheetseries.owasp.org/)

---

**⚠️ DISCLAIMER:** This repository is for demonstration purposes. Do not deploy to production without addressing the documented security vulnerabilities.
