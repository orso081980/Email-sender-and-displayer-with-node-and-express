const mongoose = require('mongoose');

const mongoDB = 'mongodb://127.0.0.1/marco_ex_1';
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

console.log(db);

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const Message = mongoose.model('Message', {
  name: String,
  message: String,
  email: String,
  checkNews: String
})

module.exports = Message