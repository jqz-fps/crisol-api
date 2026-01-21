import express from 'express'
import { searchStores, searchStoresByProduct } from '../controllers/storeController.js'

const router = express.Router()

router.get("/", searchStores)

router.get("/:isbn", searchStoresByProduct)

export default router