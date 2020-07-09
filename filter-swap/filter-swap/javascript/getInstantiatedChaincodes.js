'use strict';

const {
    FileSystemWallet,
    Gateway,
} = require('fabric-network');
const path = require('path');
const yargs = require('yargs');
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
	org: {
	    alias: 'o',
	    demandOption: true,
	    description: 'Organization of the user'
	},
        channel: {
            demandOption: true,
            description: 'Fabric channel name'
        },
        config: {
            alias: 'c',
            demandOption: true,
            description: 'Connection configuration profile'
        }
    }).example('node getInstantiatedChaincodes.js -a admin -c connection-org1.json --channel mychannel')
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
        const walletPath = path.join(process.cwd(), 'wallet_'+argv.admin+'_'+argv.org);
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

        const gateway = new Gateway();
        await gateway.connect(ccpPath, {
	    wallet: wallet,
            identity: argv.admin,
            discovery: {
                enabled: true,
                asLocalhost: true
            }
        });

        let client = gateway.getClient();
        const network = await gateway.getNetwork(argv.channel);
        const channel = network.getChannel();

        client.setAdminSigningIdentity(pk, cert, adminWallet.mspId);

        const peers = await client.getPeersForOrg(adminWallet.mspId);

        console.log('Instantiated chaincodes for all peers across all orgs');
        let instantiatedChaincodes = await channel.queryInstantiatedChaincodes(peers[0],true);
        console.log(instantiatedChaincodes);

    } catch (error) {
        console.error(`Failed ${error}`);
        process.exit(1);
    }
}

main();
