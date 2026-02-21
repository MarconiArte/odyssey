import nodemailer from "nodemailer";

export default async (req, context) => {
  // Permitir solo POST
  if (req.method !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Método no permitido" }),
    };
  }

  try {
    const { name, email, project, message } = JSON.parse(req.body);

    // Validar campos
    if (!name || !email || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Faltan campos obligatorios" }),
      };
    }

    // Configurar transportador de email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Email para ti (administrador)
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: "contacto.odysseydev@gmail.com",
      subject: `Nuevo contacto de ${name}`,
      html: `
        <h2>Nuevo mensaje de contacto</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Tipo de Proyecto:</strong> ${project || "No especificado"}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    };

    // Email de confirmación para el usuario
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Hemos recibido tu mensaje - Odyssey",
      html: `
        <h2>¡Gracias por contactarnos!</h2>
        <p>Hola ${name},</p>
        <p>Hemos recibido tu mensaje y nos pondremos en contacto pronto.</p>
        <p>Mientras tanto, si tienes más preguntas, puedes responder a este email.</p>
        <br>
        <p>Saludos,<br>El equipo de Odyssey</p>
      `,
    };

    // Enviar ambos emails
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userMailOptions);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Email enviado correctamente",
      }),
    };
  } catch (error) {
    console.error("Error al enviar email:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error al enviar el email",
        details: error.message,
      }),
    };
  }
};
