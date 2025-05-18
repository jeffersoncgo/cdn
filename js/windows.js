class Custom_Window {
	constructor(id, width, height, top, left, parent = document.body, sizeable, title, buttons, elements, icon) {
		this.id = id;
		this.width = width;
		this.height = height;
		this.top = top;
		this.left = left;
		this.parent = parent;
		this.sizeable = sizeable;
		this.title = title;
		this.icon = icon;
		this._buttons = this.SafeConvert(buttons);
		this._elements = this.SafeConvert(elements);
		this._shown = false;
		this._maximized = false;
		this._center = false;
		this.onresize = null;
		this.onscroll = null;
		this.onmousemove = null;
		this.onmouseup = null;
		this.onmousedown = null;
		this.onkeydown = null;
		this.onkeyup = null;
		this.onkeypress = null;
		this.onwheel = null;
		this.oncontextmenu = null;
		this.onfocus = null;
		this.onblur = null;
		this.window_div = null;
		this.default_buttons = {
			info: {
				text: Config.UserConfig.ThemeIcons ? JCGWeb.Windows.MakeIconElement('info', 'popup-button-icon') : '<i class="popup-button-icon" class="fa-solid fa-info"></i>',
				onclick: () => {
					this.Info();
				}
			},
			minimize: {
				text: Config.UserConfig.ThemeIcons ? JCGWeb.Windows.MakeIconElement('minimize_window', 'popup-button-icon') : '<i class="popup-button-icon" class="fa-solid fa-window-minimize"></i>',
				onclick: () => {
					this.Minimize();
				}
			},
			maximize: {
				text: Config.UserConfig.ThemeIcons ? JCGWeb.Windows.MakeIconElement('maximize_window', 'popup-button-icon') : '<i class="popup-button-icon" class="fa-solid fa-window-maximize"></i>',
				onclick: () => {
					this.Maximize();
				}
			},
			close: {
				text: Config.UserConfig.ThemeIcons ? JCGWeb.Windows.MakeIconElement('close_window', 'popup-button-icon') : '<i class="popup-button-icon" class="fa-solid fa-square-xmark"></i>',
				onclick: () => {
					this.Close();
				}
			}
		}
	}

	SafeConvert(Value) {
		if (Array.isArray(Value))
			return Value
		else
			return [Value];
	}

	Create_Buttons() {
		let buttons_keys = Object.keys(this._buttons);
		let window_buttons_div = document.createElement('div');
		window_buttons_div.classList.add('custom-window-buttons');
		for (let i = 0; i < buttons_keys.length; i++) {
			let button = this._buttons[buttons_keys[i]];
			if (typeof button == 'string') {
				if (this.default_buttons.hasOwnProperty(button)) {
					button = this.default_buttons[button];
				} else {
					button = {
						text: button,
						onclick: () => { }
					}
				}
			}
			let button_div = document.createElement('div');
			button_div.classList.add('custom-window-button');
			button_div.classList.add('noselect');
			let button_i = document.createElement('i');
			button_i.classList.add('custom-window-button-icon');
			button_i.innerHTML = button.text;
			button_div.onclick = button.onclick;
			button_div.appendChild(button_i);
			window_buttons_div.appendChild(button_div);
		}

		return window_buttons_div;
	}

	Create_Elements() {
		let window_content_div = document.createElement('div');
		window_content_div.classList.add('custom-window-content');
		for (let i = 0; i < this._elements.length; i++) {
			let element = this._elements[i];
			element.classList.add('custom-window-content-element');
			window_content_div.appendChild(element);
		}
		return window_content_div;
	}

	Create_Window() {
		let window_div = document.createElement('div');
		window_div.id = `pid_${this.id}`;
		window_div.classList.add('custom-window');
		window_div.onclick = (() => {
			window_div.classList.add('focused');
		})

		let window_top_bar = document.createElement('div');
		window_top_bar.classList.add('custom-window-top-bar');
		let window_title_text = document.createElement('span');
		window_title_text.classList.add('custom-window-title-text');
		window_title_text.classList.add('noselect');
		window_title_text.innerHTML = this.title;
		let icon = JCGWeb.Functions.CreateElementFromHTML(this.icon)[0];
		icon.classList.add('custom-window-title-icon');
		icon.classList.add('noselect');
		window_top_bar.appendChild(icon);
		window_top_bar.appendChild(window_title_text);

		let window_buttons_div = this.Create_Buttons();

		window_top_bar.appendChild(window_buttons_div);

		let window_content_div = this.Create_Elements();

		window_div.appendChild(window_top_bar);

		window_div.appendChild(window_content_div);

		this.window_div = window_div;
		this.parent.appendChild(this.window_div);
		return this.window_div;
	}

	Show(top = this.top, left = this.left, width = this.width, height = this.height, center = true,) {
		this.window_div.style.display = 'flex';
		this._shown = true;
		if (!center) {
			let info = JCGWeb.Functions.MakeSafePos(width, height, left, top, this.parent);
			width = `calc(${width} * var(--screen-scale))`;
			height = `calc(${height} * var(--screen-scale))`;
			left = `${info.left}px`;
			top = `${info.top}px`;
			this.window_div.style.transform = this.window_div.style.transform.replace('translate(-50%, -50%)', '');
			this.window_div.style.borderRadius = 'var(--border-radius)'
		} else {
			width = `calc(${width} * var(--screen-scale))`;
			height = `calc(${height} * var(--screen-scale))`;
			left = `50%`;
			top = `50%`;
			this.window_div.style.transform = `translate(-50%, -50%)`;
			this.window_div.style.borderRadius = 'var(--border-radius)';
		}
		this.window_div.style.width = width;
		this.window_div.style.height = height;
		this.window_div.style.top = top;
		this.window_div.style.left = left;
		this.window_div.classList.add('focused')
	}

	Close() {
		this.closed = true;
		this.window_div.remove();
		JCGWeb.Windows.Clean();
	}

	Maximize() {
		if (this._maximized) {
			this.window_div.classList.remove('maximized')
			this._maximized = false;
		} else {
			this.window_div.classList.add('maximized');
			this._maximized = true;
		}
	}

	Minimize() {
		this.window_div.style.display = 'none';
		this.window_div.classList.remove('focused');
		this._shown = false;
	}

	Info() {
		console.log(this)
	}

	/*get shown() {
		return this._shown;
	}

	set shown(value) {
		this._shown = value;
	}*/
}

class Windows {
	constructor() {
		this.Windows = {};
	}
	AddWindow() {
		let id = JCGWeb.PID.id;
		let window = new Custom_Window(
			id,
			'50%',
			'50%',
			'0px',
			'0px',
			document.body,
			true,
			'Window',
			[
				'info',
				'minimize',
				'maximize',
				'close',
			],
			[]
		);
		this.Windows[id] = window;
		return window;
	}

	Clean() {
		let keys = Object.keys(this.Windows);
		for (let i = 0; i < keys.length; i++) {
			let window = this.Windows[keys[i]];
			if (window.closed) {
				delete this.Windows[keys[i]];
			}
		}
	}

	GetWindowFromEvent = (event) => {
		let el = event.target;
		while (!!el && !el.classList.contains('custom-window')) {
			el = el.parentElement;
		}
		return this.GetWindowObjById(this.ElementId(el));
	}

	GetWindowFromElement = (element) => {
		let el = element;
		while (!!el && !el.classList.contains('custom-window')) {
			el = el.parentElement;
		}
		return this.GetWindowObjById(this.ElementId(el));
	}

	GetWindowFromID = (id) => {
		return document.getElementById(`pid_${id}`);
	}

	CloseWindowByEvent = (event) => {
		let win = this.GetWindowFromEvent(event);
		win.Close();
	}

	CloseWindowByElement = (element) => {
		let win = this.GetWindowFromElement(element);
		win.Close();
	}

	ElementId = (element) => {
		return element.id.replace('pid_', '');
	}

	GetWindowObjById = (id) => {
		return this.Windows[id];
	}

	CreatePopup(Title, Text, Icon, CloseButton = false, OK_Text, OK_Callback, Cancel_Text, Cancel_Callback, CloseBtnFuncion) {
		let Popup = this.AddWindow();
		Popup.title = Title;
		let TextElement = document.createElement('div');
		TextElement.classList.add('popup-text');
		TextElement.innerHTML = Text;
		let Buttons = !CloseButton ? [] : ['close'];
		Popup.width = 'auto';
		Popup.height = 'auto';
		Popup._buttons = Buttons;
		Popup._elements = [TextElement];
		let Buttons_Div = document.createElement('div');
		Buttons_Div.classList.add('popup-buttons');
		let OK_Button;
		let Cancel_Button
		if (Cancel_Text) {
			Cancel_Button = document.createElement('button');
			Cancel_Button.classList.add('btn');
			Cancel_Button.classList.add('btn-cancel');
			Cancel_Button.innerHTML = Cancel_Text;
			Cancel_Button.onclick = Cancel_Callback || (() => { Popup.Close(Popup) });
			Buttons_Div.appendChild(Cancel_Button);
			if (!CloseBtnFuncion)
				CloseBtnFuncion = Cancel_Button.onclick;
		}
		if (OK_Text) {
			OK_Button = document.createElement('button');
			OK_Button.classList.add('btn');
			OK_Button.classList.add('btn-ok');
			OK_Button.innerHTML = OK_Text;
			OK_Button.onclick = OK_Callback;
			Buttons_Div.appendChild(OK_Button);
			if (!CloseBtnFuncion)
				CloseBtnFuncion = OK_Button.onclick;
		}
		if (OK_Text || Cancel_Text) {
			if (!!OK_Button && !Cancel_Button) {
				OK_Button.style.right = '-100%'
				OK_Button.style.transform = 'translate(-100%, 0)'
			}
			if (!OK_Button && Cancel_Button) {
				Cancel_Button.style.right = '-100%'
				Cancel_Button.style.transform = 'translate(-100%, 0)'
			}
			Popup._elements.push(Buttons_Div);
		}
		if (CloseBtnFuncion)
			Popup.default_buttons.close.onclick = CloseBtnFuncion || (() => { Popup.Close(Popup) });
		Popup.icon = Icon;
		Popup.Create_Window();
		Popup.Show(true);
	}

	CreateMessagePopup1Btn(Icon, Text_HTML, Message_HTML, OkFunction) {
		Icon = `<img src="/fileexplorer/themes/${Config.UserConfig.Theme}/icons/${Icon}.svg?type=modules" type="${Icon}">`;
		this.CreatePopup(Text_HTML, Message_HTML, Icon, true, 'OK', (
			(e) => {
				if (OkFunction)
					OkFunction(e);
				this.CloseWindowByEvent(e)
			})
		)
	}
	
	CreateMessagePopup2Btn(Icon, Text_HTML, Message_HTML, OkFunction, CancelFunction) {
		Icon = `<img src="/fileexplorer/themes/${Config.UserConfig.Theme}/icons/${Icon}.svg?type=modules" type="${Icon}">`;
		this.CreatePopup(Text_HTML, Message_HTML, Icon, true, 'OK', (
			(e) => {
				if (OkFunction)
					OkFunction(e);
				this.CloseWindowByEvent(e)
			}), 'Cancel', (
			(e) => {
				if (CancelFunction)
					CancelFunction(e);
				this.CloseWindowByEvent(e)
			})
		)
	}

	MakeIconElement(IconName, iclass = '') {
		iclass = !!iclass ? `class="${iclass}"` : '';
		return `<img ${iclass} onerror="OnLoadMiniatureError(event)" src="/fileexplorer/themes/${Config.UserConfig.Theme}/icons/${IconName}.svg?type=modules" type="${IconName}">`;
	}

	CreateViewer(title, widht, height, icon, FileUrl) {
		let FileViewer = this.AddWindow();
		FileViewer.title = title;
		FileViewer.width = widht || 'auto';
		FileViewer.height = height || 'auto';
		FileViewer.icon = this.MakeIconElement(icon, 'popup-button-icon');
		FileViewer.fileurl = FileUrl;
		return FileViewer;
	}

	SetupViewer(Viewer, Element, Type) {
		Element.width = Viewer.width;
		Element.height = Viewer.height;
		Element.classList.add('viewer');
		Element.classList.add(`file-viewer-${Type}`);
		Element.classList.add('noselect');
		Viewer._elements.push(Element)
		Viewer.Create_Window();
	}

	CreateImageViewer(ImageUrl) {
		let ImageViewer = this.CreateViewer('Image Viewer', 'auto', 'auto', 'image', ImageUrl);
		let ImageElement = document.createElement('img');
		ImageElement.src = ImageUrl.includes('?') ? `${ImageUrl}&compress=false` : `${ImageUrl}?&compress=false`;
		this.SetupViewer(ImageViewer, ImageElement, 'image');
		ImageViewer.Maximize();
		ImageViewer.Show(true);
	}

	CreatePDFViewer(PDFUrl) {
		let PDFViewer = this.CreateViewer('PDF Viewer', '500px', '800px', 'pdf', PDFUrl);
		let PDFElement = document.createElement('iframe');
		PDFElement.src = PDFUrl;
		this.SetupViewer(PDFViewer, PDFElement, 'pdf');
		PDFViewer.Maximize();
		PDFViewer.Show(true);
	}

	CreateVideoViewer(VideoUrl) {
		let VideoViewer = this.CreateViewer('Video Player', 'auto', 'auto', 'video', VideoUrl);
		let videoElement = this.CreateMidiaElement('video', VideoUrl);
		this.SetupViewer(VideoViewer, videoElement, 'video');
		VideoViewer.Maximize();
		VideoViewer.Show(true);
	}

	CreateAudioViewer(AudioUrl) {
		let AudioViewer = this.CreateViewer('Audio Player', '300px', '280px', 'audio', AudioUrl);
		let audioElement = this.CreateMidiaElement('audio', AudioUrl);
		this.SetupViewer(AudioViewer, audioElement, 'audio');
		AudioViewer.Create_Window();
		AudioViewer.Show(true);
	}

	CreateTextViewer(TextUrl) {
		this.FetchTextData(TextUrl).then((data) => {
			let TextViewer = this.CreateViewer('File Viewer', '800px', '600px', 'text', TextUrl);
			let textElement = document.createElement('textarea');
			textElement.setAttribute('contenteditable', 'true');
			textElement.value = data;
			textElement.width = TextViewer.width;
			textElement.height = TextViewer.height;
			let icon = this.MakeIconElement('save', 'popup-button-icon');
			console.log(icon)
			let sabeButton = {
				text: icon,
				onclick: () => {
					let data = textElement.value;
					let blob = new Blob([data], { type: "text/plain;charset=utf-8" });
					saveAs(blob, TextViewer.title);
				}
			}
			TextViewer._buttons.unshift(sabeButton);
			this.SetupViewer(TextViewer, textElement, 'text');
			TextViewer.Maximize();
			TextViewer.Show(true);
		});
	}

	CreateHTMLViewer(FileUrl) {

	}

	DownloadFile(FileUrl, Name) {
		//Make the browser start the download of the file
		let link = document.createElement('a');
		link.href = FileUrl;
		link.download = Name;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}

	async FetchTextData(Url) {
		let response = await fetch(Url);
		let data = await response.text();
		return data;
	}

	CreateMidiaElement(type, MediaUrl) {
		function getAlbumArtUrl(audioElement) {
			const mediaSource = audioElement.mediaElement && audioElement.mediaElement;
			const tracks = mediaSource && mediaSource.tracks ? mediaSource.tracks : [];
			for (let i = 0; i < tracks.length; i++) {
				const track = tracks[i];
				if (track.id === 'ID3v2' && track.type === 'metadata') {
					const metadata = track.details;
					if (metadata && metadata.picture && metadata.picture.data) {
						const pictureData = new Uint8Array(metadata.picture.data);
						const blob = new Blob([pictureData], { type: metadata.picture.format });
						return URL.createObjectURL(blob);
					}
				}
			}
			return null;
		}
		let albumArt = document.createElement('img');
		let mediaElement;
		if ((typeof Audio == 'undefined') || (typeof VideoDecoder == 'undefined')) {
			mediaElement = document.createElement('iframe');
			mediaElement.setAttribute('frameborder', '0');
			mediaElement.setAttribute('src', MediaUrl + '?autoplay=1');
		} else {
			mediaElement = document.createElement(type);
			let sourceElement = document.createElement('source');
			mediaElement.setAttribute('controls', 'true');
			mediaElement.setAttribute('autoplay', 'true')
			mediaElement.setAttribute('frameborder', '0');
			sourceElement.setAttribute('type', `${type}/mp4`);//mpeg
			sourceElement.setAttribute('src', MediaUrl);
			mediaElement.appendChild(sourceElement);
			mediaElement.addEventListener('loadedmetadata', () => {
				const metadata = mediaElement.seekable && mediaElement.seekable.length ? mediaElement.seekable.end(0) : NaN;
				if (!isNaN(metadata)) {
					console.log(MediaUrl)
					const audioObjectUrl = URL.createObjectURL(MediaUrl);
					const audioElement = new Audio(audioObjectUrl);
					audioElement.addEventListener('loadedmetadata', () => {
						const albumArtUrl = getAlbumArtUrl(audioElement);
						if (albumArtUrl) {
							albumArt.src = albumArtUrl;
						}
					});			
					audioElement.load();
				}
			});
			mediaElement.appendChild(albumArt);
		}
		return mediaElement;
	}


}

JCGWeb.Windows = new Windows();