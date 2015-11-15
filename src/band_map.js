// In order to update the inner bands of a cube, we need to define which
// faces are adjacent to one another, and their relative orientations.
// This allows us to turn any size cube, without mapping each point.

module.exports = {
    U: [
        { face: 'B', chunk: 'rows', in_order: true,  is_reversed: false },
        { face: 'R', chunk: 'rows', in_order: true,  is_reversed: false },
        { face: 'F', chunk: 'rows', in_order: true,  is_reversed: false },
        { face: 'L', chunk: 'rows', in_order: true,  is_reversed: false },
    ],
    L: [
        { face: 'U', chunk: 'cols', in_order: true,  is_reversed: false },
        { face: 'F', chunk: 'cols', in_order: true,  is_reversed: false },
        { face: 'D', chunk: 'cols', in_order: true,  is_reversed: false },
        { face: 'B', chunk: 'cols', in_order: false, is_reversed: true  },
    ],
    F: [
        { face: 'U', chunk: 'rows', in_order: false, is_reversed: true  },
        { face: 'R', chunk: 'cols', in_order: true,  is_reversed: true  },
        { face: 'D', chunk: 'rows', in_order: true,  is_reversed: false },
        { face: 'L', chunk: 'cols', in_order: false, is_reversed: false },
    ],
    R: [
        { face: 'U', chunk: 'cols', in_order: false, is_reversed: true  },
        { face: 'B', chunk: 'cols', in_order: true,  is_reversed: false },
        { face: 'D', chunk: 'cols', in_order: false, is_reversed: true  },
        { face: 'F', chunk: 'cols', in_order: false, is_reversed: true  },
    ],
    B: [
        { face: 'U', chunk: 'rows', in_order: true,  is_reversed: true  },
        { face: 'L', chunk: 'cols', in_order: true,  is_reversed: false },
        { face: 'D', chunk: 'rows', in_order: false, is_reversed: false },
        { face: 'R', chunk: 'cols', in_order: false, is_reversed: true  },
    ],
    D: [
        { face: 'F', chunk: 'rows', in_order: false, is_reversed: false },
        { face: 'R', chunk: 'rows', in_order: false, is_reversed: false },
        { face: 'B', chunk: 'rows', in_order: false, is_reversed: false },
        { face: 'L', chunk: 'rows', in_order: false, is_reversed: false },
    ],
};
