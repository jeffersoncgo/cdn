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

      if(xValue < yValue)
        return Descending ? 1 : -1;
      if(xValue > yValue)
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
        xValue = Date.parse(x.innerText).getTime();
        x.setAttribute('_sortValue', xValue);
      } else {
        xValue = parseFloat(xValue);
      }
  
      let yValue = y.getAttribute('_sortValue');
      if (!yValue) {
        yValue = Date.parse(y.innerText).getTime();
        y.setAttribute('_sortValue', yValue);
      } else {
        yValue = parseFloat(yValue);
      }

      if(xValue > yValue)
        return Descending ? 1 : -1;
      if(xValue < yValue)
        return Descending ? -1 : 1;
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

      if(xValue > yValue)
        return Descending ? 1 : -1;
      if(xValue < yValue)
        return Descending ? -1 : 1;
      return 0;
    } catch {
      return 0;
    }
  }
}

class TableSorter {
  constructor(TableId, SortConfig, hasFooter = false) {
    this.Table = typeof TableId == 'object' ? TableId : document.getElementById(TableId);
    this.Table.addEventListener('Sorter', this.Sort);
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
    this.Rows = {
      'Original': [], //While this is only the originalRows content, so we can change it's order without change the table content
      'Sorted': {} //This is the rows already sorted, grouped by sorttile
    };
    this.NeedsIndexing = true;
    this.Setup();
  }

  Setup = () => {
    this.UpdateHeader();
    this.SetupHeader();
    this.SetSortConfig(this.SortConfig);

    let TableObserver = new Observer(this.Table);
    TableObserver.Start();
    TableObserver.AddCallBack(async (mutationsList, observer) => {
      if (this.NeedsIndexing) {
        this.NeedsIndexing = false;
        TableObserver.Destroy();
        await this.FillOriginalRows();
        await this.GenerateSortedData();
        this.UpdateFooter();
      }
    });
  }

  UpdateHeader = () => {
    this.Header = {};
    this.Header.Row = this.Table.getElementsByTagName('thead')[0]?.getElementsByTagName('tr')[0];
    if(!this.Header.Row)
      return; this.Header.Cells = [];
    this.Header.Cells = this.Header.Row.getElementsByTagName('th');
  }

  UpdateFooter = () => {
    this.Footer = {};
    this.Footer.Row = this.Table.getElementsByTagName('tfoot')[0]?.getElementsByTagName('tr')[0];
    if(!this.Footer.Row)
      return; this.Footer.Cells = [];
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
  DefaultSort_Vanilla = (x, y) => {
    return this.Dir == 'Descending' ? x.innerText.toLowerCase() < y.innerText.toLowerCase() : x.innerText.toLowerCase() > y.innerText.toLowerCase();
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
    if (this.LastSortedField != Field)
      this.Dir = 'Ascending'
    else
      this.Dir = this.Dir == 'Descending' ? 'Ascending' : 'Descending';
  }

  ClearCollumnIcon = () => {
    for (let index = 0; index < this.Header.Cells.length; index++)
      this.Header.Cells[index].innerText = this.Header.Cells[index].innerText.replace(this.SortIcons.Desc, '').replace(this.SortIcons.Asc, '');
  }

  AddCollumnIcon = (Title, IsDescending) => {
    const Collumn = this.GetCollumByTitle(Title);
    Collumn.innerText = Collumn.innerText + this.SortIcons[IsDescending ? 'Asc' : 'Desc'];
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

  SortContent = async (Field, IsDescending, useTable = false) => {
    try {
      if (useTable) {
        const rows = this.Table.tBodies[0].rows;
        const sortedRows = this.Rows.Sorted[Field];
        let order, factor;
        if (IsDescending) {
          order = 0;
          factor = 1;
        } else {
          order = rows.length - 1;
          factor = -1;
        }
        for (let index = 0; index < rows.length; index++) {
          const row = rows[index];
          if (row.hasAttribute('_sortignore'))
            continue;
          const sortedRow = sortedRows[order + factor * index];
          if (sortedRow == row)
            continue;
          row.parentNode.insertBefore(sortedRow, row);
        }
      } else {
        const Collum_Index = this.GetCollumnIndex(Field);
        const SortType = this.GetSortType(Field);
        const rows = [...this.Rows.Original].filter(row => this.Header.Row != row && this.Footer.Row != row);
        rows.sort((a, b) => {
          const x = a.getElementsByTagName("TD")[Collum_Index];
          const y = b.getElementsByTagName("TD")[Collum_Index];
          if (a.hasAttribute('_sortignore') || b.hasAttribute('_sortignore'))
            return 0;
          const result =  SortType(x, y, IsDescending);
          return result;
        });
        this.Rows.Sorted[Field] = rows;
      }
    } catch {}
  }

  Sort = Field => {
    if (this.NeedsIndexing) {
      console.log('Sorry, we are still indexing the data')
      return
    };
    this.ChageSortDir(Field);
    this.LastSortedField = Field;
    const Collum_Index = this.GetCollumnIndex(Field);
    const Collum = this.Header.Cells[Collum_Index];
    const IsDescending = this.IsDescending();

    if (Collum_Index == -1) return;

    this.CleanFieldClasses();

    Collum.classList.add('collumnsorted');

    Collum.classList.add(IsDescending ? 'sorted_descending' : 'sorted_ascending')

    this.ClearCollumnIcon();

    this.AddCollumnIcon(Field, IsDescending);

    this.SortContent(Field, IsDescending, true);
  }

  FillOriginalRows = async () => {//Keep this as a simple for loop, if you use foreach, it will bug
    this.Rows.Original = [];
    for (let index = 0; index < this.Table.tBodies[0].rows.length; index++) {
      const row = this.Table.tBodies[0].rows[index];
      this.Rows.Original.push(row)
    }
  };

  GenerateSortedData = async () => { //Keep this as a simple for loop, if you use foreach, it will bug
    for (let index = 0; index < this.Header.Cells.length; index++) {
      const Collumn = this.Header.Cells[index];
      if (Collumn.hasAttribute('_sortignore'))
        continue;
      await this.SortContent(Collumn.getAttribute('sorttitle') || Collumn.innerText, true, false)
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