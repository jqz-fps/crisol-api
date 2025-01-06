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
  const maxResults = req.query.max
  const query = req.query.q
  if(!query) return reqError(res, 400, "No query provided")
  if(query.length < 3) return reqError(res, 400, "Query too short (min 3 characters required)")
  if(maxResults && (isNaN(maxResults) || maxResults < 1)) return reqError(res, 400, "Invalid max results")
  const results = {}
  let page = 1
  let index = 0
  try {
    let $ = await getCheerioPage(`https://www.crisol.com.pe/catalogsearch/result/index/?p=${page}&q=${query}`)
    do {
      $('li.item.product.product-item').each((i, el) => {
        let title = $(el).find('.product-item-name a').text().trim()
        let image_url = $(el).find('.product-item-photo img').attr('src')
        let price = $(el).find('span.price').text().trim().split("S/")[1].trim()
        let link = $(el).find('.product-item-link').attr('href')
        let has_discount = $(el).find('.old-price').length > 0
        let old_price = $(el).find('.old-price').find('span.price').text().trim().split("S/ ")[1] || null
        if(index >= maxResults) return
        results[index++] = {
          title,
          image_url,
          price,
          has_discount,
          old_price,
          link
        }
      })
      if(index >= maxResults) break
      $ = await getCheerioPage(`https://www.crisol.com.pe/catalogsearch/result/index/?p=${page++}&q=${query}`)
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
    let $ = await getCheerioPage(`https://www.crisol.com.pe/catalogsearch/result/index/?q=${isbn}`)
    let product_url = $('li.item.product.product-item').find('.product-item-link').attr('href')
    if(!product_url) return reqError(res, 404, "Product not found")
    let page = await getCheerioPage(product_url)
    let content = page('.column.main')
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
    content.find('#disponibilidad\\.tab tbody tr').each((i, el) => {
      let store = page(el).find('th a').text().trim()
      let stock = page(el).find('th span').text().trim()
      stores[i] = {
        store,
        stock
      }
    })
    res.send({
      req_date: new Date().toISOString(),
      title,
      image_url,
      store_page,
      weight,
      author,
      publisher,
      height,
      width,
      edition_year,
      format,
      pages,
      isbn,
      synopsis,
      price,
      has_discount,
      old_price,
      stores
    })
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