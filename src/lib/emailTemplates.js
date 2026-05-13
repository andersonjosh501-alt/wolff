// Default email templates with variable support
// Variables: {client_name}, {firm_name}, {preparer_name}, {document_list}

export const defaultEmailTemplates = {
  status_update: {
    name: 'Status Update',
    subject: 'Tax Return Status Update — {firm_name}',
    body: `Hi {client_name},

Just a quick update on your tax return.

Current status: In Progress. We're working through your documents and will keep you posted on any changes.

Don't hesitate to reach out if you have questions.

Best regards,
{preparer_name}
{firm_name}`,
  },
  request_docs: {
    name: 'Request Missing Documents',
    subject: 'Action Needed: Missing Documents for Your Tax Return',
    body: `Hi {client_name},

We're preparing your tax return and are still missing the following documents:

{document_list}

Please upload them through your secure client portal at your earliest convenience, or reply to this email with the documents attached.

Thank you,
{preparer_name}
{firm_name}`,
  },
  request_bank: {
    name: 'Request Bank Information',
    subject: 'Bank Information Needed for Direct Deposit — {firm_name}',
    body: `Hi {client_name},

Your tax return is nearly complete. To set up direct deposit for your refund, we need your bank account information.

Please provide your routing number and account number through your secure client portal. Your information is encrypted and protected.

If you prefer a paper check, just let us know.

Best regards,
{preparer_name}
{firm_name}`,
  },
  ready_pickup: {
    name: 'Ready for Pickup',
    subject: 'Your Tax Return is Ready! — {firm_name}',
    body: `Hi {client_name},

Great news — your tax return is complete and ready for pickup!

Please contact us to arrange a time, or let us know if you'd like us to mail it to you.

Thank you for choosing {firm_name}. We appreciate your trust in us.

Best regards,
{preparer_name}
{firm_name}`,
  },
}

export const templateVariables = [
  { key: '{client_name}', desc: "Client's first name" },
  { key: '{firm_name}', desc: 'Your firm name' },
  { key: '{preparer_name}', desc: 'Preparer / sender name' },
  { key: '{document_list}', desc: 'List of missing documents' },
]

// Interpolate variables into a template string
export function interpolateTemplate(template, vars) {
  let result = template
  result = result.replace(/\{client_name\}/g, vars.clientName || '')
  result = result.replace(/\{firm_name\}/g, vars.firmName || '')
  result = result.replace(/\{preparer_name\}/g, vars.preparerName || '')
  result = result.replace(/\{document_list\}/g, vars.documentList || '')
  return result
}
