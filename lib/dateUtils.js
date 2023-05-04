const date = require("date-and-time");

exports.getYesterday = async () => {
  return date.format(date.addDays(new Date(), -1), "YYYY-MM-DD");
};
