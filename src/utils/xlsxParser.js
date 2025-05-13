import * as XLSX from "xlsx";

const formatDate = (date) => {
  if (!(date instanceof Date)) return date;
  return date.toLocaleDateString("en-GB");
};

const convertExcelDateToJSDate = (serial) => {
  const epoch = new Date(1900, 0, 1);
  const date = new Date(epoch.getTime() + (serial - 2) * 86400000);
  return date;
};

export const parseExcelFile = (file, callback) => {
  const reader = new FileReader();

  reader.onload = (evt) => {
    const bstr = evt.target.result;
    const wb = XLSX.read(bstr, { type: "array", cellDates: true });
    const wsname = wb.SheetNames[0];
    const ws = wb.Sheets[wsname];
    const jsonData = XLSX.utils.sheet_to_json(ws, { defval: "" });

    const newData = jsonData.map((row) => {
      const newRow = { ...row };

      for (let key in newRow) {
        const value = newRow[key];

        if (
          key.toLowerCase().includes("date") ||
          key.toLowerCase().includes(" on") ||
          key.toLowerCase().includes("dob")
        ) {
          if (typeof value === "number" && !isNaN(value)) {
            const parsedDate = convertExcelDateToJSDate(value);
            newRow[key] = formatDate(parsedDate);
          } else if (value instanceof Date) {
            newRow[key] = formatDate(value);
          } else if (typeof value === "string" && !isNaN(Date.parse(value))) {
            const parsedDate = new Date(value);
            if (!isNaN(parsedDate)) {
              newRow[key] = formatDate(parsedDate);
            }
          }
        } else {
          newRow[key] = value;
        }
      }

      return newRow;
    });

    callback(newData);
  };

  reader.readAsArrayBuffer(file);
};
