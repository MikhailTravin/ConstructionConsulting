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
/*
let globalFormSubmitAction = null;

export function formSubmit() {
	const forms = document.forms;

	// Добавляем обработчик для кнопок с data-docs
	document.addEventListener('click', function (e) {
		if (e.target.closest('[data-docs]')) {
			const button = e.target.closest('[data-docs]');
			const documentName = button.getAttribute('data-docs');
			const popupId = button.getAttribute('data-popup');

			// Устанавливаем значение во все скрытые поля document на странице
			const documentInputs = document.querySelectorAll('input[name="document"]');
			documentInputs.forEach(input => {
				input.value = documentName;
			});

			// Если указан попап, находим в нем поле document
			if (popupId) {
				const popup = document.querySelector(popupId);
				if (popup) {
					const popupDocumentInput = popup.querySelector('input[name="document"]');
					if (popupDocumentInput) {
						popupDocumentInput.value = documentName;
					}
				}
			}

			// Обновляем тему формы если нужно
			const themeInputs = document.querySelectorAll('input[name="theme"]');
			themeInputs.forEach(input => {
				if (input.value === 'Запрос на документ') {
					input.value = `Запрос на документ: ${documentName}`;
				}
			});
		}
	});

	if (forms.length) {
		for (const form of forms) {
			form.addEventListener('submit', function (e) {
				const form = e.target;

				// 1. Сначала стандартная валидация полей
				if (formValidate.getErrors(form)) {
					e.preventDefault();
					return;
				}

				// 2. Проверка селекта региона
				const regionSelect = form.querySelector('select[name="region"]');
				if (regionSelect) {
					const selectedValue = regionSelect.value;
					const selectTitle = form.querySelector('.select__title');

					if (!selectedValue) {
						e.preventDefault();
						// Добавляем класс ошибки к select__title
						if (selectTitle) {
							selectTitle.classList.add('_error');
							// Прокручиваем к ошибке
							selectTitle.scrollIntoView({
								behavior: 'smooth',
								block: 'center'
							});
						}
						// Показываем сообщение об ошибке
						showResultMessage('Пожалуйста, выберите регион', true, form);
						return;
					} else {
						// Убираем класс ошибки если значение выбрано
						if (selectTitle) {
							selectTitle.classList.remove('_error');
						}
					}
				}

				// 3. ПРОСТАЯ ПРОВЕРКА КАПЧИ
				const captchaTokenInput = form.querySelector('input[name="captcha_token"]');
				const captchaToken = captchaTokenInput?.value;

				if (!captchaToken) {
					e.preventDefault();
					showResultMessage('Пожалуйста, пройдите проверку на робота', true, form);

					// Подсвечиваем капчу
					const captchaContainer = form.querySelector('.g-recaptcha.smart-captcha');
					if (captchaContainer) {
						captchaContainer.classList.add('_captcha-error');
						captchaContainer.scrollIntoView({
							behavior: 'smooth',
							block: 'center'
						});
					}
					return;
				}

				// Отправляем форму напрямую
				formSubmitAction(form, e);
			});

			// Добавляем обработчик изменения селекта для снятия ошибки
			const regionSelects = form.querySelectorAll('select[name="region"]');
			regionSelects.forEach(select => {
				select.addEventListener('change', function () {
					const selectTitle = this.closest('.select').querySelector('.select__title');
					if (selectTitle && this.value) {
						selectTitle.classList.remove('_error');
					}
				});
			});

			// Также обрабатываем клики по option кнопкам кастомного селекта
			const selectOptions = form.querySelectorAll('.select__option');
			selectOptions.forEach(option => {
				option.addEventListener('click', function () {
					const select = this.closest('.select').querySelector('select[name="region"]');
					const selectTitle = this.closest('.select').querySelector('.select__title');
					if (select && selectTitle) {
						selectTitle.classList.remove('_error');
					}
				});
			});

			form.addEventListener('reset', function (e) {
				const form = e.target;
				formValidate.formClean(form);
				clearFileInputs(form);

				// Сбрасываем ошибку селекта
				const selectTitles = form.querySelectorAll('.select__title');
				selectTitles.forEach(title => {
					title.classList.remove('_error');
				});

				// Сбрасываем капчу для текущей формы
				resetCaptcha(form);
			});
		}
	}

	// === Сохраняем ссылку на formSubmitAction ===
	globalFormSubmitAction = formSubmitAction;

	async function formSubmitAction(form, e) {
		e.preventDefault();

		// Повторная проверка селекта перед отправкой
		const regionSelect = form.querySelector('select[name="region"]');
		if (regionSelect && !regionSelect.value) {
			const selectTitle = form.querySelector('.select__title');
			if (selectTitle) {
				selectTitle.classList.add('_error');
				selectTitle.scrollIntoView({
					behavior: 'smooth',
					block: 'center'
				});
			}
			showResultMessage('Пожалуйста, выберите регион', true, form);
			return;
		}

		// Проверка капчи перед отправкой
		const captchaTokenInput = form.querySelector('input[name="captcha_token"]');
		if (!captchaTokenInput?.value) {
			showResultMessage('Пожалуйста, пройдите проверку на робота', true, form);
			return;
		}

		const formAction = form.getAttribute('action');
		if (!formAction || formAction.includes('.html')) {
			showResultMessage('Ошибка: указан неверный адрес отправки формы', true, form);
			return;
		}

		const formMethod = form.getAttribute('method')?.toUpperCase() || 'POST';
		const formData = new FormData(form);

		// Добавляем токен капчи из текущей формы
		if (captchaTokenInput.value) {
			formData.append('captcha_token', captchaTokenInput.value);
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

			if (result.redirect) {
				setTimeout(() => {
					window.location.href = result.redirect;
				}, 1500);
			} else {
				form.reset();
				clearFileInputs(form);

				// Сбрасываем ошибку селекта при успешной отправке
				const selectTitles = form.querySelectorAll('.select__title');
				selectTitles.forEach(title => {
					title.classList.remove('_error');
				});

				// Сбрасываем капчу для текущей формы
				resetCaptcha(form);

				const previewsContainer = form.querySelector('.form__previews');
				if (previewsContainer) previewsContainer.innerHTML = '';
			}

			formSent(form, result);

		} catch (error) {
			form.classList.remove('_sending');
			console.error('Ошибка отправки:', error);
			showResultMessage(extractErrorMessage(error), true, form);

			// Сбрасываем капчу для текущей формы при ошибке
			resetCaptcha(form);
		}
	}

	// Глобальная функция обратного вызова для капчи
	window.onCaptchaSuccess = function (token) {
		console.log('Капча пройдена, токен:', token);

		// Находим все формы на странице
		const forms = document.querySelectorAll('form');

		forms.forEach(form => {
			// Сохраняем токен во всех input'ах captcha_token в форме
			const captchaTokenInputs = form.querySelectorAll('input[name="captcha_token"]');
			captchaTokenInputs.forEach(input => {
				input.value = token;
			});

			// Сбрасываем ошибки капчи
			const captchaContainers = form.querySelectorAll('.g-recaptcha.smart-captcha');
			captchaContainers.forEach(container => {
				container.classList.remove('_captcha-error');
			});
		});

		// Форма будет отправлена при нажатии на кнопку Submit
		// (убрана автоматическая отправка)
	};

	function resetCaptcha(form) {
		// Сбрасываем капчу для конкретной формы
		const captchaTokenInput = form.querySelector('input[name="captcha_token"]');
		if (captchaTokenInput) captchaTokenInput.value = '';

		const captchaContainer = form.querySelector('.g-recaptcha.smart-captcha');
		if (captchaContainer) {
			captchaContainer.classList.remove('_captcha-error');

			// Сброс Yandex Smart Captcha
			if (window.smartCaptcha && typeof window.smartCaptcha.reset === 'function') {
				window.smartCaptcha.reset();
			}
		}
	}

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
				} else if (typeof flsModules !== 'undefined' && flsModules.popup) {
					flsModules.popup.open(popupId);
				} else if (typeof MicroModal !== 'undefined') {
					MicroModal.show(popupId.replace('#', ''));
				}
			}
		}

		if (!responseResult.redirect) {
			formValidate.formClean(form);
		}

		formLogging('Форма отправлена!' + (responseResult.redirect ? ` Редирект на: ${responseResult.redirect}` : ''));
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
*/

