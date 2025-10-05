import reqError from './utils/errorHandler.js'
import ServerError from './models/serverError.js'

import express from 'express'
const app = express()
const PORT = process.env.PORT || 3000

import rateLimit from 'express-rate-limit'
const limiter = rateLimit({
  windowMs: (process.env.MINUTES_LIMIT || 15) * 60 * 1000,
  max: process.env.MAX_REQUESTS || 100,
  message: `Too many requests from this IP, please try again after ${process.env.MINUTES_LIMIT || 15} minutes`,
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(limiter)

import searchProducts from './services/searchService.js'
import getProduct from './services/productService.js'
import getStores from './services/storeService.js'

import cors from 'cors'
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
  res.send(stores)
})

// Middleware for non existing routes
app.use((req, res) => {
  reqError(res, 404, "Not found")
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})