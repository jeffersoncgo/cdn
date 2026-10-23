// Don't forget to import the base before it
// Don't forget to import the observer

const Sorters = {
  Default: (x, y, Descending) => {
    try {
      let xValue = x.getAttribute('_sortValue');
      if (!xValue) {
        xValue = x.innerText;
        x.setAttribute('_sortValue', xValue);
      }

      let yValue = y.getAttribute('_sortValue');
      if (!yValue) {
        yValue = y.innerText;
        y.setAttribute('_sortValue', yValue);
      }

      if (xValue < yValue)
        return Descending ? 1 : -1;
      if (xValue > yValue)
        return Descending ? -1 : 1;
      return 0;
    } catch {
      return 0;
    }
  },
  Date: (x, y, Descending) => {
    try {
      let xValue = x.getAttribute('_sortValue');
      if (!xValue) {
        xValue = Date.parse(x.innerText);
        x.setAttribute('_sortValue', xValue);
      } else {
        xValue = parseFloat(xValue);
      }

      let yValue = y.getAttribute('_sortValue');
      if (!yValue) {
        yValue = Date.parse(y.innerText);
        y.setAttribute('_sortValue', yValue);
      } else {
        yValue = parseFloat(yValue);
      }

      if (Number.isNaN(xValue)) xValue = -Infinity;
      if (Number.isNaN(yValue)) yValue = -Infinity;
      // Same convention as Sorters.Default: Descending=true sorts from the biggest to the smallest
      if (xValue > yValue)
        return Descending ? -1 : 1;
      if (xValue < yValue)
        return Descending ? 1 : -1;
      return 0;
    } catch {
      return 0;
    }
  },
  Number: (x, y, Descending) => {
    try {
      let xValue = x.getAttribute('_sortValue');
      if (!xValue) {
        xValue = parseFloat(x.innerText, true);
        x.setAttribute('_sortValue', xValue);
      } else {
        xValue = parseFloat(xValue);
      }

      let yValue = y.getAttribute('_sortValue');
      if (!yValue) {
        yValue = parseFloat(y.innerText, true);
        y.setAttribute('_sortValue', yValue);
      } else {
        yValue = parseFloat(yValue);
      }

      if (Number.isNaN(xValue)) xValue = -Infinity;
      if (Number.isNaN(yValue)) yValue = -Infinity;
      // Same convention as Sorters.Default: Descending=true sorts from the biggest to the smallest
      if (xValue > yValue)
        return Descending ? -1 : 1;
      if (xValue < yValue)
        return Descending ? 1 : -1;
      return 0;
    } catch {
      return 0;
    }
  }
}


class TableSorter {
  constructor(TableId, SortConfig, hasFooter = false) {
    this.Table = typeof TableId == 'object' ? TableId : document.getElementById(TableId);
    this.Dir = 'Descending';
    this.hasFooter = hasFooter;
    this.Header = {
      Row: undefined,
      Cells: []
    };
    this.Footer = {
      Row: undefined,
      Cells: []
    };
    this.SortConfig = SortConfig;
    this.SortIcons = { Desc: ' ⤵', Asc: ' ⤴' };
    this.LastSortedField = undefined;
    this.CurrentSortedField = undefined;
    this.Rows = {
      'Original': [], //While this is only the originalRows content, so we can change it's order without change the table content
      'Sorted': {}, //This is the rows already sorted, grouped by sorttile
      'LastSorted': [] //This here will store the Last Sorted rows array, for easier check to see if they actually changed
    };
    this._isApplyingSort = false;
    this._isReady = false;
    this.TableObserver = undefined;
    this.Setup();
  }

  Setup = () => {
    this.UpdateHeader();
    this.SetupHeader();
    this.SetSortConfig(this.SortConfig);
    this.SetupController();
    this.SetupObserver();
    this.reIndex();
    this._isReady = true;
  }

  Destroy = () => {
    this.ClearObserver();
    this._isReady = false;
  }

