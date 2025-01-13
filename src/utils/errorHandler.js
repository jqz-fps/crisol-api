export default function reqError(res, status, message) {
  res.status(status).send({ "error": message, "status": status })
}