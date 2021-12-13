module.exports.arr2str = (arr) => arr.map(a => String.fromCharCode(a)).join('')
module.exports.str2arr = (str) => str.split('').map(c => c.charCodeAt(0))
module.exports.arr2buf = (arr) => Buffer.from(arr)
module.exports.int2arr = (int, bytes) => {
  const arr = []
  for (let i = 0; i < bytes; i++) {
    arr.push(int % 256)
    int >>= 8
  }
  return arr.reverse()
}
module.exports.ab2str = (ab) => String.fromCharCode.apply(null, new Uint16Array(ab))
