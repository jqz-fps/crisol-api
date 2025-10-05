import ServerError from '../models/serverError.js'
import getCheerioPage from '../utils/httpRequest.js'

export default async function searchProducts(query, maxResults) {
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
      let price = $(el).find('span.price').text().trim().split("S/")[1].trim()
      let link = $(el).find('.product-item-link').attr('href')
      let has_discount = $(el).find('.old-price').length > 0
      let has_amasty = $(el).find('img.amasty-label-image').attr('src')
      let format = 'book'
      if(has_amasty)
        format = has_amasty.includes('ebook') ? 'ebook' : has_amasty.includes('audiolibro') ? 'audiobook' : 'book'
      let old_price = $(el).find('.old-price').find('span.price').text().trim().split("S/ ")[1] || null
      if(index >= maxResults) return
      results[index++] = {
        title,
        author,
        isbn,
        image_url,
        price,
        has_discount,
        old_price,
        format,
        link
      }
    })
    if(index >= maxResults) break
    // Get the next page results of the query
    $ = await getCheerioPage(`https://www.crisol.com.pe/catalogsearch/result/index/?p=${++page}&product_list_limit=${productsListLimit}&q=${query}`)
    // Do this while there are results in the page
  } while ($('li.item.product.product-item').length > 0)

  return results
}