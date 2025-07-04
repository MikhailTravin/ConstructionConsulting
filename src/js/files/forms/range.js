import * as noUiSlider from 'nouislider';

import '../../libs/wNumb.min.js';

export function rangeInit() {

	//Фильтр
	const ranges = document.querySelectorAll('.range');
	ranges.forEach((range) => {
		if (range) {
			// Инициализируем noUiSlider для каждого ползунка
			noUiSlider.create(range, {
				start: [1300000, 53175000], // Начальные значения
				connect: true, // Заполнение между бегунками
				range: {
					'min': 1300000, // Минимальное значение
					'max': 253175000 // Максимальное значение
				},
				format: wNumb({
					decimals: 0, // Без десятичных знаков
					thousand: ' ', // Разделитель тысяч
				})
			});

			// Находим связанные элементы для текущего ползунка
			const container = range.closest('.filter-tabs');
			if (!container) {
				return;
			}

			const priceStart = container.querySelector('.rating-filter-tabs__input .price-start');
			const priceEnd = container.querySelector('.rating-filter-tabs__input .price-end');
			const resetButton = container.querySelector('.filter-tabs__clear');

			if (!priceStart || !priceEnd || !resetButton) {
				return;
			}

			// Обновляем значения инпутов при изменении слайдера
			range.noUiSlider.on('update', function (values, handle) {
				const value = values[handle];
				if (handle) {
					priceEnd.value = value + ' ₽';
				} else {
					priceStart.value = value + ' ₽';
				}
			});

			// При изменении значения priceStart обновляем слайдер
			priceStart.addEventListener('change', function () {
				const numericValue = this.value.replace(/[^0-9]/g, ''); // Убираем все, кроме цифр
				range.noUiSlider.set([numericValue, null]);
			});

			// При изменении значения priceEnd обновляем слайдер
			priceEnd.addEventListener('change', function () {
				const numericValue = this.value.replace(/[^0-9]/g, ''); // Убираем все, кроме цифр
				range.noUiSlider.set([null, numericValue]);
			});

			// Функция для сброса фильтров
			function reserRange() {
				priceStart.value = priceStart.defaultValue;
				priceEnd.value = priceEnd.defaultValue;

				const startValue = parseInt(priceStart.defaultValue.replace(/\s/g, ''), 10);
				const endValue = parseInt(priceEnd.defaultValue.replace(/\s/g, ''), 10);
				range.noUiSlider.set([startValue, endValue]);
			}

			// Обработчик клика на кнопку "Сбросить"
			resetButton.addEventListener('click', function () {
				reserRange();
			});
		}
	});
}
