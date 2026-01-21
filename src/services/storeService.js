import ServerError from "../models/serverError.js"
import getCheerioPage from "../utils/httpRequest.js"

export const getStores = async () => {
  const results = {}

  const $ = await getCheerioPage("https://www.crisol.com.pe/stores")

  let storesArray = []

  $('script[type="text/x-magento-init"]').each((i, el) => {
    const content = $(el).html()
    
    if (content.includes('initialStores')) {
      try {
        const config = JSON.parse(content)

        const initialStores = config["#storepickup-viewpage"]
          ?.["Magento_Ui/js/core/app"]
          ?.components
          ?.storepickupView
          ?.config
          ?.initialStores

        if (initialStores) {
          storesArray = initialStores
        }
      } catch (err) {
        console.error("Error al parsear JSON de tiendas:", err)
      }
    }
  })

  storesArray.forEach((location, index) => {
    results[index] = {
      store: location.name,
      city: location.city,
      region: location.region,
      street: location.street,
      postcode: location.postcode,
      phone: location.phone,
    }
  })

  return results
}

export const getStoresByProduct = async (isbn) => {
  // TODO: Implement this
}