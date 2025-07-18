const asyncHandler = (fn) => (req, res, next) => {
    return fn(req, res, next).catch(next);
  };
  
  module.exports = { asyncHandler };
  