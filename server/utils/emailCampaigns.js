/**
 * LeetVision Re-engagement Email Campaign Templates
 * Each template has: subject, html(user) => htmlString
 */

const baseStyle = `
    <style>
        body { margin: 0; padding: 0; background: #0a0a0a; font-family: 'Segoe UI', Arial, sans-serif; }
        .wrapper { max-width: 600px; margin: 0 auto; background: #111111; border: 1px solid #222; border-radius: 16px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #f57c00, #ff9800); padding: 40px 32px; text-align: center; }
        .header h1 { color: #fff; font-size: 2rem; margin: 0; letter-spacing: -1px; }
        .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 1rem; }
        .body { padding: 40px 32px; color: #ddd; }
        .body h2 { color: #fff; font-size: 1.5rem; margin: 0 0 16px; }
        .body p { line-height: 1.7; font-size: 1rem; color: #aaa; margin: 0 0 16px; }
        .body em { color: #f57c00; font-style: normal; font-weight: 700; }
        .cta { display: block; background: linear-gradient(135deg, #f57c00, #ff9800); color: #fff !important; text-decoration: none; padding: 16px 32px; border-radius: 50px; font-weight: 700; font-size: 1.1rem; text-align: center; margin: 28px 0; }
        .footer { padding: 24px 32px; text-align: center; border-top: 1px solid #222; }
        .footer p { color: #555; font-size: 0.8rem; margin: 0; }
        .footer a { color: #f57c00; text-decoration: none; }
        .emoji-big { font-size: 3rem; display: block; text-align: center; margin-bottom: 24px; }
        .highlight-box { background: rgba(245, 124, 0, 0.08); border: 1px solid rgba(245, 124, 0, 0.2); border-radius: 12px; padding: 20px; margin: 20px 0; }
        .highlight-box p { margin: 0; color: #fff; font-weight: 500; }
    </style>
`;

const makeFooter = (unsubscribeUrl) => `
    <div class="footer">
        <p>You're receiving this because you signed up for LeetVision.<br>
        <a href="${unsubscribeUrl}">Unsubscribe</a> &nbsp;|&nbsp;
        <a href="https://leet-vision.com">Visit LeetVision</a></p>
    </div>
`;

const SITE_URL = 'https://leet-vision.com';
const API_URL = 'https://leet-vision.com/api';

