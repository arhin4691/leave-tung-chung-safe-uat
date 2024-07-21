import { parseString } from "xml2js";

export const getRoadStatus = async () => {
  try {
    const response = fetch(
      "https://resource.data.one.gov.hk/td/en/specialtrafficnews.xml"
    );
    const xml = await response.text();
    parseString(xml, function (err, result) {
      return result.body.message;
    });

  } catch (error) {
    return [
      {
        ChinShort: `政府內部資料錯誤: ${error}`,
        ChinText: `政府內部資料錯誤: ${error}`,
        ReferenceDate: "",
      },
    ];
  }
};
