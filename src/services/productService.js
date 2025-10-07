import ServerError from '../models/serverError.js'
import getCheerioPage from '../utils/httpRequest.js'
import axios from 'axios'

export default async function getProduct(isbn) {
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
  let synopsis = content.find('.additional-attributes-wrapper.custom-synopsis p').text()
  let price = content.find('span.price').text().trim().split("S/")[1].trim()
  let has_discount = content.find('.old-price').length > 0
  let old_price = content.find('.old-price').find('span.price').text().trim().replace(/S\/\s*/, "").trim() || null

  // Get all the stores and stock

  const storesData = await axios.get(
    `https://www.crisol.com.pe/stores/service/stores/?skus[]=${isbn}`,
    {
      headers: {
        'x-requested-with': 'XMLHttpRequest',
      }
    }
  )

  const rawStores = storesData.data?.stores || {}
  const stores = Object.values(rawStores).map(store => {
    const stockInfo = store.stock && store.stock[0]
    return {
      store: store.name,
      city: store.city,
      district: store.district,
      phone: store.phone,
      address: store.street,
      stock: stockInfo.quantity ?? 0,
      description: store.description
    }
  })

  return {
    title, image_url, store_page, weight, author,
    publisher, height, width, edition_year, format, pages,
    isbn, synopsis, price, has_discount, old_price, stores
  }
}