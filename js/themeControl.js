utils.AddStyle(utils.CurrentUrlToFile('themeControl.css'));
var themeSliderControl = new Controller(shiftTheme.bind(this));
themeSliderControl = themeSliderControl.exec.bind(themeSliderControl);

let themeShifted = 1;

let themeCtrl_Themes = {};

const fixColorAngle = angle =>  {
  const negative = angle < 0;
  angle = Math.abs(angle);
  return negative && angle > 256 ? 256 - (angle % 256) : negative && angle < 256 ? 256 - angle : angle > 256 ? angle % 256 : angle;
}

const isColorValue = value => /rgb|rgba|hsl|hsla|\#[0-9a-f]{3,6}/i.test(value); //check if the value is a color
const rgbToHex = (r, g, b) => `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
const rgbaToHex = (r, g, b, a) => `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}${componentToHex(a * 255)}`;
const componentToHex = c => (c.toString(16).padStart(2, '0')).toUpperCase();
const isValidHex = color => /^#?([a-f\d]{3})/i.test(color);
const invertComponent =value => Math.max(0, Math.min(255, 255 - value));
const invertColor = color => invertHexColor(colorToHex(color));
const shiftRgbComponents = (rgb, angle) => rgb.map(component => fixColorAngle(component + angle));


function hexToRgb(hexColor) {
  const hex = hexColor.startsWith("#") ? hexColor.slice(1) : hexColor;
  const [r, g, b] = hex.match(/([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/i).slice(1).map(str => parseInt(str, 16));
  return [r, g, b];
}

function invertAlpha(alpha) {
  const weight = 0.2;
  return 1 - Math.min(1, alpha * weight) / weight;
}

function invertHue(hue) {
  const invertedHue = (hue + 180) % 360;
  return invertedHue < 0 ? invertedHue + 360 : invertedHue;
}

function invertLightness(lightness) {
  const weight = 0.5;
  return 100 - Math.min(100, lightness * weight) / weight;
}

function colorToHex(color) {
  const efun = match => {
    const [, colorSpace, components] = match;
    const componentValues = components.split(',').map(str => parseFloat(str, 10));
    switch (colorSpace.toLowerCase()) {
      case 'rgb':
        return rgbToHex(...componentValues);
      case 'rgba':
        return rgbaToHex(...componentValues);
      case 'hsl':
      case 'hsla': return rgbToHex(...hslToRgb(...componentValues));
      default:
        console.log("Unsupported color space", {color, colorSpace, components});
        return color;
    }
  }
  if (isValidHex(color)) return color
  const matchValues = color.match(/^(\w+)\(([^)]+)\)/i);

  if (!matchValues) {
    console.error(`Invalid color: ${color}`);
    return color;
  }

  return efun(matchValues).split('.')[0];
}

function hslToRgb(h, s, l) {
  h = h / 360;
  s = s / 100;
  l = l / 100;
  if (s === 0) return [l * 255, l * 255, l * 255];
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h * 6) % 2 - 1));
  const m = l - c / 2;
  const [r, g, b] = h < 1 / 6 ? [c, x, 0] : h < 1 / 3 ? [x, c, 0] : h < 1 / 2 ? [0, c, x] : h < 2 / 3 ? [0, x, c] : h < 5 / 6 ? [x, 0, c] : [c, 0, x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}


function invertHexColor(color) {
  try {
    if(!color)
      return
    if(!isValidHex(color)) {
      console.error(`Invalid hex color: ${color}`);
      return color;
    }
    const [, r, g, b] = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/i?.exec(color);
    if (!r || !g || !b) {
      console.error(`Invalid hex color: ${color}`);
      return color;
    };
    return `rgb(${255 - parseInt(r, 16)}, ${255 - parseInt(g, 16)}, ${255 - parseInt(b, 16)})`;
  } catch (error) {}
}

function shiftColor(color, angle) {
  const hexColor = isValidHex(color) ? color : colorToHex(color);
  if(!isValidHex(hexColor)) {
    console.error(`Invalid color: ${color}`);
    return color;
  }
  return rgbToHex(...shiftRgbComponents(hexToRgb(hexColor), angle));
}

function invertTheme() {
  const colorRules = getCSSRulesWithColors();
  for (const rule of colorRules) {
    for (let i = 0; i < rule.style.length; i++) {
      const property = rule.style[i];
      const value = rule.style.getPropertyValue(property);
      if (isColorValue(value)) rule.style.setProperty(property, invertColor(value));
    }
  }
}

function shiftTheme(angle) {
  const colorRules = getCSSRulesWithColors();
  const selectorName = document.getElementById('theme-css-selector')?.value || 'theme-auto';
  for (const rule of colorRules) {
    if (selectorName != 'theme-auto' && rule.selectorText != selectorName) continue;
    for (let i = 0; i < rule.style.length; i++) {
      const property = rule.style[i];
      const value = rule.style.getPropertyValue(property);
      if (isColorValue(value))
        rule.style.setProperty(property, shiftColor(value, angle));
    }
  }
}

const isColorRule = style =>  {
  for (let i = 0; i < style.length; i++) if (isColorValue(style.getPropertyValue(style[i]))) return true;
  return false;
}

const makeQueryPathUntilBody = element => {
  const path = [];
  while (element !== document.body && element !== document.documentElement && element != null) {
    path.push(element);
    element = element.parentElement;
  }
  const names = [];
  for (let index = 0; index < path.length; index++) {
    const element = path[index];
    if (element.id) {
      names.push(`#${element.id}`);
      break;
    } else if (element.className)
      names.push(`.${element.className}`)
    else names.push(element.tagName);
  }
  return names.join(' ') || 'body';
}

function getCSSRulesWithColors() {
  const allRules = [];
  // rules from stylesheets:
  const styleSheets = document.styleSheets;
  for (let i = 0; i < styleSheets.length; i++) {
    try {
      const rules = styleSheets[i].cssRules || styleSheets[i].rules;
      if(!rules) continue;
      for (let j = 0; j < rules.length; j++) {
        const rule = rules[j];
        if (isColorRule(rule.style)) allRules.push(rule);
      }
    } catch (error) {
      console.error(error);
    }
  }

  //inline styles:
  const elements = document.querySelectorAll('*');
  for (const element of elements) {
    const inlineStyle = element.style;
    if (isColorRule(inlineStyle)) allRules.push({ selectorText: makeQueryPathUntilBody(element), style: inlineStyle });
  }
  return allRules;
}

function addThemeToList(themeName) {
  const themeListSelect = document.getElementById('theme-list');
  const option = document.createElement('option');
  option.value = themeName;
  option.textContent = themeName;
  themeListSelect.appendChild(option);
}

function themeCtrl_saveTheme() {
  //open an input asking the user to set the theme name
  let prompt = window.prompt("Enter a name for your theme");
  if (!prompt) return;
  const colorRules = getCSSRulesWithColors();
  const colors = [];
  for (const rule of colorRules) {
    for (let i = 0; i < rule.style.length; i++) {
      const property = rule.style[i];
      const value = rule.style.getPropertyValue(property);
      let selector = rule.selectorText;
      if (selector != ':root' || !selector.startsWith('#') || !selector.startsWith('.')) {
        try {
          const selectors = document.querySelectorAll(selector);
          for (let index = 0; index < selectors.length; index++) {
            const element = selectors[index];
            const style = getComputedStyle(element);
            if (style.getPropertyValue(property) !== value) continue;
            if(element.id)
              selector = `#${element.id}`;
            else if(element.className)
              selector = `.${element.className}`;
            else {
              selector = element.tagName;
              if(element.parentElement) {
                const parent = element.parentElement;
                let parentSelector = parent.id ? `#${parent.id}` : parent.className ? `.${parent.className}` : parent.tagName;
                selector = `${parentSelector} ${selector}`;
              }
            }
            break;
          }
        } catch (e) {
          console.error(e);
        }
      }
      if (isColorValue(value)) colors.push({ selector, property, value });
    }
  }
  addThemeToList(prompt);
  themeCtrl_Themes[prompt] = colors;
  localStorage.setItem("themeCtrlThemes", JSON.stringify(themeCtrl_Themes));
  localStorage.setItem("themeCtrlTheme", prompt);
  const themeListSelect = document.getElementById('theme-list');
  themeListSelect.value = prompt;
}

