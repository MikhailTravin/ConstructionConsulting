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
        /*
        arrowPrev.style.left = `${sumMainHomePrev}px`;
        arrowNext.style.right = `${sumMainHomeNext}px`;
        */

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
/*
//Прикрепить фото
document.querySelectorAll('.form__file input[type="file"]').forEach(input => {
    let fileList = []; // Храним File объекты для каждого инпута

    // Ищем контейнер для превью разными способами
    let previewContainer = null;

    // Попытка 1: ищем внутри .form-popup__inputs (для второй формы)
    const formPopupInputs = input.closest('.form-popup__inputs');
    if (formPopupInputs) {
        previewContainer = formPopupInputs.querySelector('.form__previews');
    }

    // Попытка 2: если не нашли, ищем внутри .form__bottom (для первой формы)
    if (!previewContainer) {
        const formBottom = input.closest('.form__bottom');
        if (formBottom) {
            previewContainer = formBottom.querySelector('.form__previews');
        }
    }

    // Попытка 3: если все еще не нашли, ищем в ближайшем родителе
    if (!previewContainer) {
        const parent = input.closest('.form__file').parentElement;
        previewContainer = parent.querySelector('.form__previews');
    }

    // Если контейнер не найден, создаем его
    if (!previewContainer) {
        console.warn('Не найден .form__previews для input', input);
        return; // Пропускаем этот инпут
    }

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

            item.appendChild(remove);
            item.appendChild(fileName);
            previewContainer.appendChild(item);
        });
    }

    function updateFileInput() {
        const dataTransfer = new DataTransfer();
        fileList.forEach(file => dataTransfer.items.add(file));
        input.files = dataTransfer.files;
    }

    // Инициализация существующих превью (если есть)
    const existingPreviews = previewContainer.querySelectorAll('.form__preview');
    if (existingPreviews.length > 0) {
        // Можно добавить логику для восстановления fileList из существующих превью
        previewContainer.style.display = 'block';
    } else {
        previewContainer.style.display = 'none';
    }
});
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

//========================================================================================================================================================

document.addEventListener('DOMContentLoaded', function () {
    function activateTabByParam() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const tabNumber = urlParams.get('t');

            if (!tabNumber) return;

            // Ищем все возможные элементы с data-tab-hash
            const targetElements = document.querySelectorAll(`[data-tab-hash="${tabNumber}"]`);

            if (targetElements.length === 0) return;

            // Обрабатываем каждый найденный элемент
            targetElements.forEach(targetElement => {
                if (targetElement.classList.contains('tabs__title')) {
                    // Обработка вкладок
                    const tabTitles = document.querySelectorAll('.tabs__title');
                    const tabBodies = document.querySelectorAll('.tabs__body');
                    const tabIndex = Array.from(tabTitles).indexOf(targetElement);

                    tabTitles.forEach(title => title.classList.remove('_tab-active'));
                    tabBodies.forEach(body => body.setAttribute('hidden', ''));

                    targetElement.classList.add('_tab-active');

                    if (tabBodies[tabIndex]) {
                        tabBodies[tabIndex].removeAttribute('hidden');
                    }

                    scrollToElement('.product-line');

                } else if (targetElement.classList.contains('installation-stage__title')) {
                    // Обработка installation-stage
                    const allTitles = document.querySelectorAll('.installation-stage__title');
                    allTitles.forEach(title => title.classList.remove('_tab-active'));
                    targetElement.classList.add('_tab-active');

                    // Прокрутка к верху блока installation-stage delivery-object
                    scrollToElement('.installation-stage.delivery-object');
                }
            });

        } catch (error) {
            console.error('Error activating tab:', error);
        }
    }

    function scrollToElement(selector) {
        const element = document.querySelector(selector);
        if (!element) return;

        const header = document.querySelector('header');
        const headerHeight = header ? header.offsetHeight : 100;

        const elementRect = element.getBoundingClientRect();
        const offsetPosition = elementRect.top + window.pageYOffset - headerHeight;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    // Инициализация
    setTimeout(activateTabByParam, 100);
    window.addEventListener('popstate', activateTabByParam);

    // Обработчик кликов
    document.addEventListener('click', function (e) {
        const link = e.target.closest('a[href*="?t="]');
        if (link) {
            const url = new URL(link.href);
            if (url.pathname === window.location.pathname) {
                e.preventDefault();
                history.pushState({}, '', url.href);
                activateTabByParam();
            }
        }
    });
});