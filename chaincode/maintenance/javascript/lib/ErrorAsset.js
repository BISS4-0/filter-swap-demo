/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Utility class for ledger state
const State = require('../ledger-api/state.js');


/**
 * MachineAsset class extends State class
 * Class will be used by application and smart contract to define an asset
 */
class ErrorAsset extends State {

    constructor(obj) {
        super(ErrorAsset.getClass(), [obj.errorAssetID]);
        Object.assign(this, obj);
    }

    /**
     * Basic getters and setters
    */

    getCurrentState() {
        return this.currentState;
    }

    /**
     * Useful methods to encapsulate asset states
     */

    static fromBuffer(buffer) {
        return ErrorAsset.deserialize(Buffer.from(JSON.parse(buffer)));
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    /**
     * Deserialize a state data to an asset
     * @param {Buffer} data to form back into the object
     */
    static deserialize(data) {
        return State.deserializeClass(data, ErrorAsset);
    }

    /**
     * Factory method to create an asset object
     */
    static createInstance(errorAssetID) {
        return new ErrorAsset({errorAssetID});
    }

    static getClass() {
        return 'org.biss.errorasset';
    }
}

module.exports = ErrorAsset;
