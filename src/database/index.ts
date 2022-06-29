const mongoose = require("mongoose");

const uri = process.env.MONGODB_URI;

mongoose
  .connect(uri)
  .then(() => {
    console.log("connexion ok !");
  })
  .catch((err) => {
    console.log(err);
  });

module.exports = mongoose;
