const Discord = require('discord.js');
const axios = require('axios');
require('custom-env').env('staging');
let models = require("./models");
const mongoose = require("mongoose");

const client = new Discord.Client();
client.login(process.env.LOGIN);
client.once('ready', () => {
  console.log("Paper Trading Bot is running");
});

mongoose.connect("mongodb+srv://admin:" + process.env.ATLASPASSWORD + "@cluster0.xpbd4.mongodb.net/" + process.env.ATLASUSER, {useNewUrlParser: true, useUnifiedTopology: true});

const formatter = new Intl.NumberFormat('en-US', {style: 'currency',currency: "USD",minimumFractionDigits: 2});

const prefix = ".";

client.on ('message', async message => {
  if (!message.content.startsWith(prefix)) return

  var user = await models.User.findOne({'id': message.author.id}).exec();
  if (user == null){
    const newUser = new models.User({
      id: message.author.id,
      usdbalance: 10000,
      wallet: [],
      openOrder: undefined
    });
    user = newUser;
  }

  await user.save();

  const args = message.content.slice(prefix.length).split(" ");
  const command = args.shift().toLowerCase();

  if (command === "price"){
    price(args[0], price => {
      if (!price){
        message.channel.send("Invalid symbol")
        return
      }
      message.channel.send(formatter.format(price))
    })
  }

  else if (command === "balance"){
    var itemsImbed = new Discord.MessageEmbed()
    itemsImbed.addField(`USD Balance`, formatter.format(user.usdbalance));
    message.channel.send(itemsImbed);
  }

  else if (command === "buy"){
    user.openOrder = undefined;

    if (args.length != 2){
      message.channel.send("Invalid command")
      return
    }

    const symbol = args[0].toUpperCase()
    const amount = args[1]

    price(symbol, price => {
      if (!price){
        message.channel.send("Invalid symbol.")
        return
      }
      message.channel.send(`Are you sure you want to purchase ${amount} ${symbol}. Price of ${symbol} is ${formatter.format(price)}. Total will be ${formatter.format(price * amount)}. (.yes or .no)`)
      user.openOrder = {order: "marketbuy", symbol: symbol, amount: amount, price: price}
      user.save();
    })
    await user.save();
  }

  else if (command === "sell"){
    user.openOrder = undefined;

    if (args.length != 2){
      message.channel.send("Invalid command")
      return
    }

    const symbol = args[0].toUpperCase()
    const amount = args[1]

    price(symbol, price => {
      if (!price){
        message.channel.send("Invalid symbol.")
        return
      }
      message.channel.send(`Are you sure you want to sell ${amount} ${symbol}. Price of ${symbol} is ${formatter.format(price)}. Total will be ${formatter.format(price * amount)}. (.yes or .no)`)
      user.openOrder = {order: "marketsell", symbol: symbol, amount: amount, price: price}
      user.save();
    })
    await user.save();
  }

  else if (command === "yes"){
    let order = user.openOrder
    if (!order){
      message.channel.send("No open orders")
      return
    }

    if (order.order === "marketbuy"){
      if (order.amount * order.price > user.usdbalance){
        message.channel.send("Not enough funds")
        return
      }
      user.usdbalance = user.usdbalance - order.amount * order.price
      const index = user.wallet.findIndex(x => x.symbol === order.symbol)

      if (index === -1){
        user.wallet.push({symbol: order.symbol, amount: order.amount})
      }else{
        user.wallet[index].amount += order.amount
      }
    }

    else if (order.order === "marketsell"){
      const index = user.wallet.findIndex(x => x.symbol === order.symbol)

      if (index === -1){
        message.channel.send(`You have no ${order.symbol.toUpperCase()}`)
        return
      }

      coin = user.wallet[index]

      console.log(coin.amount)
      if (order.amount > coin.amount){
        message.channel.send("Not enough funds")
        return
      }
      user.usdbalance = user.usdbalance + (order.amount * order.price)

      user.wallet[index].amount = user.wallet[index].amount - order.amount
    }

    user.openOrder = undefined
    await user.save();
    message.channel.send("Success!")
  }

  else if (command === ".no"){
      user.openOrder = undefined
      await user.save();

      message.channel.send("order canclled")
  }

  else if (command === "wallet"){
    var itemsImbed = new Discord.MessageEmbed()
    itemsImbed.addField("USD", formatter.format(user.usdbalance));
    user.wallet.forEach((coin, j) => {
      price(coin.symbol, price => {
        itemsImbed.addField(`${coin.symbol.toUpperCase()}`, `Amount: ${coin.amount}\n value: ${formatter.format(coin.amount * price)}`);
        console.log(itemsImbed)
        if (itemsImbed.fields.length === user.wallet.length + 1){
          message.channel.send(itemsImbed);
        }
      })
    });
  }
});

function price(symbol, callback){
  axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol.toUpperCase()}USDT`)
    .then(res => {
      if (!res.data.price){
        callback(null)
        return
      }
      callback(res.data.price)
    })
    .catch(err => {
      callback(null)
    })
}
