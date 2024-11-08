import { memo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";

const TrendValue = ({ value, text }: { value: number; text: string }) => (
  <div
    className={`inline-flex items-center gap-1 text-sm font-medium ${
      value >= 0 ? "text-green-500" : "text-red-500"
    }`}
  >
    <FontAwesomeIcon icon={value >= 0 ? faCaretUp : faCaretDown} />
    {text}
  </div>
);

export default memo(TrendValue);
