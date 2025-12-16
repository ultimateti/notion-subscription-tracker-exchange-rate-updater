require("dotenv").config();
const { getExchangeRate } = require("./lib/exchangeRate");

const databaseId = process.env.NOTION_DATABASE_ID;
console.log(databaseId);

const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
let exchangeRate = {};

exports.main = async (args) => {
  const databaseResponse = await notion.databases.retrieve({
    database_id: databaseId,
  });
  const datasouceResponse = await notion.dataSources.query({
    data_source_id: databaseResponse.data_sources[0].id,
  });
  for (let page of datasouceResponse.results) {
    const pageId = page.id;
    const pageProps = page.properties;
    if (pageProps.Currency.rich_text.length > 0) {
      let pageCurrency = pageProps.Currency.rich_text[0].plain_text;
      if (exchangeRate[pageCurrency] == null) {
        exchangeRate[pageCurrency] = await getExchangeRate(
          pageCurrency,
          pageProps.CURRENCY_THB_DIVIDER.formula.number
        );
      }

      if (exchangeRate[pageCurrency] != -1) {
        await notion.pages.update({
          page_id: pageId,
          properties: {
            COST_THB: {
              number: Number(
                (pageProps.Costs.number * exchangeRate[pageCurrency]).toFixed(2)
              ),
            },
          },
        });
      }
      console.log("process page ID: ", pageId);
    }
  }
};
