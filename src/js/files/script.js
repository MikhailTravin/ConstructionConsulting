function indents() {
    const header = document.querySelector('.header');
    const bannerContent = document.querySelector('.banner__content');
    const page = document.querySelector('.page-other');

    // Оступ от шапки
    let hHeader = window.getComputedStyle(header).height;
    hHeader = Number(hHeader.slice(0, hHeader.length - 2)); // Преобразуем в число
    if (bannerContent) {
        bannerContent.style.paddingTop = `${hHeader}px`;
    }

    if (page) {
        page.style.paddingTop = `${hHeader}px`;
    }

    // Выпадающее меню
    const menuBody = document.querySelector('.menu__body');
    if (menuBody) {
        let hHeader = window.getComputedStyle(header).height;
        hHeader = Number(hHeader.slice(0, hHeader.length - 2)); // Преобразуем в число
        if (document.documentElement.clientWidth < 991.98) {
            menuBody.style.top = `${hHeader}px`;
            menuBody.style.minHeight = `calc(100vh - ${hHeader}px)`;
            menuBody.style.height = `calc(100vh - ${hHeader}px)`;
        } else {
            menuBody.style.top = '0px';
            menuBody.style.minHeight = 'auto';
            menuBody.style.height = 'auto';
        }
    }

    // Слайдер навигация
    let arrowPrev = document.querySelector('.images-product__arrow-prev');
    let arrowNext = document.querySelector('.images-product__arrow-next');
    const imagesSliderContainer = document.querySelector('.images-product__container-arrows');
    let imagesSlider = document.querySelector('.images-product');
    const imagesSwiper = document.querySelector('.images-product__slider');
    const imagesSwiperDesc = document.querySelectorAll('.images-product__desc');

    if (arrowNext && imagesSliderContainer && imagesSlider && imagesSwiper && imagesSwiperDesc.length > 0) {
        // Вычисляем ширину контейнера и слайдера
        let wimagesSliderContainer = window.getComputedStyle(imagesSliderContainer).width;
        wimagesSliderContainer = Number(wimagesSliderContainer.slice(0, wimagesSliderContainer.length - 2));

        let wimagesSlider = window.getComputedStyle(imagesSlider).width;
        wimagesSlider = Number(wimagesSlider.slice(0, wimagesSlider.length - 2));

        // Вычисляем высоту слайдера и описания
        let himagesSwiper = window.getComputedStyle(imagesSwiper).height;
        himagesSwiper = Number(himagesSwiper.slice(0, himagesSwiper.length - 2));

        let himagesSwiperDesc = window.getComputedStyle(imagesSwiperDesc[0]).height;
        himagesSwiperDesc = Number(himagesSwiperDesc.slice(0, himagesSwiperDesc.length - 2));

        // Расчет позиций стрелок
        const sumMainHomePrev = ((wimagesSlider - wimagesSliderContainer) / 2);
        const sumMainHomeNext = ((wimagesSlider - wimagesSliderContainer) / 2);

        // Устанавливаем позицию по горизонтали
        arrowPrev.style.left = `${sumMainHomePrev}px`;
        arrowNext.style.right = `${sumMainHomeNext}px`;

        // Устанавливаем позицию по вертикали, учитывая высоту imagesSwiperDesc
        arrowPrev.style.top = `calc(48% - ${himagesSwiperDesc / 2}px)`;
        arrowNext.style.top = `calc(48% - ${himagesSwiperDesc / 2}px)`;
    }
}

// Обработчики событий
window.addEventListener('scroll', () => {
    requestAnimationFrame(indents); // Обновляем при прокрутке
});

window.addEventListener('resize', () => {
    requestAnimationFrame(indents); // Обновляем при изменении размеров окна
});

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    indents(); // Первичная инициализация
});

//========================================================================================================================================================

//Прикрепить фото

let input = document.querySelector('input[type="file"]');

if (input) {
    // Блок предпросмотра
    const preview = document.querySelector('.form__previews');
    // Список файлов
    const fileList = [];

    // Вешаем функцию onChange на событие change у <input>
    input.addEventListener('change', onChange);

    function onChange() {
        // Получаем первый выбранный файл
        const file = input.files[0];

        if (file) {
            // Элемент списка .preview
            const item = document.createElement('div');
            item.classList.add('form__preview');

            // Текстовое название файла
            const fileName = document.createElement('span');
            fileName.textContent = file.name; // Добавляем название файла
            fileName.classList.add('file-name'); // Добавляем класс для стилизации

            // Ссылка на исключение файла из списка выгрузки
            const remove = document.createElement('div');
            remove.classList.add('form__preview-close');

            // Элемент массива fileList
            const fileItem = {
                name: file.name,
                modified: file.lastModified,
                size: file.size,
            };

            // Добавляем элемент в список выгрузки
            fileList.push(fileItem);

            // Обработчик клика по ссылке исключения файла
            remove.addEventListener('click', () => {
                // Исключаем элемент с файлом из списка выгрузки
                fileList.splice(fileList.indexOf(fileItem), 1);
                // Удаляем элемент списка (<div>) из контейнера
                item.classList.add('removing');
                setTimeout(() => item.remove(), 100);
            });

            // Добавляем элементы в DOM
            item.appendChild(remove); // Кнопка удаления
            item.appendChild(fileName); // Название файла
            preview.appendChild(item); // Добавляем в блок предпросмотра
        }

        // Сбрасываем значение <input>
        input.value = '';
        // Создаем клон <input>
        const newInput = input.cloneNode(true);
        // Заменяем <input> клоном
        input.replaceWith(newInput);
        // Теперь input будет указывать на клона
        input = newInput;
        // Повесим функцию onChange на событие change у нового <input>
        input.addEventListener('change', onChange);
    }
}

//========================================================================================================================================================

const inputContainer = document.querySelector('.bottom-header__input');
if (inputContainer) {
    const input = document.querySelector('.bottom-header__input input');

    function toggleFilledClass() {
        if (input.value.trim() !== '') {
            inputContainer.classList.add('filled'); // Добавляем класс, если input заполнен
        } else {
            inputContainer.classList.remove('filled'); // Удаляем класс, если input пустой
        }
    }

    // Слушаем события input
    input.addEventListener('input', toggleFilledClass);
};

//========================================================================================================================================================


const inputs = document.querySelectorAll('input[type="text"]');

function handleInput() {
    const parent = this.parentElement;
    const hasValue = this.value.trim() !== '';

    // Добавляем/удаляем класс filled к инпуту
    this.classList.toggle('filled', hasValue);

    // Добавляем/удаляем класс filled к родителю
    if (parent) {
        parent.classList.toggle('filled', hasValue);
    }
}

inputs.forEach(input => {
    input.addEventListener('input', handleInput);
    // Проверка при загрузке страницы
    handleInput.call(input);
});