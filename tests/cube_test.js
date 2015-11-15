let { assert } = require('chai');
let Cube = require('./../src/cube');

//
// Chunking
//
describe('Chunking', () => {
    let cube = new Cube();

    let data = [
        1, 2, 3,
        4, 5, 6,
        7, 8, 9
    ];

    //
    // Chunk slicing and re-assembly
    //
    describe('Data', () => {
        it('Chunk and unchunk rows', () => {
            let chunks = cube.chunk(data, 'rows');
            assert.deepEqual(chunks, [[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
            assert.deepEqual(cube.unchunk(chunks, 'rows'), data);
        });

        it('Chunk and unchunk columns', () => {
            let chunks = cube.chunk(data, 'cols')
            assert.deepEqual(chunks, [[1, 4, 7], [2, 5, 8], [3, 6, 9]]);
            assert.deepEqual(cube.unchunk(chunks, 'cols'), data);
        });
    });

    //
    // Reading and writing row chunks
    //
    describe('Rows', () => {
        it('Read rows from the top', () => {
            assert.deepEqual(cube.readChunk(data, 'rows', 0, true, false), [1, 2, 3]);
        });

        it('Read rows from the bottom', () => {
            assert.deepEqual(cube.readChunk(data, 'rows', 0, false, false), [7, 8, 9]);
        });

        it('Read rows at a specified depth', () => {
            assert.deepEqual(cube.readChunk(data, 'rows', 1, true, false), [4, 5, 6]);
            assert.deepEqual(cube.readChunk(data, 'rows', 2, true, false), [7, 8, 9]);
        });

        it('Read rows in reverse order', () => {
            assert.deepEqual(cube.readChunk(data, 'rows', 0, true, true), [3, 2, 1]);
        });

        it('Write rows from the top', () => {
            let result = cube.writeChunk(data, 'rows', 0, true, false, ['A', 'B', 'C']);
            assert.deepEqual(result, ['A', 'B', 'C', 4, 5, 6, 7, 8, 9]);
        });

        it('Write rows from the bottom', () => {
            let result = cube.writeChunk(data, 'rows', 0, false, false, ['A', 'B', 'C']);
            assert.deepEqual(result, [1, 2, 3, 4, 5, 6, 'A', 'B', 'C']);
        });

        it('Write rows at a specified depth', () => {
            let result1 = cube.writeChunk(data, 'rows', 1, true, false, ['A', 'B', 'C']);
            assert.deepEqual(result1, [1, 2, 3, 'A', 'B', 'C', 7, 8, 9]);

            let result2 = cube.writeChunk(data, 'rows', 2, true, false, ['A', 'B', 'C']);
            assert.deepEqual(result2, [1, 2, 3, 4, 5, 6, 'A', 'B', 'C']);
        });

        it('Write rows in reverse order', () => {
            let result = cube.writeChunk(data, 'rows', 0, true, true, ['C', 'B', 'A']);
            assert.deepEqual(result, ['A', 'B', 'C', 4, 5, 6, 7, 8, 9]);
        });
    });

    //
    // Reading and writing column chunks
    //
    describe('Columns', () => {
        it('Read columns from the left', () => {
            assert.deepEqual(cube.readChunk(data, 'cols', 0, true, false), [1, 4, 7]);
        });

        it('Read columns from the right', () => {
            assert.deepEqual(cube.readChunk(data, 'cols', 0, false, false), [3, 6, 9]);
        });

        it('Read columns at a specified depth', () => {
            assert.deepEqual(cube.readChunk(data, 'cols', 1, true, false), [2, 5, 8]);
            assert.deepEqual(cube.readChunk(data, 'cols', 2, true, false), [3, 6, 9]);
        });

        it('Read columns in reverse order', () => {
            assert.deepEqual(cube.readChunk(data, 'cols', 0, true, true), [7, 4, 1]);
        });

        it('Write columns from the left', () => {
            let result = cube.writeChunk(data, 'cols', 0, true, false, ['A', 'B', 'C']);
            assert.deepEqual(result, ['A', 2, 3, 'B', 5, 6, 'C', 8, 9]);
        });

        it('Write columns from the right', () => {
            let result = cube.writeChunk(data, 'cols', 0, false, false, ['A', 'B', 'C']);
            assert.deepEqual(result, [1, 2, 'A', 4, 5, 'B', 7, 8, 'C']);
        });

        it('Write columns at a specified depth', () => {
            let result1 = cube.writeChunk(data, 'cols', 1, true, false, ['A', 'B', 'C']);
            assert.deepEqual(result1, [1, 'A', 3, 4, 'B', 6, 7, 'C', 9]);

            let result2 = cube.writeChunk(data, 'cols', 2, true, false, ['A', 'B', 'C']);
            assert.deepEqual(result2, [1, 2, 'A', 4, 5, 'B', 7, 8, 'C']);
        });

        it('Write columns in reverse order', () => {
            let result = cube.writeChunk(data, 'cols', 0, true, true, ['C', 'B', 'A']);
            assert.deepEqual(result, ['A', 2, 3, 'B', 5, 6, 'C', 8, 9]);
        });
    });
});

//
// Turning
//
describe('Turning', () => {
    //
    // Faces
    //
    describe('Faces', () => {
        let cube = new Cube();
        let face = [1, 2, 3, 4, 5, 6, 7, 8, 9];

        it('90 degrees clockwise', () => {
            assert.deepEqual(
                cube.turnFace(face, 90),
                [7, 4, 1, 8, 5, 2, 9, 6, 3]
            );
        });

        it('90 degrees counter-clockwise', () => {
            assert.deepEqual(
                cube.turnFace(face, -90),
                [3, 6, 9, 2, 5, 8, 1, 4, 7]
            );
        });

        it('180 degrees', () => {
            assert.deepEqual(
                cube.turnFace(face, 180),
                [9, 8, 7, 6, 5, 4, 3, 2, 1]
            );
        });
    });

    //
    // Bands
    //
    describe('Bands', () => {
        let cube = new Cube();
        let data = function() {
            return {
                U: ['U1', 'U2', 'U3', 'U4'],
                L: ['L1', 'L2', 'L3', 'L4'],
                F: ['F1', 'F2', 'F3', 'F4'],
                R: ['R1', 'R2', 'R3', 'R4'],
                B: ['B1', 'B2', 'B3', 'B4'],
                D: ['D1', 'D2', 'D3', 'D4'],
            };
        };

        it('U (90 degrees clockwise)', () => {
            assert.deepEqual(cube.turnBand(data(), 'U', 90), {
                U: ['U1', 'U2', 'U3', 'U4'],
                L: ['F1', 'F2', 'L3', 'L4'],
                F: ['R1', 'R2', 'F3', 'F4'],
                R: ['B1', 'B2', 'R3', 'R4'],
                B: ['L1', 'L2', 'B3', 'B4'],
                D: ['D1', 'D2', 'D3', 'D4'],
            });
        });

        it('U (90 degrees counter-clockwise)', () => {
            assert.deepEqual(cube.turnBand(data(), 'U', -90), {
                U: ['U1', 'U2', 'U3', 'U4'],
                L: ['B1', 'B2', 'L3', 'L4'],
                F: ['L1', 'L2', 'F3', 'F4'],
                R: ['F1', 'F2', 'R3', 'R4'],
                B: ['R1', 'R2', 'B3', 'B4'],
                D: ['D1', 'D2', 'D3', 'D4'],
            });
        });

        it('U (180 degrees)', () => {
            assert.deepEqual(cube.turnBand(data(), 'U', 180), {
                U: ['U1', 'U2', 'U3', 'U4'],
                L: ['R1', 'R2', 'L3', 'L4'],
                F: ['B1', 'B2', 'F3', 'F4'],
                R: ['L1', 'L2', 'R3', 'R4'],
                B: ['F1', 'F2', 'B3', 'B4'],
                D: ['D1', 'D2', 'D3', 'D4'],
            });
        });

        it('L', () => {
            assert.deepEqual(cube.turnBand(data(), 'L', 90), {
                U: ['B4', 'U2', 'B2', 'U4'],
                L: ['L1', 'L2', 'L3', 'L4'],
                F: ['U1', 'F2', 'U3', 'F4'],
                R: ['R1', 'R2', 'R3', 'R4'],
                B: ['B1', 'D3', 'B3', 'D1'],
                D: ['F1', 'D2', 'F3', 'D4'],
            });
        });

        it('F', () => {
            assert.deepEqual(cube.turnBand(data(), 'F', 90), {
                U: ['U1', 'U2', 'L4', 'L2'],
                L: ['L1', 'D1', 'L3', 'D2'],
                F: ['F1', 'F2', 'F3', 'F4'],
                R: ['U3', 'R2', 'U4', 'R4'],
                B: ['B1', 'B2', 'B3', 'B4'],
                D: ['R3', 'R1', 'D3', 'D4'],
            });
        });

        it('R', () => {
            assert.deepEqual(cube.turnBand(data(), 'R', 90), {
                U: ['U1', 'F2', 'U3', 'F4'],
                L: ['L1', 'L2', 'L3', 'L4'],
                F: ['F1', 'D2', 'F3', 'D4'],
                R: ['R1', 'R2', 'R3', 'R4'],
                B: ['U4', 'B2', 'U2', 'B4'],
                D: ['D1', 'B3', 'D3', 'B1'],
            });
        });

        it('B', () => {
            assert.deepEqual(cube.turnBand(data(), 'B', 90), {
                U: ['R2', 'R4', 'U3', 'U4'],
                L: ['U2', 'L2', 'U1', 'L4'],
                F: ['F1', 'F2', 'F3', 'F4'],
                R: ['R1', 'D4', 'R3', 'D3'],
                B: ['B1', 'B2', 'B3', 'B4'],
                D: ['D1', 'D2', 'L1', 'L3'],
            });
        });

        it('D', () => {
            assert.deepEqual(cube.turnBand(data(), 'D', 90), {
                U: ['U1', 'U2', 'U3', 'U4'],
                L: ['L1', 'L2', 'B3', 'B4'],
                F: ['F1', 'F2', 'L3', 'L4'],
                R: ['R1', 'R2', 'F3', 'F4'],
                B: ['B1', 'B2', 'R3', 'R4'],
                D: ['D1', 'D2', 'D3', 'D4'],
            });
        });
    });
});

//
// Rotating
//
describe('Cube rotations', () => {
    let cube = new Cube();
    let data = function() {
        return {
            U: ['U1', 'U2', 'U3', 'U4'],
            L: ['L1', 'L2', 'L3', 'L4'],
            F: ['F1', 'F2', 'F3', 'F4'],
            R: ['R1', 'R2', 'R3', 'R4'],
            B: ['B1', 'B2', 'B3', 'B4'],
            D: ['D1', 'D2', 'D3', 'D4'],
        };
    };

    describe('X axis', () => {
        it('90 degrees clockwise', () => {
            assert.deepEqual(cube.rotateX(data(), 90), {
                U: ['F1', 'F2', 'F3', 'F4'],
                L: ['L2', 'L4', 'L1', 'L3'],
                F: ['D1', 'D2', 'D3', 'D4'],
                R: ['R3', 'R1', 'R4', 'R2'],
                B: ['U4', 'U3', 'U2', 'U1'],
                D: ['B4', 'B3', 'B2', 'B1'],
            });
        });

        it('90 degrees counter-clockwise', () => {
            assert.deepEqual(cube.rotateX(data(), -90), {
                U: ['B4', 'B3', 'B2', 'B1'],
                L: ['L3', 'L1', 'L4', 'L2'],
                F: ['U1', 'U2', 'U3', 'U4'],
                R: ['R2', 'R4', 'R1', 'R3'],
                B: ['D4', 'D3', 'D2', 'D1'],
                D: ['F1', 'F2', 'F3', 'F4'],
            });
        });

        it('180 degrees', () => {
            assert.deepEqual(cube.rotateX(data(), 180), {
                U: ['D1', 'D2', 'D3', 'D4'],
                L: ['L4', 'L3', 'L2', 'L1'],
                F: ['B4', 'B3', 'B2', 'B1'],
                R: ['R4', 'R3', 'R2', 'R1'],
                B: ['F4', 'F3', 'F2', 'F1'],
                D: ['U1', 'U2', 'U3', 'U4'],
            });
        });
    });

    describe('Y axis', () => {
        it('90 degrees clockwise', () => {
            assert.deepEqual(cube.rotateY(data(), 90), {
                U: ['U3', 'U1', 'U4', 'U2'],
                L: ['F1', 'F2', 'F3', 'F4'],
                F: ['R1', 'R2', 'R3', 'R4'],
                R: ['B1', 'B2', 'B3', 'B4'],
                B: ['L1', 'L2', 'L3', 'L4'],
                D: ['D2', 'D4', 'D1', 'D3'],
            });
        });

        it('90 degrees counter-clockwise', () => {
            assert.deepEqual(cube.rotateY(data(), -90), {
                U: ['U2', 'U4', 'U1', 'U3'],
                L: ['B1', 'B2', 'B3', 'B4'],
                F: ['L1', 'L2', 'L3', 'L4'],
                R: ['F1', 'F2', 'F3', 'F4'],
                B: ['R1', 'R2', 'R3', 'R4'],
                D: ['D3', 'D1', 'D4', 'D2'],
            });
        });

        it('180 degrees', () => {
            assert.deepEqual(cube.rotateY(data(), 180), {
                U: ['U4', 'U3', 'U2', 'U1'],
                L: ['R1', 'R2', 'R3', 'R4'],
                F: ['B1', 'B2', 'B3', 'B4'],
                R: ['L1', 'L2', 'L3', 'L4'],
                B: ['F1', 'F2', 'F3', 'F4'],
                D: ['D4', 'D3', 'D2', 'D1'],
            });
        });
    });

    describe('Z axis', () => {
        it('90 degrees clockwise', () => {
            assert.deepEqual(cube.rotateZ(data(), 90), {
                U: ['L3', 'L1', 'L4', 'L2'],
                L: ['D3', 'D1', 'D4', 'D2'],
                F: ['F3', 'F1', 'F4', 'F2'],
                R: ['U3', 'U1', 'U4', 'U2'],
                B: ['B2', 'B4', 'B1', 'B3'],
                D: ['R3', 'R1', 'R4', 'R2'],
            });
        });

        it('90 degrees counter-clockwise', () => {
            assert.deepEqual(cube.rotateZ(data(), -90), {
                U: ['L2', 'L4', 'L1', 'L3'],
                L: ['D2', 'D4', 'D1', 'D3'],
                F: ['F2', 'F4', 'F1', 'F3'],
                R: ['U2', 'U4', 'U1', 'U3'],
                B: ['B3', 'B1', 'B4', 'B2'],
                D: ['R2', 'R4', 'R1', 'R3'],
            });
        });

        it('180 degrees', () => {
            assert.deepEqual(cube.rotateZ(data(), 180), {
                U: ['D4', 'D3', 'D2', 'D1'],
                L: ['R4', 'R3', 'R2', 'R1'],
                F: ['F4', 'F3', 'F2', 'F1'],
                R: ['L4', 'L3', 'L2', 'L1'],
                B: ['B4', 'B3', 'B2', 'B1'],
                D: ['U4', 'U3', 'U2', 'U1'],
            });
        });
    });
});
