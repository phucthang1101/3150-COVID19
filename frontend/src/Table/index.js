import React, { useEffect, useState } from 'react'
import moment from 'moment';

const Table = () => {
  const [reports, setReports] = useState(null)
  const [provinces, setProvinces] = useState(null)
  useEffect(() => {
    fetchSummaryAndPronvinces().then(([reports, provinces]) => {
      console.log({reports})
      setReports(reports.data)
      setProvinces(provinces)
    }).catch(error => {
      console.log(error)
    });
  }, []);

  async function fetchSummaryAndPronvinces() {
    const [reportsResponse, provincesResponse] = await Promise.all([
      fetch('/api/reports'),
      fetch('/api/provinces')
    ]);
    console.log({reportsResponse})
    const reports = await reportsResponse.json();
    const provinces = await provincesResponse.json();
    return [reports, provinces];
  }

  function provinceProperties(code, name) {
    
    let hashmap = {
      "QC": {
        name: "Quebec",
        population: 8604495,
        code: "QC",
        displayNotes: false
      },
      "NL": {
        name: "Newfoundland and Labrador",
        population: 520553,
        code: "NL",
        displayNotes: false
      },
      "BC": {
        name: "British Columbia",
        population: 5214805,
        code: "BC",
        displayNotes: false
      },
      "NU": {
        name: "Nunavut",
        population: 39403,
        code: "NU",
        displayNotes: false
      },
      "NT": {
        name: "Northwest Territories",
        population: 45504,
        code: "NT",
        displayNotes: false
      },
      "NB": {
        name: "New Brunswick",
        population: 789225,
        code: "NB",
        displayNotes: false
      },
      "NS": {
        name: "Nova Scotia",
        population: 992055,
        code: "NS",
        displayNotes: false
      },
      "SK": {
        name: "Saskatchewan",
        population: 1179844,
        code: "SK",
        displayNotes: true
      },
      "AB": {
        name: "Alberta",
        population: 4442879,
        code: "AB",
        displayNotes: false
      },
      "PE": {
        name: "Prince Edward Island",
        population: 164318,
        code: "PE",
        displayNotes: false
      },
      "YT": {
        name: "Yukon",
        population: 42986,
        code: "YT",
        displayNotes: false
      },
      "MB": {
        name: "Manitoba",
        population: 1383765,
        code: "MB",
        displayNotes: false
      },
      "ON": {
        name: "Ontario",
        population: 14826276,
        code: "ON",
        displayNotes: false
      }
    };
    code = code.trim()
    if (code) return hashmap[code];
    if (name) {
      let keys = Object.keys(hashmap);
      code = null;
      for (let i = 0; i < keys.length; i++) {
        if (hashmap[keys[i]].name === name) {
          code = keys[i];
          break;
        }
      }
      return code;
    }
    return null;
  }
  // const renderTableBody = (reports, provinces) => {
  //   return (
      
  //   )
  // }
  const renderTableBody = (reports, provinces) => {
    
    return reports.map((item) => {
      console.log({item})
      let casesPer100000 = Math.floor(((100000 * item.total_cases) / provinceProperties(item.PROVID).population) * 100) / 100;
      let fatalitiesPer100000 = Math.floor(((100000 * item.total_fatalities) / provinceProperties(item.PROVID).population) * 100) / 100;
      let hospitalizationsPer100000 = Math.floor(((100000 * item.total_hospitalizations) / provinceProperties(item.PROVID).population) * 100) / 100;
      let criticalsPer100000 = Math.floor(((100000 * item.total_criticals) / provinceProperties(item.PROVID).population) * 100) / 100;
      let recoveriesPer100000 = Math.floor(((100000 * item.total_recoveries) / provinceProperties(item.PROVID).population) * 100) / 100;
      let testsPer100000 = Math.floor(((100000 * item.total_tests) / provinceProperties(item.PROVID).population) * 100) / 100;
      let vaccinationsPer100000 = Math.floor(((100000 * item.total_vaccinations) / provinceProperties(item.PROVID).population) * 100) / 100;


      let provinceData = provinces.filter(province => province.code === item.PROVID);
      provinceData = provinceData.length ? provinceData[0] : {};
      let updatedAt = provinceData.updated_at ? moment(provinceData.updated_at).format("dddd, MMMM Do YYYY, HH:mm") + " CST" : "N/A";
      let provinceStatus = provinceData.data_status || "Unknown";
      console.log(reports, provinces)
      return (
        <>
          <tr className='provinceRow'>
            <td>
              <span>
                {provinceProperties(item.PROVID).name}
              </span>
              <span className='toggle-regions'>
                <span className='arrow-down' data-toggle='0' data-province={item.PROVID}>
                  <i className='fa fa-angle-down'></i>
                </span>
              </span>
            </td>
            <td data-per-capita={casesPer100000}>
              <b>
                <i>{item.total_cases}
                </i>
              </b>
            </td>
            <td data-per-capita={fatalitiesPer100000}>
              <b>
                <i>{item.total_fatalities}
                </i>
              </b>
            </td>
            <td data-per-capita={hospitalizationsPer100000}>
              <b>
                <i>{item.total_hospitalizations}</i>
              </b>
            </td>
            <td data-per-capita={criticalsPer100000}>
              <b>
                <i>{item.total_criticals}
                </i>
              </b>
            </td>
            <td data-per-capita={recoveriesPer100000}>
              <b>
                <i>{item.total_recoveries}
                </i>
              </b>
            </td>
            <td data-per-capita={testsPer100000}>
              <b>
                <i>{item.total_tests}</i>
              </b>
            </td>
            <td data-per-capita={vaccinationsPer100000}>
              <b>
                <i>{item.total_vaccinations}</i>
              </b>
            </td>
            {/* <td>{casesPer100000}</td> */}
          </tr>
        </>
      )
    })
  }

  return (
    <div className="card mb-4">
      <div className="card-header"><i className="fas fa-table mr-1"></i>Total Cases By Province</div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-bordered table-hover" id="dataTable1" width="100%" cellspacing="0">
            <thead>
              <tr>
                <th>Province</th>
                <th>Cases</th>
                <th>Deaths</th>
                <th>Hospitalizations</th>
                <th>Criticals</th>
                <th>Recoveries</th>
                <th>Tests</th>
                <th>Doses Admin.</th>
              </tr>
            </thead>
            <tbody id="totalCasesProvinceTable">
              {reports && provinces && renderTableBody(reports, provinces)}
            </tbody>
            <tfoot>
              <tr>
                <td><i><b>Canada</b></i></td>
                <td><i><b id="totalCasesCanada" data-per-capita=""></b></i></td>
                <td><i><b id="totalFatalitiesCanada" data-per-capita=""></b></i></td>
                <td><i><b id="totalHospitalizationsCanada" data-per-capita=""></b></i></td>
                <td><i><b id="totalCriticalsCanada" data-per-capita=""></b></i></td>
                <td><i><b id="totalRecoveriesCanada" data-per-capita=""></b></i></td>
                <td><i><b id="totalTestsCanada" data-per-capita=""></b></i></td>
                <td><i><b id="totalVaccinationsCanada" data-per-capita=""></b></i></td>
                {/* <td><b id="infectedPerCanada"></b></td>
                <td><a href="https://www.canada.ca/en/public-health/services/diseases/2019-novel-coronavirus-infection.html">Source</a></td> */}
              </tr>
            </tfoot>
            <tbody id="totalCasesProvinceTable"></tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Table