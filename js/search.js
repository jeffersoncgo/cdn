class SearchEngine {
  constructor() {
    this._searchCache = new WeakMap();
  }

  flattenObject(obj, parentPath = '') {
    const result = [];

    const isPrimitive = (val) =>
      typeof val !== 'object' || val === null;

    const flatten = (val, currentPath) => {
      if (isPrimitive(val)) {
        result.push({ path: currentPath, value: String(val) });
      } else if (Array.isArray(val)) {
        val.forEach((item, idx) => flatten(item, `${currentPath}[${idx}]`));
      } else {
        for (const key in val) {
          if (val.hasOwnProperty(key)) {
            const newPath = currentPath ? `${currentPath}.${key}` : key;
            flatten(val[key], newPath);
          }
        }
      }
    };

    flatten(obj, parentPath);
    return result;
  }

  getFlattenedCache(dataArray) {
    if (!this._searchCache.has(dataArray)) {
      const flattened = dataArray.map(obj => this.flattenObject(obj));
      this._searchCache.set(dataArray, {
        flattened,
        results: new Map()
      });
    }
    return this._searchCache.get(dataArray).flattened;
  }

  search(dataArray, queryOrQueries, sort) {
    const flattened = this.getFlattenedCache(dataArray);
    const cache = this._searchCache.get(dataArray);

    const isComplex = Array.isArray(queryOrQueries) && typeof queryOrQueries[0] === 'object';
    const cacheKey = JSON.stringify({ queryOrQueries, sort });

    if (cache.results.has(cacheKey)) {
      return cache.results.get(cacheKey);
    }

    let results = isComplex
      ? this.searchComplex(flattened, dataArray, queryOrQueries)
      : this.searchSimple(flattened, dataArray, queryOrQueries.toLowerCase(), null);

    if (sort) {
      results = this.sort(results, sort);
    }

    cache.results.set(cacheKey, results);
    return results;
  }



  sort(results, sort) {
    const getComparableValue = (val) => {
      if (val instanceof Date) return val.getTime();
      if (typeof val === 'string' || typeof val === 'number') return val;
      return val !== null && val !== undefined ? String(val) : null;
    };

    const compareValues = (aVal, bVal, order) => {
      if (aVal === bVal) return 0;
      if (aVal === null) return 1;
      if (bVal === null) return -1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return order * aVal.localeCompare(bVal);
      }
      return order * ((aVal > bVal) ? 1 : -1);
    };

    results.sort((a, b) => {
      for (const s of sort) {
        const aVal = getComparableValue(this.getFieldValue(a, s.fields));
        const bVal = getComparableValue(this.getFieldValue(b, s.fields));
        const order = s.type === 'desc' ? -1 : 1;

        const cmp = compareValues(aVal, bVal, order);
        if (cmp !== 0) return cmp;
      }
      return 0;
    });

    return results;
  }

  getFieldValue(obj, fields) {
    for (const field of fields) {
      let value = obj;
      const path = field.split('.');
      for (const p of path) {
        if (value === undefined || value === null) {
          value = undefined;
          break;
        }
        value = value[p];
      }
      if (value !== undefined) {
        return value;
      }
    }
    return undefined;
  }


  searchSimple(flattened, dataArray, normalizedQuery, fields) {
    return dataArray.filter((_, index) => {
      return flattened[index].some(({ path, value }) => {
        const inFields = !fields || fields.some(field => path.startsWith(field));
        return inFields && value.toLowerCase().includes(normalizedQuery);
      });
    });
  }

  searchComplex(flattened, dataArray, queryGroups) {
    const lower = (s) => s.toLowerCase();

    // Require all the matchs to exists
    const filterAll = (data, query) => {
      return data.filter((item) => {
        const idx = dataArray.indexOf(item);
        const flat = flattened[idx];
        const queries = query.queries.map(lower);
        const fields = query.fields ?? [];

        return queries.every(q =>
          flat.some(({ path, value }) =>
            (!fields.length || fields.some(f => path.startsWith(f))) &&
            value.toLowerCase().includes(q)
          )
        );
      });
    }

    // Require any of the matchs to exists, but at least one
    const filterAny = (data, query) => {
      return data.filter((item) => {
        const idx = dataArray.indexOf(item);
        const flat = flattened[idx];
        const queries = query.queries.map(lower);
        const fields = query.fields ?? [];

        return queries.some(q =>
          flat.some(({ path, value }) =>
            (!fields.length || fields.some(f => path.startsWith(f))) &&
            value.toLowerCase().includes(q)
          )
        );
      });
    }

    const filterBigger = (data, query) => {
      return data.filter((item) => {
        const idx = dataArray.indexOf(item);
        const flat = flattened[idx];
        const queryValue = parseFloat(query.queries[0]);
        const fields = query.fields ?? [];

        return flat.some(({ path, value }) => {
          const fieldValue = parseFloat(value);
          return !isNaN(fieldValue) &&
            (!fields.length || fields.some(f => path.startsWith(f))) &&
            fieldValue > queryValue;
        });
      });
    }

    const filterSmaller = (data, query) => {
      return data.filter((item) => {
        const idx = dataArray.indexOf(item);
        const flat = flattened[idx];
        const queryValue = parseFloat(query.queries[0]);
        const fields = query.fields ?? [];

        return flat.some(({ path, value }) => {
          const fieldValue = parseFloat(value);
          return !isNaN(fieldValue) &&
            (!fields.length || fields.some(f => path.startsWith(f))) &&
            fieldValue < queryValue;
        });
      });
    }

    const filterEqual = (data, query) => {
      return data.filter((item) => {
        const idx = dataArray.indexOf(item);
        const flat = flattened[idx];
        const queryValue = parseFloat(query.queries[0]);
        const fields = query.fields ?? [];

        return flat.some(({ path, value }) => {
          const fieldValue = parseFloat(value);
          return !isNaN(fieldValue) &&
            (!fields.length || fields.some(f => path.startsWith(f))) &&
            fieldValue === queryValue;
        });
      });
    }

    // const filterNotEqual = (data, query) => {
    //   return data.filter((item) => {
    //     const idx = dataArray.indexOf(item);
    //     const flat = flattened[idx];
    //     const queryValue = parseFloat(query.queries[0]);
    //     const fields = query.fields ?? [];

    //     return flat.some(({ path, value }) => {
    //       const fieldValue = parseFloat(value);
    //       return !isNaN(fieldValue) &&
    //         (!fields.length || fields.some(f => path.startsWith(f))) &&
    //         fieldValue !== queryValue;
    //     });
    //   });
    // }

    const filterNotEqual = (data, query) => {
      const queryValues = new Set(query.queries.map(v => String(v).toLowerCase())); // Normalize once
      const fields = query.fields ?? [];

      return data.filter((item) => {
        const idx = dataArray.indexOf(item);
        const flat = flattened[idx];

        return flat.some(({ path, value }) => {
          const normalizedValue = String(value).toLowerCase();
          const fieldMatch = !fields.length || fields.some(f => path.startsWith(f));
          return fieldMatch && !queryValues.has(normalizedValue);
        });
      });
    };

    const filterBetween = (data, query) => {
      return data.filter((item) => {
        const idx = dataArray.indexOf(item);
        const flat = flattened[idx];
        const queryValue1 = parseFloat(query.queries[0]);
        const queryValue2 = parseFloat(query.queries[1]);
        const fields = query.fields ?? [];

        return flat.some(({ path, value }) => {
          const fieldValue = parseFloat(value);
          return !isNaN(fieldValue) &&
            (!fields.length || fields.some(f => path.startsWith(f))) &&
            fieldValue >= queryValue1 && fieldValue <= queryValue2;
        });
      });
    }

    // Sort the queryGroups by all, =, !=, >, <, between and in the last any
    queryGroups.sort((a, b) => {
      const order = {
        'all': 0,
        '=': 1,
        '!=': 2,
        '>': 3,
        '<': 4,
        '..': 5,
        'any': 6
      };
      return order[a.operator] - order[b.operator];
    });

    const operators = {
      'all': filterAll,
      'any': filterAny,
      '>': filterBigger,
      '<': filterSmaller,
      '=': filterEqual,
      '!=': filterNotEqual,
      '..': filterBetween
    };

    let filtered = dataArray;

    for (const query of queryGroups) {
      if (operators[query.operator]) {
        filtered = operators[query.operator](filtered, query)
      }
    }

    return filtered;
  }
}

if (typeof module !== 'undefined') module.exports = SearchEngine;
else window.search = new SearchEngine();
