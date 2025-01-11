const reqError = require('./utils/errorHandler')
const ServerError = require('./models/serverError')

const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000

const searchProducts = require('./services/searchService')
const getProduct = require('./services/productService')
const getStores = require('./services/storeService')

const cors = require('cors')
app.use(cors({
  methods: ['GET']
}))

app.get('/', (req, res) => {
  // TODO: something with this route :)
  res.send({ message: "Hello World" })
})

app.get('/search', async (req, res) => {
  let results = {}
  try {
    results = await searchProducts(req.query.q, req.query.max)
  } catch (error) {
    if(error instanceof ServerError) return reqError(res, error.statusCode, error.message)
    reqError(res, 500, error.message)
  }
  res.send({ req_date: new Date().toISOString(), results })
})

app.get('/product', async (req, res) => {
  let productData = {}
  try {
    productData = await getProduct(req.query.isbn)
  } catch (error) {
    if(error instanceof ServerError) return reqError(res, error.statusCode, error.message)
    reqError(res, 500, error.message)
  }
  Object.assign(productData, { req_date: new Date().toISOString() })
  res.send(productData)
})

app.get("/stores", async (req, res) => {
  let stores = {}
  try {
    stores = await getStores()
  } catch (error) {
    if(error instanceof ServerError) return reqError(res, error.statusCode, error.message)
    reqError(res, 500, error.message)
  }
  Object.assign(stores, { req_date: new Date().toISOString() })
  res.send({ req_date: new Date().toISOString(), stores })
})

// Middleware for non existing routes
app.use((req, res) => {
  reqError(res, 404, "Not found")
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})