const reqError = require('./utils/errorHandler')
const getCheerioPage = require('./utils/httpRequest')

const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000

const cors = require('cors')
app.use(cors({
  methods: ['GET']
}))

app.get('/', (req, res) => {
  // TODO: something with this route :)
  res.send({ message: "Hello World" })
})

app.get('/search', async (req, res) => {
  // Get and validate the request parameters
  const maxResults = req.query.max
  const query = req.query.q
  if(!query) return reqError(res, 400, "No query provided")
  if(query.length < 3) return reqError(res, 400, "Query too short (min 3 characters required)")
  if(maxResults && (isNaN(maxResults) || maxResults < 1)) return reqError(res, 400, "Invalid max results")
  const results = {}
  let page = 1 // Actual page
  let index = 0 // Index of the products
  try {
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
    
    res.send({ req_date: new Date().toISOString(), results })
  } catch (error) {
    reqError(res, 500, error.message)
  }
})

app.get('/product', async (req, res) => {
  const isbn = req.query.isbn
  if(!isbn) return reqError(res, 400, "No ISBN provided")
  if(isNaN(isbn)) return reqError(res, 400, "ISBN must be a number")
  if(isbn.length !== 13) return reqError(res, 400, "Invalid ISBN")
  try {
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

    res.send({
      req_date: new Date().toISOString(),
      title, image_url, store_page, weight, author,
      publisher, height, width, edition_year, format, pages,
      isbn, synopsis, price, has_discount, old_price, stores
    })
  } catch (error) {
    reqError(res, 500, error.message)
  }
})

app.get("/stores", async (req, res) => {
  const stores = {}
  try {
    // Get the stores page
    let $ = await getCheerioPage("https://www.crisol.com.pe/amlocator/")

    // Pick the stores divs
    $('.amlocator-stores-wrapper .amlocator-store-desc').each((i, el) => {
      let details = $(el).find('.amlocator-store-information')
      let name = details.find('.amlocator-title a').text().trim()
      let city, zip, province, address
      details.contents().each((i, el) => {
        let text = $(el).text().trim()
        if(!text.includes(":")) return
        let [k, v] = text.split(":")
        if(k === "Ciudad") city = v.trim()
        else if(k === "Zip") zip = v.trim()
        else if(k === "Provincia") province = v.trim()
        else if(k === "Dirección") address = v.trim()
      })
      stores[i] = { name, city, zip, province, address }
    })

    res.send({ req_date: new Date().toISOString(), stores })
  } catch (error) {
    reqError(res, 500, error.message)
  }
})

// Middleware for non existing routes
app.use((req, res) => {
  reqError(res, 404, "Not found")
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})