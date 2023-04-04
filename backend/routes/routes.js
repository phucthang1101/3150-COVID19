const express = require('express')
const axios = require('axios')
const { sqlConfig } = require('../server')
const router = express.Router()
const sql = require('mssql')
// const sqlConfig = {
//   user: 'sa',
//   password: 'Thang012345@',
//   database: 'test4',
//   server: 'localhost',
//   options: {
//     encrypt: false,
//     trustServerCertificate: false 
//   }
// }

const REPORTS_API_URL = 'https://api.covid19tracker.ca/reports'
router.get('/canada', async (req, res, next) => {

  try {

    const { data } = await axios.get(`${REPORTS_API_URL}`)
    res.json(data)

  } catch (error) {
    return next(error)
  }

})

const PROVINCE_REPORTS_API_URL = 'https://api.covid19tracker.ca/summary/split'
router.get('/reports', async (req, res, next) => {
  try {
    let pool = await sql.connect(sqlConfig)
    let test = await pool.query("Select * from dbo.PROVINCE ")
    console.log(test)
    res.json({data: test.recordset})
  } catch (error) {
    return next(error)
  }
})


const TABLE_API_URL = 'https://api.covid19tracker.ca/summary'
router.get('/summary', async (req, res, next) => {
  try {
    const { data } = await axios.get(`${TABLE_API_URL}`)
    res.json(data)
  } catch (error) {
    return next(error)
  }
})

const TABLE_PROVINCES_API_URL = 'https://api.covid19tracker.ca/provinces'
router.get('/provinces', async (req, res, next) => {
  try {
    const { data } = await axios.get(`${TABLE_PROVINCES_API_URL}`)
    res.json(data)

  } catch (error) {
    return next(error)
  }
})
module.exports = router