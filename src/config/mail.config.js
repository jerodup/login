import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const verificationEmail = async (to, token) => {
  try {
    const url = `http://localhost:3000/api/auth/verify/${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"${process.env.MAIL_NAME || "Mi App"}" <${process.env.MAIL_USER}>`,
      to,
      subject: "Verificá tu correo",
      html: `
        <h1 style="color:#333;">¡Bienvenido!</h1>
        <p>Para activar tu cuenta hacé clic en el botón:</p>
        <a href="${url}" 
          target="_blank" 
          style="
            display:inline-block;
            background-color:#007bff;
            color:#fff;
            padding:10px 20px;
            text-decoration:none;
            border-radius:6px;
            font-weight:bold;
          ">Verificar correo</a>
        <p>O copiá este enlace en tu navegador:</p>
        <p>${url}</p>
      `,
    });

    return `Message sent: ${info.messageId}`;
  } catch (error) {
    console.error("❌ Error enviando mail:", error);
    throw new Error("No se pudo enviar el correo de verificación");
  }
};

export const resetPasswordEmail = async (to, token) => {
  try {
    const url = `http://localhost:5173/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"${process.env.MAIL_NAME || "Mi App"}" <${process.env.MAIL_USER}>`,
      to,
      subject: "Restablecé tu contraseña",
      html: `
        <h1 style="color:#333;">¿Olvidaste tu contraseña?</h1>
        <p>Hacé clic en el botón para restablecerla. Este enlace expira en 1 hora.</p>
        <a href="${url}"
          target="_blank"
          style="
            display:inline-block;
            background-color:#ef4444;
            color:#fff;
            padding:10px 20px;
            text-decoration:none;
            border-radius:6px;
            font-weight:bold;
          ">Restablecer contraseña</a>
        <p>O copiá este enlace en tu navegador:</p>
        <p>${url}</p>
      `,
    });

    return `Message sent: ${info.messageId}`;
  } catch (error) {
    console.error("❌ Error enviando mail de reset:", error);
    throw new Error("No se pudo enviar el correo de restablecimiento");
  }
};