const axios = require('axios')
const cheerio = require('cheerio')

module.exports = async function getCheerioPage(url, config = {}) {
  try {
    const response = await axios.get(url, config)
    return cheerio.load(response.data)
  } catch (error) {
    
  }
}