import React, { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { RowIcon, ColumnIcon } from "../assets/icons";
import reset from "../assets/images/reset.png";

const FieldItem = ({
  field,
  type,
  onDrop,
  onRemove,
  isDateHierarchy,
  isNumerical,
  aggregations,
  setAggregations,
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: "FIELD",
    item: { field, sourceType: type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className={`p-2 text-[12px] bg-[#f81cafb5] border bg-[#f81cafb5] border rounded-lg shadow-md cursor-grab flex items-center justify-between mb-2 ${
        isDragging ? "opacity-60" : ""
      }`}
    >
      <div
        className={`${
          isDateHierarchy ? "text-amber-950" : "text-black"
        } flex items-center gap-2`}
      >
        {isNumerical && <span className="text-black">Σ</span>}
        <span>{field}</span>
      </div>
      <div className="flex items-center gap-2">
        {type === "values" && (
          <select
            className="py-1 border border-gray-300 shadow-sm rounded text-[10px] max-w-[60px] bg-[#F8F8F8] hover:bg-[#E6E6E6]"
            value={aggregations[field] || "sum"}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) =>
              setAggregations((prev) => ({ ...prev, [field]: e.target.value }))
            }
          >
            <option value="sum">Sum</option>
            <option value="avg">Avg</option>
            <option value="count">Count</option>
            <option value="min">Min</option>
            <option value="max">Max</option>
          </select>
        )}
        {type !== "available" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(field);
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

const DropZone = ({
  type,
  fields,
  onDrop,
  onRemove,
  title,
  icon,
  aggregations,
  setAggregations,
}) => {
  const [{ isOver }, drop] = useDrop({
    accept: "FIELD",
    drop: (item) => onDrop(item.field, type),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2 text-gray-600">
        <span className="text-sm font-medium">{title}</span>
      </div>
      <div
        ref={drop}
        className={`p-3 border rounded-lg min-h-[120px] max-h-[150px] ${
          isOver ? "bg-blue-50 border-blue-300" : "bg-white border-gray-200"
        }`}
      >
        <div className="max-h-[130px] overflow-y-auto">
          {fields.map((field) => (
            <FieldItem
              key={field}
              field={field}
              type={type}
              onDrop={onDrop}
              onRemove={onRemove}
              isDateHierarchy={
                field.includes("_Year") ||
                field.includes("_Quarter") ||
                field.includes("_Month")
              }
              isNumerical={type === "values"}
              aggregations={aggregations}
              setAggregations={setAggregations}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default function FieldSelector({
  fields,
  rows,
  setRows,
  columns,
  setColumns,
  values,
  setValues,
  aggregations,
  setAggregations,
  numericalFields,
}) {
  const [dateFields, setDateFields] = useState([]);
  const [dateHierarchyFields, setDateHierarchyFields] = useState([]);

  useEffect(() => {
    const dateCols = fields.filter(
      (field) =>
        field.toLowerCase().includes(" on") ||
        field.toLowerCase().includes("date") ||
        field.toLowerCase().includes("dob")
    );

    const hierarchyFields = dateCols.flatMap((dateField) => [
      `${dateField}_Year`,
      `${dateField}_Quarter`,
      `${dateField}_Month`,
    ]);

    setDateFields(dateCols);
    setDateHierarchyFields(hierarchyFields);
  }, [fields]);

  const handleDrop = (field, targetType) => {
    let newRows = [...rows];
    let newColumns = [...columns];
    let newValues = [...values];
    let newAggregations = { ...aggregations };

    if (newRows.includes(field)) newRows = newRows.filter((f) => f !== field);
    if (newColumns.includes(field))
      newColumns = newColumns.filter((f) => f !== field);
    if (newValues.includes(field)) {
      newValues = newValues.filter((f) => f !== field);
      delete newAggregations[field];
    }

    if (targetType === "rows" && !newRows.includes(field)) newRows.push(field);
    if (targetType === "columns" && !newColumns.includes(field))
      newColumns.push(field);
    if (targetType === "values" && !newValues.includes(field))
      newValues.push(field);

    setRows(newRows);
    setColumns(newColumns);
    setValues(newValues);
    setAggregations(newAggregations);
  };

  const handleRemove = (field) => {
    if (rows.includes(field)) setRows(rows.filter((f) => f !== field));
    if (columns.includes(field)) setColumns(columns.filter((f) => f !== field));
    if (values.includes(field)) {
      setValues(values.filter((f) => f !== field));
      const newAggregations = { ...aggregations };
      delete newAggregations[field];
      setAggregations(newAggregations);
    }
  };

  const handleReset = () => {
    setRows([]);
    setColumns([]);
    setValues([]);
    setAggregations({});
  };

  const allAvailableFields = [
    ...fields.filter(
      (f) => !rows.includes(f) && !columns.includes(f) && !values.includes(f)
    ),
    ...dateHierarchyFields.filter(
      (f) => !rows.includes(f) && !columns.includes(f) && !values.includes(f)
    ),
  ];

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="w-[320px] h-[500px] flex flex-col bg-[#f9f9f9] shadow-lg rounded-lg border">
        <div className="px-4 py-2 flex justify-between bg-[#F1F1F1] rounded-t-lg">
          <h2 className="font-semibold text-gray-700">PivotTable Fields</h2>
          <button
            className="cursor-pointer hover:opacity-70 transition-opacity"
            onClick={handleReset}
          >
            <img src={reset} alt="reset" width="22" height="22" />
          </button>
        </div>

        <div
          className="flex-1 max-h-[300px] overflow-y-auto border-b border-b-gray-300 p-3 pt-0"
          id="scroll"
        >
          {allAvailableFields.map((field) => (
            <FieldItem
              key={field}
              field={field}
              type="available"
              onDrop={handleDrop}
              onRemove={handleRemove}
              isDateHierarchy={
                field.includes("_Year") ||
                field.includes("_Quarter") ||
                field.includes("_Month")
              }
              isNumerical={numericalFields.includes(field)}
              aggregations={aggregations}
              setAggregations={setAggregations}
            />
          ))}
        </div>

        <div className="p-3 space-y-3">
          <div className="flex gap-4">
            <DropZone
              type="rows"
              fields={rows}
              onDrop={handleDrop}
              onRemove={handleRemove}
              title="Rows"
              icon={<RowIcon />}
              aggregations={aggregations}
              setAggregations={setAggregations}
            />
            <DropZone
              type="columns"
              fields={columns}
              onDrop={handleDrop}
              onRemove={handleRemove}
              title="Columns"
              icon={<ColumnIcon />}
              aggregations={aggregations}
              setAggregations={setAggregations}
            />
          </div>

          <DropZone
            type="values"
            fields={values}
            onDrop={handleDrop}
            onRemove={handleRemove}
            title="Values"
            icon="Σ"
            aggregations={aggregations}
            setAggregations={setAggregations}
          />
        </div>
      </div>
    </DndProvider>
  );
}
