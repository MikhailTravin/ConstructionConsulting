/*
Документация по работе в шаблоне: 
Документация слайдера: https://swiperjs.com/
Сниппет(HTML): swiper
*/

// Подключаем слайдер Swiper из node_modules
// При необходимости подключаем дополнительные модули слайдера, указывая их в {} через запятую
// Пример: { Navigation, Autoplay }
import Swiper, { Navigation, Thumbs } from 'swiper';
/*
Основниые модули слайдера:
Navigation, Pagination, Autoplay, 
EffectFade, Lazy, Manipulation
Подробнее смотри https://swiperjs.com/
*/

// Стили Swiper
// Базовые стили
import "../../scss/base/swiper.scss";
// Полный набор стилей из scss/libs/swiper.scss
// import "../../scss/libs/swiper.scss";
// Полный набор стилей из node_modules
// import 'swiper/css';

// Список слайдеров
if (document.querySelector('.images-product')) { // Указываем скласс нужного слайдера
	const thumbsSwiper = new Swiper('.images-product__thumb', {
		// Подключаем модули слайдера
		// для конкретного случая
		modules: [Navigation, Thumbs],
		observer: true,
		observeParents: true,
		slidesPerView: 8,
		spaceBetween: 0,
		speed: 400,
		preloadImages: true,
		// Брейкпоинты
		breakpoints: {
			0: {
				slidesPerView: 2,
			},
			479.98: {
				slidesPerView: 3,
			},
			767.98: {
				slidesPerView: 5,
			},
			991.98: {
				slidesPerView: 6,
			},
			1100: {
				slidesPerView: 8,
			},
		},
	});
	const mainThumbsSwiper = new Swiper('.images-product__slider', {
		// Подключаем модули слайдера
		// для конкретного случая
		modules: [Navigation, Thumbs],
		thumbs: {
			swiper: thumbsSwiper
		},
		observer: true,
		observeParents: true,
		slidesPerView: 1,
		spaceBetween: 2,
		speed: 400,
		preloadImages: true,
		// Кнопки "влево/вправо"
		navigation: {
			prevEl: '.images-product__arrow-prev',
			nextEl: '.images-product__arrow-next',
		},
	});
}

