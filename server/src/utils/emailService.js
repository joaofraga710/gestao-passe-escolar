const SENDGRID_ENDPOINT = 'https://api.sendgrid.com/v3/mail/send';

const sendPdfByEmail = async (studentName, destinationEmail, pdfBase64) => {
  if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM) {
    throw new Error('SENDGRID_API_KEY/SENDGRID_FROM nao configurados no ambiente.');
  }

  if (!destinationEmail || !pdfBase64) return;

  const base64Data = pdfBase64.replace(/^data:application\/pdf;base64,/, "").trim();

  if (!base64Data || base64Data.length === 0) {
    throw new Error('PDF base64 vazio ou inválido.');
  }

  const mailOptions = {
    personalizations: [
      {
        to: [{ email: destinationEmail }],
        subject: `📄 Carteirinha Digital - ${studentName}`
      }
    ],
    from: { email: process.env.SENDGRID_FROM },
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e1e4e8; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #003366; padding: 20px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0;">Transporte Escolar - Imbé</h2>
        </div>
        <div style="padding: 20px; background-color: #f6f8fa;">
          <p>Olá,</p>
          <p>Segue em anexo a carteirinha de passe escolar do(a) aluno(a) <strong>${studentName}</strong> gerada pelo sistema.</p>
          <p>Por favor, realize a impressão ou o repasse ao responsável.</p>
          <br>
          <p style="font-size: 12px; color: #6e7681;">Este é um e-mail automático do sistema. Por favor, não responda.</p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `Carteirinha_${studentName.replace(/\s+/g, '_')}.pdf`,
        content: base64Data,
        type: 'application/pdf'
      }
    ]
  };

  const payload = {
    personalizations: mailOptions.personalizations,
    from: mailOptions.from,
    content: [{ type: 'text/html', value: mailOptions.html }],
    attachments: mailOptions.attachments
  };

  const response = await fetch(SENDGRID_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SendGrid error: ${response.status} ${errorText}`);
  }
};

export { sendPdfByEmail };