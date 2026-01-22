import reqError from '../utils/errorHandler.js'
import ServerError from '../models/serverError.js'
import { getProducByIsbn, getProducts } from '../services/productService.js'
import resHandler from '../utils/responseHandler.js'

export const searchProduct = async (req, res) => {
  let productData = {}
  try {
    const { isbn } = req.params
    productData = await getProducByIsbn(isbn)
    resHandler(res, 200, "product", productData)
  } catch (error) {
    if(error instanceof ServerError) return reqError(res, error.statusCode, error.message)
    reqError(res, 500, error.message)
  }
}

export const searchProducts = async (req, res) => {
  const reqUrl = req.protocol + '://' + req.get('host')
  let results = {}
  try {
    results = await getProducts(req.query.q, req.query.max, reqUrl)
    resHandler(res, 200, "products", results)
  } catch (error) {
    if(error instanceof ServerError) return reqError(res, error.statusCode, error.message)
    reqError(res, 500, error.message)
  }
}