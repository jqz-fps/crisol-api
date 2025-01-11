const ServerError = require('../models/serverError')
const getCheerioPage = require('../utils/httpRequest')

module.exports = async function searchProducts(query, maxResults) {
  // Validate the request parameters
  if(!query) throw new ServerError("No query provided", 400)
  if(query.length < 3) throw new ServerError("Query too short (min 3 characters required)", 400)
  if(maxResults && (isNaN(maxResults) || maxResults < 1)) throw new ServerError("Invalid max results", 400)
  const results = {}
  let page = 1 // Actual page
  let index = 0 // Index of the products

  // Get the results page
  let $ = await getCheerioPage(`https://www.crisol.com.pe/catalogsearch/result/index/?p=${page}&q=${query}`)
  do {
    // Get all the results
    $('li.item.product.product-item').each((i, el) => {
      let title = $(el).find('.product-item-name a').text().trim()
      let isbn = $(el).find('[data-role="tocart-form"]').attr('data-product-sku')
      let image_url = $(el).find('.product-item-photo img').attr('src')
      let price = $(el).find('span.price').text().trim().split("S/")[1].trim()
      let link = $(el).find('.product-item-link').attr('href')
      let has_discount = $(el).find('.old-price').length > 0
      let old_price = $(el).find('.old-price').find('span.price').text().trim().split("S/ ")[1] || null
      if(index >= maxResults) return
      results[index++] = {
        title,
        isbn,
        image_url,
        price,
        has_discount,
        old_price,
        link
      }
    })
    if(index >= maxResults) break
    // Get the next page results of the query
    $ = await getCheerioPage(`https://www.crisol.com.pe/catalogsearch/result/index/?p=${++page}&q=${query}`)
    // Do this while there are results in the page
  } while ($('li.item.product.product-item').length > 0)

  return results
}