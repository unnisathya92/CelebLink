# AdSense 400 Error Troubleshooting Guide

## Current Status:
- ✓ AdSense script is loading
- ✓ Client ID is correct: `ca-pub-2217932579992453`
- ✗ Getting 400 errors when requesting ads
- ✗ Ad slots failing to load

## Issue: 400 Bad Request from AdSense

This error means Google AdSense is rejecting your ad requests. Here are the exact steps to fix it:

---

## Fix 1: Check for OPT_OUT Cookie (MOST COMMON)

### In Browser DevTools:
1. Press F12 to open DevTools
2. Go to **Application** tab (Chrome/Edge) or **Storage** tab (Firefox)
3. Expand **Cookies** in left sidebar
4. Click on `.doubleclick.net`
5. Look for a cookie named `id` with value `OPT_OUT`

### If you find it:
- **Delete the cookie**
- Refresh the page
- Ads should start working

### Why this happens:
- Someone clicked "Opt out of personalized ads"
- Privacy extensions set this cookie
- Browser privacy settings enabled it

---

## Fix 2: Verify AdSense Dashboard Setup

### A. Check if your site is added:
1. Go to https://www.google.com/adsense
2. Click **"Sites"** in left menu
3. Look for `celebslinks.com`

**If NOT listed:**
- Click **"Add site"**
- Enter: `celebslinks.com`
- Follow verification steps
- Wait 24-48 hours for approval

**If listed, check status:**
- ✓ "Ready" = Good, ads should work
- ⏳ "Getting ready" = Wait 24-48 hours
- ⚠️ "Needs attention" = Click to see what's needed

---

### B. Verify ad slot IDs exist:
1. In AdSense, click **"Ads"** → **"By ad unit"**
2. Check if these ad units exist:
   - Slot ID: `5210800975` (Footer ad)
   - Slot ID: `2946147018` (Results banner)

**If they DON'T exist:**
You need to create them. Follow these steps:

#### Create Ad Unit 1 (Footer Ad):
1. Click **"+ New ad unit"** → **"Display ads"**
2. Name: `CelebLink Footer`
3. Ad size: **Responsive**
4. Click **Create**
5. **COPY the full ad slot ID** (format: `1234567890`)

#### Create Ad Unit 2 (Results Banner):
1. Click **"+ New ad unit"** → **"Display ads"**
2. Name: `CelebLink Results Banner`
3. Ad size: **Responsive**
4. Click **Create**
5. **COPY the full ad slot ID**

#### Update the code with real slot IDs:
After creating ad units, you need to update two files:

**File: `app/page.tsx`**
- Line 381: Replace `"2946147018"` with your actual Results Banner slot ID
- Line 400: Replace `"5210800975"` with your actual Footer ad slot ID

---

## Fix 3: Test in Incognito/Private Mode

After fixing above issues:
1. Open **Incognito window** (Ctrl+Shift+N or Cmd+Shift+N)
2. Visit https://celebslinks.com
3. Open DevTools (F12) → Console tab
4. Look for success message: `AdSense: Slot XXXXX loaded successfully`

---

## Fix 4: Disable Ad Blockers

Ad blockers can interfere with testing:
- uBlock Origin
- AdBlock Plus
- Privacy Badger
- Brave Shields
- Browser privacy features

**Temporarily disable** these extensions to test.

---

## Expected Console Messages After Fix:

### Success:
```
AdSense: Initializing ad slot 5210800975
AdSense: Slot 5210800975 loaded successfully (status: filled)
```

### No ads available (normal, not an error):
```
AdSense: Initializing ad slot 5210800975
AdSense: Slot 5210800975 - No ads available (unfilled)
```

### Still failing:
```
AdSense: Initializing ad slot 5210800975
AdSense: Slot 5210800975 - Ad may have failed to load
```

---

## Timeline for AdSense Approval:

1. **Account approval**: Usually 1-2 days
2. **Site approval**: 24-48 hours after adding domain
3. **Ad units active**: Immediate after creation
4. **First ads showing**: Up to 1 week for full ad serving

During the waiting period, you might see:
- 400 errors (site not yet approved)
- "unfilled" status (no matching ads yet)
- Blank ad spaces (AdSense still learning)

---

## Quick Diagnostic:

Run this checklist:
- [ ] Cleared OPT_OUT cookie from .doubleclick.net
- [ ] celebslinks.com added to AdSense Sites (Status: "Ready")
- [ ] Ad units created in AdSense dashboard
- [ ] Ad slot IDs in code match dashboard
- [ ] Tested in incognito mode
- [ ] Ad blockers disabled
- [ ] Waited 24-48 hours after site approval

---

## Still Not Working?

Check these AdSense policy requirements:
1. **Sufficient content**: Need quality, original content
2. **Privacy Policy**: Add a privacy policy page
3. **Navigation**: Clear site navigation
4. **No prohibited content**: Review AdSense policies
5. **Age**: Domain should be at least a few weeks old

---

## Next Steps:

1. **Check your AdSense dashboard NOW**:
   - Sites tab: Is celebslinks.com there? What's the status?
   - Ads → By ad unit: Do those slot IDs exist?

2. **Clear cookies**:
   - Delete OPT_OUT cookie from .doubleclick.net
   - Test in incognito mode

3. **If ad slots don't exist**:
   - Create them in AdSense dashboard
   - Get the real slot IDs
   - Update the code with correct IDs
   - Redeploy

---

## Contact Support:

If you've done all the above and ads still don't work:
- [AdSense Help Center](https://support.google.com/adsense)
- [AdSense Community Forum](https://support.google.com/adsense/community)
- Check your email for messages from AdSense team
