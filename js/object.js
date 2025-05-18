const GetValueFromPath = (path, obj) => path.split('.').reduce((o, i) => o[i], obj);
const MakeObjFromPath = (path, value, obj, spliter = '.') => {
  let paths = path.split(spliter);
  let last = paths.pop();
  let lastObj = paths.reduce((o, i) => o[i] = o[i] || {}, obj);
  lastObj[last] = value;
  return obj;
}
function cleanObject(obj) {
  for (let key in obj) {
    if (obj[key] === null || obj[key] === undefined || obj[key] === '') {
      delete obj[key];
    } else if (typeof obj[key] === 'object') {
      if(Array.isArray(obj[key])) {
        if(obj[key].length === 0) {
          delete obj[key];
          continue
        }
      }
      if(Object.keys(obj[key]).length === 0) {
        delete obj[key];
        continue
      }
      if(obj[key].constructor === Object && Object.keys(obj[key]).length === 0) {
        delete obj[key];
        continue
      }
      obj = cleanObject(obj[key]);
    }
  }
  return obj;
}


function mergeObjects(obj1, obj2) {
  for (let key in obj2) {
    if (typeof obj2[key] === 'object' && !Array.isArray(obj2[key])) {
      if (!obj1[key]) {
        obj1[key] = {};
      }
      obj1[key] = merge(obj1[key], obj2[key]);
    } else {
      obj1[key] = obj2[key];
    }
  }
  return obj1;
}



if (typeof module != 'undefined') module.exports = {
  GetValueFromPath,
  MakeObjFromPath,
  cleanObject,
  mergeObjects
};