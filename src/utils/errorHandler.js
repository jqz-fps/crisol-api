export default function reqError(res, status, message) {
  res.status(status).send({ status: status, req_date: new Date().toISOString(), error: message })
}