// Envuelve controladores async para mandar los errores al errorHandler
module.exports = (fn) => (req, res, next) => fn(req, res, next).catch(next);
