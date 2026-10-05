import React from "react";

// const defaultFields = [
//   { label: "Project Name", value: "Muthvive's Agriculture Land For Sale" },
//   { label: "Property Category", value: "Agricultural Land" },
//   { label: "Area Unit", value: "Acre" },
//   { label: "Property Area", value: "200" },
//   { label: "Road Plan", value: "Interior" },
//   { label: "Pathway Available", value: "Available" },
//   { label: "Pathway Length", value: "200  Sq.Ft" },
//   { label: "Pathway Length", value: "123 Sq.Ft" },
//   { label: "HP (Horsepower)", value: "2000HP" },
//   { label: "Electricity Available", value: "Individual Electricity" },
//   { label: "Construction", value: "Commercial Building" },
//   { label: "Property Facing", value: "North" },
// ];

// Groups fields into pairs of 2 so each pair renders as one row with a
// single divider spanning both columns underneath - matches the
// screenshot's row-level (not per-cell) border lines. An odd field count
// leaves the last row's second slot empty rather than erroring.
const chunkIntoPairs = (items) => {
  const pairs = [];
  for (let i = 0; i < items.length; i += 2) {
    pairs.push(items.slice(i, i + 2));
  }
  return pairs;
};

const PropertyOverview = ({ title = "Property Overview", fields = [] }) => {
  const rows = chunkIntoPairs(fields);

  return (
    <div className="w-full rounded-xl text-start border border-gray-300 bg-white">
      <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">
          {title}
        </h2>
      </div>

      <div className="px-5 sm:px-6">
        {rows.map((pair, rowIndex) => {
          const isLastRow = rowIndex === rows.length - 1;
          return (
            <div
              key={rowIndex}
              className={`grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 py-4 ${
                isLastRow ? "" : "border-b border-gray-100"
              }`}
            >
              {pair.map((field, colIndex) => (
                <div key={colIndex}>
                  <p className="text-sm text-gray-400">{field.label}</p>
                  <p className="mt-1 text-sm sm:text-base font-semibold text-gray-900">
                    {field.value}
                  </p>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PropertyOverview;
