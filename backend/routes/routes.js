const express = require('express')
const axios = require('axios')
const { sqlConfig } = require('../server')
const router = express.Router()
const sql = require('mssql')

router.get('/reports', async (req, res, next) => {
  try {
    let pool = await sql.connect(sqlConfig)
    let query = await pool.query("Select * from dbo.PROVINCE ")
    res.json({ data: query.recordset })
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

router.post('/testTesult', async (req, res, next) => {
  let {result, ageGroup, date, province} = req.body;
  console.log({result, ageGroup, date, province})

  
  try {
    let pool = await sql.connect(sqlConfig)
    let sqlQuery = sql.query`
      INSERT INTO dbo.TEST(TESTING_DATE, RESULT, AGE_GROUP_CODE, PROVID) VALUES (${date}, ${result}, ${ageGroup}, ${province});`

      await pool.query(sqlQuery)
      res.status(200)
  } catch (err) {
    console.log({ err })
  }
})


module.exports = router