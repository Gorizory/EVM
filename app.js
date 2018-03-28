const count = require('./count');

const fs = require('fs');

function accommodation() {
    const sequence = [4,5,6,7];
    const nRange = [5,7];
    const N = 30;

    const first = sequence[0];
    const last = sequence[sequence.length - 1];

    const path = 'EVM.csv';
    if (fs.existsSync(path)) {
        fs.unlinkSync(path);
    }
    fs.appendFileSync(path, 'Sizes set; Q; Iterations; V0; V1; V2; V3; V4; V5; V6\n');

    function each() {
        for (let i = nRange[0]; i <= nRange[1]; i++) {
            next(i);
        }
    }

    function next(m) {
        const out = [];

        for (let i = 0; i < m; i++) {
            out.push(first);
        }

        while (out) {
            let j = m - 1;

            for (let k = j; out[k] === last; k--) {
                out[k] = first;
                j--;
            }

            if (j < 0) {
                break;
            }

            out[j]++;

            if (out.reduce((sum, number) => {
                sum += number;
                return sum;
            }, 0) === N) {
                const result = count(out);
                console.log(out);
                let resultStr = `${out}; ${result.Q}; ${result.iteration}; `;
                result.Vi.forEach(group => {
                    resultStr += ` ${group.getSet()};`;
                });
                fs.appendFileSync(path, `${resultStr}\n`);
            }

        }
    }

    return {
        each,
    };
}

const combinations = accommodation();

combinations.each();

