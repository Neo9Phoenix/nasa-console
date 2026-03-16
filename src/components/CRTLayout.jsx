import React from "react";
import "./CRTLayout.css";

const CRTLayout = ({ children }) => {
  return (
    <div className="crt-container">
      <div className="crt-overlay"></div>
      <div className="crt-content">{children}</div>
    </div>
  );
};

export default CRTLayout;
