"use strict";

const { FileSystemWallet, Gateway } = require("fabric-network");
const path = require("path");
const yargs = require("yargs");
const fs = require("fs");
const crypto = require("crypto");
const express = require("express");
const app = express();

app.use(express.static(__dirname + '/static'));

function add(filters, filter) {
    filters.filter.push(filter);
    console.log("Filters array content: " + filters.filter);
    return filters;
}

function read() {
    let rawdata = fs.readFileSync("filter.json");
    let filter = JSON.parse(rawdata);
    return filter;
}

function write(filters) {
    let data = JSON.stringify(filters);
    fs.writeFileSync("filter.json", data);
}

function init() {
    console.log("Initialized");
    let filters = {
        filter: [],
    };
    let data = JSON.stringify(filters);
    fs.writeFileSync("filter.json", data);
}

app.get("/initialize", async (req, res) => {
    console.log("Initialized");
    init();
    //res.send("Initialized");
    res.sendFile(__dirname + '/static/init.html');  
});

app.get("/initblockchain", async (req, res) => {
    console.log("Init blockchain");
    const ccpPath = path.join(process.cwd(), "config", "connection-org1.json");
    console.log(ccpPath);

    try {
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), "wallet_user1_Org1");
        const wallet = new FileSystemWallet(walletPath);

        // Check to see if we've already enrolled the admin.
        const userExists = await wallet.exists("user1");

        if (!userExists) {
            res.send("User does not exist");
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, {
            wallet,
            identity: "user1",
            discovery: {
                enabled: true,
                asLocalhost: true,
            },
        });
        // Get the network (channel) your contract is deployed to.
        const network = await gateway.getNetwork("mychannel");

        // Get the contract from the network.
        const contract = network.getContract("maintenance");
        const transaction = contract.createTransaction("instantiate");

        let response = await transaction.submit();

        res.send(response.toString());
    } catch (Error) {
        res.send("Something bad happened: " + Error);
    }
});


app.get("/checkuser", async (req, res) => {
    console.log("Check if user exists");
    const ccpPath = path.join(process.cwd(), "config", "connection-org1.json");
    console.log(ccpPath);

    try {
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(
            process.cwd(),
            "wallet_" + req.query.user + "_Org1"
        );
        const wallet = new FileSystemWallet(walletPath);

        // Check to see if we've already enrolled the admin.
        const userExists = await wallet.exists(req.query.user);

        if (!userExists) {
            res.send("User does not exist");
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, {
            wallet,
            identity: req.query.user,
            discovery: {
                enabled: true,
                asLocalhost: true,
            },
        });

        res.send("Login successful");
    } catch (Error) {
        res.send("Something wrong happened");
    }
});

app.get("/replacefilter", async (req, res) => {
    console.log("Replace filter");
    const ccpPath = path.join(process.cwd(), "config", "connection-org1.json");
    console.log(ccpPath);

    let filters = read();
    if (filters.filter.length >= 1) {
        filters = add(filters, req.query.filter);
        console.log("Filter buffer full, write to blockchain");
        filters.filter.sort();
        let oldfilter = filters.filter[0];
        let newfilter = filters.filter[1];

        try {
            // Create a new file system based wallet for managing identities.
            const walletPath = path.join(process.cwd(), "wallet_user1_Org1");
            const wallet = new FileSystemWallet(walletPath);

            // Check to see if we've already enrolled the admin.
            const userExists = await wallet.exists("user1");

            if (!userExists) {
                res.send("User does not exist");
            }

            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(ccpPath, {
                wallet,
                identity: "user1",
                discovery: {
                    enabled: true,
                    asLocalhost: true,
                },
            });
            // Get the network (channel) your contract is deployed to.
            const network = await gateway.getNetwork("mychannel");

            // Get the contract from the network.
            const contract = network.getContract("maintenance");
            const transaction = contract.createTransaction("changeFilter");

            let transactionID = await transaction.getTransactionID();

            let response = await transaction.submit(
                "machine1",
                oldfilter,
                newfilter
            );
            init();
            res.send(String("Filter replaced: " + response));
        } catch (Error) {
            res.send("Something bad happened");
        }
    } else {
        console.log(
            "Filter buffer not full enough, do not write to blockchain"
        );
        filters = add(filters, req.query.filter);
        write(filters);
        res.send(String("Marked filter to be replaced: " + req.query.filter));
    }
});

app.get("/replacepart", async (req, res) => {
    console.log("Replace filter");
    const ccpPath = path.join(process.cwd(), "config", "connection-org1.json");
    console.log(ccpPath);

    try {
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), "wallet_user1_Org1");
        const wallet = new FileSystemWallet(walletPath);

        // Check to see if we've already enrolled the admin.
        const userExists = await wallet.exists("user1");

        if (!userExists) {
            res.send("User does not exist");
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, {
            wallet,
            identity: "user1",
            discovery: {
                enabled: true,
                asLocalhost: true,
            },
        });
        // Get the network (channel) your contract is deployed to.
        const network = await gateway.getNetwork("mychannel");

        // Get the contract from the network.
        const contract = network.getContract("maintenance");
        const transaction = contract.createTransaction("changeFilter");

        let transactionID = await transaction.getTransactionID();

        let response = await transaction.submit(
            "machine1",
            req.query.oldfilter,
            req.query.newfilter
        );
        res.send(String("Transaction sucessful: " + response));
    } catch (Error) {
        res.send("Something bad happened");
    }
});

app.get("/registermachine", async (req, res) => {
    console.log("Register machine");
    const ccpPath = path.join(process.cwd(), "config", "connection-org1.json");
    console.log(ccpPath);

    try {
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), "wallet_user1_Org1");
        const wallet = new FileSystemWallet(walletPath);

        // Check to see if we've already enrolled the admin.
        const userExists = await wallet.exists("user1");

        if (!userExists) {
            res.send("User does not exist");
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, {
            wallet,
            identity: "user1",
            discovery: {
                enabled: true,
                asLocalhost: true,
            },
        });
        // Get the network (channel) your contract is deployed to.
        const network = await gateway.getNetwork("mychannel");

        // Get the contract from the network.
        const contract = network.getContract("maintenance");
        const transaction = contract.createTransaction("registerMachine");

        let transactionID = await transaction.getTransactionID();

        let response = await transaction.submit(req.query.machine);
        res.send(String("Transaction sucessful: " + response));
    } catch (Error) {
        res.send("Something bad happened");
    }
});

app.get("/queryall", async (req, res) => {
    console.log("Query all");
    const ccpPath = path.join(process.cwd(), "config", "connection-org1.json");
    console.log(ccpPath);

    try {
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), "wallet_user1_Org1");
        const wallet = new FileSystemWallet(walletPath);

        // Check to see if we've already enrolled the admin.
        const userExists = await wallet.exists("user1");

        if (!userExists) {
            res.send("User does not exist");
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, {
            wallet,
            identity: "user1",
            discovery: {
                enabled: true,
                asLocalhost: true,
            },
        });
        // Get the network (channel) your contract is deployed to.
        const network = await gateway.getNetwork("mychannel");

        // Get the contract from the network.
        const contract = network.getContract("maintenance");
        const transaction = contract.createTransaction("queryAll");

        let response = await transaction.submit();

        res.send(response.toString());
    } catch (Error) {
        res.send("Something bad happened: " + Error);
    }
});

app.get("/deleteall", async (req, res) => {
    console.log("delete all");
    const ccpPath = path.join(process.cwd(), "config", "connection-org1.json");
    console.log(ccpPath);

    try {
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), "wallet_user1_Org1");
        const wallet = new FileSystemWallet(walletPath);

        // Check to see if we've already enrolled the admin.
        const userExists = await wallet.exists("user1");

        if (!userExists) {
            res.send("User does not exist");
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, {
            wallet,
            identity: "user1",
            discovery: {
                enabled: true,
                asLocalhost: true,
            },
        });
        // Get the network (channel) your contract is deployed to.
        const network = await gateway.getNetwork("mychannel");

        // Get the contract from the network.
        const contract = network.getContract("maintenance");
        const transaction = contract.createTransaction("deleteAll");

        let response = await transaction.submit();

        res.send(response.toString());
    } catch (Error) {
        res.send("Something bad happened: " + Error);
    }
});

