utils.AddStyle(utils.CurrentUrlToFile('styles.css'));

class PopupMessage {
  constructor(message = '', title = '', durationMs = 3000, triggers = {}) {
    this._id = PopuMessageManager.getId.id;
    this._message = message;
    this._title = title;
    this._intervalTime = durationMs;
    this._interval = null;
    this._onMessage = triggers["onMessage"];
    this._onClose = triggers["onClose"];
    this._onShow = triggers["onShow"];
    this._onMessageClick = triggers["onMessageClick"];
    this._onTitleClick = triggers["onTitleClick"];
    this._messageBox = document.createElement('div');
    this._messageBox.id = `popupMessage${this._id}`;
    this._messageBox.classList.add('messageBox');
    this._messageBox.innerHTML = `
      <button class="closeButton">&times;</button>
      <div class="messageTitle">${this._title}</div>
      <div class="messageBody">${this._message}</div>`;
    this._messageBox.querySelector('.closeButton').addEventListener('click', this.close.bind(this));
    this._messageBox.querySelector('.messageBody').addEventListener('click', this._onMessageClick.bind(this));
    this._messageBox.querySelector('.messageTitle').addEventListener('click', this._onTitleClick.bind(this));
    this._messageBox.addEventListener('click', this._onMessage.bind(this));
    this._messageBox.addEventListener('transitionend', this._onClose.bind(this));
    this._messageBox.addEventListener('transitionstart', this._onShow.bind(this));
    this._interval = setTimeout(this.close.bind(this), this._intervalTime);
    PopuMessageManager.messages.push(this);
    PopuMessageManager.messageHolder.appendChild(this._messageBox);
  }
  close() {
    clearInterval(this._interval)
    PopuMessageManager.removeMessage(this)
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
  addMessage(message, title, durationMs, onMessage, onClose, onShow, onMessageClick, onTitleClick) {
    new PopupMessage(typeof message == 'string' ? message : JSON.stringify(message), title, durationMs, {
      onMessage: onMessage || this.onMessage,
      onClose: onClose || this.onClose,
      onShow: onShow || this.onShow,
      onMessageClick: onMessageClick || this.onMessageClick,
      onTitleClick: onTitleClick || this.onTitleClick
    });
  },
  removeMessage(message) {
    this.messages.splice(this.messages.indexOf(message), 1);
    this.messageHolder.removeChild(message._messageBox);
  },
}

PopuMessageManager.messageHolder.id = 'messageHolder';
document.body.appendChild(PopuMessageManager.messageHolder);