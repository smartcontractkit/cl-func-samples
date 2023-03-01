# Chainlink Functions -Sample Twilio-Spotify Sample
Chainlink Functions allows users to request data from almost any API and perform custom computation using JavaScript. This project is currently in a closed beta. Request access to to the Beta Whitelist at https://functions.chain.link


You can also check out the documents here: https://docs.chain.link/chainlink-functions.


## Use Case Description

This use case creates a `RecordLabel` smart contract. This contract represents an on-chain payment contract between a music artist and the record label.

Chainlink Functions is used to poll the latest monthly streaming numbers for the artist, using Soundcharts' spotify API. 

If the artist has acquired new streams since last measured, the Chainlink Functions code will use the Twilio-Sendgrid email API to send the artist an email informing them that some payments are coming their way.  

<img width="540" alt="Messenger" src="https://user-images.githubusercontent.com/8016129/222272480-cd09893b-00f5-4104-82f6-3eef34b063d6.png"> <span /><span />

The Functions code will also send the latest artist stream count back to the smart contract so it can be recorded immutably on the blockchain. The returned value is passed through [Chainlink's Off Chain Reporting consensus mechanism](https://docs.chain.link/architecture-overview/off-chain-reporting/) - which the nodes in the [Decentralized Oracle Network](https://chain.link/whitepaper) that are returning this streams data achieve a cryptographically verifiable consensus on that returned data!  

The smart contract can then calculate how much payment to send to the artist (the payment could be in the form of a stablecoin such as USDC). The record label and the artist have an agreed payment rate:  for example, the artist gets 1 USDC for every 10000 additional streams for every 1000 additional steams.  This rate is part of the smart contract's code and represents a trust-minimized, verifiable, on-chain record of the agreement. 


## Functions CLI Tool
This sample uses the tooling in [this repo](https://github.com/smartcontractkit/functions-hardhat-starter-kit).  To get a full list of commands available using the Chainlink Functions CLI tool please visit the README on that repo.


## Before you Start...
### Setup

1. Get your Twilio Sendgrid API Keys by following [these docs](https://docs.sendgrid.com/for-developers/sending-email/api-getting-started). <b> You cannot use this sample without completing the Sendgrid setup steps!</b>

2. Ensure you follow the [verify process](https://docs.sendgrid.com/ui/sending-email/sender-verification) for the email address that you intend to send from. Sendgrid needs to approve it.

3. Take a look at the [soundcharts sandbox api](https://doc.api.soundcharts.com/api/v2/doc). Note that the sandbox's API credentials are public for a very limited data set. It's enough for this sample.

4. Get your RPC URL with API key for Sepolia or Mumbai - from [Infura](https://infura.io) or [Alchemy](https://alchemy.com).

5. Get your network's token (Sepolia Eth ) or [Mumbai Matic](https://faucet.polygon.technology/) and, after connecting your Metamask wallet to the right testnet, get some LINK token(faucets.link.com) into your Metamask or other browser wallet.

6. Make sure you have your testnet node RPC URLs in the `./env` file. If necessary, use infura.io or alchemy.com to get your testnet node RPC URL.

7. Create a `.env` file in the project's root (please refer to the `.env.example` file):.  Make sure you have at least the following:

      > :warning: DO NOT COMMIT YOUR .env FILE! The .gitignore file excludes .env but NOT .env.example
        
        ARTIST_EMAIL="PRETEND_YOUR_EMAIL_IS_THE_ARTISTS" 
        VERIFIED_SENDER="THE_EMAIL_VERIFIED_BY_TWILIO" 
        
        TWILIO_API_KEY="YOUR TWILIO API KEY"
        SOUNDCHART_APP_ID="soundcharts"
        SOUNDCHART_API_KEY="soundcharts"


        MUMBAI_RPC_URL="https://polygon-mumbai.g.alchemy.com/v2/ExampleKey"  # OR
        SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/ExampleKey"  
        
        # and
        PRIVATE_KEY="EVM wallet private key (Example: 6c0d*********************************************ac8da9)"

        SECOND_PRIVATE_KEY="SECONDWALLET KEY HERE"

8. Update the `../../hardhat.config.js` in the project's root file to include your private keys for a second wallet account We will pretend this is the artist's wallet address.

```
accounts: process.env.PRIVATE_KEY
        ? [
            {
              privateKey: process.env.PRIVATE_KEY,
              balance: "10000000000000000000000",
            },
// Add this....
            {
              privateKey: process.env.SECOND_PRIVATE_KEY,
              balance: "10000000000000000000000",
            },
          ]
        : [],
```


9. Study the file `./samples/twilio-spotify/Twilio-Spotify-Functions-Source-Example.js`. 

4. Study the `RecordLabel` contract in `../../contracts/sample-apps/RecordLabel.sol` which makes the request and receives the results sent by the Functions source code example. The request is initiated via `executeRequest()` and the DON will return the output of your custom code in the `fulfillRequest()` callback.  

5. Copy the value of the variable `requestConfig` in `./samples/twilio-spotify/twilio-spotify-requestConfig.js`. Paste/replace that object as the new value of `requestConfig` in `../../Functions-request-config.js`.  Note that this example uses Off Chain Secrets.  Follow the instructions in [the upstream README](https://github.com/smartcontractkit/functions-hardhat-starter-kit#off-chain-secrets) on how to use Off Chain Secrets.




### Executing your Chainlink Functions Custom Code via CLI commands

1. All commands are documented in the [upstream repo's command glossary](https://github.com/smartcontractkit/functions-hardhat-starter-kit#command-glossary). We will run through the main commands here. Note that for this twilio-spotify example, the tasks are custom made in the `tasks/Sample-apps-tasks` folder. 

2.  > :warning: **Update the Functions Consumer Contract in code**:When you're ready to run the CLI scripts described in the main README file, make sure you update the references to the client smart contract correctly. 

    When running the CLI commands (which are Hardhat [tasks](https://hardhat.org/hardhat-runner/docs/guides/tasks-and-scripts)), be sure to find the script that implements the task in `/tasks` directory, and change the Contract name in the line that looks like this `const clientFactory = await ethers.getContractFactory("FunctionsConsumer")`. In the Twilio-spotify sample, the contract in this line will read as `const clientFactory = await ethers.getContractFactory("RecordLabel")`.  Replace all references to `await ethers.getContractFactory("FunctionsConsumer")`  in `./tasks/...` to `await ethers.getContractFactory("RecordLabel")`.


3. First deploy the SimpleStableCoin contract to the testnet of your choice
`npx hardhat functions-deploy-stablecoin --network <<network name>>`

4. Then deploy the RecordLabel Smart Contract (referred to as "FunctionsConsumer")
` npx hardhat functions-deploy-recordlabel --network <<network name>> --stc-contract <<address of the SimpleStableCoin contract>>`

5. Create a Chainlink subscription, fund it with LINK (decimals accepted), and add your RecordLabel contract as an authorized consumer / client of Chainlink Functions services.
`npx hardhat functions-sub-create --network <<network name>> --amount 2.5 --contract <<0x-RecordLabel-address>>`
    This will print out information on the subscription ID created, and the details of your LINK balance and which contracts are authorised consumers.


// TODO :Zubin remove this below
```
npx hardhat functions-simulate-twilio --gaslimit 300000 // set the max gas limit to run the computations in the RecorLabel's fulfillRequest() method

// When ready to deploy to testnets, first deploy the mock stablecoin SimpleStableCoin ERC20 contract
yhh function-deploy-stablecoin --network <<network name>>


```
