const mongoose = require("mongoose");

const uri = process.env.MONGODB_URI;

mongoose.connect(uri, () => {
  console.log("connexion ok !");
});

mongoose.connection.on("error", (e: Error) =>
  console.log(e),
);

module.exports = mongoose;
