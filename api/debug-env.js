export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  return res.status(200).json({
    hasResendKey: !!process.env.RESEND_API_KEY,
    keyPrefix: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.substring(0, 6) + '...' : 'NOT SET',
    nodeEnv: process.env.NODE_ENV,
    allEnvKeys: Object.keys(process.env).filter(k => k.includes('RESEND') || k.includes('resend')),
  })
}
