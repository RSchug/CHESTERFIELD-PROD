/**
 * Format the input number into currency format ($9.99) for easy reading of dollar amounts.
 * @param  {float} num [Number to format]
 * @return {string} Dollar formatted string.
 */
function currencyFormat(num) {
    return "$" + num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
}