import reqError from '../utils/errorHandler.js'
import ServerError from '../models/serverError.js'
import { getProducByIsbn, getProducts } from '../services/productService.js'

export const searchProduct = async (req, res) => {
  let productData = {}
  try {
    const { isbn } = req.params
    productData = await getProducByIsbn(isbn)
    res.send({ req_date: new Date().toISOString(), product: productData })
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
    res.send({ req_date: new Date().toISOString(), results })
  } catch (error) {
    if(error instanceof ServerError) return reqError(res, error.statusCode, error.message)
    reqError(res, 500, error.message)
  }
}