import reqError from './utils/errorHandler.js'
import express from 'express'
import rateLimit from 'express-rate-limit'
import cors from 'cors'
import product from './routes/productRoutes.js'
import store from './routes/storeRoutes.js'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

const app = express()
const PORT = process.env.PORT || 3000

const limiter = rateLimit({
  windowMs: (process.env.MINUTES_LIMIT || 15) * 60 * 1000,
  max: process.env.MAX_REQUESTS || 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, res) => req.path.includes("/docs"),

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

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Crisol API',
      version: '4.0.0',
      description: "Unnofficial API for the Crisol online shop. A Node.js application that uses the Crisol website to scrape data from Crisol's website.",
    }
  },
  apis: ['./src/routes/*.js'],
}

const swaggerDocs = swaggerJSDoc(swaggerOptions)
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

app.use('/products', product)

app.use('/stores', store)

app.get('/', (req, res) => {
  res.redirect('/docs')
})

// Middleware for non existing routes
app.use((req, res) => {
  reqError(res, 404, "Not found")
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})