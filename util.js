function parseInput(input){
  if (input.length != 2){
    return null
  }

  input1 = input[0]
  input2 = input[1]

  if (isNaN(input1) && !isNaN(input2)){
    return {symbol: input1, amount: input2}
  }else if (!isNaN(input1) && isNaN(input2)){
    return {symbol: input2.toUpperCase(), amount: input1}
  }else{
    if (input1.toLowerCase() === "max"){
      return {symbol: input2.toUpperCase(), amount: -1}
    }
    else if (input2.toLowerCase() === "max"){
      return {symbol: input1.toUpperCase(), amount: -1}
    }
    return null
  }
}

module.exports = {parseInput};
