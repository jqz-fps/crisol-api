const getCheerioPage = require('../utils/httpRequest')

module.exports = async function getStores() {
  const stores = {}
  
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

  return stores
}