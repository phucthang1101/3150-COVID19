import { MenuItem, Select, TextField } from '@material-ui/core';
import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useState } from 'react'

const Form = () => {
  const [result, setResult] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [date, setDate] = useState('');
  const [province, setProvince] = useState('');
  const [tests, setTests] = useState([]);

  const onFormSubmit = (e) => {
    e.preventDefault()
    axios('/api/testTesult', {
      method: 'POST',
      url: 'http://localhost:5000/api/testTesult',
      headers: {
        'Access-Control-Allow-Origin': '*', 'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      data: {
        result,
        ageGroup,
        date,
        province
      },

    }).then(res => {
      console.log(res);
      setTests([])
    }).catch(error => {
      console.log(error)
    });
  }

  
  useEffect(() => {
    const res = fetch(`/api/testTesult`)
      .then(res => res.json())
      .then(res1 => {console.log({res1}); setTests(res1.data) })
  }, [tests]);
  
  const displayTime = (time) => {
    let date = new Date(time)
    const format2 = "YYYY-MM-DD"
    date = moment.utc(date).format(format2);
    return date;
  }
  return (
    <div className="container-fluid">
      <div className="row p-0">

        <div className="col-xl-5 m-auto" id="displayRapid">
          <div className="card mb-4">
            <div className="card-header"><i className="fas fa-vial"></i> Report Your Rapid Test</div>
            <div className="card-body">
              <form id="rapid" onSubmit={onFormSubmit}>
                <div className="form-group">
                  <label for="form-control">Test Result</label>
                  <Select
                    className="form-control"
                    value={result}
                    onChange={(e) => setResult(e.target.value)}
                  >
                    <MenuItem value={1}>Positive</MenuItem>
                    <MenuItem value={0}>Negative</MenuItem>
                  </Select>
                </div>
                <div className="form-group">
                  <label for="exampleInputPassword1">Province</label>
                  <Select
                    className="form-control"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                  >
                    <MenuItem value={"QC"}>Quebec</MenuItem>
                    <MenuItem value={"NL"}>Newfoundland and Labrador</MenuItem>
                    <MenuItem value={"BC"}>British Columbia</MenuItem>
                    <MenuItem value={"NU"}>Northwest Territories</MenuItem>
                    <MenuItem value={"NB"}>New Brunswick</MenuItem>
                    <MenuItem value={"NS"}>Nova Scotia</MenuItem>
                    <MenuItem value={"SK"}>Saskatchewan</MenuItem>
                    <MenuItem value={"AB"}>Alberta</MenuItem>
                    <MenuItem value={"PE"}>Prince Edward Island</MenuItem>
                    <MenuItem value={"YT"}>Yukon</MenuItem>
                    <MenuItem value={"MB"}>Manitoba</MenuItem>
                    <MenuItem value={"ON"}>Ontario</MenuItem>
                  </Select>
                </div>

                <div className="form-group">
                  <label for="exampleInputPassword1">Date of Test</label>
                  <input required type="date" className="form-control" id="datePicker" name="date" value={date} onChange={(e) => setDate(e.target.value)} />
                  <small id="emailHelp" className="form-text text-muted">Please enter the date when your test was performed.</small>
                </div>

                <div className="form-group">
                  <label for="form-control">Age</label>
                  <Select
                    className="form-control"
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value)}
                    name="ageGroup"
                  >
                    <MenuItem disabled selected value="">Select Your Age</MenuItem>
                    <MenuItem value={1}>0-11</MenuItem>
                    <MenuItem value={2}>12-17</MenuItem>
                    <MenuItem value={3}>18-39</MenuItem>
                    <MenuItem value={4}>40-59</MenuItem>
                    <MenuItem value={5}>60-79</MenuItem>
                    <MenuItem value={6}>80+</MenuItem>
                  </Select>

                  <small id="emailHelp" className="form-text text-muted">This information remains anonymous.</small>
                </div>
                <br />
                <button type="submit" className="btn btn-dark">Submit Results</button>
              </form>
            </div>
          </div>
        </div>
        
      </div>
      {tests && tests.map(test => (
          <div><p>{displayTime(test.TESTING_DATE)} {test.RESULT ? "Positive":"Negative"} {test.PROVID}</p> <br/> </div>
        ))}
    </div>
  )
}

export default Form