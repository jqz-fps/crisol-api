import express from 'express'
import { searchStores, searchStoresByProduct } from '../controllers/storeController.js'

const router = express.Router()

/**
 * @swagger
 * /stores:
 *   get:
 *     summary: Search for stores
 *     description: Search for physical stores in Peru
 *     tags:
 *       - Store
 *     responses:
 *       200:
 *         description: Successful response
 *       400:
 *         description: Bad request, not enough or invalid parameters
 */
router.get("/", searchStores)

/**
 * @swagger
 * /stores/{isbn}:
 *   get:
 *     summary: Search for stores by product
 *     description: Search for physical stores for a specific product
 *     tags:
 *       - Store
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
 *       400:
 *         description: Bad request, not enough or invalid parameters
 *       404:
 *         description: Not found
 */
router.get("/:isbn", searchStoresByProduct)

export default router