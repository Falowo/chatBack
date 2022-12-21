const mongoose = require("mongoose");

const uri = process.env.MONGODB_URI;

mongoose.set("strictQuery", false);

mongoose.connection.on("error", (e: Error) =>
  console.log(e),
);

mongoose.connect(uri, () => {
  console.log("connexion ok !");
});

module.exports = mongoose;
