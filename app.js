const V = require('./V');

const matrixAdj = {
    v0: {v0: 0, v1: 2, v2: 3, v3: 0, v4: 0, v5: 0, v6: 0},
    v1: {v0: 2, v1: 0, v2: 1, v3: 0, v4: 0, v5: 0, v6: 0},
    v2: {v0: 3, v1: 1, v2: 0, v3: 1, v4: 0, v5: 1, v6: 0},
    v3: {v0: 0, v1: 0, v2: 1, v3: 0, v4: 1, v5: 3, v6: 0},
    v4: {v0: 0, v1: 0, v2: 0, v3: 1, v4: 0, v5: 0, v6: 3},
    v5: {v0: 0, v1: 0, v2: 1, v3: 3, v4: 0, v5: 0, v6: 1},
    v6: {v0: 0, v1: 0, v2: 0, v3: 0, v4: 3, v5: 1, v6: 0},
};

const contMatrixAdj = {};
for (const id in matrixAdj) {
    contMatrixAdj[id] = Object.assign({}, matrixAdj[id]);
}

const N1 = 3;
const N2 = 2;
const N3 = 2;

const Vi = [new V(N1), new V(N2), new V(N3)];

console.log('Последовательный ход:');

function countSum() {
    const vectorSum = {};

    for (const rowId in contMatrixAdj) {
        vectorSum[rowId] = Object.keys(contMatrixAdj[rowId]).reduce((sum, colId) => {
            sum += contMatrixAdj[rowId][colId];
            return sum;
        }, 0);
    }

    return vectorSum;
}

for (let i = 0; i < Vi.length; i++) {
    let least = 'v0';

    const vectorSum = countSum();

    Object.keys(vectorSum).reduce((min, rowId) => {
        if (vectorSum[rowId] < min) {
            min = vectorSum[rowId];
            least = rowId;
            return min;
        }
    }, 9999);
    Vi[i].pushSet(least);

    let setHasSpace = true;

    for (const colId in contMatrixAdj[least]) {
        if (contMatrixAdj[least][colId] > 0 && contMatrixAdj.hasOwnProperty(colId)) {
            setHasSpace = Vi[i].pushSet(colId);
        }
    }

    if (setHasSpace) {
        let diff = Vi[i].getSet().length - Vi[i].getSize();
        while (diff < 0) {
            const sumVector = {v0: 0, v1: 0, v2: 0, v3: 0, v4: 0, v5: 0, v6: 0};

            Vi[i].getSet().forEach((rowId) => {
                const row = contMatrixAdj[rowId];

                for (const colId in row) {
                    sumVector[colId] += row[colId];
                }
            });

            let max = -1;
            let maxId;

            for (const id in sumVector) {
                if (max < sumVector[id] && Vi[i].getSet().indexOf(id) < 0) {
                    max = sumVector[id];
                    maxId = id;
                }
            }

            Vi[i].pushSet(maxId);

            diff++;
        }
    } else {
        while (!setHasSpace) {
            const delta = {};
            Vi[i].getSet().forEach((rowId) => {
                let s = 0;
                const row = contMatrixAdj[rowId];

                for (const colId in row) {
                    if (Vi[i].getSet().indexOf(colId) < 0) {
                        continue;
                    }
                    s += row[colId];
                }

                delta[rowId] = vectorSum[rowId] - s;
            });

            let maxDeltaId = Vi[i].getSet()[0];
            Object.keys(delta).reduce((max, rowId) => {
                if (delta[rowId] > max) {
                    max = delta[rowId];
                    maxDeltaId = rowId;
                }
                return max;
            }, -1);

            setHasSpace = Vi[i].pullSet(maxDeltaId);
        }
    }

    Vi[i].getSet().forEach(rowIdToDelete => {
        delete contMatrixAdj[rowIdToDelete];
        for (const rowId in contMatrixAdj) {
            delete contMatrixAdj[rowId][rowIdToDelete];
        }
    });

    console.log(`V${i}: ${Vi[i].getSet()}`);
}

console.log('Итерационный ход:');

const iterationMatrixAdj = {};
for (let i = 0; i < Vi.length; i++) {
    const rowVi = {};
    Vi[i].getSet().forEach(rowId => {
        const rowV = {};
        for (let j = 0; j < Vi.length; j++) {
            const colVi = {};
            Vi[j].getSet().forEach(colId => {
                colVi[colId] = matrixAdj[rowId][colId];
            });
            rowV[`V${j}`] = colVi;
        }
        rowVi[rowId] = rowV;
    });
    iterationMatrixAdj[`V${i}`] = rowVi;
}

function countQ() {
    let q = 0;

    for (let i = 0; i < Vi.length - 1; i++) {
        for (const rowId in iterationMatrixAdj[`V${i}`]) {
            for (let j = i + 1; j < Vi.length; j++) {
                for (const colId in iterationMatrixAdj[`V${i}`][rowId][`V${j}`]){
                    q += iterationMatrixAdj[`V${i}`][rowId][`V${j}`][colId];
                }
            }
        }
    }

    return q;
}

function countDeltaRIJ(dVi, rowId, Vj, colId) {
    function countS(sVi, sRowId, sVj) {
        let s = 0;

        for (const sColId in iterationMatrixAdj[sVi][sRowId][sVj]) {
            s += iterationMatrixAdj[sVi][sRowId][sVj][sColId];
        }

        return s;
    }

    return ((countS(dVi, rowId, Vj) - countS(dVi, rowId, dVi)) - (countS(Vj, colId, dVi) - countS(Vj, colId, Vj)) - 2 * iterationMatrixAdj[dVi][rowId][Vj][colId]);
}

let iteration = 0;
console.log(`Q: ${countQ()}, iteration: ${iteration}`);

for (let i = 0; i < Vi.length - 1; i++) {
    const deltaR = {};

    Vi[i].forEach(rowId => {
        const Vj = {};

        for (let j = i + 1; j < Vi.length; j++) {
            console.log(deltaR, rowId, Vj);
            countDeltaRIJ();
        }
    });
}