function themeCtrl_deleteTheme() {
  const themeListSelect = document.getElementById('theme-list');
  const themeName = themeListSelect.value;
  if (!themeName) return;
  delete themeCtrl_Themes[themeName];
  localStorage.setItem("themeCtrlThemes", JSON.stringify(themeCtrl_Themes));
  themeListSelect.remove(themeListSelect.selectedIndex);
}

function themeCtrl_loadTheme() {
  const themeName = localStorage.getItem("themeCtrlTheme");
  if (themeName) themeCtrl_setTheme(themeName);
}

function themeCtrl_setTheme(theme) {
  if(!themeCtrl_Themes[theme])
    themeCtrl_Themes = JSON.parse(localStorage.getItem("themeCtrlThemes")) || {};
  const colors = themeCtrl_Themes[theme];
  if (!colors) return;
  const selectorTarger = document.getElementById('theme-css-selector')?.value || 'theme-auto';
  if (selectorTarger == 'theme-auto') {
    for (const color of colors) {
      try {
        const elements = document.querySelectorAll(color.selector);
        for (const element of elements) { try { element.style.setProperty(color.property, color.value) } catch (error) {
          console.error(error);
        }}
      } catch (error) {
        console.error(error);
      }
    }
  } else {
    for (const color of colors) {
      if(color.selector != selectorTarger) continue;
      const elements = document.querySelectorAll(color.selector);
      for (const element of elements) { try { element.style.setProperty(color.property, color.value) } catch (error) {
        console.error(error);
      }}
    }
  }
  localStorage.setItem("themeCtrlTheme", theme);
}

function createThemeControlButton() {
  const themeControlButton = document.createElement('button');
  themeControlButton.id = 'theme-control-button';
  themeControlButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-brush" viewBox="0 0 16 16"><path d="M15.825.12a.5.5 0 0 1 .132.584c-1.53 3.43-4.743 8.17-7.095 10.64a6.1 6.1 0 0 1-2.373 1.534c-.018.227-.06.538-.16.868-.201.659-.667 1.479-1.708 1.74a8.1 8.1 0 0 1-3.078.132 4 4 0 0 1-.562-.135 1.4 1.4 0 0 1-.466-.247.7.7 0 0 1-.204-.288.62.62 0 0 1 .004-.443c.095-.245.316-.38.461-.452.394-.197.625-.453.867-.826.095-.144.184-.297.287-.472l.117-.198c.151-.255.326-.54.546-.848.528-.739 1.201-.925 1.746-.896q.19.012.348.048c.062-.172.142-.38.238-.608.261-.619.658-1.419 1.187-2.069 2.176-2.67 6.18-6.206 9.117-8.104a.5.5 0 0 1 .596.04M4.705 11.912a1.2 1.2 0 0 0-.419-.1c-.246-.013-.573.05-.879.479-.197.275-.355.532-.5.777l-.105.177c-.106.181-.213.362-.32.528a3.4 3.4 0 0 1-.76.861c.69.112 1.736.111 2.657-.12.559-.139.843-.569.993-1.06a3 3 0 0 0 .126-.75zm1.44.026c.12-.04.277-.1.458-.183a5.1 5.1 0 0 0 1.535-1.1c1.9-1.996 4.412-5.57 6.052-8.631-2.59 1.927-5.566 4.66-7.302 6.792-.442.543-.795 1.243-1.042 1.826-.121.288-.214.54-.275.72v.001l.575.575zm-4.973 3.04.007-.005zm3.582-3.043.002.001h-.002z"/></svg>`
  themeControlButton.onclick = showThemeControl;
  document.body.appendChild(themeControlButton);
}

function showThemeControl() {
  themeCtrl_Themes = JSON.parse(localStorage.getItem("themeCtrlThemes")) || {};
  const cssRules = getCSSRulesWithColors();
  const themeCtrlTheme = localStorage.getItem("themeCtrlTheme");
  let themeSpacer = document.getElementById('theme-spacer');
  if (themeSpacer) themeSpacer.style.display = 'block';
  else {
    themeSpacer = document.createElement('div');
    themeSpacer.id = 'theme-spacer';

    const cssRulesSelect = document.createElement('select');
    cssRulesSelect.id = 'theme-css-selector';
    const automaticOption = document.createElement('option');
    automaticOption.value = 'theme-auto';
    automaticOption.textContent = 'Auto';
    cssRulesSelect.appendChild(automaticOption);

    for (const rule of cssRules) {
      const option = document.createElement('option');
      option.value = rule.selectorText;
      option.textContent = rule.selectorText;
      cssRulesSelect.appendChild(option);
    }

    const themeListSelect = document.createElement('select');
    themeListSelect.id = 'theme-list';
    themeListSelect.onchange = () => {
      const deleteButton = document.getElementById('theme-delete');
      deleteButton.disabled = false;
      themeCtrl_setTheme(themeListSelect.value)
    };
    const themes = JSON.parse(localStorage.getItem("themeCtrlThemes")) || {};
    if (themes) {
      for (const theme in themes) {
        const option = document.createElement('option');
        option.value = theme;
        option.textContent = theme;
        themeListSelect.appendChild(option);
      }
    }

    themeListSelect.value = themeCtrlTheme;

    const saveButton = document.createElement('button');
    saveButton.id = 'theme-save';
    saveButton.textContent = 'Save Theme';
    saveButton.onclick = themeCtrl_saveTheme;

    const deleteButton = document.createElement('button');
    deleteButton.id = 'theme-delete';
    deleteButton.textContent = 'Delete Theme';
    deleteButton.disabled = Object.keys(themes).length === 0;
    deleteButton.onclick = themeCtrl_deleteTheme;

    const closeControl = document.createElement('button');
    closeControl.id = 'theme-control-close';
    closeControl.textContent = 'Close';
    closeControl.onclick = () => themeSpacer.style.display = 'none';

    const invertButton = document.createElement('button');
    invertButton.id = 'theme-invert';
    invertButton.textContent = 'Invert Colors';
    invertButton.onclick = invertTheme;

    const slider = document.createElement('input');
    slider.id = 'theme-slider';
    slider.type = 'range';
    slider.min = 0;
    slider.max = 256;
    slider.value = 0;
    slider.step = 1;
    slider.oninput = () => {
      themeSliderControl(slider.value - themeShifted)
      themeShifted = slider.value;
    };

    const control = document.createElement('div');
    control.id = 'theme-control';
    const style = getComputedStyle(document.body);
    control.style.backgroundColor = style.backgroundColor;
    control.style.color = style.color;
    control.style.border = style.border;

    control.appendChild(cssRulesSelect);
    control.appendChild(slider);
    control.appendChild(themeListSelect);
    control.appendChild(saveButton);
    control.appendChild(deleteButton);
    control.appendChild(invertButton);
    control.appendChild(closeControl);

    themeSpacer.appendChild(control);

    document.body.appendChild(themeSpacer);
    themeCtrl_loadTheme()
  };
}


document.addEventListener('DOMContentLoaded', createThemeControlButton);

setTimeout(() => themeCtrl_loadTheme(), 100);
