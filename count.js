const config = require('./config');
const V = require('./V');

function count(sizeArray) {
    let printIsNeeded = false;
    if (!sizeArray) {
        sizeArray = [5, 4, 4, 4, 7, 6];
        printIsNeeded = true;
    }

    const matrixAdj = config.matrixAdj;

    const contMatrixAdj = {};
    for (const id in matrixAdj) {
        contMatrixAdj[id] = Object.assign({}, matrixAdj[id]);
    }

    const Vi = [];

    sizeArray.forEach(size => {
        Vi.push(new V(size));
    });

    if (printIsNeeded) {
        console.log('Последовательный ход:');
    }

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
                const sumVector = {};

                for (const id in contMatrixAdj) {
                    sumVector[id] = 0;
                }

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

        if (printIsNeeded) {
            console.log(`V${i}: ${Vi[i].getSet()}`);
        }
    }

    if (printIsNeeded) {
        console.log('Итерационный ход:');
    }

    function createIterationMatrixAdj() {
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

        return iterationMatrixAdj;
    }


    function countQ(iterationMatrixAdj) {
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

    function countDeltaRIJ(dVi, rowId, Vj, colId, iterationMatrixAdj) {
        function countS(sVi, sRowId, sVj) {
            let s = 0;

            for (const sColId in iterationMatrixAdj[sVi][sRowId][sVj]) {
                s += iterationMatrixAdj[sVi][sRowId][sVj][sColId];
            }

            return s;
        }

        return ((countS(dVi, rowId, Vj) - countS(dVi, rowId, dVi)) + (countS(Vj, colId, dVi) - countS(Vj, colId, Vj)) - 2 * iterationMatrixAdj[dVi][rowId][Vj][colId]);
    }

    let iteration = 0;

    for (let i = 0; i < Vi.length - 1; i++) {
        let nextV = false;

        while (!nextV) {

            const iterationMatrixAdj = createIterationMatrixAdj();

            const deltaR = {};

            if (printIsNeeded) {
                console.log(`Q: ${countQ(iterationMatrixAdj)}, iteration: ${iteration}`);
            }

            Vi[i].getSet().forEach(rowId => {
                const Vj = {};

                for (let j = i + 1; j < Vi.length; j++) {
                    const Vjj = {};

                    for (const colId in iterationMatrixAdj[`V${i}`][rowId][`V${j}`]) {
                        Vjj[colId] = countDeltaRIJ(`V${i}`, rowId, `V${j}`, colId, iterationMatrixAdj);
                    }

                    Vj[`V${j}`] = Vjj;
                }

                deltaR[rowId] = Vj;
            });

            let maxNum = -9999;
            let maxVi = Vi[i].getSet()[0];
            let maxVj = `V${i + 1}`;
            let maxVjj = Vi[i + 1].getSet()[0];

            for (const viR in deltaR) {
                for (const VjR in deltaR[viR]) {
                    for (const vjR in deltaR[viR][VjR]) {
                        if (deltaR[viR][VjR][vjR] > maxNum) {
                            maxNum = deltaR[viR][VjR][vjR];
                            maxVi = viR;
                            maxVj = VjR;
                            maxVjj = vjR;
                        }
                    }
                }
            }

            if (maxNum > 0) {
                const VjIndex = parseInt(maxVj.substring(maxVj.indexOf('V') + 1), 10);
                Vi[i].pullSet(maxVi);
                Vi[i].pushSet(maxVjj);
                Vi[VjIndex].pullSet(maxVjj);
                Vi[VjIndex].pushSet(maxVi);
            } else {
                nextV = true;
            }

            iteration++;
        }
    }

    const iterationMatrixAdj = createIterationMatrixAdj();
    if (printIsNeeded) {
        console.log(`Q: ${countQ(iterationMatrixAdj)}, iteration: ${iteration}`);
        Vi.forEach((Vii, i) => {
            console.log(`V${i}: ${Vii.getSet()}`);
        });

    }

    return {
        Q: countQ(iterationMatrixAdj),
        Vi,
        iteration,
    };
}

if (process.env.START) {
    count();
}

module.exports = count;
