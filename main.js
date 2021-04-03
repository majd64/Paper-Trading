const Discord = require('discord.js');
const axios = require('axios');

const client = new Discord.Client();
client.login(process.env.LOGIN);
client.once('ready', () => {
  console.log("Cardano bot is running");
  updatePrice();
});

const formatter = new Intl.NumberFormat('en-US', {style: 'currency',currency: "USD",minimumFractionDigits: 2});

function updatePrice(){
  axios.get("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=cardano&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=1h%2C24h")
  .then(res => {
    client.user.setActivity(`${formatter.format(res.data[0].current_price)}`, { type: 'WATCHING' });
  });
  setTimeout(updatePrice, 10000);
}
