export default function resHandler(res, status, keyName, result) {
  res.status(status).send({ status: status, req_date: new Date().toISOString(), [keyName]: result })
}