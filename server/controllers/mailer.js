// import nodemailer from 'nodemailer'
// import Mailgen from 'mailgen';

// import ENV from '../config.js'
// import Mail from 'nodemailer/lib/mailer';



// // https://ethernal.mail.create

// let nodeConfig = {
//     host: "smtp.ethernal.email",
//     port: 587,
//     secure : false,
//     auth : {
//         user: ENV.EMAIL,
//         pass: ENV.PASSWORD,
//     }
// }

// let transporter = nodemailer.createTransport(nodeConfig);

// let Mailgenerator = new Mailgen({
//     theme: "default",
//     product: {
//         name: "Mailgen",
//         link: 'https::/mailgen.js/'
//     }
// })


// export const registerMail = async(req,res) => {
//     const {username, userEmail, text,subject } = req.body;


//     // body of the email
//     var email = {
//         body : {
//             name: username,
//             intro : text || "Hi, I am Durga Manikanta Sai",
//             outro: "Need help,or have questions? Just reply to this email"
//         }
//     }


//     var emailBody = Mailgenerator.generate(email);

//     let message = {
//         from: ENV.EMAIL,
//         to : userEmail,
//         subject: subject || "Signup Successful",
//         html: emailBody
//     }


//     transporter.sendMail(message)
//         .then(() => {
//             return res.status(200).send({msg:"You should receive and email from us"})
//         })
//         .catch(error =>  res.status(500).send({error}))
// }