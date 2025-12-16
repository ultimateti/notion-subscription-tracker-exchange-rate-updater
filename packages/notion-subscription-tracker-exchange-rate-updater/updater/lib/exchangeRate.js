const { getYesterday } = require("./dateUtils");

const BOTAPIToken = process.env.BOT_API_TOKEN;

exports.getExchangeRate = async (currency, divider) => {
  const BOTEndpoint =
    "https://gateway.api.bot.or.th/Stat-ExchangeRate/v2/DAILY_AVG_EXG_RATE/?";

  try {
    const response = await fetch(
      BOTEndpoint +
        new URLSearchParams({
          start_period: await getYesterday(),
          end_period: await getYesterday(),
          currency: currency,
        }),
      {
        method: "GET",
        headers: {
          Authorization: BOTAPIToken,
        },
      }
    );
    try {
      const respJson = await response.json();
      const rateString = respJson.result.data.data_detail[0].selling;
      if (rateString === "") {
        console.log("There is no exchange rate for ", currency, " yesterday");
        return -1;
      }
      const exchangeRate =
        parseFloat(respJson.result.data.data_detail[0].selling) / divider;
      console.log(
        "Get exchange rate of ",
        currency,
        " from BOT: ",
        exchangeRate
      );
      return exchangeRate;
    } catch (e) {
      if (e instanceof SyntaxError) {
        // Unexpected token < in JSON
        console.log("There was a SyntaxError", e);
        return -1;
      } else {
        console.log("There was an error", e);
        return -1;
      }
    }
  } catch (e) {
    console.log("Fetch error ", e);
    return -1;
  }
};
