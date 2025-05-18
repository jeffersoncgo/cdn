utils.AddStyle(utils.CurrentUrlToFile('styles.css'));
class TreeListCreator {
  constructor() {
    this.document = document.createElement('div');
    this.FullHTML = '';
    this.Tree = undefined;
    this.Opened = false;
    this.Sanitize = true;
  }

  SanitizeLista(data) {
    let NewLista = Array.isArray(data) ? [] : {};
    for (let key in data)
      NewLista[key.replaceAll('/', '.').replaceAll('\\', '.')] = data[key];
    return this.CloneObjectIntoLayersPath(NewLista);
  }

  CloneObjectIntoLayersPath(data) {
    let NewObject = Array.isArray(data) ? [] : {};
    for (let key in data) {
      if (typeof data[key] == 'object') {
        NewObject = !Array.isArray(data[key]) ? this.createObjectLayers(NewObject, key, data[key]) : this.createArrayLayers(NewObject, key, data[key]);
      } else
        NewObject[key] = data[key];
    }
    return NewObject;
  }

  createObjectLayers(obj, ipath, value) {
    let current = obj;
    const layers = ipath.split('.');
    layers.forEach((item, index) => {
      try {
        current[item] = current[item] || {};
        if (index == layers.length - 1) current[item] = value
        else current = current[item];
      } catch (error) { }
    })
    return obj;
  }

  createArrayLayers(array, ipath, value) {
    let current = array;
    const layers = ipath.split('.');
    layers.forEach((item) => {
      try {
        current[item] = current[item] || [];
        current = current[item];
      } catch (error) { }
    });
    current.push(value);
    return array;
  }

  async createDetails(data, parent) {
    let Type = typeof data;
    let IsArray = Array.isArray(data);
    switch (Type) {
      case 'object':
        if (IsArray) {
          let Itherate = Object.keys(data);
          Itherate.forEach(async (element, index) => {
            let Item = data[element];
            let target = undefined;
            let isComplex = typeof Item == 'object';
            if (isComplex) {
              let details = document.createElement('details');
              let summary = document.createElement('summary');
              summary.innerHTML = Item.Key || element;
              details.appendChild(summary);
              target = details;
            } else
              target = parent;
            this.createDetails(Item, target).then(() => {
              if (this.Opened)
                target.setAttribute('open', '');
              if (isComplex)
                parent.appendChild(target)
            })
          });
        } else {
          for (let key in data) {
            let details = document.createElement('details');
            let summary = document.createElement('summary');
            summary.innerHTML = key;
            details.appendChild(summary);
            this.createDetails(data[key], details).then(() => {
              if (this.Opened)
                details.setAttribute('open', '')
              parent.appendChild(details);
            })
          }
        }
        break;
      default:
        let li = document.createElement('li');
        let text = document.createTextNode(data);
        li.appendChild(text);
        parent.appendChild(li);
        break;
    }
  }

  CloseAll() {
    let details = this.document.getElementsByTagName('details');
    for (let i = 0; i < details.length; i++) {
      details[i].removeAttribute('open');
    }
    this.Opened = false;
  }

  OpenAll() {
    let details = this.document.getElementsByTagName('details');
    for (let i = 0; i < details.length; i++) {
      details[i].setAttribute('open', '');
    }
    this.Opened = true;
  }

  async TreeHTML(Json) {
    if (Json/* || !this.Tree*/)
      this.MakeTree(Json);
    this.document.innerHTML = '';
    await this.createDetails(this.Tree, this.document);
    return this.document.innerHTML;
  }

  MakeTree(Json) {
    this.Tree = this.Sanitize ? this.SanitizeLista(Json) : Json;
  }
}

const TreeListManager = new TreeListCreator();