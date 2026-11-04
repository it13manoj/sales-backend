"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const email_channel_1 = require("./email.channel");
const linkedin_channel_1 = require("./linkedin.channel");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
const emailChannel = new email_channel_1.EmailChannel();
const linkedinChannel = new linkedin_channel_1.LinkedInChannel();
router.use(auth_middleware_1.authenticate);
router.post('/test-email', async (req, res) => {
    const { to, subject, message } = req.body;
    const result = await emailChannel.send({
        to: to || req.user.email,
        subject: subject || 'Test Outbound Email',
        html: `<p>${message || 'This is a test outbound email sent from Outbound Sales Platform.'}</p>`,
    });
    res.json({ success: true, result });
});
router.post('/test-linkedin', async (req, res) => {
    const { linkedinUrl, note } = req.body;
    const result = await linkedinChannel.sendConnectRequest(linkedinUrl || 'https://linkedin.com/in/test-lead', note);
    res.json({ success: true, result });
});
exports.default = router;
