'use strict';

const FabricCAServices = require('fabric-ca-client');
const {
    FileSystemWallet,
    X509WalletMixin
} = require('fabric-network');
const fs = require('fs');
const path = require('path');
const yargs = require('yargs');

async function main() {

    const argv = yargs.options({
        org: {
            alias: 'o',
            demandOption: true,
            description: 'The organization to enroll to. For example: Org1'
        },
        admin: {
            alias: 'a',
            default: 'admin',
            description: 'Admin user to enroll'
        },
        password: {
            alias: 'p',
            default: 'adminpw',
            description: 'Password of admin'
        },
        config: {
            alias: 'c',
            demandOption: true,
            description: 'Connection configuration profile'
        }
    }).example('enrollAdmin.js -o Org1 -c connection-org1.json')
        .version(false)
        .argv;

    const ccpPath = path.join(process.cwd(), 'config', argv.config);
    let ccpJSON = null;
    console.log(ccpPath)
    try {
        ccpJSON = fs.readFileSync(ccpPath, 'utf8');
    } catch (e) {
        console.log('ERROR: Cannot find file');
        process.exit(1);
    }

    const ccp = JSON.parse(ccpJSON);

    // Create a new CA client for interacting with the CA.
    let caURL = null;
    try {
        caURL = ccp.organizations[argv.org].certificateAuthorities[0];
    } catch (e) {
        console.log('ERROR: Unknown organization');
        process.exit(1);
    }

    try {
        const caInfo = ccp.certificateAuthorities[caURL];

        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, {
            trustedRoots: caTLSCACerts,
            verify: false
        }, caInfo.caName);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet_'+argv.admin+'_'+argv.org);
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the admin admin.
        const adminExists = await wallet.exists(argv.admin);
        if (adminExists) {
            console.log('An identity for the admin', argv.admin, 'already exists in the wallet');
            process.exit(1);
        }

        // Enroll the admin admin, and import the new identity into the wallet.
        const enrollment = await ca.enroll({
            enrollmentID: argv.admin,
            enrollmentSecret: argv.password
        }).catch(() => {
            console.log('Failed to enroll admin');
            process.exit(1);
        });

        const identity = X509WalletMixin.createIdentity(ccp.organizations[argv.org].mspid, enrollment.certificate, enrollment.key.toBytes());
        await wallet.import(argv.admin, identity);
        console.log('Successfully enrolled admin', argv.admin, 'and imported it into the wallet');

    } catch (error) {
        console.error(`Failed to enroll admin: ${error}`);
        process.exit(1);
    }
}

main();
