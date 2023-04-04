const express = require('express')
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000
const path = require('path')

const sql = require('mssql')
const sqlConfig = {
  user: 'sa',
  password: 'Thang012345@',
  database: 'test4',
  server: 'localhost',
  options: {
    encrypt: false, // for azure
    trustServerCertificate: false // change to true for local dev / self-signed certs
  }
}

const connectDB = async () => {
  try {
    await sql.connect(sqlConfig)
    console.log("You're in, boss")
  } catch (err) {
    console.log({ err })
  }
}
connectDB()
const axios = require('axios')
const PROVINCE_REPORTS_API_URL = 'https://api.covid19tracker.ca/summary/split'
const initDB = async () => {
  try {
    let pool = await sql.connect(sqlConfig)
    let { data } = await axios.get(`${PROVINCE_REPORTS_API_URL}`)
    data = data.data
    for(let i = 0; i < data.length; i++) {
      let sqlQuery = sql.query`
      UPDATE dbo.PROVINCE 
      SET total_cases = ${data[i].total_cases},
          total_fatalities = ${data[i].total_fatalities},
          total_tests = ${data[i].total_tests},
          total_hospitalizations = ${data[i].total_hospitalizations},
          total_criticals = ${data[i].total_criticals},
          total_recoveries = ${data[i].total_recoveries},
          total_vaccinations = ${data[i].total_vaccinations},
          total_vaccinated = ${data[i].total_vaccinated},
          total_boosters_1 =  ${data[i].total_vaccinated},
          total_boosters_2 =  ${data[i].total_boosters_2},
          total_vaccines_distributed =  ${data[i].total_vaccines_distributed}
      WHERE PROVID = ${data[i].province}`

      let res = await pool.query(sqlQuery)
      //console.log({res})
      
    }
    //console.log(data)
  } catch (err) {
    console.log({ err })
  }
}
const router = require('./routes/routes')

app.use('/api', router)

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'))
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
  })
}

app.listen(port, () => console.log(`Listening on port ${port}`));

initDB()