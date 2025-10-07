import reqError from './utils/errorHandler.js'
import express from 'express'
import rateLimit from 'express-rate-limit'
import cors from 'cors'
import product from './routes/productRoutes.js'

const app = express()
const PORT = process.env.PORT || 3000

const limiter = rateLimit({
  windowMs: (process.env.MINUTES_LIMIT || 15) * 60 * 1000,
  max: process.env.MAX_REQUESTS || 100,
  standardHeaders: true,
  legacyHeaders: false,

  handler: (req, res, next, options) => {
    reqError(
      res,
      options.statusCode || 429,
      `Too many requests from this IP, please try again after ${process.env.MINUTES_LIMIT || 15} minutes`
    )
  }
})
app.use(limiter)

app.use(cors({
  methods: ['GET']
}))

app.use('/products', product)

app.get('/', (req, res) => {
  // TODO: something with this route :)
  res.send({ message: "Hello World" })
})

// Middleware for non existing routes
app.use((req, res) => {
  reqError(res, 404, "Not found")
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})