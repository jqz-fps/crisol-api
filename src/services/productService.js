import ServerError from '../models/serverError.js'
import getCheerioPage from '../utils/httpRequest.js'
import { getStoresByProduct } from './storeService.js'

export const getProducByIsbn = async (isbn) => {
  if(!isbn) throw new ServerError("No ISBN provided", 400)
  if(isNaN(isbn)) throw new ServerError("ISBN must be a number", 400)
  if(isbn.length !== 13) throw new ServerError("Invalid ISBN", 400)

  // Get the results and pick the first one
  let $ = await getCheerioPage(`https://www.crisol.com.pe/catalogsearch/result/index/?q=${isbn}`)
  let product_url = $('li.item.product.product-item').find('.product-item-link').attr('href')
  if(!product_url) throw new ServerError("Product not found", 404)

  // Get the product page and search the main data
  let page = await getCheerioPage(product_url)
  let content = page('.column.main')

  // Scrape the data
  let title = content.find('.page-title span').text().trim()
  let image_url = content.find('.gallery-placeholder__image').attr('src')
  let store_page = product_url
  let weight = content.find('[data-th="Peso"]').text().trim()
  let author = content.find('[data-th="Nombre del autor"]').text().trim()
  let publisher = content.find('[data-th="Editorial"]').text().trim()
  let height = content.find('[data-th="Alto"]').text().trim()
  let width = content.find('[data-th="Ancho"]').text().trim()
  let edition_year = content.find('[data-th="Año de edición"]').text().trim()
  let format = content.find('[data-th="Formato"]').text().trim()
  let pages = content.find('[data-th="Número de Páginas"]').text().trim()
  let review = content.find('#product-view-sinopsis > div > div').text().trim()
  let price = content.find('span.price').text().trim().split("S/")[1].trim()
  let has_discount = content.find('.old-price').length > 0
  let old_price = content.find('.old-price').find('span.price').text().trim().replace(/S\/\s*/, "").trim() || null

  const stores = await getStoresByProduct(isbn)

  return {
    title, image_url, store_page, weight, author,
    publisher, height, width, edition_year, format, pages,
    isbn, review, price, has_discount, old_price, stores
  }
}

export const getProducts = async (query, maxResults, request_url) => {
  // Validate the request parameters
  if(!query) throw new ServerError("No query provided", 400)
  if(query.length < 3) throw new ServerError("Query too short (min 3 characters required)", 400)
  
  // Set the default max results per page to 45
  let productsListLimit = 45
  if(maxResults) {
    if(isNaN(maxResults) || maxResults < 1) throw new ServerError("Invalid max results", 400)
    if(maxResults <= 15) productsListLimit = 15
    else if(maxResults <= 30) productsListLimit = 30
  }

  const results = {}
  let page = 1 // Actual page
  let index = 0 // Index of the products

  // Get the results page
  let $ = await getCheerioPage(`https://www.crisol.com.pe/catalogsearch/result/index/?p=${page}&product_list_limit=${productsListLimit}&q=${query}`)
  do {
    // Get all the results
    $('li.item.product.product-item').each((i, el) => {
      let title = $(el).find('.product-item-name a').text().trim()
      let author = $(el).find('div.author').text().trim()
      let isbn = $(el).find('[data-role="tocart-form"]').attr('data-product-sku')
      let image_url = $(el).find('.product-item-photo img').attr('src')
      // Price must be splited because sometimes it has a discount and tag's class changes to .special-price
      let price = $(el).find('span.price').text().trim().split("S/")[1].trim()
      let store_page = $(el).find('.product-item-link').attr('href')
      let has_discount = $(el).find('.old-price').length > 0
      let has_amasty = $(el).find('img.amasty-label-image').attr('src')
      let format = 'book'
      if(has_amasty)
        format = has_amasty.includes('ebook') ? 'ebook' : has_amasty.includes('audiolibro') ? 'audiobook' : 'book'
      let old_price = $(el).find('.old-price').find('span.price').text().trim().replace(/S\/\s*/, "").trim() || null
      let detail_url = request_url + "/products/" + isbn
      if(index >= maxResults) return
      results[index++] = {
        title, author, isbn,
        image_url, price, has_discount,
        old_price, format, detail_url, store_page
      }
    })
    if(index >= maxResults) break
    // Get the next page results of the query
    $ = await getCheerioPage(`https://www.crisol.com.pe/catalogsearch/result/index/?p=${++page}&product_list_limit=${productsListLimit}&q=${query}`)
    // Do this while there are results in the page
  } while (index < productsListLimit && $('li.item.product.product-item').length > 0)

  return results
}