/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Utility class for collections of ledger states --  a state list
const StateList = require('../ledger-api/statelist.js');

const Asset = require('./MachineAsset.js');

class MachineAssetList extends StateList {

    constructor(ctx) {
        super(ctx, 'org.biss.machineassetlist');
        this.use(Asset);
    }

    async addAsset(asset) {
        return this.addState(asset);
    }

    async getAsset(assetKey) {
        return this.getState(assetKey);
    }

    async updateAsset(asset) {
        return this.updateState(asset);
    }

    async deleteAsset(assetKey) {
        return this.deleteState(assetKey);
    }
}


module.exports = MachineAssetList;
