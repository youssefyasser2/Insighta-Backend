class DateUtils {
    static formatDate(date, locale = "ar-EG") {
      return new Date(date).toLocaleString(locale);
    }

    static isExpired(date) {
      return new Date(date) < new Date();
    }
  }

  module.exports = DateUtils;


