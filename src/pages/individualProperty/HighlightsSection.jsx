import React from "react";

const defaultFields = [
  { label: "State", value: "Tamil Nadu" },
  { label: "District", value: "Coimbatore" },
  { label: "Taluk", value: "Pollachi" },
  { label: "Village", value: "Anaimalai" },
  { label: "Locality", value: "Sethumadai Road" },
  { label: "Pincode", value: "642104" },
];

// Same row-pair-with-shared-divider pattern as PropertyOverview - groups
// fields two at a time so the border line spans the full row, not just
// one cell. Odd counts simply leave the last row's second slot empty.
const chunkIntoPairs = (items) => {
  const pairs = [];
  for (let i = 0; i < items.length; i += 2) {
    pairs.push(items.slice(i, i + 2));
  }
  return pairs;
};

const PropertyLocation = ({ title = "Property Highlights", fields = [] }) => {
  const rows = chunkIntoPairs(fields);
  // console.log("fields", fields);
  return (
    <div className="w-full text-start rounded-xl border border-gray-300 bg-white">
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

export default PropertyLocation;