  SetupObserver = () => {
    this.TableObserver = new Observer(this.Table);
    this.TableObserver.SetListeners([]);
    this.TableObserver.Start();
    this.TableObserver.AddCallBack(Controller.wrap(async () => await this.reIndex(), { delayMs: 100, intervalBetweenRunsMs: 1000 }));
  }

  SetupController = () => {
    this.reIndex = Controller.wrap(this.reIndex);
  };

  ClearObserver = () => {
    this.TableObserver.Destroy();
  }

  rowsChanged = () => {
    if(!this.LastSortedField || !this.CurrentSortedField)
      return true;

    if (this.Rows.LastSorted.length === 0 && this.Rows.Sorted[this.CurrentSortedField].length === 0) {
      return false;
    }

    if (this.Rows.LastSorted.length !== this.Rows.Sorted[this.CurrentSortedField].length) {
      return true;
    }

    for (let i = 0; i < this.Rows.LastSorted.length; i++) {
      if (this.Rows.LastSorted[i] !== this.Rows.Sorted[this.CurrentSortedField][i]) {
        return true;
      }
    }
    return false;
  }

  reIndex = async () => {
    if (this.isIndexing)
      return console.log('Sorry, we are still indexing the data');
    
    try {
      this.isIndexing = true;
      
      if(Array.isArray(this.Rows.Sorted[this.CurrentSortedField]))
        this.Rows.LastSorted = [...this.Rows.Sorted[this.CurrentSortedField]];
      
      this.TableObserver.Stop();
      try {
        this.ClearSortCache();
        await this.FillOriginalRows();
        await this.GenerateSortedData();
      } finally {
        this.TableObserver.Start();
      }
      this.UpdateFooter();
      
      if(this.rowsChanged()) {
        console.log('Rows Changed - Reapplying sort');
        this.LastSortedField = this.CurrentSortedField;
        
        this.TableObserver.Stop();
        try {
          this.ApplySortToTable(this.CurrentSortedField, this.IsDescending());
        } finally {
          this.TableObserver.Start();
        }
      }
    } catch (error) {
      console.error("Error during reIndex:", error);
    }
    this.isIndexing = false;
  };

  // Cell values are cached in the _sortValue attribute; drop them so edited cells sort by their new content
  ClearSortCache = () => {
    for (const cell of this.Table.querySelectorAll('[_sortValue]'))
      cell.removeAttribute('_sortValue');
  }

  UpdateHeader = () => {
    this.Header = {};
    this.Header.Row = this.Table.getElementsByTagName('thead')[0]?.getElementsByTagName('tr')[0];
    this.Header.Cells = [];
    if (!this.Header.Row)
      return;
    this.Header.Cells = this.Header.Row.getElementsByTagName('th');
  }

  UpdateFooter = () => {
    this.Footer = {};
    this.Footer.Row = this.Table.getElementsByTagName('tfoot')[0]?.getElementsByTagName('tr')[0];
    this.Footer.Cells = [];
    if (!this.Footer.Row)
      return;
    this.Footer.Cells = [...this.hasFooter ? this.Footer.Row.getElementsByTagName('th') : []];
  }

  SetupHeader = () => {
    for (let index = 0; index < this.Header.Cells.length; index++) {
      const element = this.Header.Cells[index];
      element.style.userSelect = 'none'
      if (element.hasAttribute('_sortignore'))
        continue;
      element.style.cursor = 'pointer';
      element.classList.add('cansortcollumn')
      if (!element.hasAttribute('sorttitle'))
        element.setAttribute('sorttitle', element.innerText);
      const sortTitle = element.getAttribute('sorttitle');
      element.addEventListener('click', (e) => this.Sort(sortTitle));
      this.Rows.Sorted[sortTitle] = {};
    }
  }
  SetSortConfig = SortConfig => {
    this.SortConfig = SortConfig || window[this.Table.getAttribute('SortConfig')];
    if (!this.SortConfig)
      this.SortConfig = {};
    if (!this.SortConfig.Default)
      this.SortConfig.Default = this.DefaultSort_Vanilla;
  }
  DefaultSort_Vanilla = (x, y, Descending = true) => {
    const cmp = x.innerText.toLowerCase().localeCompare(y.innerText.toLowerCase(), undefined, { numeric: true });
    return Descending ? -cmp : cmp;
  }
  CleanFieldClasses = () => {
    for (let index = 0; index < this.Header.Cells.length; index++) {
      const element = this.Header.Cells[index];
      element.classList.remove('collumnsorted');
      element.classList.remove('sorted_ascending');
      element.classList.remove('sorted_descending');
    }
  }

