import { parseString } from "xml2js";

export const getRoadStatus = async (): Promise<any[]> => {
  try {
    const response = await fetch(
      "https://resource.data.one.gov.hk/td/en/specialtrafficnews.xml"
    );
    const xml = await response.text();
    return new Promise((resolve) => {
      parseString(xml, (err, result) => {
        if (err || !result?.body?.message) {
          resolve([
            {
              ChinShort: `政府內部資料錯誤`,
              ChinText: `政府內部資料錯誤`,
              ReferenceDate: "",
            },
          ]);
        } else {
          resolve(result.body.message);
        }
      });
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
