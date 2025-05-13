import React from "react";
import { parseExcelFile } from "../utils/xlsxParser";

export default function FileUploader({ onDataParsed }) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      parseExcelFile(file, (parsedData) => {
        onDataParsed(parsedData);
      });
    }
  };

  return (
    <div className=" p-6 rounded-lg shadow-md text-center w-full max-w-md mx-auto">
      <label className="block mb-4">
        <span className="text-lg font-semibold text-indigo-950">
          Click on your Excel/Csv File
        </span>
      </label>
      <div className="flex justify-center">
        <label className="flex gap-3  bg-[#121213] hover:bg-[#5900ff] text-white font-semibold py-3 px-8 rounded-lg cursor-pointer transition-all ease-in-out duration-300 shadow-md">
          <img className="img-src" src="/images.jpg" alt="" />
          <span className="text-lg">Import File</span>

          <input type="file" onChange={handleFileChange} className="hidden" />
        </label>
      </div>
    </div>
  );
}
