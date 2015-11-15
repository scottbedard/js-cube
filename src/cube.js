var band_maps = require('./band_map');

module.exports = class {

    /**
     * Chunks a face into rows or columns
     *
     * @param  {Array}  data    Array of data to be split
     * @param  {String} method  Direction to slice the face ('rows' or 'cols')
     * @return {Array}
     */
    chunk(data, method)
    {
        let size = Math.sqrt(data.length);

        // Slice a face into rows
        if (method == 'rows') {
            let rows = [];
            for (let i = 0; i < size; i++) {
                let start = size * i;
                rows.push(data.slice(start, start + size));
            }

            return rows;
        }

        // Otherwise slice it into columns
        let cols = [];
        for (let i = 0; i < size; i++) {
            let col = [];
            for (let j = 0; j < size; j++) {
                col.push(data[j * size + i])
            }

            cols.push(col);
        }

        return cols;
    }

    /**
     * Re-assembles chunked data
     *
     * @param   {Array}  data
     * @param   {String} method
     * @return  {Array}
     */
    unchunk(data, method)
    {
        if (method == 'rows') {
            return data.reduce((a, b) => a.concat(b));
        }

        let result = [];
        let size = data.length;
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                result.push(data[j][i]);
            }
        }

        return result;
    }

    /**
     * Reads a face chunk
     *
     * @param   {Array}     face            The face being read
     * @param   {String}    type            Type of chunk ('rows' or 'cols')
     * @param   {Integer}   depth           Depth of the row
     * @param   {Boolean}   in_order        If the chunks should be read in order
     * @param   {Boolean}   is_reversed     If the resulting row should be read backwards
     * @return  {Array}
     */
    readChunk(face, type, depth, in_order, is_reversed)
    {
        let chunks = this.chunk(face, type);

        if (!in_order) {
            depth = chunks.length - depth - 1;
        }

        return is_reversed
            ? chunks[depth].reverse()
            : chunks[depth];
    }

    /**
     * Write a face chunk
     *
     * @param   {Array}     face            The face being read
     * @param   {String}    type            Type of chunk ('rows' or 'cols')
     * @param   {Integer}   depth           Depth of the row
     * @param   {Boolean}   in_order        If the chunks should be read in order
     * @param   {Boolean}   is_reversed     If the new chunk should be written backwards
     * @param   {Array}     new_chunk       The new data to write to the face
     * @return  {Array}
     */
    writeChunk(face, type, depth, in_order, is_reversed, new_chunk)
    {
        let chunks = this.chunk(face, type);

        if (!in_order) {
            depth = chunks.length - depth - 1;
        }

        if (is_reversed) {
            new_chunk.reverse();
        }

        chunks[depth] = new_chunk;

        return this.unchunk(chunks, type);
    }

    /**
     * Turn a band
     *
     * @param   {Object}    data        Cube data
     * @param   {String}    face        Relative band face
     * @param   {Integer}   degrees     Degrees to turn the band by
     * @param   {Integer}   depth       Band depth from outside layer
     * @return  {Object}
     */
    turnBand(data, face, degrees, depth = 0)
    {
        // Create the band being turned
        let band = [];
        for (let i = 0; i < 4; i++) {
            let map = band_maps[face][i];

            band.push(this.readChunk(
                data[map.face],
                map.chunk,
                depth,
                map.in_order,
                map.is_reversed
            ));
        }

        // Execute the turn
        if (degrees === 90) {
            [band[0], band[1], band[2], band[3]] = [band[3], band[0], band[1], band[2]];
        } else if (degrees === -90) {
            [band[0], band[1], band[2], band[3]] = [band[1], band[2], band[3], band[0]];
        } else {
            [band[0], band[1], band[2], band[3]] = [band[2], band[3], band[0], band[1]];
        }

        // Re-assemble the data
        for (let i = 0; i < 4; i++) {
            let map = band_maps[face][i];

            data[map.face] = this.writeChunk(
                data[map.face],
                map.chunk,
                depth,
                map.in_order,
                map.is_reversed,
                band[i]
            );
        }

        return data;
    }

    /**
     * Turn a face
     *
     * @param   {Array}     data
     * @param   {Integer}   degrees ( -90, 90, or 180 )
     * @return  {Array}
     */
    turnFace(data, degrees)
    {
        // For 180 degree turns we can just reverse the data
        if (degrees === 180) {
            return data.reverse();
        }

        // Otherwise, chunk the data and execute the quarter turn
        let cols = this.chunk(data);
        let result = degrees === 90
            ? cols.map(cols => cols.reverse())
            : cols.reverse();

        return result.reduce((a, b) => a.concat(b));
    }

    /**
     * Rotate the entire cube along the X axis
     *
     * @param   {Object}    data        Cube data
     * @param   {Integer}   degrees     Degrees to rotate (90, -90, or 180)
     * @return  {Object}
     */
    rotateX(data, degrees)
    {
        if (degrees === 90) {
            return {
                U: data.F,
                L: this.turnFace(data.L, -90),
                F: data.D,
                R: this.turnFace(data.R, 90),
                B: data.U.reverse(),
                D: data.B.reverse(),
            };
        } else if (degrees === -90) {
            return {
                U: data.B.reverse(),
                L: this.turnFace(data.L, 90),
                F: data.U,
                R: this.turnFace(data.R, -90),
                B: data.D.reverse(),
                D: data.F,
            };
        }

        return {
            U: data.D,
            L: data.L.reverse(),
            F: data.B.reverse(),
            R: data.R.reverse(),
            B: data.F.reverse(),
            D: data.U,
        };
    }

    /**
     * Rotate the entire cube along the Y axis
     *
     * @param   {Object}    data        Cube data
     * @param   {Integer}   degrees     Degrees to rotate (90, -90, or 180)
     * @return  {Object}
     */
    rotateY(data, degrees)
    {
        if (degrees === 90) {
            return {
                U: this.turnFace(data.U, 90),
                L: data.F,
                F: data.R,
                R: data.B,
                B: data.L,
                D: this.turnFace(data.D, -90),
            };
        } else if (degrees === -90) {
            return {
                U: this.turnFace(data.U, -90),
                L: data.B,
                F: data.L,
                R: data.F,
                B: data.R,
                D: this.turnFace(data.D, 90),
            };
        }

        return {
            U: data.U.reverse(),
            L: data.R,
            F: data.B,
            R: data.L,
            B: data.F,
            D: data.D.reverse(),
        };
    }

    /**
     * Rotate the entire cube along the Z axis
     *
     * @param   {Object}    data        Cube data
     * @param   {Integer}   degrees     Degrees to rotate (90, -90, or 180)
     * @return  {Object}
     */
    rotateZ(data, degrees)
    {
        if (degrees === 90) {
            return {
                U: this.turnFace(data.L, 90),
                L: this.turnFace(data.D, 90),
                F: this.turnFace(data.F, 90),
                R: this.turnFace(data.U, 90),
                B: this.turnFace(data.B, -90),
                D: this.turnFace(data.R, 90),
            };
        } else if (degrees === -90) {
            return {
                U: this.turnFace(data.L, -90),
                L: this.turnFace(data.D, -90),
                F: this.turnFace(data.F, -90),
                R: this.turnFace(data.U, -90),
                B: this.turnFace(data.B, 90),
                D: this.turnFace(data.R, -90),
            };
        }

        return {
            U: data.D.reverse(),
            L: data.R.reverse(),
            F: data.F.reverse(),
            R: data.L.reverse(),
            B: data.B.reverse(),
            D: data.U.reverse(),
        };
    }
};