let globalFormSubmitAction = null;

export function formSubmit() {
	const forms = document.forms;

	// Инициализация обработки файлов для всех форм
	initFileHandlers();

	// Добавляем обработчик для кнопок с data-docs
	document.addEventListener('click', function (e) {
		if (e.target.closest('[data-docs]')) {
			const button = e.target.closest('[data-docs]');
			const documentName = button.getAttribute('data-docs');
			const popupId = button.getAttribute('data-popup');

			// Устанавливаем значение во все скрытые поля document на странице
			const documentInputs = document.querySelectorAll('input[name="document"]');
			documentInputs.forEach(input => {
				input.value = documentName;
			});

			// Если указан попап, находим в нем поле document
			if (popupId) {
				const popup = document.querySelector(popupId);
				if (popup) {
					const popupDocumentInput = popup.querySelector('input[name="document"]');
					if (popupDocumentInput) {
						popupDocumentInput.value = documentName;
					}
				}
			}

			// Обновляем тему формы если нужно
			const themeInputs = document.querySelectorAll('input[name="theme"]');
			themeInputs.forEach(input => {
				if (input.value === 'Запрос на документ') {
					input.value = `Запрос на документ: ${documentName}`;
				}
			});
		}
	});

	if (forms.length) {
		for (const form of forms) {
			form.addEventListener('submit', function (e) {
				const form = e.target;

				// 1. Сначала стандартная валидация полей
				if (formValidate.getErrors(form)) {
					e.preventDefault();
					return;
				}

				// 2. Проверка селекта региона
				const regionSelect = form.querySelector('select[name="region"]');
				if (regionSelect) {
					const selectedValue = regionSelect.value;
					const selectTitle = form.querySelector('.select__title');

					if (!selectedValue) {
						e.preventDefault();
						// Добавляем класс ошибки к select__title
						if (selectTitle) {
							selectTitle.classList.add('_error');
							// Прокручиваем к ошибке
							selectTitle.scrollIntoView({
								behavior: 'smooth',
								block: 'center'
							});
						}
						// Показываем сообщение об ошибке
						showResultMessage('Пожалуйста, выберите регион', true, form);
						return;
					} else {
						// Убираем класс ошибки если значение выбрано
						if (selectTitle) {
							selectTitle.classList.remove('_error');
						}
					}
				}

				// 3. ПРОВЕРКА КАПЧИ (ТОЛЬКО ЕСЛИ ЕСТЬ В ФОРМЕ)
				const captchaTokenInput = form.querySelector('input[name="captcha_token"]');
				if (captchaTokenInput) { // Проверяем, есть ли капча в форме
					const captchaToken = captchaTokenInput.value;

					if (!captchaToken) {
						e.preventDefault();
						showResultMessage('Пожалуйста, пройдите проверку на робота', true, form);

						// Подсвечиваем капчу
						const captchaContainer = form.querySelector('.g-recaptcha.smart-captcha');
						if (captchaContainer) {
							captchaContainer.classList.add('_captcha-error');
							captchaContainer.scrollIntoView({
								behavior: 'smooth',
								block: 'center'
							});
						}
						return;
					}
				}

				// Отправляем форму напрямую
				formSubmitAction(form, e);
			});

			// Добавляем обработчик изменения селекта для снятия ошибки
			const regionSelects = form.querySelectorAll('select[name="region"]');
			regionSelects.forEach(select => {
				select.addEventListener('change', function () {
					const selectTitle = this.closest('.select').querySelector('.select__title');
					if (selectTitle && this.value) {
						selectTitle.classList.remove('_error');
					}
				});
			});

			// Также обрабатываем клики по option кнопкам кастомного селекта
			const selectOptions = form.querySelectorAll('.select__option');
			selectOptions.forEach(option => {
				option.addEventListener('click', function () {
					const select = this.closest('.select').querySelector('select[name="region"]');
					const selectTitle = this.closest('.select').querySelector('.select__title');
					if (select && selectTitle) {
						selectTitle.classList.remove('_error');
					}
				});
			});

			form.addEventListener('reset', function (e) {
				const form = e.target;
				formValidate.formClean(form);
				clearFileInputs(form);

				// Сбрасываем ошибку селекта
				const selectTitles = form.querySelectorAll('.select__title');
				selectTitles.forEach(title => {
					title.classList.remove('_error');
				});

				// Сбрасываем капчу для текущей формы
				resetCaptcha(form);
			});
		}
	}

	// === Сохраняем ссылку на formSubmitAction ===
	globalFormSubmitAction = formSubmitAction;

	async function formSubmitAction(form, e) {
		e.preventDefault();

		// Повторная проверка селекта перед отправкой
		const regionSelect = form.querySelector('select[name="region"]');
		if (regionSelect && !regionSelect.value) {
			const selectTitle = form.querySelector('.select__title');
			if (selectTitle) {
				selectTitle.classList.add('_error');
				selectTitle.scrollIntoView({
					behavior: 'smooth',
					block: 'center'
				});
			}
			showResultMessage('Пожалуйста, выберите регион', true, form);
			return;
		}

		// Проверка капчи перед отправкой (ТОЛЬКО ЕСЛИ ЕСТЬ В ФОРМЕ)
		const captchaTokenInput = form.querySelector('input[name="captcha_token"]');
		if (captchaTokenInput && !captchaTokenInput.value) {
			showResultMessage('Пожалуйста, пройдите проверку на робота', true, form);
			return;
		}

		const formAction = form.getAttribute('action');
		if (!formAction || formAction.includes('.html')) {
			showResultMessage('Ошибка: указан неверный адрес отправки формы', true, form);
			return;
		}

		const formMethod = form.getAttribute('method')?.toUpperCase() || 'POST';
		const formData = new FormData(form);

		// Добавляем токен капчи из текущей формы (только если есть)
		if (captchaTokenInput && captchaTokenInput.value) {
			formData.append('captcha_token', captchaTokenInput.value);
		}

		// Добавляем файлы из всех file inputs
		const fileInputs = form.querySelectorAll('input[type="file"]');
		fileInputs.forEach(fileInput => {
			if (fileInput?.files?.length > 0) {
				Array.from(fileInput.files).forEach(file => {
					formData.append(fileInput.name || 'files[]', file);
				});
			}
		});

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

			if (result.redirect) {
				setTimeout(() => {
					window.location.href = result.redirect;
				}, 1500);
			} else {
				form.reset();
				clearFileInputs(form);

				// Сбрасываем ошибку селекта при успешной отправке
				const selectTitles = form.querySelectorAll('.select__title');
				selectTitles.forEach(title => {
					title.classList.remove('_error');
				});

				// Сбрасываем капчу для текущей формы
				resetCaptcha(form);

				// Очищаем превью файлов
				const previewsContainers = form.querySelectorAll('.form__previews');
				previewsContainers.forEach(container => {
					container.innerHTML = '';
					container.style.display = 'none';
				});
			}

			formSent(form, result);

		} catch (error) {
			form.classList.remove('_sending');
			console.error('Ошибка отправки:', error);
			showResultMessage(extractErrorMessage(error), true, form);

			// Сбрасываем капчу для текущей формы при ошибке
			resetCaptcha(form);
		}
	}

	// Функция инициализации обработчиков файлов
	function initFileHandlers() {
		document.querySelectorAll('.form__file input[type="file"]').forEach(input => {
			let fileList = []; // Храним File объекты для каждого инпута

			// Ищем контейнер для превью в любой части формы
			let previewContainer = findPreviewContainer(input);

			if (!previewContainer) {
				console.warn('Не найден .form__previews для input', input);
				return;
			}

			console.log('Найден контейнер для превью:', previewContainer);

			input.addEventListener('change', function () {
				// Добавляем новые файлы
				for (let i = 0; i < this.files.length; i++) {
					if (!fileList.some(f => f.name === this.files[i].name && f.size === this.files[i].size)) {
						fileList.push(this.files[i]);
					}
				}
				updatePreview();
				updateFileInput();
			});

			function updatePreview() {
				previewContainer.innerHTML = '';
				if (fileList.length === 0) {
					previewContainer.style.display = 'none';
					return;
				}

				previewContainer.style.display = 'block';

				fileList.forEach((file, index) => {
					const item = document.createElement('div');
					item.classList.add('form__preview');

					const fileName = document.createElement('span');
					fileName.textContent = file.name;
					fileName.classList.add('file-name');

					const remove = document.createElement('div');
					remove.classList.add('form__preview-close');

					remove.addEventListener('click', (e) => {
						e.stopPropagation();
						fileList.splice(index, 1);
						updateFileInput();
						updatePreview();
					});

					item.appendChild(fileName);
					item.appendChild(remove);
					previewContainer.appendChild(item);
				});
			}

			function updateFileInput() {
				const dataTransfer = new DataTransfer();
				fileList.forEach(file => dataTransfer.items.add(file));
				input.files = dataTransfer.files;

				// Триггерим событие change для обновления формы
				input.dispatchEvent(new Event('change', { bubbles: true }));
			}

			// Инициализация существующих превью
			updatePreview();
		});
	}

	function findPreviewContainer(input) {
		// Ищем контейнер в той же форме, где находится input
		const form = input.closest('form');
		if (!form) {
			console.warn('Input не находится внутри формы:', input);
			return null;
		}

		// Ищем любой .form__previews внутри формы
		const previewContainer = form.querySelector('.form__previews');
		if (previewContainer) {
			return previewContainer;
		}

		// Если контейнер не найден, создаем его
		console.log('Создаем новый контейнер .form__previews');
		const newContainer = document.createElement('div');
		newContainer.className = 'form__previews';
		newContainer.style.display = 'none';

		// Размещаем контейнер в логическом месте - после .form__file или в конце формы
		const formFile = input.closest('.form__file');
		if (formFile && formFile.parentNode) {
			formFile.parentNode.insertBefore(newContainer, formFile.nextSibling);
		} else {
			form.appendChild(newContainer);
		}

		return newContainer;
	}

	// Глобальная функция обратного вызова для капчи
	window.onCaptchaSuccess = function (token) {
		console.log('Капча пройдена, токен:', token);

		// Находим все формы на странице
		const forms = document.querySelectorAll('form');

		forms.forEach(form => {
			// Сохраняем токен во всех input'ах captcha_token в форме
			const captchaTokenInputs = form.querySelectorAll('input[name="captcha_token"]');
			captchaTokenInputs.forEach(input => {
				input.value = token;
			});

			// Сбрасываем ошибки капчи
			const captchaContainers = form.querySelectorAll('.g-recaptcha.smart-captcha');
			captchaContainers.forEach(container => {
				container.classList.remove('_captcha-error');
			});
		});
	};

	function resetCaptcha(form) {
		// Сбрасываем капчу для конкретной формы (только если есть)
		const captchaTokenInput = form.querySelector('input[name="captcha_token"]');
		if (captchaTokenInput) {
			captchaTokenInput.value = '';

			const captchaContainer = form.querySelector('.g-recaptcha.smart-captcha');
			if (captchaContainer) {
				captchaContainer.classList.remove('_captcha-error');

				// Сброс Yandex Smart Captcha
				if (window.smartCaptcha && typeof window.smartCaptcha.reset === 'function') {
					window.smartCaptcha.reset();
				}
			}
		}
	}

	function clearFileInputs(form) {
		const fileInputs = form.querySelectorAll('input[type="file"]');
		fileInputs.forEach(input => {
			input.value = '';
		});

		// Также очищаем все контейнеры превью
		const previewsContainers = form.querySelectorAll('.form__previews');
		previewsContainers.forEach(container => {
			container.innerHTML = '';
			container.style.display = 'none';
		});
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
				} else if (typeof flsModules !== 'undefined' && flsModules.popup) {
					flsModules.popup.open(popupId);
				} else if (typeof MicroModal !== 'undefined') {
					MicroModal.show(popupId.replace('#', ''));
				}
			}
		}

		if (!responseResult.redirect) {
			formValidate.formClean(form);
		}

		formLogging('Форма отправлена!' + (responseResult.redirect ? ` Редирект на: ${responseResult.redirect}` : ''));
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

