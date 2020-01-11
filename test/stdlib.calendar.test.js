require("set-tz")("UTC");

const { createTestUtil } = require("./utils");

const { expectOutput } = createTestUtil({
  prefix: "吾嘗觀「「曆法」」之書。",
  suffix: "書之"
});

describe("stdlib", () => {
  describe("calendar", () => {
    describe("2001-02-03T04:05:06.789Z", () => {
      it("言彼之日時", () => {
        expectOutput(
          "方悟「言彼之日時」之義。施「言彼之日時」於九八一一七三一〇六·七八九",
          "西元二〇〇一年辛巳年正月十一日丁酉日寅正初刻五分六秒"
        );
      });

      it("言彼之年月日", () => {
        expectOutput(
          "方悟「言彼之年月日」之義。施「言彼之年月日」於九八一一七三一〇六·七八九",
          "西元二〇〇一年辛巳年正月十一日丁酉日"
        );
      });

      it("言彼之時刻", () => {
        expectOutput(
          "方悟「言彼之時刻」之義。施「言彼之時刻」於九八一一七三一〇六·七八九",
          "寅正初刻五分六秒"
        );
      });

      it("彼年何年號", () => {
        expectOutput(
          "方悟「彼年何年號」之義。施「彼年何年號」於九八一一七三一〇六·七八九",
          "西元"
        );
      });

      it("彼年何年", () => {
        expectOutput(
          "方悟「彼年何年」之義。施「彼年何年」於九八一一七三一〇六·七八九",
          "二千零一"
        );
      });

      it("彼年何干支", () => {
        expectOutput(
          "方悟「彼年何干支」之義。施「彼年何干支」於九八一一七三一〇六·七八九",
          "一十八"
        );
      });

      it("彼年積何年", () => {
        expectOutput(
          "方悟「彼年積何年」之義。施「彼年積何年」於九八一一七三一〇六·七八九",
          "四千六百九十八"
        );
      });

      it("彼月何月", () => {
        expectOutput(
          "方悟「彼月何月」之義。施「彼月何月」於九八一一七三一〇六·七八九",
          "一"
        );
      });

      it("彼月積何月", () => {
        expectOutput(
          "方悟「彼月積何月」之義。施「彼月積何月」於九八一一七三一〇六·七八九",
          "五萬八千一百零六"
        );
      });

      it("彼日何日", () => {
        expectOutput(
          "方悟「彼日何日」之義。施「彼日何日」於九八一一七三一〇六·七八九",
          "一十一"
        );
      });

      it("彼日何干支", () => {
        expectOutput(
          "方悟「彼日何干支」之義。施「彼日何干支」於九八一一七三一〇六·七八九",
          "三十四"
        );
      });

      it("彼日積何日", () => {
        expectOutput(
          "方悟「彼日積何日」之義。施「彼日積何日」於九八一一七三一〇六·七八九",
          "一百七十一萬五千九百一十四"
        );
      });

      it("彼時何時", () => {
        expectOutput(
          "方悟「彼時何時」之義。施「彼時何時」於九八一一七三一〇六·七八九",
          "三"
        );
      });

      it("彼時何小時", () => {
        expectOutput(
          "方悟「彼時何小時」之義。施「彼時何小時」於九八一一七三一〇六·七八九",
          "四"
        );
      });

      it("彼刻何刻", () => {
        expectOutput(
          "方悟「彼刻何刻」之義。施「彼刻何刻」於九八一一七三一〇六·七八九",
          "零"
        );
      });

      it("彼分何分", () => {
        expectOutput(
          "方悟「彼分何分」之義。施「彼分何分」於九八一一七三一〇六·七八九",
          "五"
        );
      });

      it("彼秒何秒", () => {
        expectOutput(
          "方悟「彼秒何秒」之義。施「彼秒何秒」於九八一一七三一〇六·七八九",
          "六"
        );
      });
    });

    describe("1970-01-01T00:00:00Z", () => {
      it("言彼之日時", () => {
        expectOutput(
          "方悟「言彼之日時」之義。施「言彼之日時」於零",
          "西元一九六九年己酉年十一月二十四日辛巳日子正初刻"
        );
      });

      it("言彼之日時", () => {
        expectOutput(
          "方悟「言彼之日時」之義。施「言彼之日時」於零",
          "西元一九六九年己酉年十一月二十四日辛巳日子正初刻"
        );
      });
    });

    describe("Year boundary", () => {
      it("言彼之年月日", () => {
        expectOutput(
          "方悟「言彼之年月日」之義。施「言彼之年月日」於一五七九九一〇三九九",
          "西元二〇一九年己亥年十二月三十日丙寅日"
        );
      });

      it("言彼之年月日", () => {
        expectOutput(
          "方悟「言彼之年月日」之義。施「言彼之年月日」於一五七九九一〇四〇〇",
          "西元二〇二〇年庚子年正月初一日丁卯日"
        );
      });
    });

    describe("Leap month", () => {
      it("言彼之年月日", () => {
        expectOutput(
          "方悟「言彼之年月日」之義。施「言彼之年月日」於一五九〇一九一九九九",
          "西元二〇二〇年庚子年四月三十日乙丑日"
        );
      });

      it("彼月何月", () => {
        expectOutput(
          "方悟「彼月何月」之義。施「彼月何月」於一五九〇一九一九九九",
          "四"
        );
      });

      it("彼月積何月", () => {
        expectOutput(
          "方悟「彼月積何月」之義。施「彼月積何月」於一五九〇一九一九九九",
          "五萬八千三百四十四"
        );
      });

      it("言彼之年月日", () => {
        expectOutput(
          "方悟「言彼之年月日」之義。施「言彼之年月日」於一五九〇一九二〇〇〇",
          "西元二〇二〇年庚子年閏四月初一日丙寅日"
        );
      });

      it("彼月何月", () => {
        expectOutput(
          "方悟「彼月何月」之義。施「彼月何月」於一五九〇一九二〇〇〇",
          "四又五分"
        );
      });

      it("彼月積何月", () => {
        expectOutput(
          "方悟「彼月積何月」之義。施「彼月積何月」於一五九〇一九二〇〇〇",
          "五萬八千三百四十五"
        );
      });

      it("言彼之年月日", () => {
        expectOutput(
          "方悟「言彼之年月日」之義。施「言彼之年月日」於一五九二六九七五九九",
          "西元二〇二〇年庚子年閏四月二十九日甲午日"
        );
      });

      it("彼月何月", () => {
        expectOutput(
          "方悟「彼月何月」之義。施「彼月何月」於一五九二六九七五九九",
          "四又五分"
        );
      });

      it("彼月積何月", () => {
        expectOutput(
          "方悟「彼月積何月」之義。施「彼月積何月」於一五九二六九七五九九",
          "五萬八千三百四十五"
        );
      });

      it("言彼之年月日", () => {
        expectOutput(
          "方悟「言彼之年月日」之義。施「言彼之年月日」於一五九二六九七六〇〇",
          "西元二〇二〇年庚子年五月初一日乙未日"
        );
      });

      it("彼月何月", () => {
        expectOutput(
          "方悟「彼月何月」之義。施「彼月何月」於一五九二六九七六〇〇",
          "五"
        );
      });

      it("彼月積何月", () => {
        expectOutput(
          "方悟「彼月積何月」之義。施「彼月積何月」於一五九二六九七六〇〇",
          "五萬八千三百四十六"
        );
      });
    });
  });
});