async function main() {
    console.log("Init");
    const argv = yargs
        .options({
            user: {
                alias: "u",
                demandOption: true,
                description: "User to execute invoke",
            },
            type: {
                alias: "t",
                choices: ["execute", "query"],
                demandOption: false,
                description: "Type of transaction to execute",
            },
            org: {
                alias: "o",
                demandOption: true,
                description: "Organisation of the user",
            },
            command: {
                alias: "C",
                demandOption: true,
                description:
                    "Chaincode function to execute. Example: createMachine",
            },
            channel: {
                demandOption: true,
                description: "Fabric channel name",
            },
            contract: {
                demandOption: true,
                description: "Contract name",
            },
            attributes: {
                demandOption: true,
                description:
                    'Attributes of chaincode function. Example: \'{"122","MachineA","..."}\'',
            },
            proof: {
                alias: "p",
                demandOption: false,
                description: "Proof to be appended",
            },
            config: {
                alias: "c",
                demandOption: true,
                description: "Connection configuration profile",
            },
        })
        .example(
            'node invoke.js --user user1 --command createMachineAsset --contract maintenance --channel mychannel --attributes \'["Corp A","M1"]\' -c connection-org1.json\n node invoke.js --user user1 --command queryCar --contract fabcar --channel mychannel --attributes \'["CAR1"] -c connection-org1.json -t query'
        )
        .skipValidation("attributes")
        .version(false).argv;

    const ccpPath = path.join(process.cwd(), "config", argv.config);
    console.log(ccpPath);

    try {
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(
            process.cwd(),
            "wallet_" + argv.user + "_" + argv.org
        );
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the admin.
        const userExists = await wallet.exists(argv.user);
        if (!userExists) {
            console.log(
                "An identity for the user",
                argv.user,
                "does not exist in the wallet"
            );
            console.log("Run the registerUser.js application before retrying");
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, {
            wallet,
            identity: argv.user,
            discovery: {
                enabled: true,
                asLocalhost: true,
            },
        });

        // Get the network (channel) your contract is deployed to.
        const network = await gateway.getNetwork(argv.channel);

        // Get the contract from the network.
        const contract = network.getContract(argv.contract);

        let functionArguments = null;

        try {
            functionArguments = JSON.parse(argv.attributes);
        } catch (SyntaxError) {
            console.log("Arguments cannot be parsed");
            return 0;
        }

        const maintenanceDB = nano.use("maintenance");
        const maintenaceProofDB = nano.use("maintenanceproofs");

        if (argv.command === "createMachineAsset") {
            const transaction = contract.createTransaction(argv.command);

            let transactionID = await transaction.getTransactionID();
            try {
                // eslint-disable-next-line no-unused-vars
                let response = await transaction.submit(
                    functionArguments[0],
                    functionArguments[1]
                );
            } catch (error) {
                throw new Error(error);
            }

            maintenanceDB.insert({
                _id: transactionID._transaction_id,
                creator: argv.user,
                machineOwner: functionArguments[0],
                machineAssetID: functionArguments[1],
            });
        } else if (argv.command === "verifyFinding") {
            if (functionArguments[4] === undefined) {
                functionArguments[4] = String(null);
            }

            let maintenanceProof;
            try {
                maintenanceProof = fs.readFileSync(argv.proof);
            } catch (error) {
                throw new Error("Proof cannot be read:" + error);
            }

            const proofHash = crypto
                .createHash("sha256")
                .update(maintenanceProof)
                .digest("hex")
                .toString();

            let maintenanceTimestamp = Date.now().toString();

            const transaction = contract.createTransaction(argv.command);

            let transactionID = await transaction.getTransactionID();
            try {
                // eslint-disable-next-line no-unused-vars
                let response = await transaction.submit(
                    functionArguments[0],
                    functionArguments[1],
                    functionArguments[2],
                    maintenanceTimestamp,
                    functionArguments[3],
                    functionArguments[4],
                    proofHash
                );
            } catch (error) {
                throw new Error(error);
            }

            maintenaceProofDB.attachment.insert(
                transactionID._transaction_id,
                "proof",
                maintenanceProof,
                "image/png"
            );
            // maintenaceProofDB.multipart.insert({hash: proofHash},[{name: argv.proof, data: maintenanceProof, content_type: 'image/png'}],transactionID._transaction_id);
            maintenanceDB.insert({
                _id: transactionID._transaction_id,
                creator: argv.user,
                machineOwner: functionArguments[0],
                machineAssetID: functionArguments[1],
                maintenanceAssetID: functionArguments[2],
                maintenanceTimestamp: maintenanceTimestamp,
                maintenanceStatus: functionArguments[3],
                maintenanceDescription: functionArguments[4],
            });
        }

        // Disconnect from the gateway.
        await gateway.disconnect();
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

app.listen(3000);
