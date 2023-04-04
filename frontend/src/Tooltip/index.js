import React from "react";

const Tooltip = ({ feature }) => {
  const { properties } = feature;
  return (
    <div id={`tooltip-${properties.id}`} style={{fontSize: '18px'}}>
    
      <center><strong>{properties.name}</strong><br />
        Active Cases: {properties.province_cases_active} <br />
        Total Cases: {properties.province_cases_total} <br />
        Deaths: {properties.province_deaths_total} <br />
        Tests: {properties.province_tests_total} <br />
        Hospitalizations: {properties.province_hospitalizations_total}
      </center>
    </div>
  );
};

export default Tooltip;