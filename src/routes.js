
const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator/check')
const { matchedData } = require('express-validator/filter')
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const mongoDB = 'mongodb://127.0.0.1/marco_ex_1';

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));


const Message = mongoose.model('Message', {
  name: String,
  message: String,
  email: String,
  checkNews: String,
  inserAt: Date
})

router.get('/', (req, res) => {
  res.render('index')
})

router.get('/contact', csrfProtection, (req, res) => {
  res.render('contact', {
    data: {},
    errors: {},
    errorMap: {},
    csrfToken: req.csrfToken()
  });
});

router.get('/message', (req, res) => {
    Message.find({}, function(err, data) {
      //console.log(data);
        res.render('message.ejs', {
            messages: data
        });
    });
});

router.post('/contact', csrfProtection, [
  check('message')
  .isLength({ min: 1 })
  .withMessage('Message is required')
  .trim(),
  check('name')
  .isLength({ min: 1 })
  .withMessage('Name is required')
  .trim(),
  check('email')
  .isEmail()
  .withMessage('That email doesn‘t look right')
  .trim()
  .normalizeEmail(),
  check('checkNews')
  ], (req, res, next) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.render('contact', {
        data: req.body,
        errors: errors.array(),
        errorMap: errors.mapped(),
        csrfToken: req.csrfToken()
      })
    }

    const data = matchedData(req)
    console.log('Sanitized: ', data)

    const transporter = nodemailer.createTransport({
      service: 'hotmail',
      auth: {
        user: 'youremail@email.com',
        pass: 'yourpassword'
      }
    });

    const mailOptions = {
      from: 'youremail@email.com',
      to: req.body.email,
      subject: 'Sending Email using Node.js',
      // text: `${req.body.name} wants to contact you about ${req.body.message}. She will ${req.body.checkNews}`
      html: `<div><h1>${req.body.name}</h1> wants to contact you about ${req.body.message}. He/She has ${req.body.checkNews ? 'subscribed' : 'decided not to subscribe'}</div>`
    };

    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        //console.log(error);
      } else {
        //console.log('Email sent: ' + info.response);
      }
    });

    let newDate = new Date();
    const SaveMessage = new Message({ name: data.name, message: data.message, email: data.email, checkNews: data.checkNews, inserAt: newDate });
    //console.log(SaveMessage);
    SaveMessage.save((err) => {
      if (err) {
        //sendStatus(500)
      }
      console.log(req.body);
      // res.sendStatus(200)
    })

    req.flash('success', 'Thanks for the message! I‘ll be in touch :)')
    res.redirect('/')

  })

module.exports = router
