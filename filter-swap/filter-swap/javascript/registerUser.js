/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const {
    FileSystemWallet,
    Gateway,
    X509WalletMixin
} = require('fabric-network');
const path = require('path');
const yargs = require('yargs');
const fs = require('fs');

async function main() {

    const argv = yargs.options({
        org: {
            alias: 'o',
            demandOption: true,
            description: 'The organization to enroll to. For example: Org1'
        },
        admin: {
            alias: 'a',
            demandOption: true,
            description: 'Admin user'
        },
        user: {
            alias: 'u',
            demandOption: true,
            description: 'User to register'
        },
        affiliation: {
            demandOption: true,
            description: 'Affiliation of the user to register. Example: org1.department2'
        },
        config: {
            alias: 'c',
            demandOption: true,
            description: 'Connection configuration profile'
        },
        attributes: {
            demandOption: false,
            description: 'Attributes of the user as an array of attributes. Example: \'{\"query\":\"true\",\"create\":\"false\"}\''
        }
    }).example('node registerUser.js -u userA -c connection-org1.json -o Org1 --affiliation org1.department2 -a admin --attributes \'{\"query\":\"true\",\"create\":\"false\"}\'')
        .skipValidation('attributes')
        .version(false)
        .argv;

    const ccpPath = path.join(process.cwd(), 'config', argv.config);
    console.log(ccpPath);
    let ccpJSON = null;

    try {
        ccpJSON = fs.readFileSync(ccpPath, 'utf8');
    } catch (e) {
        console.log('ERROR: Cannot find file');
        process.exit(1);
    }

    const ccp = JSON.parse(ccpJSON);

    try {
        // Create a new file system based wallet for managing identities.
        const walletPathAdmin = path.join(process.cwd(), 'wallet_'+argv.admin+'_'+argv.org);
        const walletAdmin = new FileSystemWallet(walletPathAdmin);
        console.log(`Admin Wallet path: ${walletPathAdmin}`);

        const walletPathUser = path.join(process.cwd(), 'wallet_'+argv.user+'_'+argv.org);
        const walletUser = new FileSystemWallet(walletPathUser);
        console.log(`User Wallet path: ${walletPathUser}`);
	    
	// Check to see if we've already enrolled the admin.
        const userExists = await walletUser.exists(argv.user);
        if (userExists) {
            console.log('An identity for the user', argv.user, 'already exists in the wallet');
            return;
        }

        // Check to see if we've already enrolled the admin admin.
        const adminExists = await walletAdmin.exists(argv.admin);
        if (!adminExists) {
            console.log('An identity for the admin user', argv.admin, 'does not exist in the wallet');
            console.log('Run the enrollAdmin.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, {
	    wallet: walletAdmin,
            identity: argv.admin,
            discovery: {
                enabled: true,
                asLocalhost: true
            }
        });

        // Get the CA client object from the gateway for interacting with the CA.
        const ca = gateway.getClient().getCertificateAuthority();
        const adminIdentity = gateway.getCurrentIdentity();

        let userAttrs = [];

        if(typeof(argv.attributes) !== 'undefined') {
            let attributesAsJSON = JSON.parse(argv.attributes);

            Object.entries(attributesAsJSON).forEach(([partOne, partTwo]) => {
                userAttrs.push({
                    name: partOne.toString(),
                    value: partTwo.toString(),
                    ecert: true
                });
            });
        }

        // Register the admin, enroll the admin, and import the new identity into the wallet.
        const secret = await ca.register({
            affiliation: argv.affiliation,
            enrollmentID: argv.user,
            role: 'client',
            attrs: userAttrs
        }, adminIdentity);
        const enrollment = await ca.enroll({
            enrollmentID: argv.user,
            enrollmentSecret: secret
        });

        const userIdentity = X509WalletMixin.createIdentity(ccp.organizations[argv.org].mspid, enrollment.certificate, enrollment.key.toBytes());
        await walletUser.import(argv.user, userIdentity);
        console.log('Successfully registered and enrolled user', argv.user, 'and imported it into the wallet');

    } catch (error) {
        console.error(`Failed to enroll user: ${error}`);
        process.exit(1);
    }
}

main();