  IsDescending = () => {
    return this.Dir == 'Descending';
  }

  GetSortType = Field => {
    return !!this.SortConfig[Field] ? this.SortConfig[Field] : this.DefaultSort_Vanilla;
  }

  ChageSortDir = Field => {
    if (this.CurrentSortedField != Field)
      this.Dir = 'Ascending'
    else
      this.Dir = this.Dir == 'Descending' ? 'Ascending' : 'Descending';
  }

  ClearCollumnIcon = () => {
    for (let index = 0; index < this.Header.Cells.length; index++)
      this.Header.Cells[index].querySelectorAll('.tablesorter-icon').forEach(icon => icon.remove());
  }

  AddCollumnIcon = (Title, IsDescending) => {
    const Collumn = this.GetCollumByTitle(Title);
    // The icon lives in its own span so the header keeps any markup it has
    const icon = document.createElement('span');
    icon.className = 'tablesorter-icon';
    icon.textContent = this.SortIcons[IsDescending ? 'Asc' : 'Desc'];
    Collumn.appendChild(icon);
  }

  GetCollumnIndex = Title => {
    for (let index = 0; index < this.Header.Cells.length; index++) {
      const element = this.Header.Cells[index];
      if (element.getAttribute('sorttitle') == Title)
        return index;
    }
    return -1;
  }

  GetCollumByIndex = Index => {
    return this.Header.Cells[Index];
  }

  GetCollumByTitle = Title => {
    return this.GetCollumByIndex(this.GetCollumnIndex(Title));
  }

  Sort = async Field => {
    this.TableObserver.Stop();
    
    try {
      this.ChageSortDir(Field);
      this.CurrentSortedField = Field;
      const Collum_Index = this.GetCollumnIndex(Field);
      const Collum = this.Header.Cells[Collum_Index];
      const IsDescending = this.IsDescending();

      if (Collum_Index == -1) return;

      this.CleanFieldClasses();
      Collum.classList.add('collumnsorted');
      Collum.classList.add(IsDescending ? 'sorted_descending' : 'sorted_ascending');
      this.ClearCollumnIcon();
      this.AddCollumnIcon(Field, IsDescending);

      this.ClearSortCache();
      await this.FillOriginalRows();
      await this.GenerateSortedData();
      this.ApplySortToTable(Field, IsDescending);
    } finally {
      this.TableObserver.Start();
    }
  };

  FillOriginalRows = async () => {//Keep this as a simple for loop, if you use foreach, it will bug
    this.Rows.Original = [];
    for (let index = 0; index < this.Table.tBodies[0].rows.length; index++) {
      const row = this.Table.tBodies[0].rows[index];
      this.Rows.Original.push(row)
    }
  };

  GenerateSortedData = async () => {
    this.Rows.Sorted = {};
    for (let index = 0; index < this.Header.Cells.length; index++) {
      const Collumn = this.Header.Cells[index];
      if (Collumn.hasAttribute('_sortignore'))
        continue;
      
      const Field = Collumn.getAttribute('sorttitle') || Collumn.innerText;
      const Collum_Index = this.GetCollumnIndex(Field);
      const SortType = this.GetSortType(Field);
      
      const rows = [...this.Rows.Original].filter(row => 
        this.Header.Row != row && this.Footer.Row != row && !row.hasAttribute('_sortignore')
      );
      
      rows.sort((a, b) => {
        const x = a.getElementsByTagName("TD")[Collum_Index];
        const y = b.getElementsByTagName("TD")[Collum_Index];
        if (!x || !y) return 0;
        return SortType(x, y, true);
      });
      
      this.Rows.Sorted[Field] = rows;
    }
  };

