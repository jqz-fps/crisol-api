const ServerError = require('../models/serverError')
const getCheerioPage = require('../utils/httpRequest')

module.exports = async function getProduct(isbn) {
  if(!isbn) throw new ServerError("No ISBN provided", 400)
  if(isNaN(isbn)) throw new ServerError("ISBN must be a number", 400)
  if(isbn.length !== 13) throw new ServerError("Invalid ISBN", 400)

  // Get the results and pick the first one
  let $ = await getCheerioPage(`https://www.crisol.com.pe/catalogsearch/result/index/?q=${isbn}`)
  let product_url = $('li.item.product.product-item').find('.product-item-link').attr('href')
  if(!product_url) return reqError(res, 404, "Product not found")

  // Get the product page and search the main data
  let page = await getCheerioPage(product_url)
  let content = page('.column.main')

  // Scrape the data
  let title = content.find('.page-title span').text().trim()
  let image_url = content.find('#magnifier-item-0').attr('src')
  let store_page = product_url
  let weight = content.find('[data-th="Peso"]').text().trim()
  let author = content.find('[data-th="Nombre del autor"]').text().trim()
  let publisher = content.find('[data-th="Editorial"]').text().trim()
  let height = content.find('[data-th="Alto"]').text().trim()
  let width = content.find('[data-th="Ancho"]').text().trim()
  let edition_year = content.find('[data-th="Año de edición"]').text().trim()
  let format = content.find('[data-th="Formato"]').text().trim()
  let pages = content.find('[data-th="Número de Páginas"]').text().trim()
  let synopsis = content.find('.additional-attributes-wrapper.custom-synopsis p').text()
  let price = content.find('span.price').text().trim().split("S/")[1].trim()
  let has_discount = content.find('.old-price').length > 0
  let old_price = content.find('.old-price span.price').text().trim().split("S/ ")[1] || null
  let stores = {}

  // Get all the stores and stock
  content.find('#disponibilidad\\.tab tbody tr').each((i, el) => {
    stores[i] = {
      store: page(el).find('th a').text().trim(),
      stock: page(el).find('th span').text().trim()
    }
  })

  return {
    title, image_url, store_page, weight, author,
    publisher, height, width, edition_year, format, pages,
    isbn, synopsis, price, has_discount, old_price, stores
  }
}