import express from 'express'
import { searchProduct, searchProducts } from '../controllers/productController.js'

const router = express.Router()

router.get("/", searchProducts)

router.get("/:isbn", searchProduct)

export default router