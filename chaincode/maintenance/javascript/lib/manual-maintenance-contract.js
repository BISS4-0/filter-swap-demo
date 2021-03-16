/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const {Contract, Context} = require('fabric-contract-api');

const MachineAsset = require('./MachineAsset.js');
const MachineAssetList = require('./MachineAssetList.js');
const MaintenanceAsset = require('./MaintenanceAsset.js');
const MaintenanceAssetList = require('./MaintenanceAssetList.js');
const ErrorAsset = require('./ErrorAsset.js');
const ErrorAssetList = require('./ErrorAssetList.js')

class AssetContext extends Context {
    constructor() {
        super();
        this.errorAssetList = new ErrorAssetList(this);
        this.machineAssetList = new MachineAssetList(this);
        this.maintenanceAssetList = new MaintenanceAssetList(this);
    }
}


class ManualMaintenanceContract extends Contract {

    createContext() {
        return new AssetContext();
    }

    async instantiate(ctx) {
        // No implementation required with this contract
        // It could be where data migration is performed, if necessary
        this.errorAssetList = new ErrorAssetList(this);
        this.machineAssetList = new MachineAssetList(this);
        this.maintenanceAssetList = new MaintenanceAssetList(this);
        return "Instantiate Lists";
    }

    async registerMachine(ctx, machineAssetID) {
        let machineAssetKey = MachineAsset.makeKey([machineAssetID]);
        let machineAsset;

        try {
            machineAsset = await ctx.machineAssetList.getAsset(machineAssetKey);
        } catch (SyntaxError) {
            console.log('Machine asset ' + machineAssetID + ' does not exist, good');
            machineAsset = MachineAsset.createInstance(machineAssetID);
        }

        if (machineAsset && machineAsset.length > 0) {
            console.log('Machine asset ' + machineAssetID + ' does already exist, ignoring');
        }

        await ctx.machineAssetList.addAsset(machineAsset);
        return "Maschine " + machineAssetID + " registiert"
    }

    async changeFilter(ctx, machineAssetID, oldFilterID, newFilterID) {
        if (oldFilterID === newFilterID) {
            console.log("oldFilterID: " + oldFilterID + " newFilterID: " + newFilterID + " are equal, abort transaction");
            let errorAssetKey = ErrorAsset.makeKey([oldFilterID]);
            let errorAsset;

            try {
                errorAsset = await ctx.errorAssetList.getAsset(errorAssetKey);
            } catch (SyntaxError) {
                console.log('Error asset ' + oldFilterID + ' does not exist, good');
                errorAsset = ErrorAsset.createInstance(oldFilterID);
            }

            await ctx.errorAssetList.addAsset(errorAsset);
            return "Old filter and new filter are the same, abort";
        }
        console.log(machineAssetID);
        let machineAssetKey = MachineAsset.makeKey([machineAssetID]);

        try {
            await ctx.machineAssetList.getAsset(machineAssetKey);
        } catch (SyntaxError) {
            throw new Error('Asset ' + machineAssetID + ' does not exist');
        }

        let maintenanceAssetKeyOld = MaintenanceAsset.makeKey([machineAssetID, oldFilterID]);
        let maintenanceAssetKeyNew = MaintenanceAsset.makeKey([machineAssetID, newFilterID]);
        console.log('Maintenance Key ' + maintenanceAssetKeyOld);
        console.log('Maintenance Key ' + maintenanceAssetKeyNew);

        let maintenanceAssetOld = null;

        try {
            maintenanceAssetOld = await ctx.maintenanceAssetList.getAsset(maintenanceAssetKeyOld);
        } catch (SyntaxError) {
            console.log('Maintenance asset ' + maintenanceAssetOld + ' does not exist, good');
        }
        console.log(maintenanceAssetOld);

        maintenanceAssetOld = MaintenanceAsset.createInstance(machineAssetID, oldFilterID);

        maintenanceAssetOld.setOldFilter(oldFilterID);
        maintenanceAssetOld.setNewFilter(newFilterID);

        await ctx.maintenanceAssetList.addAsset(maintenanceAssetOld);

        return "Tausche Filter " + oldFilterID + " gegen Filter " + newFilterID;
    }

    async deleteAll(ctx) {
        let blockchainContent = await this.queryAll(ctx);

        let blockchainContentParsed = JSON.parse(blockchainContent);

        for(let i = 0; i < blockchainContentParsed.length; i++) {
            await ctx.stub.deleteState(blockchainContentParsed[i]['Key']);
            /*
            if(blockchainContentParsed[i]['Record']['class'] === "org.biss.errorasset") {

            }
            if(blockchainContentParsed[i]['Record']['class'] === "org.biss.machineasset") {

            }
            if(blockchainContentParsed[i]['Record']['class'] === "org.biss.maintenanceasset") {

            }
            */
        }
        return "Delete all the things";
    }

    async queryAll(ctx) {

        // Query the state database with query string. An empty selector returns all documents.
        const iterator = await ctx.stub.getQueryResult('{ "selector": {} }');

        const allResults = [];

        // Loop through iterator and parse all results
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({Key, Record});
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }
}

module.exports = ManualMaintenanceContract;
