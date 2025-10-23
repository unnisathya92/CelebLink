# Google AdSense Setup Guide

## 🎯 Strategic Ad Placement

The app includes **2 non-intrusive ad placements**:

1. **After Results Ad**: Shows only when connections are found (horizontal banner)
2. **Footer Ad**: Subtle ad at the bottom of the page (responsive)

Both ads are designed to blend with the app's aesthetic and won't interfere with user experience.

---

## 📋 Setup Instructions

### Step 1: Sign Up for Google AdSense

1. Go to [Google AdSense](https://www.google.com/adsense)
2. Sign in with your Google account
3. Submit your website URL for review
4. Add your payment information
5. Wait for approval (usually 1-2 days)

### Step 2: Get Your Client ID

Once approved:
1. Go to AdSense Dashboard
2. Click on **"Ads"** → **"Get code"**
3. Copy your client ID (format: `ca-pub-XXXXXXXXXXXXXXXX`)

### Step 3: Configure Your App

#### For Local Development:
Add to `.env` file:
```bash
NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
```

#### For Vercel Production:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - **Key**: `NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID`
   - **Value**: `ca-pub-XXXXXXXXXXXXXXXX`
3. Redeploy your app

### Step 4: Create Ad Units

1. In AdSense, go to **"Ads"** → **"By ad unit"** → **"Display ads"**
2. Create two ad units:

   **Ad Unit 1: Results Banner**
   - Name: "CelebLink Results Banner"
   - Type: Display ad
   - Size: Responsive
   - Copy the Ad Slot ID

   **Ad Unit 2: Footer Ad**
   - Name: "CelebLink Footer"
   - Type: Display ad
   - Size: Responsive
   - Copy the Ad Slot ID

3. Update the ad slots in `app/page.tsx`:
   ```tsx
   // Line ~309: Replace "1234567890" with your Results Banner slot ID
   <GoogleAd slot="YOUR_RESULTS_BANNER_SLOT_ID" />

   // Line ~329: Replace "0987654321" with your Footer slot ID
   <GoogleAd slot="YOUR_FOOTER_AD_SLOT_ID" />
   ```

---

## 🎨 Ad Styling & Customization

The ads are already styled to match your app:
- Responsive sizing
- Blends with the gradient theme
- Smooth opacity transitions
- Only shows when appropriate (results exist)

### To Adjust Ad Placement:

**Remove the results ad** (if too intrusive):
```tsx
// Delete or comment out lines 305-314 in app/page.tsx
```

**Remove the footer ad**:
```tsx
// Delete or comment out lines 325-332 in app/page.tsx
```

**Change ad formats**:
```tsx
<GoogleAd
  slot="your-slot-id"
  format="horizontal"  // Options: 'auto', 'fluid', 'rectangle', 'vertical', 'horizontal'
  responsive={true}
  className="max-w-3xl"
/>
```

---

## 💰 Monetization Tips

1. **Wait for Traffic**: AdSense needs decent traffic to generate revenue
2. **Monitor Performance**: Check AdSense dashboard for click-through rates
3. **Don't Click Your Own Ads**: This will get you banned
4. **Be Patient**: Revenue grows as traffic grows
5. **Optimize Placement**: Test different ad positions if needed

---

## 🚫 Disable Ads

If you want to disable ads entirely:

**Option 1**: Don't set the environment variable
```bash
# Simply don't add NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID
# Ads will not show at all
```

**Option 2**: Remove the ad components
```tsx
// Delete the GoogleAd imports and components from app/page.tsx
```

---

## ✅ Verification

After setup:
1. Deploy your app
2. Visit your live site
3. Open browser DevTools → Network tab
4. Search for "adsbygoogle" requests
5. If you see requests, ads are working!
6. Ads may take a few hours to start showing

---

## 📊 Best Practices

✅ **Do**:
- Keep ads relevant to your content
- Monitor ad performance regularly
- Comply with AdSense policies
- Place ads where they don't disrupt UX

❌ **Don't**:
- Click your own ads
- Ask users to click ads
- Place too many ads (2 is perfect)
- Hide ad labels or mislead users

---

## 🔧 Troubleshooting

### Ads Not Showing:
- Check if `NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID` is set
- Verify ad slot IDs are correct
- Wait up to 24 hours after AdSense approval
- Check browser console for errors
- Ensure ad blockers are disabled for testing

### AdSense Rejection:
- Ensure your site has original, valuable content
- Add privacy policy and terms of service
- Have sufficient content before applying
- Make sure site is accessible and loads properly

---

## 📧 Support

For AdSense issues:
- [AdSense Help Center](https://support.google.com/adsense)
- [AdSense Community](https://support.google.com/adsense/community)

For app-specific issues:
- Check `components/GoogleAd.tsx` component
- Review browser console for errors
- Verify environment variables are set correctly
