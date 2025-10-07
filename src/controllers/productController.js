import reqError from '../utils/errorHandler.js'
import ServerError from '../models/serverError.js'
import getProduct from '../services/productService.js'

const searchProduct = async (req, res) => {
  let productData = {}
  try {
    productData = await getProduct(req.query.isbn)
    res.send({ req_date: new Date().toISOString(), product: productData })
  } catch (error) {
    if(error instanceof ServerError) return reqError(res, error.statusCode, error.message)
    reqError(res, 500, error.message)
  }
}

export default {
  searchProduct
}