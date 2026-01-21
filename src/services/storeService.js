import ServerError from "../models/serverError.js"
import getCheerioPage from "../utils/httpRequest.js"
import axios from "axios"

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
  const storesData = await axios.get(
    `https://www.crisol.com.pe/stores/service/stores/?skus[]=${isbn}`,
    {
      headers: {
        'x-requested-with': 'XMLHttpRequest',
      }
    }
  )

  if (storesData.status !== 200)
    throw new ServerError("No stores found", 404)

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

  return stores
}