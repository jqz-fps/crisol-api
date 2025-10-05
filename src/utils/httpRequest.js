import axios from 'axios'
import * as cheerio from 'cheerio'

export default async function getCheerioPage(url, config = {}) {
  try {
    const response = await axios.get(url, config)
    return cheerio.load(response.data)
  } catch (error) {
    
  }
}