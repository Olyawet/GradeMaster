document.addEventListener('DOMContentLoaded', () => {
    // --- Элементы DOM ---
    const subjectsContainer = document.getElementById('subjects-container');
    const addSubjectFab = document.getElementById('add-subject-fab');
    const settingsButton = document.getElementById('settings-button');
    const settingsModal = document.getElementById('settings-modal');
    const closeModalButton = settingsModal.querySelector('.close-button');
    const gradeScaleSelect = document.getElementById('grade-scale');

    // Элементы футера для итоговой статистики
    const totalSubjectsSpan = document.getElementById('total-subjects');
    const overallAvgGradeSpan = document.getElementById('overall-avg-grade');
    const maxSubjectGradeSpan = document.getElementById('max-subject-grade');
    const minSubjectGradeSpan = document.getElementById('min-subject-grade');

    // Элементы модального окна настроек
    const workTypesList = document.getElementById('work-types-list');
    const newWorkTypeNameInput = document.getElementById('new-work-type-name');
    const newWorkTypeWeightInput = document.getElementById('new-work-type-weight');
    const addWorkTypeButton = document.getElementById('add-work-type-button');

    const subjectNamesList = document.getElementById('subject-names-list');
    const newSubjectNameInput = document.getElementById('new-subject-name');
    const addSubjectNameButton = document.getElementById('add-subject-name-button');

    const darkThemeToggle = document.getElementById('dark-theme-toggle');
    const showTipsToggle = document.getElementById('show-tips-toggle');
    const autoSaveToggle = document.getElementById('auto-save-toggle');

    const exportCsvButton = document.getElementById('export-csv-button');
    const exportPdfButton = document.getElementById('export-pdf-button');
    const resetDataButton = document.getElementById('reset-data-button');
    const saveDataButton = document.getElementById('save-data-button'); // Кнопка "Сохранить данные" в шапке
    const resetButton = document.getElementById('reset-button'); // Кнопка "Сбросить" в шапке

    // Новые элементы для готовых шаблонов предметов
    const subjectTemplates = document.querySelectorAll('.subject-template');

    // Кнопка быстрого добавления предмета
    const addSubjectQuickButton = document.getElementById('add-subject-quick');

    // Элементы модального окна настроек предмета
    const subjectSettingsModal = document.getElementById('subject-settings-modal');
    const closeSubjectSettingsButton = subjectSettingsModal.querySelector('.close-button');
    const subjectNameInput = document.getElementById('subject-name-input');
    const subjectColorInput = document.getElementById('subject-color');
    const subjectIconSelect = document.getElementById('subject-icon');
    const subjectWeightInput = document.getElementById('subject-weight');
    const subjectGoalInput = document.getElementById('subject-goal');
    const subjectNotificationsCheckbox = document.getElementById('subject-notifications');
    const subjectAutoCalcCheckbox = document.getElementById('subject-auto-calc');
    const subjectNotesTextarea = document.getElementById('subject-notes');
    const saveSubjectSettingsButton = document.getElementById('save-subject-settings');
    const cancelSubjectSettingsButton = document.getElementById('cancel-subject-settings');

    // Переменные для управления настройками предмета
    let currentSubjectIndex = -1;
    let isNewSubject = false;

    // --- Состояние приложения (данные) ---
    let appState = {
        settings: {
            scale: '5-point', // '5-point', '12-point', '10-point', 'A-F'
            workTypes: [
                { name: 'Контрольная', weight: 1.0 },
                { name: 'Домашняя работа', weight: 0.7 },
                { name: 'Работа на уроке', weight: 0.5 },
                { name: 'Зачёт', weight: 0.9 }
            ],
            theme: 'light', // 'light' or 'dark'
            showTips: true,
            autoSave: true
        },
        subjects: []
    };

    // Готовые шаблоны предметов с иконками и цветами
    const subjectTemplatesData = {
        'Математика': { icon: '📐', color: '#4361EE' },
        'Физика': { icon: '⚡', color: '#FF6B35' },
        'Химия': { icon: '🧪', color: '#7209B7' },
        'Биология': { icon: '🌱', color: '#4CAF50' },
        'История': { icon: '📚', color: '#8B4513' },
        'География': { icon: '🌍', color: '#2196F3' },
        'Литература': { icon: '📖', color: '#E91E63' },
        'Русский язык': { icon: '📝', color: '#FF5722' },
        'Английский язык': { icon: '🇬🇧', color: '#3F51B5' },
        'Информатика': { icon: '💻', color: '#00BCD4' },
        'Физкультура': { icon: '🏃', color: '#FF9800' },
        'ИЗО': { icon: '🎨', color: '#9C27B0' },
        'Музыка': { icon: '🎵', color: '#FF4081' },
        'Технология': { icon: '🔧', color: '#795548' },
        'ОБЖ': { icon: '🛡️', color: '#607D8B' },
        'Обществознание': { icon: '🏛️', color: '#9E9E9E' }
    };

    // --- Функции для работы с данными (LocalForage - имитация для простоты) ---
    const saveData = () => {
        try {
            localStorage.setItem('gradeMasterState', JSON.stringify(appState));
            console.log('Данные сохранены автоматически.');
            return true;
        } catch (error) {
            console.error('Ошибка при сохранении данных:', error);
            alert('Ошибка при сохранении данных. Проверьте доступное место в браузере.');
            return false;
        }
    };

    const saveDataAuto = () => {
        // Всегда сохраняем, если автосохранение не отключено явно
        if (appState.settings.autoSave !== false) {
            saveData();
        }
    };

    const saveDataManual = () => {
        if (saveData()) {
            alert('Данные успешно сохранены!');
        }
    };

    const loadData = () => {
        try {
            const savedState = localStorage.getItem('gradeMasterState');
            if (savedState) {
                const parsedState = JSON.parse(savedState);
                // Проверяем структуру данных и добавляем недостающие поля
                appState = {
                    settings: {
                        scale: parsedState.settings?.scale || '5-point',
                        workTypes: parsedState.settings?.workTypes || [
                            { name: 'Контрольная', weight: 1.0 },
                            { name: 'Домашняя работа', weight: 0.7 },
                            { name: 'Работа на уроке', weight: 0.5 },
                            { name: 'Зачёт', weight: 0.9 }
                        ],
                        theme: parsedState.settings?.theme || 'light',
                        showTips: parsedState.settings?.showTips !== false,
                        autoSave: parsedState.settings?.autoSave !== false
                    },
                    subjects: parsedState.subjects || []
                };
                console.log('Данные загружены успешно.');
            } else {
                console.log('Нет сохраненных данных, используется состояние по умолчанию.');
                // Создаем начальные данные
                saveData();
            }
        } catch (error) {
            console.error('Ошибка при загрузке данных:', error);
            alert('Ошибка при загрузке данных. Используются настройки по умолчанию.');
            // Создаем начальные данные
            saveData();
        }
        applySettings();
        renderSubjects();
        updateOverallStats();
    };

    const resetData = () => {
        try {
            localStorage.removeItem('gradeMasterState');
            appState = { // Сброс к дефолтному состоянию
                settings: {
                    scale: '5-point',
                    workTypes: [
                        { name: 'Контрольная', weight: 1.0 },
                        { name: 'Домашняя работа', weight: 0.7 },
                        { name: 'Работа на уроке', weight: 0.5 },
                        { name: 'Зачёт', weight: 0.9 }
                    ],
                    theme: 'light',
                    showTips: true,
                    autoSave: true
                },
                subjects: []
            };
            applySettings();
            renderSubjects();
            updateOverallStats();
            saveData(); // Сохраняем начальные данные
            console.log('Все данные сброшены.');
            alert('✅ Все данные успешно сброшены!\n\nПриложение восстановлено к начальному состоянию.');
        } catch (error) {
            console.error('Ошибка при сбросе данных:', error);
            alert('❌ Ошибка при сбросе данных. Попробуйте обновить страницу.');
        }
    };

    // --- Функции рендеринга и обновления интерфейса ---

    // Применение настроек к интерфейсу
    const applySettings = () => {
        // Шкала оценок
        gradeScaleSelect.value = appState.settings.scale;

        // Тема
        if (appState.settings.theme === 'dark') {
            document.body.classList.add('dark-theme');
            darkThemeToggle.checked = true;
        } else {
            document.body.classList.remove('dark-theme');
            darkThemeToggle.checked = false;
        }

        // Подсказки (пока не реализованы, но готов к использованию)
        showTipsToggle.checked = appState.settings.showTips;

        // Автосохранение
        autoSaveToggle.checked = appState.settings.autoSave;

        // Обновить список типов работ в модальном окне
        renderWorkTypesInSettings();
        // Обновить список названий предметов в модальном окне
        renderSubjectNamesInSettings();
    };

    // Рендеринг типов работ в модальном окне настроек
    const renderWorkTypesInSettings = () => {
        workTypesList.innerHTML = '';
        appState.settings.workTypes.forEach((type, index) => {
            const div = document.createElement('div');
            div.classList.add('work-type-item');
            div.innerHTML = `
                <span>${type.name}</span>
                <select class="work-type-weight">
                    ${Array.from({ length: 11 }, (_, i) => (i / 10).toFixed(1)).map(weight => `
                        <option value="${weight}" ${type.weight === parseFloat(weight) ? 'selected' : ''}>${weight}</option>
                    `).join('')}
                </select>
                <button class="remove-work-type-button" data-index="${index}"><span class="material-icons">close</span></button>
            `;
            workTypesList.appendChild(div);
        });

        // Добавляем слушатели событий для новых элементов
        workTypesList.querySelectorAll('.work-type-weight').forEach(select => {
            select.addEventListener('change', (e) => {
                const index = Array.from(workTypesList.children).indexOf(e.target.closest('.work-type-item'));
                if (index !== -1) {
                                appState.settings.workTypes[index].weight = parseFloat(e.target.value);
            saveDataAuto();
            renderSubjects(); // Перерисовать все предметы, т.к. веса могли измениться
            updateOverallStats();
                }
            });
        });

        workTypesList.querySelectorAll('.remove-work-type-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                if (confirm(`Удалить тип работы "${appState.settings.workTypes[index].name}"?`)) {
                    appState.settings.workTypes.splice(index, 1);
                    saveDataAuto();
                    renderWorkTypesInSettings();
                    renderSubjects(); // Перерисовать все предметы, т.к. типы работ могли измениться
                    updateOverallStats();
                }
            });
        });
    };

    // Рендеринг названий предметов в модальном окне настроек
    const renderSubjectNamesInSettings = () => {
        subjectNamesList.innerHTML = '';
        // Получаем уникальные названия предметов из существующих subjects
        const uniqueSubjectNames = [...new Set(appState.subjects.map(sub => sub.name))];

        if (uniqueSubjectNames.length === 0) {
            subjectNamesList.innerHTML = '<p style="text-align: center; color: #888; font-style: italic;">Нет добавленных предметов</p>';
            return;
        }

        uniqueSubjectNames.forEach((name, index) => {
            const div = document.createElement('div');
            div.classList.add('subject-name-item');
            div.innerHTML = `
                <span>${name}</span>
                <button class="remove-subject-name-button" data-name="${name}"><span class="material-icons">close</span></button>
            `;
            subjectNamesList.appendChild(div);
        });

        subjectNamesList.querySelectorAll('.remove-subject-name-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const subjectNameToRemove = e.currentTarget.dataset.name;
                if (confirm(`Вы уверены, что хотите удалить предмет "${subjectNameToRemove}"? Это удалит все карточки предметов с таким названием.`)) {
                    // Удаляем все предметы с таким именем
                    appState.subjects = appState.subjects.filter(s => s.name !== subjectNameToRemove);
                    saveDataAuto();
                    renderSubjectNamesInSettings();
                    renderSubjects();
                    updateOverallStats();
                }
            });
        });
    };

    // Генерация опций для выбора оценки в зависимости от шкалы
    const generateGradeOptions = (scale) => {
        let options = '';
        switch (scale) {
            case '5-point':
                for (let i = 5; i >= 1; i--) {
                    options += `<option value="${i}">${i}</option>`;
                }
                break;
            case '12-point':
                for (let i = 12; i >= 1; i--) {
                    options += `<option value="${i}">${i}</option>`;
                }
                break;
            case '10-point':
                for (let i = 10; i >= 1; i--) {
                    options += `<option value="${i}">${i}</option>`;
                }
                break;
            case 'A-F':
                options += `
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                    <option value="F">F</option>
                `;
                break;
        }
        return options;
    };

    // Создание HTML-кода для карточки предмета (обновленная версия с расширенными настройками)
    const createSubjectCard = (subjectData, subjectIndex) => {
        const subjectCard = document.createElement('div');
        subjectCard.classList.add('subject-card');
        subjectCard.dataset.index = subjectIndex;

        // Применяем цвет предмета к карточке
        if (subjectData.color) {
            subjectCard.style.borderLeft = `4px solid ${subjectData.color}`;
        }

        // Создаем опции для выбора предмета
        const subjectOptions = [...new Set(appState.subjects.map(s => s.name))]
            .map(name => `<option value="${name}" ${name === subjectData.name ? 'selected' : ''}>${name}</option>`)
            .join('');

        const icon = subjectData.icon || '📊';
        const goalText = subjectData.goal ? ` (Цель: ${subjectData.goal})` : '';
        const notesText = subjectData.notes ? `<div class="subject-notes">📝 ${subjectData.notes}</div>` : '';

        subjectCard.innerHTML = `
            <div class="subject-header">
                <div style="display: flex; align-items: center; flex-grow: 1;">
                    <span style="font-size: 1.2em; margin-right: 8px;">${icon}</span>
                    <select class="subject-select">
                        <option value="">Выберите предмет</option>
                        ${subjectOptions}
                    </select>
                </div>
                <button class="subject-settings-button" title="Настройки предмета">
                    <span class="material-icons">settings</span>
                </button>
                <button class="remove-subject" title="Удалить предмет">
                    <span class="material-icons">close</span>
                </button>
            </div>
            ${notesText}
            <table class="grades-table">
                <thead>
                    <tr>
                        <th>Тип работы</th>
                        <th>Оценка</th>
                        <th>Действие</th>
                    </tr>
                </thead>
                <tbody>
                    ${subjectData.grades.map((grade, gradeIndex) => `
                        <tr data-grade-index="${gradeIndex}">
                            <td>
                                <select class="grade-type">
                                    ${appState.settings.workTypes.map(type => 
                                        `<option value="${type.name}" ${grade.type === type.name ? 'selected' : ''}>${type.name}</option>`
                                    ).join('')}
                                </select>
                            </td>
                            <td>
                                <select class="grade-value">
                                    ${generateGradeOptions(appState.settings.scale)}
                                </select>
                            </td>
                            <td>
                                <button class="remove-grade" data-grade-index="${gradeIndex}">
                                    <span class="material-icons">delete</span>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <button class="add-grade">
                <span class="material-icons">add</span> Добавить оценку
            </button>
            <div class="subject-result">
                <p>Средний балл: <span class="avg-grade">0.00</span>${goalText}</p>
                <progress value="0" max="5"></progress>
            </div>
        `;

        // Устанавливаем выбранные оценки после того, как опции созданы
        subjectCard.querySelectorAll('.grades-table tbody tr').forEach((row, gradeIndex) => {
            const gradeValueSelect = row.querySelector('.grade-value');
            if (gradeValueSelect) {
                // Преобразуем числовые значения обратно в строки для select
                gradeValueSelect.value = String(subjectData.grades[gradeIndex].value);
            }
        });

        // Добавляем слушатели событий для этой новой карточки
        addSubjectCardEventListeners(subjectCard, subjectIndex);

        return subjectCard;
    };

    // Добавление слушателей событий для новой карточки предмета
    const addSubjectCardEventListeners = (subjectCard, subjectIndex) => {
        const removeSubjectButton = subjectCard.querySelector('.remove-subject');
        removeSubjectButton.addEventListener('click', () => removeSubject(subjectIndex));

        const addGradeButton = subjectCard.querySelector('.add-grade');
        addGradeButton.addEventListener('click', () => addGrade(subjectIndex));

        // Кнопка настроек предмета
        const subjectSettingsButton = subjectCard.querySelector('.subject-settings-button');
        subjectSettingsButton.addEventListener('click', () => openSubjectSettings(subjectIndex));

        // Слушатели для каждого элемента внутри таблицы оценок
        subjectCard.querySelectorAll('.grades-table tbody tr').forEach(row => {
            const gradeIndex = parseInt(row.dataset.gradeIndex);
            const gradeTypeSelect = row.querySelector('.grade-type');
            const gradeValueSelect = row.querySelector('.grade-value');
            const removeGradeButton = row.querySelector('.remove-grade');

            gradeTypeSelect.addEventListener('change', (e) => {
                            appState.subjects[subjectIndex].grades[gradeIndex].type = e.target.value;
            calculateSubjectAvg(subjectIndex);
            saveDataAuto();
            });

            gradeValueSelect.addEventListener('change', (e) => {
                // Сохраняем как число, если это числовая шкала
                if (['5-point', '12-point', '10-point'].includes(appState.settings.scale)) {
                    appState.subjects[subjectIndex].grades[gradeIndex].value = parseFloat(e.target.value);
                } else { // Для буквенной шкалы сохраняем как строку
                    appState.subjects[subjectIndex].grades[gradeIndex].value = e.target.value;
                }
                calculateSubjectAvg(subjectIndex);
                saveDataAuto();
            });

            removeGradeButton.addEventListener('click', () => removeGrade(subjectIndex, gradeIndex));
        });

        const subjectSelect = subjectCard.querySelector('.subject-select');
        subjectSelect.addEventListener('change', (e) => {
            appState.subjects[subjectIndex].name = e.target.value;
            saveDataAuto();
            updateOverallStats(); // Возможно, изменилось имя предмета для макс/мин
        });

        // Начальный расчет среднего балла для новой карточки
        calculateSubjectAvg(subjectIndex);
    };

    // Рендеринг всех предметов
    const renderSubjects = () => {
        subjectsContainer.innerHTML = '';
        if (appState.subjects.length === 0) {
            addSubjectFab.style.display = 'flex'; // Показать FAB, если нет предметов
            subjectsContainer.style.display = 'flex'; // Для центрирования
            subjectsContainer.style.justifyContent = 'center';
            subjectsContainer.style.alignItems = 'center';
            subjectsContainer.innerHTML = `<p style="text-align: center; font-size: 1.2em; color: #888;">Начните, добавив свой первый предмет!</p>`;
        } else {
            addSubjectFab.style.display = 'flex'; // Всегда показывать FAB, если есть предметы
            subjectsContainer.style.display = 'grid'; // Вернуть к grid
            subjectsContainer.style.justifyContent = 'start';
            subjectsContainer.style.alignItems = 'start';
            appState.subjects.forEach((subject, index) => {
                subjectsContainer.appendChild(createSubjectCard(subject, index));
            });
        }
    };

    // Добавление нового предмета
    const addSubject = () => {
        const newSubject = {
            name: 'Новый предмет', // Имя по умолчанию, пользователь может изменить
            icon: '📊',
            color: '#4361EE',
            weight: 1.0,
            goal: null,
            notifications: false,
            autoCalc: true,
            notes: '',
            grades: []
        };
        appState.subjects.push(newSubject);
        saveData();
        renderSubjects(); // Перерисовать все, чтобы новые индексы применились
        updateOverallStats();
    };

    // Удаление предмета
    const removeSubject = (index) => {
        const subjectCard = subjectsContainer.querySelector(`[data-index="${index}"]`);
        if (subjectCard && confirm(`Вы уверены, что хотите удалить предмет "${appState.subjects[index].name}" со всеми оценками?`)) {
            subjectCard.classList.add('removing');
            subjectCard.addEventListener('animationend', () => {
                            appState.subjects.splice(index, 1);
            saveDataAuto();
            renderSubjects(); // Перерисовать, чтобы обновить индексы и убрать удаленный
            updateOverallStats();
            });
        }
    };

    // Добавление оценки к предмету
    const addGrade = (subjectIndex) => {
        const newGrade = {
            type: appState.settings.workTypes[0] ? appState.settings.workTypes[0].name : 'Контрольная', // Первый доступный тип или дефолт
            value: appState.settings.scale === '5-point' ? 5 : (appState.settings.scale === '12-point' ? 12 : (appState.settings.scale === '10-point' ? 10 : 'A')) // Дефолтная оценка
        };
        appState.subjects[subjectIndex].grades.push(newGrade);
        saveDataAuto();
        renderSubjects(); // Перерисовать, чтобы обновить нужный предмет
        updateOverallStats();
    };

    // Удаление оценки из предмета
    const removeGrade = (subjectIndex, gradeIndex) => {
        const subjectCard = subjectsContainer.querySelector(`[data-index="${subjectIndex}"]`);
        if (!subjectCard) return;

        const gradeRow = subjectCard.querySelector(`[data-grade-index="${gradeIndex}"]`);
        if (gradeRow && confirm('Удалить эту оценку?')) {
            appState.subjects[subjectIndex].grades.splice(gradeIndex, 1);
            saveDataAuto();
            renderSubjects(); // Перерисовать, чтобы обновить индексы и убрать удаленную
            updateOverallStats();
        }
    };

    // Расчет среднего балла для одного предмета
    const calculateSubjectAvg = (subjectIndex) => {
        const subject = appState.subjects[subjectIndex];
        const subjectCard = subjectsContainer.querySelector(`[data-index="${subjectIndex}"]`);
        if (!subjectCard) return;

        const avgValueSpan = subjectCard.querySelector('.avg-grade');
        const progressBar = subjectCard.querySelector('progress');

        if (subject.grades.length === 0) {
            avgValueSpan.textContent = '0.0';
            progressBar.value = 0;
            progressBar.max = 1;
            subject.avgGrade = 0; // Сохраняем средний балл в состоянии
            updateOverallStats();
            return;
        }

        let totalWeightedSum = 0;
        let totalWeight = 0;
        let maxPossibleGrade = 1; // Будет обновлено в зависимости от шкалы

        // Определяем максимальное значение шкалы
        switch (appState.settings.scale) {
            case '5-point': maxPossibleGrade = 5; break;
            case '12-point': maxPossibleGrade = 12; break;
            case '10-point': maxPossibleGrade = 10; break;
            case 'A-F': maxPossibleGrade = 5; // A=5, B=4, C=3, D=2, E=1, F=0 (или другая логика)
                break;
        }

        subject.grades.forEach(grade => {
            const workType = appState.settings.workTypes.find(type => type.name === grade.type);
            if (workType) {
                let gradeValue = grade.value;
                if (appState.settings.scale === 'A-F') {
                    // Конвертация буквенной оценки в числовую для расчетов
                    switch (grade.value) {
                        case 'A': gradeValue = 5; break;
                        case 'B': gradeValue = 4; break;
                        case 'C': gradeValue = 3; break;
                        case 'D': gradeValue = 2; break;
                        case 'E': gradeValue = 1; break;
                        case 'F': gradeValue = 0; break;
                        default: gradeValue = 0; // На случай некорректных данных
                    }
                }
                totalWeightedSum += gradeValue * workType.weight;
                totalWeight += workType.weight;
            }
        });

        let avg = totalWeight === 0 ? 0 : (totalWeightedSum / totalWeight);
        avgValueSpan.textContent = avg.toFixed(2);
        progressBar.value = avg;
        progressBar.max = maxPossibleGrade;

        subject.avgGrade = avg; // Сохраняем средний балл в состоянии
        updateOverallStats(); // Обновить общую статистику после каждого изменения
        saveDataAuto();
    };

    // Обновление общей статистики в футере
    const updateOverallStats = () => {
        totalSubjectsSpan.textContent = appState.subjects.length;

        if (appState.subjects.length === 0) {
            overallAvgGradeSpan.textContent = '0.0';
            maxSubjectGradeSpan.textContent = 'Нет';
            minSubjectGradeSpan.textContent = 'Нет';
            return;
        }

        let totalAvgSum = 0;
        let maxAvg = -1;
        let minAvg = Infinity;
        let maxSubjectName = 'Нет';
        let minSubjectName = 'Нет';

        appState.subjects.forEach(subject => {
            if (typeof subject.avgGrade === 'number') { // Убедиться, что avgGrade рассчитан
                const subjectWeight = subject.weight || 1.0; // Используем вес предмета
                totalAvgSum += subject.avgGrade * subjectWeight;

                if (subject.avgGrade > maxAvg) {
                    maxAvg = subject.avgGrade;
                    maxSubjectName = subject.name;
                }
                if (subject.avgGrade < minAvg) {
                    minAvg = subject.avgGrade;
                    minSubjectName = subject.name;
                }
            }
        });

        const overallAvg = appState.subjects.length === 0 ? 0 : (totalAvgSum / appState.subjects.length);
        overallAvgGradeSpan.textContent = overallAvg.toFixed(2);
        maxSubjectGradeSpan.textContent = `${maxSubjectName} (${maxAvg.toFixed(2)})`;
        minSubjectGradeSpan.textContent = `${minSubjectName} (${minAvg.toFixed(2)})`;
    };

    // --- Функции для работы с готовыми шаблонами предметов ---

    // Добавление предмета из готового шаблона
    const addSubjectFromTemplate = (subjectName) => {
        const template = subjectTemplatesData[subjectName];
        if (template) {
            const newSubject = {
                name: subjectName,
                icon: template.icon,
                color: template.color,
                weight: 1.0,
                goal: null,
                notifications: false,
                autoCalc: true,
                notes: '',
                grades: []
            };
            appState.subjects.push(newSubject);
            saveDataAuto();
            renderSubjects();
            updateOverallStats();
        }
    };

    // --- Функции для работы с расширенными настройками предмета ---

    // Открытие модального окна настроек предмета
    const openSubjectSettings = (subjectIndex = -1) => {
        currentSubjectIndex = subjectIndex;
        isNewSubject = subjectIndex === -1;

        if (isNewSubject) {
            // Настройки для нового предмета
            subjectNameInput.value = '';
            subjectColorInput.value = '#4361EE';
            subjectIconSelect.value = '📊';
            subjectWeightInput.value = '1.0';
            subjectGoalInput.value = '';
            subjectNotificationsCheckbox.checked = false;
            subjectAutoCalcCheckbox.checked = true;
            subjectNotesTextarea.value = '';
        } else {
            // Настройки для существующего предмета
            const subject = appState.subjects[subjectIndex];
            subjectNameInput.value = subject.name || '';
            subjectColorInput.value = subject.color || '#4361EE';
            subjectIconSelect.value = subject.icon || '📊';
            subjectWeightInput.value = subject.weight || '1.0';
            subjectGoalInput.value = subject.goal || '';
            subjectNotificationsCheckbox.checked = subject.notifications || false;
            subjectAutoCalcCheckbox.checked = subject.autoCalc !== false;
            subjectNotesTextarea.value = subject.notes || '';
        }

        subjectSettingsModal.style.display = 'flex';
    };

    // Сохранение настроек предмета
    const saveSubjectSettings = () => {
        const name = subjectNameInput.value.trim();
        if (!name) {
            alert('Пожалуйста, введите название предмета.');
            return;
        }

        const subjectData = {
            name: name,
            icon: subjectIconSelect.value,
            color: subjectColorInput.value,
            weight: parseFloat(subjectWeightInput.value) || 1.0,
            goal: subjectGoalInput.value ? parseFloat(subjectGoalInput.value) : null,
            notifications: subjectNotificationsCheckbox.checked,
            autoCalc: subjectAutoCalcCheckbox.checked,
            notes: subjectNotesTextarea.value.trim(),
            grades: isNewSubject ? [] : appState.subjects[currentSubjectIndex].grades
        };

        if (isNewSubject) {
            appState.subjects.push(subjectData);
        } else {
            appState.subjects[currentSubjectIndex] = subjectData;
        }

        saveDataAuto();
        renderSubjects();
        updateOverallStats();
        closeSubjectSettingsModal();
    };

    // Закрытие модального окна настроек предмета
    const closeSubjectSettingsModal = () => {
        subjectSettingsModal.style.display = 'none';
        currentSubjectIndex = -1;
        isNewSubject = false;
    };



    // --- Обработчики событий ---

    // Открытие модального окна настроек
    settingsButton.addEventListener('click', () => {
        settingsModal.style.display = 'flex';
        applySettings(); // Применить текущие настройки к элементам модального окна
    });

    // Закрытие модального окна настроек
    closeModalButton.addEventListener('click', () => {
        settingsModal.style.display = 'none';
    });

    // Закрытие модального окна по клику вне его
    window.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
    });

    // Добавление нового предмета (кнопка FAB)
    addSubjectFab.addEventListener('click', addSubject);

    // Быстрое добавление предмета (кнопка +)
    addSubjectQuickButton.addEventListener('click', () => {
        const subjectName = prompt('Введите название предмета:');
        if (subjectName && subjectName.trim()) {
            const name = subjectName.trim();
            if (!appState.subjects.some(s => s.name === name)) {
                const newSubject = {
                    name: name,
                    icon: '📊',
                    color: '#4361EE',
                    weight: 1.0,
                    goal: null,
                    notifications: false,
                    autoCalc: true,
                    notes: '',
                    grades: []
                };
                appState.subjects.push(newSubject);
                saveDataAuto();
                renderSubjects();
                updateOverallStats();
            } else {
                alert('Предмет с таким названием уже существует.');
            }
        }
    });

    // Изменение шкалы оценок в шапке
    gradeScaleSelect.addEventListener('change', (e) => {
        appState.settings.scale = e.target.value;
        saveDataAuto();
        renderSubjects(); // Перерисовать все предметы, чтобы обновить опции оценок
    });

    // --- Обработчики событий для модального окна настроек ---

    // Добавление нового типа работы
    addWorkTypeButton.addEventListener('click', () => {
        const name = newWorkTypeNameInput.value.trim();
        const weight = parseFloat(newWorkTypeWeightInput.value);

        if (name && !isNaN(weight) && weight >= 0 && weight <= 1) {
            appState.settings.workTypes.push({ name, weight });
            newWorkTypeNameInput.value = '';
            newWorkTypeWeightInput.value = '';
            saveDataAuto();
            renderWorkTypesInSettings();
            renderSubjects(); // Обновить предметы, чтобы новые типы работ были доступны
        } else {
            alert('Пожалуйста, введите корректное название и вес (от 0.0 до 1.0) для типа работы.');
        }
    });

    // Функция для добавления нового предмета по имени
    const addCustomSubject = () => {
        const name = newSubjectNameInput.value.trim();
        if (name && !appState.subjects.some(s => s.name === name)) { // Проверка на уникальность
            // Создаем новый предмет с введенным именем
            const newSubject = {
                name: name,
                icon: '📊',
                color: '#4361EE',
                weight: 1.0,
                goal: null,
                notifications: false,
                autoCalc: true,
                notes: '',
                grades: []
            };
            appState.subjects.push(newSubject);
            newSubjectNameInput.value = ''; // Очищаем поле
            saveData();
            renderSubjects();
            updateOverallStats();
            alert(`Предмет "${name}" успешно добавлен!`);
        } else if (name) {
            alert('Предмет с таким названием уже существует.');
        } else {
            alert('Пожалуйста, введите название предмета.');
        }
    };

    // Добавление нового названия предмета (для выпадающего списка)
    addSubjectNameButton.addEventListener('click', addCustomSubject);

    // Добавление предмета по нажатию Enter
    newSubjectNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addCustomSubject();
        }
    });

    // Переключение темной темы
    darkThemeToggle.addEventListener('change', (e) => {
        appState.settings.theme = e.target.checked ? 'dark' : 'light';
        document.body.classList.toggle('dark-theme', e.target.checked);
        saveDataAuto();
    });

    // Переключение подсказок (пока функционал не реализован)
    showTipsToggle.addEventListener('change', (e) => {
        appState.settings.showTips = e.target.checked;
        saveDataAuto();
        if (appState.settings.showTips) {
            console.log('Подсказки включены');
        } else {
            console.log('Подсказки выключены');
        }
    });

    // Переключение автосохранения
    autoSaveToggle.addEventListener('change', (e) => {
        appState.settings.autoSave = e.target.checked;
        saveDataAuto(); // Сохранить текущее состояние автосохранения
    });

    // Кнопка "Сохранить данные" в шапке (для ручного сохранения)
    saveDataButton.addEventListener('click', saveDataManual);

    // Кнопка "Сбросить" в шапке
    resetButton.addEventListener('click', () => {
        if (confirm('⚠️ ВНИМАНИЕ! Вы уверены, что хотите сбросить ВСЕ данные?\n\nЭто действие:\n• Удалит все предметы и оценки\n• Сбросит все настройки\n• НЕОБРАТИМО!\n\nНажмите "OK" для подтверждения или "Отмена" для отмены.')) {
            if (confirm('🔄 Последнее предупреждение!\n\nВы действительно хотите сбросить все данные?\n\nЭто действие НЕЛЬЗЯ отменить!')) {
                resetData();
            }
        }
    });

    // Экспорт в CSV
    exportCsvButton.addEventListener('click', () => {
        let csvContent = "Предмет,Тип работы,Оценка,Вес\n";
        appState.subjects.forEach(subject => {
            subject.grades.forEach(grade => {
                const workType = appState.settings.workTypes.find(wt => wt.name === grade.type);
                const weight = workType ? workType.weight : 'N/A';
                csvContent += `${subject.name},${grade.type},${grade.value},${weight}\n`;
            });
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'GradeMaster_data.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            alert('Данные экспортированы в CSV!');
        } else {
            alert('Ваш браузер не поддерживает экспорт CSV.');
        }
    });

    // Экспорт в PDF (заглушка, требует сторонних библиотек, например, jsPDF или html2pdf)
    exportPdfButton.addEventListener('click', () => {
        alert('Функция экспорта в PDF пока не реализована. Для этого потребуется подключение сторонней библиотеки (например, jsPDF или html2pdf).');
        // Пример использования html2pdf.js (потребует установки):
        /*
        const element = document.body; // Можно выбрать конкретный элемент, например, subjectsContainer
        html2pdf().from(element).save('GradeMaster_report.pdf');
        */
    });

    // Сброс данных
    resetDataButton.addEventListener('click', resetData);

    // --- Обработчики событий для готовых шаблонов предметов ---
    subjectTemplates.forEach(template => {
        template.addEventListener('click', () => {
            const subjectName = template.dataset.subject;
            addSubjectFromTemplate(subjectName);
            // Закрываем модальное окно настроек после добавления
            settingsModal.style.display = 'none';
        });
    });

    // --- Обработчики событий для модального окна настроек предмета ---
    
    // Закрытие модального окна настроек предмета
    closeSubjectSettingsButton.addEventListener('click', closeSubjectSettingsModal);
    
    // Закрытие модального окна настроек предмета по клику вне его
    window.addEventListener('click', (e) => {
        if (e.target === subjectSettingsModal) {
            closeSubjectSettingsModal();
        }
    });

    // Сохранение настроек предмета
    saveSubjectSettingsButton.addEventListener('click', saveSubjectSettings);
    
    // Отмена настроек предмета
    cancelSubjectSettingsButton.addEventListener('click', closeSubjectSettingsModal);

    // Обновленная функция добавления предмета - теперь открывает настройки
    // Переопределяем обработчик события для кнопки добавления предмета
    addSubjectFab.removeEventListener('click', addSubject);
    addSubjectFab.addEventListener('click', () => {
        openSubjectSettings(); // Открываем настройки для нового предмета
    });
    
    // Также обновляем обработчик для кнопки быстрого добавления
    addSubjectQuickButton.removeEventListener('click', addSubject);
    addSubjectQuickButton.addEventListener('click', () => {
        openSubjectSettings(); // Открываем настройки для нового предмета
    });

    // --- Инициализация при загрузке страницы ---
    loadData(); // Загрузить сохраненные данные при старте
    
    // Принудительно сохраняем данные при загрузке страницы
    setTimeout(() => {
        saveData();
        console.log('Начальные данные сохранены.');
    }, 1000);

    // Улучшения для мобильных устройств
    // Предотвращение двойного тапа для зума
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);

    // Предотвращение масштабирования при двойном тапе
    document.addEventListener('gesturestart', function (e) {
        e.preventDefault();
    });

    document.addEventListener('gesturechange', function (e) {
        e.preventDefault();
    });

    document.addEventListener('gestureend', function (e) {
        e.preventDefault();
    });

    // Сохранение данных при уходе со страницы
    window.addEventListener('beforeunload', () => {
        saveData();
    });

    // Сохранение данных при изменении видимости страницы
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            saveData();
        }
    });
});