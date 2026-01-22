import reqError from '../utils/errorHandler.js'
import resHandler from '../utils/responseHandler.js'
import ServerError from '../models/serverError.js'
import { getStores, getStoresByProduct } from '../services/storeService.js'

export const searchStores = async (req, res) => {
  let results = {}
  try {
    results = await getStores()
    resHandler(res, 200, "stores", results)
  } catch (error) {
    if(error instanceof ServerError) return reqError(res, error.statusCode, error.message)
    reqError(res, 500, error.message)
  }
}

export const searchStoresByProduct = async (req, res) => {
  let results = {}
  try {
    results = await getStoresByProduct(req.params.isbn)
    resHandler(res, 200, "stores", results)
  } catch (error) {
    if(error instanceof ServerError) return reqError(res, error.statusCode, error.message)
    reqError(res, 500, error.message)
  }
}