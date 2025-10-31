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
	const tabsSliders = document.querySelectorAll('.tabs-slider, .documents-tabs-slider');

	if (tabsSliders.length > 0) {
		tabsSliders.forEach((slider) => {
			const sliderContainer = slider.closest('.tabs__sliders');
			const prevButton = sliderContainer?.querySelector('.tabs__arrow-prev');
			const nextButton = sliderContainer?.querySelector('.tabs__arrow-next');

			let swiper = null;

			// Функция для инициализации или уничтожения слайдера
			function initOrDestroySwiper() {
				const windowWidth = window.innerWidth;
				const isDocumentsSlider = slider.classList.contains('documents-tabs-slider');

				if (windowWidth < 992) {
					// Уничтожаем слайдер если он существует
					if (swiper) {
						swiper.destroy(true, true);
						swiper = null;
						slider.classList.remove('swiper-initialized', 'swiper-horizontal', 'swiper-backface-hidden');
						const wrapper = slider.querySelector('.swiper-wrapper');
						if (wrapper) {
							wrapper.removeAttribute('style');
							wrapper.classList.remove('swiper-wrapper', 'swiper-wrapper-vertical', 'swiper-wrapper-horizontal');
						}
						slider.querySelectorAll('.swiper-slide').forEach(slide => {
							slide.removeAttribute('style');
							slide.classList.remove('swiper-slide', 'swiper-slide-active', 'swiper-slide-next', 'swiper-slide-prev');
						});
					}
				} else {
					// Инициализируем слайдер если его нет
					if (!swiper) {
						const config = {
							modules: [Navigation],
							observer: true,
							observeParents: true,
							speed: 400,
							preloadImages: true,
							watchOverflow: true,
							navigation: {
								prevEl: prevButton,
								nextEl: nextButton,
								disabledClass: 'swiper-button-disabled',
							},
							on: {
								init: function () {
									checkSlidesCount(this);
									checkNavigation(this);
								},
								resize: function () {
									checkSlidesCount(this);
									checkNavigation(this);
								},
								slideChange: function () {
									checkNavigation(this);
								}
							}
						};

						// Разные настройки для разных типов слайдеров
						if (isDocumentsSlider) {
							Object.assign(config, {
								slidesPerView: 8,
								breakpoints: {
									0: { slidesPerView: 'auto' },
									1650: { slidesPerView: 8 },
								}
							});
						} else {
							Object.assign(config, {
								slidesPerView: 7,
								spaceBetween: 12,
								breakpoints: {
									0: { slidesPerView: 1 },
									479.98: { slidesPerView: 2 },
									767.98: { slidesPerView: 3 },
									991.98: { slidesPerView: 5 },
									1650: { slidesPerView: 7 },
								}
							});
						}

						swiper = new Swiper(slider, config);

						// Инициализация кликов по слайдам только для обычных слайдеров
						if (!isDocumentsSlider) {
							initSlideClicks();

							// Инициализация активного слайда
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
						}
					}
				}
			}

			// Функция для проверки количества слайдов
			function checkSlidesCount(swiperInstance) {
				const wrapper = swiperInstance.el.querySelector('.swiper-wrapper');
				const slides = swiperInstance.slides;
				const currentBreakpoint = swiperInstance.currentBreakpoint;

				if (wrapper && slides.length < 7 && currentBreakpoint === '1650') {
					wrapper.classList.add('_few-slides');
				} else {
					wrapper.classList.remove('_few-slides');
				}
			}

			// Функция для проверки и блокировки навигации
			function checkNavigation(swiperInstance) {
				if (!prevButton || !nextButton) return;

				const slides = swiperInstance.slides;
				const currentBreakpoint = swiperInstance.currentBreakpoint;
				const slidesPerView = swiperInstance.params.slidesPerView;
				const isDocumentsSlider = swiperInstance.el.classList.contains('documents-tabs-slider');

				// Для documents слайдера проверяем если слайдов меньше 8
				if (isDocumentsSlider && currentBreakpoint === '1650' && slides.length < 8) {
					prevButton.classList.add('swiper-button-disabled', 'swiper-button-lock');
					nextButton.classList.add('swiper-button-disabled', 'swiper-button-lock');
				}
				// Для обычного слайдера проверяем если слайдов меньше 7
				else if (!isDocumentsSlider && currentBreakpoint === '1650' && slides.length < 7) {
					prevButton.classList.add('swiper-button-disabled', 'swiper-button-lock');
					nextButton.classList.add('swiper-button-disabled', 'swiper-button-lock');
				} else {
					// Стандартное поведение Swiper
					if (swiperInstance.isBeginning) {
						prevButton.classList.add('swiper-button-disabled');
					} else {
						prevButton.classList.remove('swiper-button-disabled');
					}

					if (swiperInstance.isEnd) {
						nextButton.classList.add('swiper-button-disabled');
					} else {
						nextButton.classList.remove('swiper-button-disabled');
					}
				}
			}

			// Функция для обработки кликов по слайдам (только для обычных слайдеров)
			function initSlideClicks() {
				const slides = slider.querySelectorAll('.tabs__slide');
				slides.forEach(slide => {
					slide.removeEventListener('click', handleSlideClick);
					slide.addEventListener('click', handleSlideClick);
				});
			}

			function handleSlideClick() {
				const slideId = this.getAttribute('data-id');
				const parentTabs = slider.closest('.tabs__sliders');
				const bottomTabs = parentTabs.nextElementSibling;

				if (bottomTabs && bottomTabs.classList.contains('bottom-tabs')) {
					bottomTabs.querySelectorAll('.bottom-tabs__column').forEach(column => {
						column.classList.remove('_active');
					});

					const correspondingColumn = bottomTabs.querySelector(`.bottom-tabs__column[data-id="${slideId}"]`);
					if (correspondingColumn) {
						correspondingColumn.classList.add('_active');
					}
				}
			}

			// Инициализация при первой загрузке
			initOrDestroySwiper();

			// Обработчик изменения размера окна с троттлингом
			let resizeTimeout;
			function handleResize() {
				clearTimeout(resizeTimeout);
				resizeTimeout = setTimeout(() => {
					initOrDestroySwiper();
				}, 250);
			}

			window.addEventListener('resize', handleResize);
		});
	}
}

document.addEventListener('DOMContentLoaded', function () {
	initTabsSliders();
});

// Дополнительно: переинициализация слайдеров при переключении вкладок
function reinitTabsSliders() {
	const tabButtons = document.querySelectorAll('[data-tabs-title]');

	tabButtons.forEach(button => {
		button.addEventListener('click', function () {
			// Небольшая задержка чтобы дать время на переключение вкладки
			setTimeout(() => {
				initTabsSliders();
			}, 100);
		});
	});
}

document.addEventListener('DOMContentLoaded', function () {
	initTabsSliders();
	reinitTabsSliders();
});