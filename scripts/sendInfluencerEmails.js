#!/usr/bin/env node

/**
 * Email Automation Script for CelebLink Marketing
 *
 * This script sends personalized emails to YouTubers/influencers.
 *
 * SETUP:
 * 1. Install dependencies: npm install nodemailer
 * 2. Enable "App Passwords" in your Gmail account:
 *    - Go to: https://myaccount.google.com/apppasswords
 *    - Generate an app password for "Mail"
 * 3. Set environment variables:
 *    export EMAIL_USER="your-email@gmail.com"
 *    export EMAIL_PASS="your-app-password"
 * 4. Run: node scripts/sendInfluencerEmails.js
 */

const nodemailer = require('nodemailer');

// Influencer list from MARKETING_KIT.md
const INFLUENCERS = [
  // Start with micro-influencers (10k-50k) - they respond more!
  { name: "RealToughCandy", email: "YouTube DM", subscribers: "100k", niche: "Tech/Programming" },
  { name: "Chris Sean", email: "YouTube DM", subscribers: "200k", niche: "Web Development" },
  { name: "Maggie Mae Fish", email: "YouTube DM", subscribers: "200k", niche: "Movie Analysis" },
  { name: "Karsten Runquist", email: "YouTube DM", subscribers: "300k", niche: "Film Commentary" },

  // Add more as you find their emails via YouTube About page
];

// Email template
const getEmailTemplate = (influencerName, niche) => {
  return {
    subject: `Free tool for your next video - Celebrity Connections`,
    text: `Hi ${influencerName},

Love your content on ${niche}!

I built a tool called CelebLink that might be perfect for your audience - it finds surprising connections between any two celebrities through photos and events.

Would you be interested in:
• Featuring it in a video? (Free mention, no cost)
• Custom connection research for your content
• Early access to new features

Example: I found a 4-hop connection from Tom Cruise to Einstein!

Check it out: https://celebslinks.com

Let me know if you'd like to collaborate!

Best,
CelebLink Team

P.S. If you're interested, I can even sponsor a quick mention ($5-10) to support your channel!`,

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Hi ${influencerName},</h2>

        <p>Love your content on ${niche}!</p>

        <p>I built a tool called <strong>CelebLink</strong> that might be perfect for your audience - it finds surprising connections between any two celebrities through photos and events.</p>

        <h3 style="color: #4F46E5;">Would you be interested in:</h3>
        <ul>
          <li>Featuring it in a video? (Free mention, no cost)</li>
          <li>Custom connection research for your content</li>
          <li>Early access to new features</li>
        </ul>

        <p><strong>Example:</strong> I found a 4-hop connection from Tom Cruise to Einstein!</p>

        <p style="margin: 30px 0;">
          <a href="https://celebslinks.com" style="background: linear-gradient(to right, #4F46E5, #7C3AED); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Check it out: celebslinks.com
          </a>
        </p>

        <p>Let me know if you'd like to collaborate!</p>

        <p>Best,<br>CelebLink Team</p>

        <p style="font-size: 12px; color: #666; margin-top: 30px;">
          P.S. If you're interested, I can even sponsor a quick mention ($5-10) to support your channel!
        </p>
      </div>
    `
  };
};

async function sendEmails() {
  // Check for credentials
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('\n❌ ERROR: Email credentials not set!');
    console.log('\nPlease set environment variables:');
    console.log('  export EMAIL_USER="your-email@gmail.com"');
    console.log('  export EMAIL_PASS="your-gmail-app-password"');
    console.log('\nGet app password at: https://myaccount.google.com/apppasswords\n');
    process.exit(1);
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  console.log('\n🚀 CelebLink Email Automation Starting...\n');
  console.log(`📧 Sending from: ${process.env.EMAIL_USER}\n`);

  let sent = 0;
  let failed = 0;

  for (const influencer of INFLUENCERS) {
    // Skip if no real email (just "YouTube DM")
    if (influencer.email === "YouTube DM" || !influencer.email.includes('@')) {
      console.log(`⏭️  Skipping ${influencer.name} (YouTube DM only)`);
      continue;
    }

    const template = getEmailTemplate(influencer.name, influencer.niche);

    const mailOptions = {
      from: `CelebLink <${process.env.EMAIL_USER}>`,
      to: influencer.email,
      subject: template.subject,
      text: template.text,
      html: template.html
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Sent to ${influencer.name} (${influencer.email})`);
      sent++;

      // Wait 2 seconds between emails to avoid spam detection
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`❌ Failed to send to ${influencer.name}:`, error.message);
      failed++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`  ✅ Sent: ${sent}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  ⏭️  Skipped: ${INFLUENCERS.length - sent - failed} (YouTube DM only)`);
  console.log('\n💡 Next Steps:');
  console.log('  1. Add real email addresses to the INFLUENCERS array above');
  console.log('  2. Find emails on YouTube channel "About" pages');
  console.log('  3. Send YouTube DMs manually for channels without emails\n');
}

// Run if called directly
if (require.main === module) {
  sendEmails().catch(console.error);
}

module.exports = { sendEmails, getEmailTemplate };
