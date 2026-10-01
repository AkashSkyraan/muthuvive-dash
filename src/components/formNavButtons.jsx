// components/FormNavigationButtons.jsx
import React from "react";
import { Button } from "antd";

const FormNavigationButtons = ({
  onPrevious,
  onNext,
  disableNext,
  nextLabel = "Next",
  showPrevious = true,
}) => {
  return (
    <div className="flex justify-end gap-x-5 mt-6">
      {showPrevious && (
        <Button onClick={onPrevious} className="rounded-full px-6 !text-base">
          Previous
        </Button>
      )}

      <Button
        type="primary"
        onClick={onNext}
        disabled={disableNext}
        className="rounded-full px-6 !text-base"
      >
        {nextLabel}
      </Button>
    </div>
  );
};

export default FormNavigationButtons;
