const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  id: String,
  usdbalance: Number,
  wallet: [{
    symbol: String,
    amount: Number
  }],
  openOrder: {order: String, symbol: String, amount: Number, price: Number}
});

const dataSchema = new mongoose.Schema({
  numberOfCommands: Number,
  date: String
});

const Data = mongoose.model("Data", dataSchema);
const User = mongoose.model("User", userSchema);

module.exports = {User, Data};