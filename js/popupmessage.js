utils.AddStyle(utils.CurrentUrlToFile('popupmessage.css'));

class PopupMessage {
  /**
   * @param {string} message Shown as text; pass triggers.allowHTML = true to render HTML (old behavior)
   * @param {string} title
   * @param {number} durationMs
   * @param {Object} triggers onMessage, onClose, onShow, onMessageClick, onTitleClick, allowHTML
   */
  constructor(message = '', title = '', durationMs = 3000, triggers = {}) {
    const noop = () => { };
    this._id = PopuMessageManager.getId.id;
    this._message = message;
    this._title = title;
    this._intervalTime = durationMs;
    this._interval = null;
    this._onMessage = triggers["onMessage"] || noop;
    this._onClose = triggers["onClose"] || noop;
    this._onShow = triggers["onShow"] || noop;
    this._onMessageClick = triggers["onMessageClick"] || noop;
    this._onTitleClick = triggers["onTitleClick"] || noop;
    this._closed = false;
    this._messageBox = document.createElement('div');
    this._messageBox.id = `popupMessage${this._id}`;
    this._messageBox.classList.add('messageBox');
    this._messageBox.innerHTML = `
      <button class="closeButton">&times;</button>
      <div class="messageTitle"></div>
      <div class="messageBody"></div>`;
    // Text by default so messages built from API data cannot inject markup
    const field = triggers.allowHTML ? 'innerHTML' : 'textContent';
    this._messageBox.querySelector('.messageTitle')[field] = this._title;
    this._messageBox.querySelector('.messageBody')[field] = this._message;
    this._messageBox.querySelector('.closeButton').addEventListener('click', this.close.bind(this));
    this._messageBox.querySelector('.messageBody').addEventListener('click', this._onMessageClick.bind(this));
    this._messageBox.querySelector('.messageTitle').addEventListener('click', this._onTitleClick.bind(this));
    this._messageBox.addEventListener('click', this._onMessage.bind(this));
    this._interval = setTimeout(this.close.bind(this), this._intervalTime);
    PopuMessageManager.messages.push(this);
    PopuMessageManager.messageHolder.appendChild(this._messageBox);
    this._onShow(this);
  }
  close() {
    if (this._closed) return;
    this._closed = true;
    clearTimeout(this._interval)
    PopuMessageManager.removeMessage(this)
    this._onClose(this);
  }
}

const PopuMessageManager = {
  getId: new PID(),
  messages: [],
  onMessage: () => { },
  onClose: () => { },
  onShow: () => { },
  onMessageClick: () => { },
  onTitleClick: () => { },
  messageHolder: document.createElement('div'),
  addMessage(message, title, durationMs, onMessage, onClose, onShow, onMessageClick, onTitleClick, allowHTML = false) {
    return new PopupMessage(typeof message == 'string' ? message : JSON.stringify(message), title, durationMs, {
      allowHTML,
      onMessage: onMessage || this.onMessage,
      onClose: onClose || this.onClose,
      onShow: onShow || this.onShow,
      onMessageClick: onMessageClick || this.onMessageClick,
      onTitleClick: onTitleClick || this.onTitleClick
    });
  },
  removeMessage(message) {
    const index = this.messages.indexOf(message);
    if (index !== -1) this.messages.splice(index, 1);
    message._messageBox.remove();
  },
}

PopuMessageManager.messageHolder.id = 'messageHolder';
document.addEventListener('DOMContentLoaded', () => {
  document.body.appendChild(PopuMessageManager.messageHolder);
});