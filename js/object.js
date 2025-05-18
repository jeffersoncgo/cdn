const GetValueFromPath = (path, obj) => path.split('.').reduce((o, i) => o[i], obj);
const MakeObjFromPath = (path, value, obj, spliter = '.') => {
  let paths = path.split(spliter);
  let last = paths.pop();
  let lastObj = paths.reduce((o, i) => o[i] = o[i] || {}, obj);
  lastObj[last] = value;
  return obj;
}
function flattenValues(obj, prefix = '') {
  let values = [];
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      values = values.concat(flattenValues(value, currentPath));
    } else {
      values.push({ path: currentPath, value: String(value) });
    }
  }
  return values;
}

function flattenKeys(obj, path = '') {
  return Object.entries(obj).flatMap(([key, val]) => {
    const fullPath = path ? `${path}.${key}` : key;
    return (val && typeof val === 'object' && !Array.isArray(val))
      ? flattenKeys(val, fullPath)
      : [fullPath];
  });
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


function mergeObjects(obj1, obj2, seen = new WeakSet()) {
  if (seen.has(obj2)) return obj1;
  seen.add(obj2);

  for (let key in obj2) {
    if (typeof obj2[key] === 'object' && obj2[key] !== null && !Array.isArray(obj2[key])) {
      if (!obj1[key]) obj1[key] = {};
      obj1[key] = mergeObjects(obj1[key], obj2[key], seen);
    } else {
      obj1[key] = obj2[key];
    }
  }
  return obj1;
}

/**
 * Main search function.
 * @param {Array<Object>} dataArray - Array of data objects.
 * @param {string} query - Search term (case insensitive).
 * @param {Array<string>} [fields] - Optional list of fields to search (dot notation), or all if omitted.
 * @returns {Array<Object>} - Filtered array that match the query.
 */
function searchInArray(dataArray, query, fields = null) {
  const normalizedQuery = query.toLowerCase();
  return dataArray.filter(data => {
    const flattened = flattenValues(data);

    return flattened.some(({ path, value }) => {
      const inFields = !fields || fields.includes(path);
      return inFields && value.toLowerCase().includes(normalizedQuery);
    });
  });
}

if (typeof module != 'undefined') module.exports = {
  GetValueFromPath,
  MakeObjFromPath,
  cleanObject,
  mergeObjects,
  flattenKeys,
  flattenValues
};