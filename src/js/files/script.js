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
// Обработчик для файлового ввода
let input = document.querySelector('input[type="file"]');
let fileList = []; // Храним File объекты

if (input) {
    const preview = document.querySelector('.form__previews');

    input.addEventListener('change', onChange);

    function onChange() {
        // Добавляем новые файлы
        for (let i = 0; i < input.files.length; i++) {
            if (!fileList.some(f => f.name === input.files[i].name && f.size === input.files[i].size)) {
                fileList.push(input.files[i]);
            }
        }
        updatePreview();
        updateFileInput();
    }

    function updatePreview() {
        preview.innerHTML = '';
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

            item.appendChild(remove);
            item.appendChild(fileName);
            preview.appendChild(item);
        });
    }

    function updateFileInput() {
        const dataTransfer = new DataTransfer();
        fileList.forEach(file => dataTransfer.items.add(file));
        input.files = dataTransfer.files;
    }
}
/*
let input = document.querySelector('input[type="file"]');

if (input) {
    const preview = document.querySelector('.form__previews');
    const fileList = [];

    input.addEventListener('change', onChange);

    function onChange() {
        const files = input.files;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            const item = document.createElement('div');
            item.classList.add('form__preview');

            const fileName = document.createElement('span');
            fileName.textContent = file.name;
            fileName.classList.add('file-name');

            const remove = document.createElement('div');
            remove.classList.add('form__preview-close');

            const fileItem = {
                name: file.name,
                modified: file.lastModified,
                size: file.size,
            };

            fileList.push(fileItem);

            remove.addEventListener('click', () => {
                fileList.splice(fileList.indexOf(fileItem), 1);
                item.classList.add('removing');
                setTimeout(() => item.remove(), 100);
            });

            item.appendChild(remove);
            item.appendChild(fileName);
            preview.appendChild(item);
        }

        // Логируем выбранные файлы
        console.log('Выбранные файлы:', files);
    }
}
*/

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