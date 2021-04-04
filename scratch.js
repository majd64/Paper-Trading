else if (command === "buy"){
  user.openOrder = undefined;

  const input = util.parseInput(args)

  if (!input){
    message.channel.send(`Invalid input. To buy use the command *${prefix}buy 100 ada*`);
    return
  }

  price(input.symbol, async price => {
    if (!price){
      message.channel.send("Invalid symbol")
      return
    }

    if (input.amount === -1){
      const index = await user.wallet.findIndex(x => x.symbol.toUpperCase() === input.symbol.toUpperCase())
      input.amount = user.wallet[index].amount
    }

    message.channel.send(`Are you sure you want to buy ${input.amount} ${input.symbol}. Price of ${input.symbol} is ${formatter.format(price)}. Total will be ${formatter.format(price * input.amount)}. (${prefix}yes or ${prefix}no)`)
    user.openOrder = {order: "marketbuy", symbol: input.symbol, amount: input.amount, price: price}
    user.save();
  })
  await user.save();
}

else if (command === "sell"){
  user.openOrder = undefined;

  const input = util.parseInput(args)

  if (!input){
    message.channel.send(`Invalid input. To sell use the command *${prefix}sell 100 ada*`);
    return
  }

  price(input.symbol, async price => {
    if (!price){
      message.channel.send("Invalid symbol")
      return
    }

    if (input.amount === -1){
      const index = await user.wallet.findIndex(x => x.symbol.toUpperCase() === input.symbol.toUpperCase())
      input.amount = user.wallet[index].amount
    }

    message.channel.send(`Are you sure you want to sell ${input.amount} ${input.symbol}. Price of ${input.symbol} is ${formatter.format(price)}. Total will be ${formatter.format(price * input.amount)}. (${prefix}yes or ${prefix}no)`)
    user.openOrder = {order: "marketsell", symbol: input.symbol, amount: input.amount, price: price}
    user.save();
  })
  await user.save();
}
