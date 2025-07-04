// Подключение модуля
import "inputmask/dist/inputmask.min.js";

const telephone = document.querySelectorAll('.telephone');
if (telephone) {
	Inputmask({ "mask": "+7 (999) - 999 - 99 - 99" }).mask(telephone);
}

const phone = document.querySelectorAll('.phone');
if (phone) {
	Inputmask({ "mask": "+7 999 99 99" }).mask(phone);
}