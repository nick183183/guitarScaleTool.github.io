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
        minorPentatonic: { intervals: [0, 3, 5, 7, 10], labels: ['1', 'b3', '4', '5', 'b7'] },
        dorian: { intervals: [0, 2, 3, 5, 7, 9, 10], labels: ['1', '2', 'b3', '4', '5', '6', 'b7'] },
        phrygian: { intervals: [0, 1, 3, 5, 7, 8, 10], labels: ['1', 'b2', 'b3', '4', '5', 'b6', 'b7'] },
        lydian: { intervals: [0, 2, 4, 6, 7, 9, 11], labels: ['1', '2', '3', '#4', '5', '6', '7'] },
        mixolydian: { intervals: [0, 2, 4, 5, 7, 9, 10], labels: ['1', '2', '3', '4', '5', '6', 'b7'] },
        locrian: { intervals: [0, 1, 3, 5, 6, 8, 10], labels: ['1', 'b2', 'b3', '4', 'b5', 'b6', 'b7'] },
        melodicMinor: { intervals: [0, 2, 3, 5, 7, 9, 11], labels: ['1', '2', 'b3', '4', '5', '6', '7'] },
        harmonicMinor: { intervals: [0, 2, 3, 5, 7, 8, 11], labels: ['1', '2', 'b3', '4', '5', 'b6', '7'] },
        phrygianDom: { intervals: [0, 1, 4, 5, 7, 8, 10], labels: ['1', 'b2', '3', '4', '5', 'b6', 'b7'] },
        lydianDom: { intervals: [0, 2, 4, 6, 7, 9, 10], labels: ['1', '2', '3', '#4', '5', '6', 'b7'] },
        altered: { intervals: [0, 1, 3, 4, 6, 8, 10], labels: ['1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7'] },
        wholeTone: { intervals: [0, 2, 4, 6, 8, 10], labels: ['1', '2', '3', '#4', '#5', 'b7'] },
        diminishedHW: { intervals: [0, 1, 3, 4, 6, 7, 9, 10], labels: ['1', 'b2', 'b3', '3', '#4', '5', '6', 'b7'] },
        minorBlues: { intervals: [0, 3, 5, 6, 7, 10], labels: ['1', 'b3', '4', 'b5', '5', 'b7'] },
        majorBlues: { intervals: [0, 2, 3, 4, 7, 9], labels: ['1', '2', 'b3', '3', '5', '6'] }
    };

    const CHORD_TYPES = {
        major: [0, 4, 7], minor: [0, 3, 7], '7': [0, 4, 7, 10], maj7: [0, 4, 7, 11],
        m7: [0, 3, 7, 10], sus4: [0, 5, 7], sus2: [0, 2, 7], dim: [0, 3, 6],
        m7b5: [0, 3, 6, 10], add9: [0, 2, 4, 7], '9': [0, 2, 4, 7, 10]
    };

    const TUNINGS = {
        eStandard: { notes: [4, 9, 2, 7, 11, 4] }, ebStandard: { notes: [3, 8, 1, 6, 10, 3] },
        dStandard: { notes: [2, 7, 0, 5, 9, 2] }, dbStandard: { notes: [1, 6, 11, 4, 8, 1] },
        cStandard: { notes: [0, 5, 10, 3, 7, 0] }, bStandard: { notes: [11, 4, 9, 2, 6, 11] },
        bbStandard: { notes: [10, 3, 8, 1, 5, 10] }, aStandard: { notes: [9, 2, 7, 0, 4, 9] },
        dropD: { notes: [2, 9, 2, 7, 11, 4] }, dropDb: { notes: [1, 8, 1, 6, 10, 3] },
        dropC: { notes: [0, 7, 0, 5, 9, 2] }, dropB: { notes: [11, 6, 11, 4, 8, 1] },
        dropBb: { notes: [10, 5, 10, 3, 7, 0] }, dropA: { notes: [9, 4, 9, 2, 6, 11] },
        dropAb: { notes: [8, 3, 8, 1, 5, 10] }, dropG: { notes: [7, 2, 7, 0, 4, 9] }
    };

    const CUSTOM_COLORS = [
        'rgba(52, 152, 219, 0.85)', 'rgba(46, 204, 113, 0.85)', 'rgba(155, 89, 182, 0.85)',
        'rgba(230, 126, 34, 0.85)', 'rgba(0, 206, 201, 0.85)', 'rgba(253, 121, 168, 0.85)'
    ];

    let hiddenNotes = new Set(); 
    let addedNotes = new Map(); 
    let nextColorIndex = 0;

    // Переменные для режима "Своя гамма/аккорд"
    let customScaleNotes = new Set();
    let customScaleRoot = null;
    let customChordNotes = new Set();
    let customChordRoot = null;

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
                const scaleType = scaleTypeSelect.value;
                const chordType = chordTypeSelect.value;

                // Логика для Своей гаммы
                if (scaleType === 'customScale') {
                    if (customScaleNotes.size === 0) {
                        customScaleRoot = clickedIndex;
                        customScaleNotes.add(clickedIndex);
                    } else if (customScaleRoot === clickedIndex) {
                        customScaleNotes.clear();
                        customScaleRoot = null;
                    } else {
                        if (customScaleNotes.has(clickedIndex)) customScaleNotes.delete(clickedIndex);
                        else customScaleNotes.add(clickedIndex);
                    }
                } 
                // Логика для Своего аккорда
                else if (chordType === 'customChord') {
                    if (customChordNotes.size === 0) {
                        customChordRoot = clickedIndex;
                        customChordNotes.add(clickedIndex);
                    } else if (customChordRoot === clickedIndex) {
                        customChordNotes.clear();
                        customChordRoot = null;
                    } else {
                        if (customChordNotes.has(clickedIndex)) customChordNotes.delete(clickedIndex);
                        else customChordNotes.add(clickedIndex);
                    }
                } 
                // Логика для стандартных гамм/аккордов + доп. ноты
                else {
                    let isInActiveSet = false;
                    if (viewMode === 'scale' || viewMode === 'combined') {
                        if (scaleType !== 'none' && SCALE_DEGREES[scaleType]) {
                            const rootIndex = parseInt(rootNoteSelect.value);
                            const intervals = SCALE_DEGREES[scaleType].intervals.map(i => (rootIndex + i) % 12);
                            if (intervals.includes(clickedIndex)) isInActiveSet = true;
                        }
                    }
                    if (viewMode === 'chord' || viewMode === 'combined') {
                        if (chordType !== 'none' && CHORD_TYPES[chordType]) {
                            const rootIndex = parseInt(chordRootSelect.value);
                            const intervals = CHORD_TYPES[chordType].map(i => (rootIndex + i) % 12);
                            if (intervals.includes(clickedIndex)) isInActiveSet = true;
                        }
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
                }
                updateHighlights();
            });

            cell.appendChild(circle);
            fretboard.appendChild(cell);
        }
    }

    // 2. Заполнение селектов
    NOTES.forEach((note, index) => {
        const opt1 = document.createElement('option');
        opt1.value = index; opt1.innerText = note;
        rootNoteSelect.appendChild(opt1);
        
        const opt2 = document.createElement('option');
        opt2.value = index; opt2.innerText = note;
        chordRootSelect.appendChild(opt2);
    });
    
    // УСТАНОВКА ЗНАЧЕНИЙ ПО УМОЛЧАНИЮ
    rootNoteSelect.value = 4; // E
    chordRootSelect.value = 9; // A

    // 3. Расчет нот
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

    // 4. Обновление подсветки
    function updateHighlights() {
        const viewMode = viewModeSelect.value;
        const showDegrees = showDegreesCheckbox.checked;
        const scaleType = scaleTypeSelect.value;
        const chordType = chordTypeSelect.value;
        
        const scaleRootIndex = parseInt(rootNoteSelect.value);
        let scaleIntervals = [];
        if (scaleType !== 'customScale' && scaleType !== 'none' && SCALE_DEGREES[scaleType]) {
            scaleIntervals = SCALE_DEGREES[scaleType].intervals.map(i => (scaleRootIndex + i) % 12);
        }

        const chordRootIndex = parseInt(chordRootSelect.value);
        let chordIntervals = [];
        if (chordType !== 'customChord' && chordType !== 'none' && CHORD_TYPES[chordType]) {
            chordIntervals = CHORD_TYPES[chordType].map(i => (chordRootIndex + i) % 12);
        }

        document.querySelectorAll('.note-circle').forEach(circle => {
            const noteIndex = parseInt(circle.dataset.noteIndex);
            circle.className = 'note-circle'; 
            circle.style.background = ''; 

            const interval = (noteIndex - scaleRootIndex + 12) % 12;
            const degreeLabel = CHROMATIC_DEGREES[interval];
            
            // Определение статуса для гаммы
            let isScaleRoot = false, isScaleOther = false, isScaleCustom = false, isHidden = false;
            if (scaleType === 'customScale') {
                isScaleRoot = (noteIndex === customScaleRoot);
                isScaleOther = customScaleNotes.has(noteIndex) && !isScaleRoot;
            } else {
                isScaleRoot = (noteIndex === scaleRootIndex);
                isScaleOther = scaleIntervals.includes(noteIndex) && !isScaleRoot;
                isScaleCustom = addedNotes.has(noteIndex);
                isHidden = hiddenNotes.has(noteIndex);
            }

            // Определение статуса для аккорда
            let isChordRoot = false, isChordOther = false;
            if (chordType === 'customChord') {
                isChordRoot = (noteIndex === customChordRoot);
                isChordOther = customChordNotes.has(noteIndex) && !isChordRoot;
            } else {
                isChordRoot = (noteIndex === chordRootIndex);
                isChordOther = chordIntervals.includes(noteIndex) && !isChordRoot;
            }

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
                let leftColor = null, rightColor = null;

                if (isScaleCustom && !isHidden) leftColor = CUSTOM_COLORS[addedNotes.get(noteIndex)];
                else if (isScaleRoot && !isHidden) leftColor = '#e74c3c'; 
                else if (isScaleOther && !isHidden) leftColor = 'rgba(255, 255, 255, 0.9)'; 

                if (isChordRoot && !isHidden) rightColor = '#f1c40f'; 
                else if (isChordOther && !isHidden) rightColor = '#95a5a6'; 

                if (leftColor && rightColor) {
                    circle.style.background = `linear-gradient(to right, ${leftColor} 50%, ${rightColor} 50%)`;
                    circle.classList.add('split-note');
                } else if (leftColor) {
                    if (isScaleCustom) circle.classList.add(`custom-${addedNotes.get(noteIndex)}`);
                    else if (isScaleRoot) circle.classList.add('highlighted');
                    else if (isScaleOther) circle.classList.add('degree-note');
                } else if (rightColor) {
                    if (isChordRoot) circle.classList.add('chord-root');
                    else if (isChordOther) circle.classList.add('chord-other');
                } else {
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
    scaleTypeSelect.addEventListener('change', () => { customScaleNotes.clear(); customScaleRoot = null; updateHighlights(); });
    rootNoteSelect.addEventListener('change', updateHighlights);
    showDegreesCheckbox.addEventListener('change', updateHighlights);
    chordTypeSelect.addEventListener('change', () => { customChordNotes.clear(); customChordRoot = null; updateHighlights(); });
    chordRootSelect.addEventListener('change', updateHighlights);

    clearBtn.addEventListener('click', () => {
        hiddenNotes.clear();
        addedNotes.clear();
        customScaleNotes.clear(); customScaleRoot = null;
        customChordNotes.clear(); customChordRoot = null;
        nextColorIndex = 0;
        updateHighlights();
    });
});