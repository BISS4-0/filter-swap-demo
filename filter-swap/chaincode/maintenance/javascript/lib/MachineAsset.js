/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Utility class for ledger state
const State = require('../ledger-api/state.js');

const machineState = {
    OFF: 0,
    ON: 1,
    IDLE: 2,
    RUNNING: 3,
    NEEDS_REPAIR: 4,
    NEEDS_MAINTENANCE: 5,
    UNAVAILABLE: 6,
    UNDEFINED: 7
};

/**
 * MachineAsset class extends State class
 * Class will be used by application and smart contract to define an asset
 */
class MachineAsset extends State {

    constructor(obj) {
        super(MachineAsset.getClass(), [obj.machineAssetID]);
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
        return MachineAsset.deserialize(Buffer.from(JSON.parse(buffer)));
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    /**
     * Deserialize a state data to an asset
     * @param {Buffer} data to form back into the object
     */
    static deserialize(data) {
        return State.deserializeClass(data, MachineAsset);
    }

    /**
     * Factory method to create an asset object
     */
    static createInstance(machineAssetID) {
        return new MachineAsset({machineAssetID});
    }

    static getClass() {
        return 'org.biss.machineasset';
    }
}

module.exports = MachineAsset;
