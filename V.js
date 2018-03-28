module.exports = class V{
    /**
     * Create a set
     * @param {number} size
     */
    constructor(size) {
        this._size = size;
        this._set = [];
    }

    /**
     * Get set size
     * @returns {*}
     */
    getSize() {
        return this._size;
    }

    /**
     * Push a number to set
     * @param {string} id
     * @returns {boolean}
     */
    pushSet(id) {
        this._set.push(id);
        return this._set.length <= this._size;
    }

    /**
     * Pull a number from set
     * @param {string} id
     * @returns {boolean}
     */
    pullSet(id) {
        this._set.splice(this._set.indexOf(id), 1);
        return this._set.length <= this._size;
    }

    /**
     * Get set
     */
    getSet() {
        return this._set;
    }
};