  ApplySortToTable = (Field, IsDescending) => {
    if(!Field)
      return;
    
    try {
      const rows = this.Table.tBodies[0].rows;
      const sortedRows = this.Rows.Sorted[Field];
      
      if (!sortedRows || !Array.isArray(sortedRows)) {
        console.warn(`No sorted data available for field: ${Field}`);
        return;
      }

      let order, factor;
      if (IsDescending) {
        order = 0;
        factor = 1;
      } else {
        order = sortedRows.length - 1;
        factor = -1;
      }

      let position = 0;
      for (let index = 0; index < rows.length; index++) {
        const row = rows[index];
        if (row.hasAttribute('_sortignore')) continue;
        
        const sortedRow = sortedRows[order + factor * position];
        position++;
        if (!sortedRow) continue;
        if (sortedRow === row) continue;
        
        row.parentNode.insertBefore(sortedRow, row);
      }
    } catch (error) {
      console.error("Error applying sort to table:", error);
    }
  };

}


// var ExampleTableSort = {
//   'Date Added': DateSort,
//   'Date Started': DateSort,
//   'Date Ended': DateSort,
//   'Id': NormalSort,
//   'Status': NormalSort,
//   'FilePath': NormalSort,
//   'Url': NormalSort,
//   'Actions': () => false
// }

// const TableSort = new TableSorter('downloadTable');

// Other more complete example

// function parseIp(ip) {
//   if (!ip) return 0;
//   const ipOnly = ip.split(':')[0].trim();
//   if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ipOnly)) {
//     const parts = ipOnly.split('.').map(n => Math.min(255, Math.max(0, parseInt(n,10) || 0)));
//     return (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];
//   }
//   return ipOnly.localeCompare(ip);
// }

// function getRowFromAB(ab) {
//   return ab?.parentElement
// }

// Sorters['Peer'] = (a, b) => {
//   const vA = a.innerText + (a.innerText || '');
//   const vB = b.innerText + (b.innerText || '');
//   return vA.localeCompare(vB);
// };
// Sorters['IP'] = (a, b) => {
//   const ipA = a.innerText || '';
//   const ipB = b.innerText || '';
//   return parseIp(ipA) - parseIp(ipB);
// };
// Sorters['Endpoint'] = (a, b) => {
//   const ipA = (a.innerText || '').split(':')[0] || '';
//   const ipB = (b.innerText || '').split(':')[0] || '';
//   return parseIp(ipA) - parseIp(ipB);
// };

// Sorters['Receive'] = (a, b) => {
//   a = getRowFromAB(a);
//   b = getRowFromAB(b);
//   const rxA = parseFloat(a.getAttribute('data-rxSpeed')) || 0;
//   const rxB = parseFloat(b.getAttribute('data-rxSpeed')) || 0;
//   return rxB - rxA;
// }

// Sorters['Send'] = (a, b) => {
//   a = getRowFromAB(a);
//   b = getRowFromAB(b);
//   const txA = parseFloat(a.getAttribute('data-txSpeed')) || 0;
//   const txB = parseFloat(b.getAttribute('data-txSpeed')) || 0;
//   return txB - txA;
// }

// Sorters['LastHandshake'] = (a, b) => {
//   a = getRowFromAB(a);
//   b = getRowFromAB(b);
//   const hsA = parseInt(a.getAttribute('data-handshake')) || 0;
//   const hsB = parseInt(b.getAttribute('data-handshake')) || 0;
//   return hsB - hsA;
// }

// const sortConfig = {
//   'PEER': Sorters.Peer,
//   'ENDPOINT': Sorters.Endpoint,
//   'IP': Sorters.IP,
//   'RECEIVE': Sorters.Receive,
//   'SEND': Sorters.Send,
//   'LAST HANDSHAKE': Sorters.LastHandshake
// };

// Init sorter
// document.addEventListener('DOMContentLoaded', () => {
//   setTimeout(() => {
//     window.peersTable_ = new TableSorter('peersTable', sortConfig, false);
//   }, 800);
// });