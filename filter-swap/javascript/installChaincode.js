'use strict';

const {
    FileSystemWallet,
    Gateway,
    X509WalletMixin
} = require('fabric-network');
const path = require('path');
const yargs = require('yargs');
const util = require('util');
const fs = require('fs');
const adminBasePath = '/home/ubuntu/Chaincode/biss40playground/fabric/first-network/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/';
const keystorepath = 'keystore';
const signcert = 'signcerts';

async function readAdminFiles(filepath){
    try{
        let keystore = path.join(adminBasePath,filepath);
        let files = fs.readdirSync(keystore);
        return fs.readFileSync(path.join(keystore, files[0]));
    } catch (error){
        throw new Error(error);
    }
}

async function main() {

    const argv = yargs.options({
        admin: {
            alias: 'a',
            demandOption: true,
            description: 'Admin user'
        },
        config: {
            alias: 'c',
            demandOption: true,
            description: 'Connection configuration profile'
        },
        path: {
            alias: 'p',
            demandOption: true,
            description: 'Path to chaincode'
        },
        name: {
            alias: 'n',
            demandOption: true,
            description: 'Chaincode name'
        },
        release: {
            alias: 'r',
            demandOption: true,
            description: 'Chaincode version'
        }
    }).example('node registerUser.js -u userA -c connection-org1.json -o Org1 --affiliation org1.department2 -a admin --attributes \'{\"query\":\"true\",\"create\":\"false\"}\'')
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

    let pk;
    let cert;
    try {
        pk = await readAdminFiles(keystorepath);
        cert = await readAdminFiles(signcert);
    } catch (error) {
        throw console.log(error);
    }


    const ccp = JSON.parse(ccpJSON);

    try {
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the admin admin.
        const adminExists = await wallet.exists(argv.admin);
        if (!adminExists) {
            console.log('An identity for the admin user', argv.admin, 'does not exist in the wallet');
            console.log('Run the enrollAdmin.js application before retrying');
            return;
        }

        let adminWallet = await wallet.export(argv.admin);

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, {
            wallet,
            identity: argv.admin,
            discovery: {
                enabled: true,
                asLocalhost: true
            }
        });

        // Get the CA client object from the gateway for interacting with the CA.
        let client = gateway.getClient();
        client.setAdminSigningIdentity(pk, cert, adminWallet.mspId);

        const peers = await client.getPeersForOrg(adminWallet.mspId);

        let chaincodeInstallRequest = {
            targets: peers,
            chaincodePath : argv.path,
            chaincodeId: argv.name,
            chaincodeVersion: String(argv.release),
            chaincodeType: 'node',
        };

        console.log(util.inspect(chaincodeInstallRequest,true,null));

        try {
            let reponse_= await client.installChaincode(chaincodeInstallRequest, 20000);
        } catch (error) {
            console.error(argv.path + ' must be path to chaincode on local machine, not docker container');
            process.exit(1);
        }

    } catch (error) {
        console.error(`Failed ${error}`);
        process.exit(1);
    }
}

main();
