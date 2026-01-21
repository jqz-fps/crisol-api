import express from 'express'
import { searchProduct, searchProducts } from '../controllers/productController.js'

const router = express.Router()

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Search for products
 *     description: Search for products by query
 *     tags:
 *       - Product
 *     parameters:
 *       - name: q
 *         in: query
 *         description: Query to search for
 *         required: true
 *         schema:
 *           type: string
 *       - name: max
 *         in: query
 *         description: Maximum number of results to return
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       400:
 *         description: Bad request, not enough or invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */
router.get("/", searchProducts)

/**
 * @swagger
 * /products/{isbn}:
 *   get:
 *     summary: Search for an specific product
 *     description: Search for products by ISBN
 *     tags:
 *       - Product
 *     parameters:
 *       - name: isbn
 *         in: path
 *         description: ISBN of the product
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       400:
 *         description: Bad request, not enough or invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */
router.get("/:isbn", searchProduct)

export default router