const reqError = require('./utils/errorHandler')
const getCheerioPage = require('./utils/httpRequest')

const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
  // TODO: something with this route :)
  res.send({ message: "Hello World" })
})

app.get('/search', async (req, res) => {
  const maxResults = req.query.max
  const query = req.query.q
  if(!query) return reqError(res, 400, "No query provided")
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
    res.send(results)
  } catch (error) {
    reqError(res, 500, error.message)
  }
})

app.get('/product', (req, res) => {
  const isbn = req.query.isbn
  if(!isbn) return reqError(res, 400, "No ISBN provided")
  // TODO: fetch data from Crisol's page
  res.send(data)
})

// Middleware for non existing routes
app.use((req, res) => {
  reqError(res, 404, "Not found")
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})