class SearchEngine {
  constructor() {
    this._searchCache = new WeakMap();
  }

  // Flatten nested object into path-value pairs
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

  // Get flattened data from cache or build it
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

  // Main entry
  search(dataArray, queryOrQueries, fallbackFields = null) {
    const flattened = this.getFlattenedCache(dataArray);
    const cache = this._searchCache.get(dataArray);

    const isComplex = Array.isArray(queryOrQueries) && typeof queryOrQueries[0] === 'object';
    const cacheKey = JSON.stringify({ query: queryOrQueries, fields: fallbackFields });

    if (cache.results.has(cacheKey)) {
      return cache.results.get(cacheKey);
    }

    const results = isComplex
      ? this.searchComplex(flattened, dataArray, queryOrQueries)
      : this.searchSimple(flattened, dataArray, queryOrQueries.toLowerCase(), fallbackFields);

    cache.results.set(cacheKey, results);
    return results;
  }

  // Simple string search
  searchSimple(flattened, dataArray, normalizedQuery, fields) {
    return dataArray.filter((_, index) => {
      return flattened[index].some(({ path, value }) => {
        const inFields = !fields || fields.includes(path);
        return inFields && value.toLowerCase().includes(normalizedQuery);
      });
    });
  }

  // Complex structured query
  searchComplex(flattened, dataArray, queryGroups) {
    const lower = (s) => s.toLowerCase();

    const allFilters = queryGroups.filter(q => q.match === 'all');
    const anyFilters = queryGroups.filter(q => q.match === 'any');

    const passedAll = dataArray.filter((_, idx) => {
      const flat = flattened[idx];

      for (const group of allFilters) {
        const queries = group.queries.map(lower);
        const fields = group.fields ?? [];

        const groupPasses = queries.every(q =>
          flat.some(({ path, value }) =>
            (!fields.length || fields.includes(path)) &&
            value.toLowerCase().includes(q)
          )
        );

        if (!groupPasses) return false;
      }

      return true;
    });

    if (!anyFilters.length) return passedAll;

    return passedAll.filter(item => {
      const idx = dataArray.indexOf(item);
      const flat = flattened[idx];

      return anyFilters.some(group => {
        const queries = group.queries.map(lower);
        const fields = group.fields ?? [];

        return group.match === 'all'
          ? queries.every(q =>
              flat.some(({ path, value }) =>
                (!fields.length || fields.includes(path)) &&
                value.toLowerCase().includes(q)
              )
            )
          : queries.some(q =>
              flat.some(({ path, value }) =>
                (!fields.length || fields.includes(path)) &&
                value.toLowerCase().includes(q)
              )
            );
      });
    });
  }
}