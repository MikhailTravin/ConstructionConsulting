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

	if (tabsSliders.length > 0) {
		tabsSliders.forEach((slider) => {
			const sliderContainer = slider.closest('.tabs__sliders');
			const prevButton = sliderContainer.querySelector('.tabs__arrow-prev');
			const nextButton = sliderContainer.querySelector('.tabs__arrow-next');

			const tabItem = slider.closest('[role="tabpanel"]');
			const isActiveTab = tabItem ? tabItem.classList.contains('_active') : true;

			new Swiper(slider, {
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
			});

			const slides = slider.querySelectorAll('.tabs__slide');
			slides.forEach(slide => {
				slide.addEventListener('click', function () {
					const slideId = this.getAttribute('data-id');

					document.querySelectorAll('.bottom-tabs__column').forEach(column => {
						column.classList.remove('_active');
						if (column.getAttribute('data-id') === slideId) {
							column.classList.add('_active');
						}
					});
				});
			});

			// Только для активной вкладки — активируем первый слайд
			if (isActiveTab && !slider.dataset.initialized) {
				const firstSlide = slider.querySelector('.tabs__slide');
				if (firstSlide) {
					const firstSlideId = firstSlide.getAttribute('data-id');
					const correspondingBlock = document.querySelector(`.bottom-tabs__column[data-id="${firstSlideId}"]`);
					if (correspondingBlock) {
						// Удаляем _active у всех bottom-tabs__column перед установкой
						document.querySelectorAll('.bottom-tabs__column._active').forEach(col => {
							col.classList.remove('_active');
						});
						correspondingBlock.classList.add('_active');
					}
				}

				slider.dataset.initialized = 'true';
			}
		});
	}
}

document.addEventListener('DOMContentLoaded', function () {
	initTabsSliders();
});

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