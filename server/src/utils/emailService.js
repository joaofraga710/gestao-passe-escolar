const RESEND_ENDPOINT = 'https://api.resend.com/emails';

const sendPdfByEmail = async (studentName, destinationEmail, pdfBase64) => {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM) {
    throw new Error('RESEND_API_KEY/RESEND_FROM nao configurados no ambiente.');
  }

  if (!destinationEmail || !pdfBase64) return;

  const base64Data = pdfBase64.replace(/^data:application\/pdf;base64,/, "");

  const mailOptions = {
    from: process.env.RESEND_FROM,
    to: [destinationEmail],
    subject: `📄 Carteirinha Digital - ${studentName}`,
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
        content_type: 'application/pdf'
      }
    ]
  };

  const response = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(mailOptions)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend error: ${response.status} ${errorText}`);
  }
};

export { sendPdfByEmail };