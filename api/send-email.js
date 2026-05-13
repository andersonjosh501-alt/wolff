import { Resend } from 'resend'

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Content-Type', 'application/json')

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY is not configured' })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    const { to, subject, message, clientName, firmName } = req.body

    if (!to || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, message' })
    }

    // Use firm name from settings, fallback to "Wolff"
    const senderName = firmName || 'Wolff'

    const { data, error } = await resend.emails.send({
      from: `${senderName} <noreply@wolffhq.com>`,
      to: [to],
      subject,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="margin-bottom: 32px;">
            <div style="display: inline-flex; align-items: center; gap: 8px;">
              <div style="width: 32px; height: 32px; background-color: #6b8f71; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                <span style="color: white; font-weight: bold; font-size: 14px;">${senderName.charAt(0).toUpperCase()}</span>
              </div>
              <span style="font-size: 18px; font-weight: 600; color: #1a1a1a;">${senderName}</span>
            </div>
          </div>
          <div style="color: #374151; font-size: 15px; line-height: 1.7;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
          <p style="color: #9ca3af; font-size: 12px;">
            This email was sent by ${senderName}. If you have questions, reply directly to this email.
          </p>
        </div>
      `,
    })

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ success: true, id: data.id })
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to send email' })
  }
}