function initTabsSliders() {
	const tabsSliders = document.querySelectorAll('.tabs-slider');

	// Функция для получения параметра из URL
	function getUrlParameter(name) {
		name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
		const regex = new RegExp('[?&]' + name + '=([^&#]*)');
		const results = regex.exec(location.search);
		return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
	}

	// Функция для получения хэша из URL
	function getUrlHash() {
		return window.location.hash.substring(1);
	}

	// Функция активации таба по ID
	function activateTabById(tabId) {
		if (!tabId) return false;

		// Ищем слайд с нужным data-id
		const targetSlide = document.querySelector(`.tabs__slide[data-id="${tabId}"]`);
		if (!targetSlide) return false;

		// Находим родительский слайдер
		const slider = targetSlide.closest('.tabs__slider');
		if (!slider) return false;

		// Находим индекс слайда
		const slides = Array.from(slider.querySelectorAll('.tabs__slide'));
		const slideIndex = slides.indexOf(targetSlide);

		if (slideIndex === -1) return false;

		// Активируем слайд в Swiper
		const swiperInstance = slider.swiper;
		if (swiperInstance) {
			swiperInstance.slideTo(slideIndex);
		}

		// Активируем соответствующую колонку в bottom-tabs
		const parentTabs = slider.closest('.tabs__sliders');
		const bottomTabs = parentTabs.nextElementSibling;

		if (bottomTabs && bottomTabs.classList.contains('bottom-tabs')) {
			bottomTabs.querySelectorAll('.bottom-tabs__column').forEach(column => {
				column.classList.remove('_active');
			});

			const correspondingColumn = bottomTabs.querySelector(`.bottom-tabs__column[data-id="${tabId}"]`);
			if (correspondingColumn) {
				correspondingColumn.classList.add('_active');
			}
		}

		return true;
	}

	if (tabsSliders.length > 0) {
		tabsSliders.forEach((slider) => {
			const sliderContainer = slider.closest('.tabs__sliders');
			const prevButton = sliderContainer?.querySelector('.tabs__arrow-prev');
			const nextButton = sliderContainer?.querySelector('.tabs__arrow-next');

			const swiper = new Swiper(slider, {
				modules: [Navigation],
				observer: true,
				observeParents: true,
				slidesPerView: 7,
				spaceBetween: 12,
				speed: 400,
				preloadImages: true,
				navigation: {
					prevEl: prevButton,
					nextEl: nextButton,
				},
				breakpoints: {
					0: { slidesPerView: 1 },
					479.98: { slidesPerView: 2 },
					767.98: { slidesPerView: 3 },
					991.98: { slidesPerView: 5 },
					1650: { slidesPerView: 7 },
				},
				on: {
					init: function () {
						// Проверяем параметры URL после инициализации Swiper
						const tabIdFromParam = getUrlParameter('tab') || getUrlParameter('id') || getUrlHash();
						if (tabIdFromParam) {
							// Небольшая задержка для гарантии полной инициализации
							setTimeout(() => {
								activateTabById(tabIdFromParam);
							}, 100);
						}
					}
				}
			});

			const slides = slider.querySelectorAll('.tabs__slide');
			slides.forEach(slide => {
				slide.addEventListener('click', function () {
					const slideId = this.getAttribute('data-id');

					// Находим родительский tabs__sliders и соответствующий bottom-tabs
					const parentTabs = slider.closest('.tabs__sliders');
					const bottomTabs = parentTabs.nextElementSibling;

					if (bottomTabs && bottomTabs.classList.contains('bottom-tabs')) {
						// Удаляем _active у всех колонок в этом bottom-tabs
						bottomTabs.querySelectorAll('.bottom-tabs__column').forEach(column => {
							column.classList.remove('_active');
						});

						// Активируем соответствующую колонку
						const correspondingColumn = bottomTabs.querySelector(`.bottom-tabs__column[data-id="${slideId}"]`);
						if (correspondingColumn) {
							correspondingColumn.classList.add('_active');
						}
					}
				});
			});

			if (!slider.dataset.initialized) {
				const firstSlide = slider.querySelector('.tabs__slide');
				if (firstSlide) {
					const firstSlideId = firstSlide.getAttribute('data-id');

					const parentTabs = slider.closest('.tabs__sliders');
					const bottomTabs = parentTabs.nextElementSibling;

					if (bottomTabs && bottomTabs.classList.contains('bottom-tabs')) {
						const correspondingColumn = bottomTabs.querySelector(`.bottom-tabs__column[data-id="${firstSlideId}"]`);
						if (correspondingColumn) {
							bottomTabs.querySelectorAll('.bottom-tabs__column').forEach(col => {
								col.classList.remove('_active');
							});
							correspondingColumn.classList.add('_active');
						}
					}
				}
				slider.dataset.initialized = 'true';
			}
		});
	}
}

document.addEventListener('DOMContentLoaded', function () {
	initTabsSliders();

	// Также обрабатываем изменения хэша (если нужно)
	window.addEventListener('hashchange', function () {
		const tabId = getUrlHash();
		if (tabId) {
			activateTabById(tabId);
		}
	});
});

// Добавляем функцию getUrlParameter в глобальную область видимости
function getUrlParameter(name) {
	name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
	const regex = new RegExp('[?&]' + name + '=([^&#]*)');
	const results = regex.exec(location.search);
	return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function getUrlHash() {
	return window.location.hash.substring(1);
}

if (document.querySelector('.documents-tabs-slider')) { // Указываем скласс нужного слайдера
	new Swiper('.documents-tabs-slider', {
		// Подключаем модули слайдера
		// для конкретного случая
		modules: [Navigation],
		observer: true,
		observeParents: true,
		slidesPerView: 8,
		speed: 400,
		preloadImages: true,
		navigation: {
			prevEl: '.tabs__arrow-prev',
			nextEl: '.tabs__arrow-next',
		},
		// Брейкпоинты
		breakpoints: {
			0: {
				slidesPerView: 'auto',
			},
			1650: {
				slidesPerView: 8,
			},
		},
	});
}