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

// ------------------------------------------------------------
// Extract src URL from iframe HTML
// ------------------------------------------------------------

const extractMapUrl = (value) => {
  if (!value) {
    return null;
  }

  const stringValue = String(value).trim();

  // Handle null / undefined / empty values
  if (
    stringValue === "" ||
    stringValue === "null" ||
    stringValue === "undefined"
  ) {
    return null;
  }

  // If backend already gives a direct URL, use it directly
  if (stringValue.startsWith("http://") || stringValue.startsWith("https://")) {
    return stringValue;
  }

  // Extract src="..." or src='...'
  const srcMatch = stringValue.match(/<iframe[^>]*\s+src=["']([^"']+)["']/i);

  return srcMatch ? srcMatch[1] : null;
};

const PropertyLocation = ({
  title = "Property Location",
  fields = defaultFields,
}) => {
  // The "Map" entry (if present) is pulled out of the fields list —
  // it drives the iframe below instead of rendering as a normal
  // label/value cell. A null/missing value means no map available.
  const mapField = fields.find((field) => field.label?.toLowerCase() === "map");

  const rawMapValue = mapField?.value;

  // Extract only the URL from the stored iframe HTML
  const mapUrl = extractMapUrl(rawMapValue);

  const gridFields = fields.filter((field) => field !== mapField);
  const rows = chunkIntoPairs(gridFields);

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

      {/* -----------------------------------------------------
          Map — only rendered when the "Map" field's value is
          not null/empty. Comes from the fields array itself.
      ----------------------------------------------------- */}
      {mapUrl && (
        <div className="w-full h-[300px] overflow-hidden border-t border-gray-100 px-5 py-4 sm:px-6">
          <div className="w-full aspect-video overflow-hidden rounded-lg border border-gray-200">
            <iframe
              src={mapUrl}
              title={`${title} Map`}
              className="w-full h-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyLocation;
