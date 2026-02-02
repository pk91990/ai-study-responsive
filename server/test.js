import transporter from "./config/nodemailer.js";

// Create a test account or replace with real credentials.


// Wrap in an async IIFE so we can use await.
(async () => {
  const info = await transporter.sendMail({
    from: 'sharmak61163@gmail.com',
    to: "priyanshuraj91990@gmail.com",
    subject: "Hello ✔",
    text: "Hello world?", // plain‑text body
    html: "<b>Hello world?</b>", // HTML body
  });

  console.log("Message sent:", info.messageId);
})();



const mailOption = {
          from: process.env.SENDER_EMAIL, // your email from .env
          to: "priyanshu91990@getMaxListeners.com", // send to the registered user's email
          subject: 'Welcome to our website',
          text: `Hi , welcome to our website!`,
          html: `<p>Hi <b></b>, welcome to our website!</p>`,
        };