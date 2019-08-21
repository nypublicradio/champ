// inline if helper
function iif(bool, truthy, falsey, ops) {
  // if there are 4 args, return falsey for the false condition
  // otherwise return null
  return bool ? truthy : (ops ? falsey : null);
}

module.exports = {
  iif,
};
