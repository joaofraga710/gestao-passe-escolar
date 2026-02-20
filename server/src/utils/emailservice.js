const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendPdfByEmail = async (studentName, destinationEmail, pdfBase64) => {
  if (!destinationEmail || !pdfBase64) return;

  const base64Data = pdfBase64.replace(/^data:application\/pdf;base64,/, "");

  const mailOptions = {
    from: `"Transporte Escolar - Imbé" <${process.env.EMAIL_USER}>`,
    to: destinationEmail,
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
        encoding: 'base64',
        contentType: 'application/pdf'
      }
    ]
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendPdfByEmail };