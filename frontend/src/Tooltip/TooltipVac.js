import React from "react";

const TooltipVac = ({ feature }) => {
  const { properties } = feature;
  return (
    <div id={`tooltip-${properties.id}`} style={{ fontSize: '18px' }}>

      <center><strong>{properties.name}</strong><br />
        Doses Administered: {properties.province_vaccinations_total} <br />
        Doses Administered per 100,000: {properties.province_vaccinations_per_population} <br />
      </center>
    </div>
  );
};

export default TooltipVac;