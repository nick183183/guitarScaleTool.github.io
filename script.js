document.addEventListener('DOMContentLoaded', () => {
    const fretboard = document.getElementById('fretboard');
    const fretNumbersContainer = document.getElementById('fret-numbers');
    const tuningSelect = document.getElementById('tuning-select');
    const viewModeSelect = document.getElementById('view-mode');
    
    const scaleTypeSelect = document.getElementById('scale-type');
    const rootNoteSelect = document.getElementById('root-note');
    const showDegreesCheckbox = document.getElementById('show-degrees');
    
    const chordRootSelect = document.getElementById('chord-root-note');
    const chordTypeSelect = document.getElementById('chord-type');
    const clearBtn = document.getElementById('clear-highlights');

    const TOTAL_STRINGS = 6;
    const TOTAL_FRETS = 24;

    const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const CHROMATIC_DEGREES = ['1', 'b2', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7'];
    
    const SCALE_DEGREES = {
        major: { intervals: [0, 2, 4, 5, 7, 9, 11], labels: ['1', '2', '3', '4', '5', '6', '7'] },
        minor: { intervals: [0, 2, 3, 5, 7, 8, 10], labels: ['1', '2', 'b3', '4', '5', 'b6', 'b7'] },
        majorPentatonic: { intervals: [0, 2, 4, 7, 9], labels: ['1', '2', '3', '5', '6'] },
        minorPentatonic: { intervals: [0, 3, 5, 7, 10], labels: ['1', 'b3', '4', '5', 'b7'] }
    };

    // Интервалы аккордов (отсортированы по популярности)
    const CHORD_TYPES = {
        major: [0, 4, 7],
        minor: [0, 3, 7],
        '7': [0, 4, 7, 10],
        maj7: [0, 4, 7, 11],
        m7: [0, 3, 7, 10],
        sus4: [0, 5, 7],
        sus2: [0, 2, 7],
        dim: [0, 3, 6],
        m7b5: [0, 3, 6, 10],
        add9: [0, 2, 4, 7],
        madd9: [0, 2, 3, 7],
        '9': [0, 2, 4, 7, 10],
        aug: [0, 4, 8]
    };

    const TUNINGS = {
        eStandard:  { name: 'E Standard',  notes: [4, 9, 2, 7, 11, 4] },
        ebStandard: { name: 'Eb Standard', notes: [3, 8, 1, 6, 10, 3] },
        dStandard:  { name: 'D Standard',  notes: [2, 7, 0, 5, 9, 2] },
        dbStandard: { name: 'Db Standard', notes: [1, 6, 11, 4, 8, 1] },
        cStandard:  { name: 'C Standard',  notes: [0, 5, 10, 3, 7, 0] },
        bStandard:  { name: 'B Standard',  notes: [11, 4, 9, 2, 6, 11] },
        bbStandard: { name: 'Bb Standard', notes: [10, 3, 8, 1, 5, 10] },
        aStandard:  { name: 'A Standard',  notes: [9, 2, 7, 0, 4, 9] },
        dropD:  { name: 'Drop D',  notes: [2, 9, 2, 7, 11, 4] },
        dropDb: { name: 'Drop Db', notes: [1, 8, 1, 6, 10, 3] },
        dropC:  { name: 'Drop C',  notes: [0, 7, 0, 5, 9, 2] },
        dropB:  { name: 'Drop B',  notes: [11, 6, 11, 4, 8, 1] },
        dropBb: { name: 'Drop Bb', notes: [10, 5, 10, 3, 7, 0] },
        dropA:  { name: 'Drop A',  notes: [9, 4, 9, 2, 6, 11] },
        dropAb: { name: 'Drop Ab', notes: [8, 3, 8, 1, 5, 10] },
        dropG:  { name: 'Drop G',  notes: [7, 2, 7, 0, 4, 9] }
    };

    const CUSTOM_COLORS = [
        'rgba(52, 152, 219, 0.85)', 'rgba(46, 204, 113, 0.85)', 'rgba(155, 89, 182, 0.85)',
        'rgba(230, 126, 34, 0.85)', 'rgba(0, 206, 201, 0.85)', 'rgba(253, 121, 168, 0.85)'
    ];

    let hiddenNotes = new Set(); 
    let addedNotes = new Map(); 
    let nextColorIndex = 0;

    // 1. Генерация сетки грифа
    for (let string = 1; string <= TOTAL_STRINGS; string++) {
        for (let fret = 0; fret <= TOTAL_FRETS; fret++) {
            const cell = document.createElement('div');
            cell.className = 'note-cell';
            cell.dataset.string = string;
            cell.dataset.fret = fret;

            const circle = document.createElement('div');
            circle.className = 'note-circle';
            
            circle.addEventListener('click', () => {
                const clickedIndex = parseInt(circle.dataset.noteIndex);
                const viewMode = viewModeSelect.value;
                
                // Определяем, относится ли нота к текущим активным наборам
                let isInActiveSet = false;
                if (viewMode === 'scale' || viewMode === 'combined') {
                    const scaleType = scaleTypeSelect.value;
                    if (scaleType !== 'none' && SCALE_DEGREES[scaleType]) {
                        const rootIndex = parseInt(rootNoteSelect.value);
                        const baseScaleIntervals = SCALE_DEGREES[scaleType].intervals.map(i => (rootIndex + i) % 12);
                        if (baseScaleIntervals.includes(clickedIndex)) isInActiveSet = true;
                    }
                }
                if (viewMode === 'chord' || viewMode === 'combined') {
                    const chordType = chordTypeSelect.value;
                    const chordRoot = parseInt(chordRootSelect.value);
                    const chordIntervals = CHORD_TYPES[chordType].map(i => (chordRoot + i) % 12);
                    if (chordIntervals.includes(clickedIndex)) isInActiveSet = true;
                }

                if (isInActiveSet) {
                    if (hiddenNotes.has(clickedIndex)) hiddenNotes.delete(clickedIndex);
                    else hiddenNotes.add(clickedIndex);
                } else {
                    if (addedNotes.has(clickedIndex)) addedNotes.delete(clickedIndex);
                    else {
                        addedNotes.set(clickedIndex, nextColorIndex);
                        nextColorIndex = (nextColorIndex + 1) % 6;
                    }
                }
                updateHighlights();
            });

            cell.appendChild(circle);
            fretboard.appendChild(cell);
        }
    }

    // 2. Заполнение селектов тональностей
    NOTES.forEach((note, index) => {
        const opt1 = document.createElement('option');
        opt1.value = index; opt1.innerText = note;
        rootNoteSelect.appendChild(opt1);
        
        const opt2 = document.createElement('option');
        opt2.value = index; opt2.innerText = note;
        chordRootSelect.appendChild(opt2);
    });
    rootNoteSelect.value = 0; 
    chordRootSelect.value = 0; 

    // 3. Расчет нот на грифе
    function renderNotes(tuningKey) {
        const tuning = TUNINGS[tuningKey];
        document.querySelectorAll('.note-cell').forEach(cell => {
            const stringNum = parseInt(cell.dataset.string); 
            const fretNum = parseInt(cell.dataset.fret);     
            const tuningIndex = 6 - stringNum; 
            const openNoteIndex = tuning.notes[tuningIndex];
            const currentNoteIndex = (openNoteIndex + fretNum) % 12;
            
            const circle = cell.querySelector('.note-circle');
            circle.dataset.note = NOTES[currentNoteIndex];
            circle.dataset.noteIndex = currentNoteIndex;
            circle.dataset.openIndex = openNoteIndex;
        });
        updateHighlights();
    }

    // 4. Центральная функция обновления с поддержкой 3 режимов и градиентов
    function updateHighlights() {
        const viewMode = viewModeSelect.value;
        const showDegrees = showDegreesCheckbox.checked;
        
        // Данные гаммы
        const scaleType = scaleTypeSelect.value;
        const scaleRootIndex = parseInt(rootNoteSelect.value);
        let scaleIntervals = [];
        if (scaleType !== 'none' && SCALE_DEGREES[scaleType]) {
            scaleIntervals = SCALE_DEGREES[scaleType].intervals.map(i => (scaleRootIndex + i) % 12);
        }

        // Данные аккорда
        const chordType = chordTypeSelect.value;
        const chordRootIndex = parseInt(chordRootSelect.value);
        const chordIntervals = CHORD_TYPES[chordType].map(i => (chordRootIndex + i) % 12);

        document.querySelectorAll('.note-circle').forEach(circle => {
            const noteIndex = parseInt(circle.dataset.noteIndex);
            circle.className = 'note-circle'; // Полный сброс классов
            circle.style.background = ''; // Сброс инлайн-стилей (градиентов)

            const interval = (noteIndex - scaleRootIndex + 12) % 12;
            const degreeLabel = CHROMATIC_DEGREES[interval];
            
            const isScaleRoot = (noteIndex === scaleRootIndex);
            const isScaleOther = scaleIntervals.includes(noteIndex) && !isScaleRoot;
            const isScaleCustom = addedNotes.has(noteIndex);
            const isHidden = hiddenNotes.has(noteIndex);
            
            const isChordRoot = (noteIndex === chordRootIndex);
            const isChordOther = chordIntervals.includes(noteIndex) && !isChordRoot;

            let text = showDegrees ? degreeLabel : NOTES[noteIndex];
            circle.innerText = text;

            if (viewMode === 'scale') {
                if (isScaleCustom) circle.classList.add(`custom-${addedNotes.get(noteIndex)}`);
                else if (isScaleRoot && !isHidden) circle.classList.add('highlighted');
                else if (isScaleOther && !isHidden) circle.classList.add('degree-note');
                else circle.classList.add('inactive');
                
            } else if (viewMode === 'chord') {
                if (isChordRoot && !isHidden) circle.classList.add('chord-root');
                else if (isChordOther && !isHidden) circle.classList.add('chord-other');
                else circle.classList.add('inactive');
                
            } else if (viewMode === 'combined') {
                let leftColor = null;
                let rightColor = null;

                // Левая половина (Гамма)
                if (isScaleCustom && !isHidden) leftColor = CUSTOM_COLORS[addedNotes.get(noteIndex)];
                else if (isScaleRoot && !isHidden) leftColor = '#e74c3c'; // Красный
                else if (isScaleOther && !isHidden) leftColor = 'rgba(255, 255, 255, 0.9)'; // Белый

                // Правая половина (Аккорд)
                if (isChordRoot && !isHidden) rightColor = '#f1c40f'; // Желтый
                else if (isChordOther && !isHidden) rightColor = '#95a5a6'; // Серый

                if (leftColor && rightColor) {
                    // СОВМЕЩЕНИЕ: Градиент 50/50
                    circle.style.background = `linear-gradient(to right, ${leftColor} 50%, ${rightColor} 50%)`;
                    circle.classList.add('split-note');
                } else if (leftColor) {
                    // Только гамма
                    if (isScaleCustom) circle.classList.add(`custom-${addedNotes.get(noteIndex)}`);
                    else if (isScaleRoot) circle.classList.add('highlighted');
                    else if (isScaleOther) circle.classList.add('degree-note');
                } else if (rightColor) {
                    // Только аккорд
                    if (isChordRoot) circle.classList.add('chord-root');
                    else if (isChordOther) circle.classList.add('chord-other');
                } else {
                    // Ни то, ни другое
                    circle.classList.add('inactive');
                }
            }
        });
    }

    // 5. Генерация номеров ладов
    function renderFretNumbers() {
        const openFretNum = document.createElement('div');
        openFretNum.className = 'fret-num open';
        openFretNum.innerText = '0';
        fretNumbersContainer.appendChild(openFretNum);
        for (let fret = 1; fret <= TOTAL_FRETS; fret++) {
            const num = document.createElement('div');
            num.className = 'fret-num';
            num.innerText = fret;
            fretNumbersContainer.appendChild(num);
        }
    }

    // 6. Инициализация
    renderFretNumbers();
    renderNotes(tuningSelect.value);

    // 7. Обработчики событий
    tuningSelect.addEventListener('change', (e) => renderNotes(e.target.value));
    viewModeSelect.addEventListener('change', updateHighlights);
    scaleTypeSelect.addEventListener('change', updateHighlights);
    rootNoteSelect.addEventListener('change', updateHighlights);
    showDegreesCheckbox.addEventListener('change', updateHighlights);
    chordRootSelect.addEventListener('change', updateHighlights);
    chordTypeSelect.addEventListener('change', updateHighlights);

    clearBtn.addEventListener('click', () => {
        hiddenNotes.clear();
        addedNotes.clear();
        nextColorIndex = 0;
        updateHighlights();
    });
});