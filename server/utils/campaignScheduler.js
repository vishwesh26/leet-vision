const cron = require('node-cron');
const sendEmail = require('./email');
const { getRandomCampaign } = require('./emailCampaigns');

// Import User model lazily to avoid circular ref issues
let User;
const getUser = () => {
    if (!User) User = require('../models/User');
    return User;
};

/**
 * Generate a simple unsubscribe token from user ID
 * (In production use JWT or a signed token for security)
 */
const generateUnsubToken = (userId) => {
    return Buffer.from(userId.toString()).toString('base64');
};

/**
 * Send a campaign to all subscribed users
 * @param {Object} campaign - campaign object with subject and html()
 * @param {Object} options - { dryRun, specificEmail, customNote }
 */
const sendCampaignToAll = async (campaign, options = {}) => {
    const UserModel = getUser();
    
    let users;

    if (options.specificEmail) {
        // Testing mode: send only to a specific email
        const user = await UserModel.findOne({ email: options.specificEmail.toLowerCase().trim() })
            .select('name email _id lastEmailSentAt').lean();
        if (!user) {
            return { sent: 0, skipped: 0, errors: [{ email: options.specificEmail, error: 'User not found' }] };
        }
        users = [user];
    } else {
        users = await UserModel.find({
            emailSubscribed: { $ne: false }, // Include true AND missing (default is true)
            email: { $exists: true, $ne: '' }
        }).select('name email _id lastEmailSentAt').lean();
    }

    if (!users.length) {
        console.log('[Campaign] No subscribed users found.');
        return { sent: 0, skipped: 0, errors: [] };
    }

    console.log(`[Campaign] Sending campaign "${campaign.id}" to ${users.length} user(s)...`);

    let sent = 0;
    let skipped = 0;
    const errors = [];

    // Build custom note HTML block if provided
    const customNoteHtml = options.customNote ? `
        <div style="background:rgba(245,124,0,0.1);border:1px solid rgba(245,124,0,0.3);border-radius:10px;padding:16px 20px;margin:0 0 20px;color:#fff;font-size:0.95rem;line-height:1.6;">
            <strong style="color:#f57c00;">&#128226; Message from LeetVision:</strong><br>${options.customNote}
        </div>` : '';

    for (const user of users) {
        try {
            // Rate limit: skip if emailed in last 5 days (bypass when targeting specific user)
            if (!options.specificEmail && user.lastEmailSentAt) {
                const daysSinceLastEmail = (Date.now() - new Date(user.lastEmailSentAt).getTime()) / (1000 * 60 * 60 * 24);
                if (daysSinceLastEmail < 5) {
                    skipped++;
                    continue;
                }
            }

            if (!options.dryRun) {
                const token = generateUnsubToken(user._id);
                let html = campaign.html(user, token);

                // Inject custom note after opening .body div
                if (customNoteHtml) {
                    html = html.replace('<div class="body">', `<div class="body">${customNoteHtml}`);
                }

                await sendEmail({
                    email: user.email,
                    subject: campaign.subject,
                    html
                });

                // Update lastEmailSentAt
                await UserModel.findByIdAndUpdate(user._id, { lastEmailSentAt: new Date() });

                // Small delay between emails to avoid Gmail rate limits
                await new Promise(resolve => setTimeout(resolve, 150));
            }

            sent++;
        } catch (err) {
            console.error(`[Campaign] Failed for ${user.email}:`, err.message);
            errors.push({ email: user.email, error: err.message });
        }
    }

    console.log(`[Campaign] Done. Sent: ${sent}, Skipped: ${skipped}, Errors: ${errors.length}`);
    return { sent, skipped, errors };
};

/**
 * Initialize the scheduled cron job
 * Runs every Sunday at 10:00 AM IST (4:30 AM UTC)
 */
const initCampaignScheduler = () => {
    // '30 4 * * 0' = 4:30 AM UTC = 10:00 AM IST, every Sunday
    cron.schedule('30 4 * * 0', async () => {
        console.log('[Campaign Scheduler] Running weekly re-engagement campaign...');
        try {
            const campaign = getRandomCampaign();
            const result = await sendCampaignToAll(campaign);
            console.log('[Campaign Scheduler] Campaign complete:', result);
        } catch (err) {
            console.error('[Campaign Scheduler] Error:', err);
        }
    }, {
        timezone: 'UTC'
    });

    console.log('[Campaign Scheduler] Weekly campaign scheduled (Sundays 10AM IST)');
};

module.exports = { initCampaignScheduler, sendCampaignToAll, generateUnsubToken };
