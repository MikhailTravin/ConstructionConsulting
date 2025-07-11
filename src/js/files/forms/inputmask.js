// Подключение модуля
import "inputmask/dist/inputmask.min.js";

const telephone = document.querySelectorAll('.telephone');
if (telephone) {
	Inputmask({ "mask": "+7 (999) - 999 - 99 - 99" }).mask(telephone);
}

const phoneInputs = document.querySelectorAll('.phone');

phoneInputs.forEach(input => {
	// Применяем маску только при фокусе
	input.addEventListener('focus', function () {
		if (!this.hasAttribute('data-mask-applied')) {
			Inputmask({
				"mask": "+7(999)-999-99-99",
				"showMaskOnHover": false  // Отключаем маску при наведении
			}).mask(this);
			this.setAttribute('data-mask-applied', 'true');
		}
	});
});