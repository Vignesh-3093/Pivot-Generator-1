import React, { useState } from "react";
import FileUploader from "./components/FileUploader";
import FieldSelector from "./components/FieldSelector";
import PivotTable from "./components/PivotTable";

export default function App() {
  const [data, setData] = useState([]);
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [values, setValues] = useState([]);
  const [aggregations, setAggregations] = useState({});
  const [numericalFields, setNumericalFields] = useState([]);

  const handleDataParsed = (parsedData) => {
    setData(parsedData);
    const sampleRow = parsedData[0] || {};
    const numericFields = Object.keys(sampleRow).filter(
      (key) => typeof sampleRow[key] === "number"
    );
    setNumericalFields(numericFields);
  };

  return (
    <div className="h-screen w-full flex flex-col bg-[#F5F5F5]">
      <div className="p-4 bg-white shadow z-10">
        <FileUploader onDataParsed={handleDataParsed} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-[320px] bg-white border-r border-gray-200 shadow-lg overflow-y-auto">
          <FieldSelector
            fields={data[0] ? Object.keys(data[0]) : []}
            rows={rows}
            setRows={setRows}
            columns={columns}
            setColumns={setColumns}
            values={values}
            setValues={setValues}
            aggregations={aggregations}
            setAggregations={setAggregations}
            numericalFields={numericalFields}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <PivotTable
            data={data}
            rows={rows}
            columns={columns}
            values={values}
            aggregations={aggregations}
          />
        </div>
      </div>
    </div>
  );
}