const campaigns = [
    // ─── FUNNY #1 ───────────────────────────────────────────────────────────
    {
        id: 'funny_ghosted',
        type: 'funny',
        subject: "👻 You've been ghosting us... just like those interviewers",
        html: (user, token) => `<!DOCTYPE html><html><head>${baseStyle}</head><body>
            <div class="wrapper">
                <div class="header">
                    <h1>👻 LeetVision</h1>
                    <p>We see you out there</p>
                </div>
                <div class="body">
                    <span class="emoji-big">😢</span>
                    <h2>Hey ${user.name || 'Coder'}, we miss you!</h2>
                    <p>You haven't visited LeetVision in a while. We get it — life happens. Netflix happens. Procrastination happens.</p>
                    <p>But here's the thing: <em>your dream job at Google isn't going to interview itself.</em></p>
                    <div class="highlight-box">
                        <p>📣 We added <strong style="color:#f57c00">new company-wise questions</strong> for Google, Amazon, Meta, and Microsoft. Your competition is already grinding.</p>
                    </div>
                    <p>Come back and solve just ONE problem today. That's it. Baby steps.</p>
                    <a href="${SITE_URL}" class="cta">🚀 Resume My Prep →</a>
                    <p style="text-align:center; color:#555; font-size:0.85rem;">(Your LeetCode streak won't build itself, we checked.)</p>
                </div>
                ${makeFooter(`${API_URL}/unsubscribe?token=${token}`)}
            </div>
        </body></html>`
    },

    // ─── MOTIVATIONAL #1 ────────────────────────────────────────────────────
    {
        id: 'motivational_grind',
        type: 'motivational',
        subject: '💪 Your dream job is one problem away',
        html: (user, token) => `<!DOCTYPE html><html><head>${baseStyle}</head><body>
            <div class="wrapper">
                <div class="header" style="background: linear-gradient(135deg, #1a1a2e, #16213e);">
                    <h1 style="color:#f57c00;">LeetVision</h1>
                    <p style="color:#aaa;">Built for the grinders</p>
                </div>
                <div class="body">
                    <span class="emoji-big">🔥</span>
                    <h2>Hey ${user.name || 'Future Engineer'},</h2>
                    <p>Every senior engineer you admire once sat where you are — overwhelmed, unsure, second-guessing themselves.</p>
                    <p>The difference? <em>They showed up anyway.</em></p>
                    <p>Not every day was perfect. Not every solution was clean. But they were consistent — and consistency compounds.</p>
                    <div class="highlight-box">
                        <p>💡 <em>"Do one problem. Just one. Then decide if you want to stop."</em><br>
                        <span style="color:#666; font-size:0.9rem;">— A principle that works every single time.</span></p>
                    </div>
                    <p>We've got curated video solutions, company-specific question sets, and a platform built to make you dangerous in any interview room.</p>
                    <a href="${SITE_URL}/explore" class="cta">⚡ Start Grinding Now →</a>
                </div>
                ${makeFooter(`${API_URL}/unsubscribe?token=${token}`)}
            </div>
        </body></html>`
    },

    // ─── MARKETING #1 ───────────────────────────────────────────────────────
    {
        id: 'marketing_new_questions',
        type: 'marketing',
        subject: '🔥 Hot new company questions just dropped!',
        html: (user, token) => `<!DOCTYPE html><html><head>${baseStyle}</head><body>
            <div class="wrapper">
                <div class="header">
                    <h1>🔥 New Drop</h1>
                    <p>Fresh company questions just landed</p>
                </div>
                <div class="body">
                    <h2>Hi ${user.name || 'there'}!</h2>
                    <p>We've been busy. Here's what's new on LeetVision:</p>
                    <div class="highlight-box">
                        <p>🏢 <em>Company-Wise Questions</em> updated for 2025 hiring seasons</p>
                    </div>
                    <div class="highlight-box">
                        <p>📹 <em>1000+ Video Solutions</em> curated and ready to watch</p>
                    </div>
                    <div class="highlight-box">
                        <p>⚡ <em>GFG, LeetCode, HackerRank & CodeChef</em> — all in one place</p>
                    </div>
                    <p>Whether you're prepping for your first job or switching to FAANG, we've got the blueprint.</p>
                    <a href="${SITE_URL}" class="cta">🎯 Explore What's New →</a>
                </div>
                ${makeFooter(`${API_URL}/unsubscribe?token=${token}`)}
            </div>
        </body></html>`
    },

    // ─── FUNNY #2 ───────────────────────────────────────────────────────────
    {
        id: 'funny_read_receipt',
        type: 'funny',
        subject: '📱 Attention: Your interview prep has been left on Read',
        html: (user, token) => `<!DOCTYPE html><html><head>${baseStyle}</head><body>
            <div class="wrapper">
                <div class="header" style="background: #111; border-bottom: 2px solid #f57c00;">
                    <h1 style="color:#f57c00;">LeetVision</h1>
                    <p style="color:#888;">Sending a voice note soon if you don't respond</p>
                </div>
                <div class="body">
                    <span class="emoji-big">📱</span>
                    <h2>${user.name || 'Hey you'},</h2>
                    <p>We sent you a friend request. You accepted. Then you left us on read.</p>
                    <p>That's okay, we're not mad. (We're a little mad.)</p>
                    <p>Here's the deal: <em>hiring season is heating up</em>, and companies are actively interviewing. Right now. Like, while you're reading this.</p>
                    <div class="highlight-box">
                        <p>😬 Your competition has solved approximately <strong style="color:#f57c00">47 problems</strong> since you last visited. Just sayin'.</p>
                    </div>
                    <p>Come back. We promise the problems are less scary with a video explanation.</p>
                    <a href="${SITE_URL}" class="cta">😤 Fine, I'll Practice →</a>
                    <p style="text-align:center; color:#555; font-size:0.85rem;">(You've got this. Seriously.)</p>
                </div>
                ${makeFooter(`${API_URL}/unsubscribe?token=${token}`)}
            </div>
        </body></html>`
    },

    // ─── MOTIVATIONAL #2 ────────────────────────────────────────────────────
    {
        id: 'motivational_one_day',
        type: 'motivational',
        subject: '🧠 One problem a day keeps the rejection away',  
        html: (user, token) => `<!DOCTYPE html><html><head>${baseStyle}</head><body>
            <div class="wrapper">
                <div class="header" style="background: linear-gradient(135deg, #f57c00 0%, #e65100 100%);">
                    <h1>LeetVision</h1>
                    <p>Your daily coding digest</p>
                </div>
                <div class="body">
                    <h2>Good ${new Date().getHours() < 12 ? 'morning' : 'evening'}, ${user.name || 'champ'}! ☀️</h2>
                    <p>Quick reminder: <em>the engineers who get hired aren't the smartest ones in the room.</em></p>
                    <p>They're the most prepared. And preparation is just showing up, one day at a time.</p>
                    <p>Today's challenge, should you choose to accept it:</p>
                    <div class="highlight-box">
                        <p>🎯 Solve <em>just one problem</em> from a company you want to work at.<br>
                           <span style="color:#888; font-size:0.9rem;">Not ten. Not a full mock interview. Just one.</span></p>
                    </div>
                    <p>Small actions. Big results. That's the LeetVision way.</p>
                    <a href="${SITE_URL}/explore" class="cta">Pick My Problem →</a>
                </div>
                ${makeFooter(`${API_URL}/unsubscribe?token=${token}`)}
            </div>
        </body></html>`
    },

    // ─── MARKETING #2 (Premium) ───────────────────────────────────────────
    {
        id: 'marketing_premium',
        type: 'marketing',
        subject: '👑 Unlock the full power of LeetVision',
        html: (user, token) => `<!DOCTYPE html><html><head>${baseStyle}</head><body>
            <div class="wrapper">
                <div class="header" style="background: linear-gradient(135deg, #1a1a1a, #2a2a2a); border-bottom: 2px solid #f57c00;">
                    <h1 style="color:#f57c00;">👑 Go Premium</h1>
                    <p style="color:#888;">Built for serious candidates</p>
                </div>
                <div class="body">
                    <h2>Hey ${user.name || 'future engineer'},</h2>
                    <p>Free tier got you this far. But the companies you're targeting? They want someone who goes the extra mile.</p>
                    <div class="highlight-box">
                        <p>🏢 <em>Company-Wise Questions</em> — see exactly what Google, Amazon, Meta ask</p>
                    </div>
                    <div class="highlight-box">
                        <p>📊 <em>Progress Tracking</em> — sync with LeetCode & GFG, measure your growth</p>
                    </div>
                    <div class="highlight-box">
                        <p>⚡ <em>All 4+ Platforms</em> — LeetCode, GFG, HackerRank, CodeChef unlocked</p>
                    </div>
                    <p>Premium is built for people who are serious about landing the job they want.</p>
                    <a href="${SITE_URL}/pricing" class="cta">🚀 Upgrade to Premium →</a>
                    <p style="text-align:center; color:#555; font-size:0.85rem;">Cancel anytime. No questions asked.</p>
                </div>
                ${makeFooter(`${API_URL}/unsubscribe?token=${token}`)}
            </div>
        </body></html>`
    },

    // ─── FUNNY #3 (Interview Horror) ────────────────────────────────────────
    {
        id: 'funny_horror',
        type: 'funny',
        subject: '😱 This is a dramatized recreation of your next interview...',
        html: (user, token) => `<!DOCTYPE html><html><head>${baseStyle}</head><body>
            <div class="wrapper">
                <div class="header" style="background: #0d0d0d; border-bottom: 2px solid #f57c00;">
                    <h1 style="color:#f57c00;">⚠️ LeetVision</h1>
                    <p style="color:#666;">Sending you a warning, not a scare</p>
                </div>
                <div class="body">
                    <span class="emoji-big">😰</span>
                    <h2>Interviewer: "Can you reverse a linked list?"</h2>
                    <p><em>Unprepared you:</em> "Uh... sure, I just... um... the head becomes the tail... I think?"</p>
                    <p><em>Prepared you (after LeetVision):</em> "Absolutely. Three-pointer approach, O(n) time, O(1) space."</p>
                    <br>
                    <p>Which version do you want to be in the room?</p>
                    <p>We've got video walkthroughs for <em>every classic interview problem</em> — explained clearly, solved efficiently.</p>
                    <a href="${SITE_URL}" class="cta">🛡️ Prepare Me →</a>
                    <p style="text-align:center; color:#555; font-size:0.85rem;">(Your future self will thank you. Sincerely.)</p>
                </div>
                ${makeFooter(`${API_URL}/unsubscribe?token=${token}`)}
            </div>
        </body></html>`
    }
];

/**
 * Get a random campaign template
 */
const getRandomCampaign = () => {
    return campaigns[Math.floor(Math.random() * campaigns.length)];
};

/**
 * Get a campaign by ID
 */
const getCampaignById = (id) => {
    return campaigns.find(c => c.id === id) || campaigns[0];
};

module.exports = { campaigns, getRandomCampaign, getCampaignById };
