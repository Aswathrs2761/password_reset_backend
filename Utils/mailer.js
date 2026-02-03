    import nodemailer from "nodemailer";
    import dotenv from "dotenv";

    dotenv.config()

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.PASS_MAIL,
            pass: process.env.PASS_KEY,
        },
    })

    const Mail = async (to, subject, text) => {
        const mailOptions = {
            from: process.env.PASS_MAIL,
            to,
            subject,
            text,
        }
        try {
            await transporter.sendMail(mailOptions)
            console.log("Email sent Successfully")

        } catch (error) {
            console.error("Error sending Email", error)
            throw error
        }
    };

    export default Mail