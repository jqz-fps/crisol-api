import reqError from '../utils/errorHandler.js'
import ServerError from '../models/serverError.js'
import searchProducts from '../services/searchService.js'

const getSearch = async (req, res) => {
  const reqUrl = req.protocol + '://' + req.get('host')
  let results = {}
  try {
    results = await searchProducts(req.query.q, req.query.max, reqUrl)
    res.send({ req_date: new Date().toISOString(), results })
  } catch (error) {
    if(error instanceof ServerError) return reqError(res, error.statusCode, error.message)
    reqError(res, 500, error.message)
  }
}

export default {
  getSearch
}