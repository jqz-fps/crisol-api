import reqError from '../utils/errorHandler.js'
import ServerError from '../models/serverError.js'
import { getStores } from '../services/storeService.js'

export const searchStores = async (req, res) => {
  let results = {}
  try {
    results = await getStores()
    res.send({ req_date: new Date().toISOString(), results })
  } catch (error) {
    if(error instanceof ServerError) return reqError(res, error.statusCode, error.message)
    reqError(res, 500, error.message)
  }
}