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
class MaintenanceAsset extends State {

    constructor(obj) {
        super(MaintenanceAsset.getClass(), [obj.machineAssetID, obj.maintenanceAssetID]);
        let filter_array = {};

        Object.assign(this, obj);
        Object.assign(this, filter_array);
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

    setMaintenanceTimestamp(timestamp){
        this.maintenanceTimestamp = timestamp;
    }

    getMaintenanceTimestamp(){
        return this.maintenanceTimestamp;
    }

    setOldFilter(oldFilterID){
        this.oldFilterID = oldFilterID;
    }

    setNewFilter(newFilterID){
        this.newFilterID = newFilterID;
    }

    appendFilter(filterID){
        this.filter_array.push(filterID);
    }

    setMaintenanceDescription(maintenanceDescription){
        this.maintenanceDescription = maintenanceDescription;
    }

    getMaintenanceDescription(){
        return this.maintenanceDescription;
    }

    static fromBuffer(buffer) {
        return MaintenanceAsset.deserialize(Buffer.from(JSON.parse(buffer)));
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    /**
     * Deserialize a state data to an asset
     * @param {Buffer} data to form back into the object
     */
    static deserialize(data) {
        return State.deserializeClass(data, MaintenanceAsset);
    }

    /**
     * Factory method to create an asset object
     */
    static createInstance(machineAssetID, maintenanceAssetID) {
        return new MaintenanceAsset({machineAssetID, maintenanceAssetID});
    }

    static getClass() {
        return 'org.biss.maintenanceasset';
    }
}

module.exports = MaintenanceAsset;
