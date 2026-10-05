import React from "react";

const defaultAmenities = [
  "Borewell/Tank",
  "Swimming Pool",
  "Garden",
  "Security / Firm Alarm",
];

const Amenities = ({ title = "Amenities", fields = [] }) => {
  return (
    <div className="w-full text-start rounded-xl border border-gray-300 bg-white">
      <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">
          {title}
        </h2>
      </div>

      <div className="flex flex-wrap gap-3 px-5 py-5 sm:px-6">
        {fields.map((amenity) => (
          <span
            key={amenity}
            className="rounded-xl border border-secondary bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600"
          >
            {amenity}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Amenities;
