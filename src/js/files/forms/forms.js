// Підключення функціоналу "Чертоги Фрілансера"
// Підключення списку активних модулів
import { flsModules } from "../modules.js";
// Допоміжні функції
import { isMobile, _slideUp, _slideDown, _slideToggle, FLS } from "../functions.js";
// Модуль прокручування до блоку
import { gotoBlock } from "../scroll/gotoblock.js";
//================================================================================================================================================================================================================================================================================================================================

// Робота із полями форми.
// Инициализация полей формы
export function formFieldsInit(options = { viewPass: true, autoHeight: false }) {
	// Обработчик фокуса на полях ввода
	document.body.addEventListener("focusin", function (e) {
		const targetElement = e.target;
		if ((targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA')) {
			if (!targetElement.hasAttribute('data-no-focus-classes')) {
				targetElement.classList.add('_form-focus');
				targetElement.parentElement.classList.add('_form-focus');
			}
			formValidate.removeError(targetElement);
			targetElement.hasAttribute('data-validate') ? formValidate.removeError(targetElement) : null;
		}
	});

	// Обработчик потери фокуса
	document.body.addEventListener("focusout", function (e) {
		const targetElement = e.target;
		if ((targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA')) {
			if (!targetElement.hasAttribute('data-no-focus-classes')) {
				targetElement.classList.remove('_form-focus');
				targetElement.parentElement.classList.remove('_form-focus');
			}
			// Мгновенная валидация
			targetElement.hasAttribute('data-validate') ? formValidate.validateInput(targetElement) : null;
		}
	});

	// Функционал "Показать пароль"
	if (options.viewPass) {
		document.addEventListener("click", function (e) {
			let targetElement = e.target;
			const viewpassEl = targetElement.closest('.form-popup__viewpass');
			if (viewpassEl) {
				const input = viewpassEl.previousElementSibling;
				if (input && input.tagName === 'INPUT') {
					const inputType = viewpassEl.classList.contains('_viewpass-active') ? "password" : "text";
					input.setAttribute("type", inputType);
					viewpassEl.classList.toggle('_viewpass-active');
				}
			}
		});
	}

	// Автовысота для textarea
	if (options.autoHeight) {
		const textareas = document.querySelectorAll('textarea[data-autoheight]');
		if (textareas.length) {
			textareas.forEach(textarea => {
				const startHeight = textarea.hasAttribute('data-autoheight-min') ?
					Number(textarea.dataset.autoheightMin) : Number(textarea.offsetHeight);
				const maxHeight = textarea.hasAttribute('data-autoheight-max') ?
					Number(textarea.dataset.autoheightMax) : Infinity;
				setHeight(textarea, Math.min(startHeight, maxHeight))
				textarea.addEventListener('input', () => {
					if (textarea.scrollHeight > startHeight) {
						textarea.style.height = `auto`;
						setHeight(textarea, Math.min(Math.max(textarea.scrollHeight, startHeight), maxHeight));
					}
				});
			});
			function setHeight(textarea, height) {
				textarea.style.height = `${height}px`;
			}
		}
	}

	// Проверка паролей в реальном времени
	document.addEventListener("input", function (e) {
		const target = e.target;
		if (target.type === "password") {
			const form = target.closest('form');
			if (form) {
				const passwordInputs = form.querySelectorAll('input[type="password"]');
				if (passwordInputs.length >= 2) {
					const [password1, password2] = passwordInputs;
					if (target === password2 && password1.value && password2.value) {
						if (password1.value !== password2.value) {
							formValidate.addError(password2);
							formValidate.removeSuccess(password2);
						} else {
							formValidate.removeError(password2);
							formValidate.addSuccess(password2);
						}
					}
				}
			}
		}
	});
}

// Валидация форм
export let formValidate = {
	getErrors(form) {
		let error = 0;
		let formRequiredItems = form.querySelectorAll('*[data-required]');
		if (formRequiredItems.length) {
			formRequiredItems.forEach(formRequiredItem => {
				if ((formRequiredItem.offsetParent !== null || formRequiredItem.tagName === "SELECT") && !formRequiredItem.disabled) {
					error += this.validateInput(formRequiredItem);
				}
			});

			// Дополнительная проверка совпадения паролей
			const passwordInputs = form.querySelectorAll('input[type="password"]');
			if (passwordInputs.length >= 2) {
				const [password1, password2] = passwordInputs;
				if (password1.value && password2.value && password1.value !== password2.value) {
					this.addError(password2);
					this.removeSuccess(password2);
					error++;
				}
			}
		}
		return error;
	},

	validateInput(formRequiredItem) {
		let error = 0;

		// Проверка на совпадение паролей для поля подтверждения пароля
		if (formRequiredItem.type === "password" &&
			(formRequiredItem.placeholder === "Введите повторно пароль" ||
				formRequiredItem.nextElementSibling?.classList?.contains('form-popup__viewpass'))) {
			const form = formRequiredItem.closest('form');
			const passwordInputs = form.querySelectorAll('input[type="password"]');
			if (passwordInputs.length >= 2) {
				const [password1, password2] = passwordInputs;
				if (password1.value !== password2.value) {
					this.addError(formRequiredItem);
					this.removeSuccess(formRequiredItem);
					error++;
					return error;
				}
			}
		}

		if (formRequiredItem.dataset.required === "email") {
			formRequiredItem.value = formRequiredItem.value.replace(" ", "");
			if (this.emailTest(formRequiredItem)) {
				this.addError(formRequiredItem);
				this.removeSuccess(formRequiredItem);
				error++;
			} else {
				this.removeError(formRequiredItem);
				this.addSuccess(formRequiredItem);
			}
		} else if (formRequiredItem.type === "checkbox" && !formRequiredItem.checked) {
			this.addError(formRequiredItem);
			this.removeSuccess(formRequiredItem);
			error++;
		} else {
			if (!formRequiredItem.value.trim()) {
				this.addError(formRequiredItem);
				this.removeSuccess(formRequiredItem);
				error++;
			} else {
				this.removeError(formRequiredItem);
				this.addSuccess(formRequiredItem);
			}
		}
		return error;
	},

	addError(formRequiredItem) {
		// Если ошибка уже есть, ничего не делаем
		if (formRequiredItem.classList.contains('_form-error')) return;

		formRequiredItem.classList.add('_form-error');
		formRequiredItem.parentElement.classList.add('_form-error');

		// Находим контейнер .form__input
		const inputContainer = formRequiredItem.closest('.form__input') || formRequiredItem.parentElement;

		// Проверяем, есть ли уже сообщение об ошибке
		const existingError = inputContainer.querySelector('.form__error');
		if (existingError) return;

		// Получаем сообщение об ошибке из data-error
		let errorMessage = formRequiredItem.dataset.error;
		if (!errorMessage && formRequiredItem.type === "password" &&
			(formRequiredItem.placeholder === "Введите повторно пароль" ||
				formRequiredItem.nextElementSibling?.classList?.contains('form-popup__viewpass'))) {
			errorMessage = "Пароли не совпадают";
		}

		if (errorMessage) {
			// Создаем контейнер для ошибки
			const errorContainer = document.createElement('div');
			errorContainer.className = 'form__error-container';

			// Создаем элемент .form__error и устанавливаем текст из data-error
			const errorElement = document.createElement('div');
			errorElement.className = 'form__error';
			errorElement.textContent = errorMessage;

			errorContainer.appendChild(errorElement);

			// Вставляем после основного контейнера
			inputContainer.insertAdjacentElement('afterend', errorContainer);

			// Сохраняем ссылку на контейнер ошибки
			formRequiredItem._errorContainer = errorContainer;
		}
	},

	removeError(formRequiredItem) {
		formRequiredItem.classList.remove('_form-error');
		formRequiredItem.parentElement.classList.remove('_form-error');

		// Удаляем контейнер с ошибкой, если он был создан
		if (formRequiredItem._errorContainer) {
			formRequiredItem._errorContainer.remove();
			delete formRequiredItem._errorContainer;
		}

		// Дополнительная проверка на случай, если контейнер был создан другим способом
		const inputContainer = formRequiredItem.closest('.form__input') || formRequiredItem.parentElement;
		const nextElement = inputContainer.nextElementSibling;
		if (nextElement && nextElement.classList.contains('form__error-container')) {
			nextElement.remove();
		}
	},

	addSuccess(formRequiredItem) {
		formRequiredItem.classList.add('_form-success');
		formRequiredItem.parentElement.classList.add('_form-success');
	},

	removeSuccess(formRequiredItem) {
		formRequiredItem.classList.remove('_form-success');
		formRequiredItem.parentElement.classList.remove('_form-success');
	},

	formClean(form) {
		form.reset();
		setTimeout(() => {
			let inputs = form.querySelectorAll('input,textarea');
			for (let index = 0; index < inputs.length; index++) {
				const el = inputs[index];
				el.parentElement.classList.remove('_form-focus');
				el.classList.remove('_form-focus');
				this.removeError(el);
			}
			let checkboxes = form.querySelectorAll('.checkbox__input');
			if (checkboxes.length > 0) {
				for (let index = 0; index < checkboxes.length; index++) {
					const checkbox = checkboxes[index];
					checkbox.checked = false;
				}
			}
			if (flsModules.select) {
				let selects = form.querySelectorAll('div.select');
				if (selects.length) {
					for (let index = 0; index < selects.length; index++) {
						const select = selects[index].querySelector('select');
						flsModules.select.selectBuild(select);
					}
				}
			}
		}, 0);
	},

	emailTest(formRequiredItem) {
		return !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/.test(formRequiredItem.value);
	}
}

// Отправка форм
export function formSubmit() {
	const forms = document.forms;
	if (forms.length) {
		for (const form of forms) {
			form.addEventListener('submit', function (e) {
				const form = e.target;

				// 1. Сначала стандартная валидация полей
				if (formValidate.getErrors(form)) {
					e.preventDefault();
					return;
				}

				// 2. Для формы регистрации - проверка капчи
				if (form.id === 'regform') {
					const captchaContainer = form.querySelector('.g-recaptcha');
					const smartTokenInput = captchaContainer?.querySelector('input[name="smart-token"]');
					const smartToken = smartTokenInput?.value;
					const captchaTokenInput = document.getElementById('captchaToken');
					const captchaToken = captchaTokenInput?.value;

					// Проверяем наличие хотя бы одного токена
					if (!smartToken && !captchaToken) {
						e.preventDefault();
						showResultMessage('Пожалуйста, пройдите проверку на робота', true, form);
						highlightCaptchaError(captchaContainer);
						return;
					}

					// Синхронизируем токены если нужно
					if (smartToken && !captchaToken) {
						captchaTokenInput.value = smartToken;
					}
				}

				formSubmitAction(form, e);
			});

			form.addEventListener('reset', function (e) {
				const form = e.target;
				formValidate.formClean(form);
				clearFileInputs(form);

				if (form.id === 'regform') {
					resetCaptcha();
				}
			});
		}
	}

	async function formSubmitAction(form, e) {
		e.preventDefault();

		const formAction = form.getAttribute('action');
		if (!formAction || formAction.includes('.html')) {
			showResultMessage('Ошибка: указан неверный адрес отправки формы', true, form);
			return;
		}

		const formMethod = form.getAttribute('method')?.toUpperCase() || 'POST';
		const formData = new FormData(form);

		// Для формы регистрации добавляем токен капчи
		if (form.id === 'regform') {
			const captchaToken = document.getElementById('captchaToken')?.value;
			if (captchaToken) {
				formData.append('captcha_token', captchaToken);
			}
		}

		const fileInput = form.querySelector('input[type="file"]');
		if (fileInput?.files?.length > 0) {
			Array.from(fileInput.files).forEach(file => {
				formData.append(fileInput.name || 'files[]', file);
			});
		}

		form.classList.add('_sending');
		showResultMessage('Отправка данных...', false, form);

		try {
			const response = await fetch(formAction, {
				method: formMethod,
				body: formData,
				headers: {
					'Accept': 'application/json'
				}
			});

			const result = await parseResponse(response);

			if (!response.ok || result.success === false) {
				throw new Error(result.message || 'Ошибка сервера');
			}

			showResultMessage(result.message || 'Форма успешно отправлена', false, form);
			form.reset();
			clearFileInputs(form);

			if (form.id === 'regform') {
				resetCaptcha();
			}

			const previewsContainer = form.querySelector('.form__previews');
			if (previewsContainer) previewsContainer.innerHTML = '';

			formSent(form, result);

		} catch (error) {
			form.classList.remove('_sending');
			console.error('Ошибка отправки:', error);
			showResultMessage(extractErrorMessage(error), true, form);

			if (form.id === 'regform') {
				resetCaptcha();
			}
		}
	}

	// Функции для работы с капчей
	function highlightCaptchaError(captchaContainer) {
		if (!captchaContainer) return;
		captchaContainer.classList.add('_captcha-error');
		captchaContainer.scrollIntoView({
			behavior: 'smooth',
			block: 'center'
		});
	}

	function resetCaptcha() {
		const captchaTokenInput = document.getElementById('captchaToken');
		if (captchaTokenInput) captchaTokenInput.value = '';

		const captchaContainer = document.querySelector('.g-recaptcha');
		if (captchaContainer) {
			captchaContainer.classList.remove('_captcha-error');

			// Сброс виджета капчи если поддерживается API
			if (window.smartCaptcha && typeof window.smartCaptcha.reset === 'function') {
				window.smartCaptcha.reset();
			}
		}
	}

	// Остальные вспомогательные функции
	function clearFileInputs(form) {
		const fileInputs = form.querySelectorAll('input[type="file"]');
		fileInputs.forEach(input => {
			input.value = '';
		});

		if (typeof fileList !== 'undefined') {
			fileList.length = 0;
		}
	}

	function formSent(form, responseResult = {}) {
		document.dispatchEvent(new CustomEvent("formSent", {
			detail: {
				form: form,
				response: responseResult
			}
		}));

		if (responseResult.success !== false) {
			const popupId = form.dataset.popupMessage;
			if (popupId) {
				if (typeof FLSModules !== 'undefined' && FLSModules.popup) {
					FLSModules.popup.open(popupId);
				}
				else if (typeof flsModules !== 'undefined' && flsModules.popup) {
					flsModules.popup.open(popupId);
				}
				else if (typeof MicroModal !== 'undefined') {
					MicroModal.show(popupId.replace('#', ''));
				}
			}
		}

		formValidate.formClean(form);
		formLogging('Форма отправлена!');
	}

	async function parseResponse(response) {
		try {
			const contentType = response.headers.get('content-type');
			if (contentType && contentType.includes('application/json')) {
				return await response.json();
			}
			const text = await response.text();
			try {
				return JSON.parse(text);
			} catch {
				return { success: false, message: text };
			}
		} catch (error) {
			return { success: false, message: error.message };
		}
	}

	function showResultMessage(message, isError, form) {
		const resultElement = form.querySelector('.form-result');
		if (resultElement) {
			resultElement.textContent = message;
			resultElement.style.display = 'block';
			resultElement.classList.toggle('_error', isError);
			resultElement.classList.toggle('_success', !isError);

			if (!isError) {
				setTimeout(() => {
					resultElement.style.display = 'none';
				}, 5000);
			}
		}
	}

	function extractErrorMessage(error) {
		if (error instanceof Error) {
			return error.message;
		}
		return String(error);
	}

	function formLogging(message) {
		console.log(`[Формы]: ${message}`);
	}
}

// Callback для капчи
function onCaptchaSuccess(token) {
	const captchaTokenInput = document.getElementById('captchaToken');
	if (captchaTokenInput) {
		captchaTokenInput.value = token;

		// Убираем подсветку ошибки
		const captchaContainer = document.querySelector('.g-recaptcha');
		if (captchaContainer) {
			captchaContainer.classList.remove('_captcha-error');
		}

		// Скрываем сообщение об ошибке
		const errorMessage = document.querySelector('#regform .form-result._error');
		if (errorMessage) {
			errorMessage.style.display = 'none';
		}
	}

	// Активируем кнопку отправки
	const submitButton = document.querySelector('#regform button[type="submit"]');
	if (submitButton) submitButton.disabled = false;
}
/* Модуль форми "кількість" */
export function formQuantity() {
	document.addEventListener("click", function (e) {
		let targetElement = e.target;
		if (targetElement.closest('[data-quantity-plus]') || targetElement.closest('[data-quantity-minus]')) {
			const valueElement = targetElement.closest('[data-quantity]').querySelector('[data-quantity-value]');
			let value = parseInt(valueElement.value);
			if (targetElement.hasAttribute('data-quantity-plus')) {
				value++;
				if (+valueElement.dataset.quantityMax && +valueElement.dataset.quantityMax < value) {
					value = valueElement.dataset.quantityMax;
				}
			} else {
				--value;
				if (+valueElement.dataset.quantityMin) {
					if (+valueElement.dataset.quantityMin > value) {
						value = valueElement.dataset.quantityMin;
					}
				} else if (value < 1) {
					value = 1;
				}
			}
			targetElement.closest('[data-quantity]').querySelector('[data-quantity-value]').value = value;
		}
	});
}

/* Модуль зіркового рейтингу */
export function formRating() {
	// Rating
	const ratings = document.querySelectorAll('[data-rating]');
	if (ratings) {
		ratings.forEach(rating => {
			const ratingValue = +rating.dataset.ratingValue
			const ratingSize = +rating.dataset.ratingSize ? +rating.dataset.ratingSize : 5
			formRatingInit(rating, ratingSize)
			ratingValue ? formRatingSet(rating, ratingValue) : null
			document.addEventListener('click', formRatingAction)
		});
	}
	function formRatingAction(e) {
		const targetElement = e.target;
		if (targetElement.closest('.rating__input')) {
			const currentElement = targetElement.closest('.rating__input');
			const ratingValue = +currentElement.value
			const rating = currentElement.closest('.rating')
			const ratingSet = rating.dataset.rating === 'set'
			ratingSet ? formRatingGet(rating, ratingValue) : null;
		}
	}
	function formRatingInit(rating, ratingSize) {
		let ratingItems = ``;
		for (let index = 0; index < ratingSize; index++) {
			index === 0 ? ratingItems += `<div class="rating__items">` : null
			ratingItems += `
				<label class="rating__item">
					<input class="rating__input" type="radio" name="rating" value="${index + 1}">
				</label>`
			index === ratingSize ? ratingItems += `</div">` : null
		}
		rating.insertAdjacentHTML("beforeend", ratingItems)
	}
	function formRatingGet(rating, ratingValue) {
		// Тут відправка оцінки (ratingValue) на бекенд...
		// Отримуємо нову седню оцінку formRatingSend()
		// Або виводимо ту яку вказав користувач
		const resultRating = ratingValue;
		formRatingSet(rating, resultRating);
	}
	function formRatingSet(rating, value) {
		const ratingItems = rating.querySelectorAll('.rating__item');
		const resultFullItems = parseInt(value);
		const resultPartItem = value - resultFullItems;

		rating.hasAttribute('data-rating-title') ? rating.title = value : null

		ratingItems.forEach((ratingItem, index) => {
			ratingItem.classList.remove('rating__item--active');
			ratingItem.querySelector('span') ? ratingItems[index].querySelector('span').remove() : null;

			if (index <= (resultFullItems - 1)) {
				ratingItem.classList.add('rating__item--active');
			}
			if (index === resultFullItems && resultPartItem) {
				ratingItem.insertAdjacentHTML("beforeend", `<span style="width:${resultPartItem * 100}%"></span>`)
			}
		});
	}
	function formRatingSend() {

	}

}

