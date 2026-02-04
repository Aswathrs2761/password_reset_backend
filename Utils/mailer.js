import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendmail = async (to, subject, text) => {
  const msg = {
    to,
    from: process.env.PASS_MAIL,   // ✅ match your env
    subject,
    text,
  };

  await sgMail.send(msg);
};

export default sendmail;
