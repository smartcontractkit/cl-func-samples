# Chainlink Functions <> Music Artist - Record Label Contract

Chainlink Functions allows users to get data from any API, even with API secrets, and perform custom/heavy computations using code logic that you provide. Chainlink Functions is currently in a closed beta. Request access to use Chainlink Functions at https://functions.chain.link.

This use case showcases how Chainlink Functions can be used to facilitate a digital agreement between a record label and a music artist, with Chainlink Functions being used to obtain the artists streaming numbers from a Spotify wrapper, as well as sending them notifications as payments are made using the [Twilio SendGrid Email API](https://www.twilio.com/en-us/sendgrid/email-api)

The `RecordLabel` contract represents an on-chain payment contract between a music artist and the record label. Chainlink Functions is used to poll the latest monthly streaming numbers for the artist, using Soundcharts' Spotify API. The artist is paid in a (demo) Stablecoin called STC.

If the artist has acquired new streams since last measured, the Chainlink Functions code will use the Twilio-Sendgrid email API to send the artist an email informing them that some STC payments are coming their way. The Functions code will also send the latest stream count back to the smart contract so it can be recorded immutably on the blockchain. The returned value is passed through [Chainlink's Off-Chain Reporting consensus mechanism](https://docs.chain.link/architecture-overview/off-chain-reporting/) - which the nodes in the [Decentralized Oracle Network](https://chain.link/whitepaper) that are returning this stream's data achieve a cryptographically verifiable consensus on that returned data!

The smart contract calculates how much STC is payable to the recording artist (in real life, the payment could be in the form of a stablecoin such as USDC). The record label and the artist have an agreed payment rate: for example, the artist gets 1 USDC for every 10000 additional streams. This rate is part of the smart contract's code and represents a trust-minimized, verifiable, on-chain record of the agreement.

<img width="540" alt="Messenger" src="https://user-images.githubusercontent.com/8016129/224178418-27f62a67-d44a-4fb4-8e74-c4c967f312dd.png"> <span /><span />

## Setup & Environment Variables

Before you get started we recommend you read the README in [this Functions tooling repo](https://github.com/smartcontractkit/functions-hardhat-starter-kit) carefully to understand how this sample is designed, under the hood. Then...

1. Get your Twilio Sendgrid API Keys by following [these docs](https://docs.sendgrid.com/for-developers/sending-email/api-getting-started). <b> You cannot use this sample without completing the Sendgrid setup steps!</b> Ensure you follow the verify process for the email address that you intend to send from. Sendgrid needs to approve it. **Note:** it can take a day or more to get verified!<br><br>

2. Take a look at the [soundcharts sandbox api](https://doc.api.soundcharts.com/api/v2/doc). Note that the sandbox's API credentials are public for a very limited data set. It's enough for this sample.<br><br>

3. Clone this repository to your local machine. Then change to this directory in your terminal app and run `npm install` to install all dependencies.<br><br>

4. Take a look at the [soundcharts sandbox api](https://doc.api.soundcharts.com/api/v2/doc). Note that the sandbox's API credentials are public for a very limited data set. It's enough for this sample.<br><br>

5. Get your RPC URL with API key for Sepolia or Mumbai - from [Infura](https://infura.io) or [Alchemy](https://alchemy.com). Also, get your network's token (Sepolia Eth ) or [Mumbai Matic](https://faucet.polygon.technology/) and, after connecting your Metamask wallet to the right testnet, get some LINK token(faucets.link.com) into your Metamask or other browser wallet.<br><br>

6. Prepare to have the following environment variables available for easy copy-pasting. **We do not recommend** storing your keys/secrets locally on your machine in a human-readable form, so its best to open windows that show your keys. Further down, we will explain how to use the included `env-enc` tool to encrypt them in the `.env.enc` file on your development machine.

**NOTE:** This Record Label example requires a second wallet private key!

> :warning: DO NOT COMMIT YOUR .env FILE! The .gitignore file excludes .env but NOT .env.example

Make sure you have at least the following environment variables ready:

          # For Email functionality
          ARTIST_EMAIL="PRETEND_YOUR_EMAIL_IS_THE_ARTISTS"
          VERIFIED_SENDER="THE_EMAIL_VERIFIED_BY_TWILIO"
          TWILIO_API_KEY="YOUR TWILIO API KEY"

          # Spotify streaming counts
          SOUNDCHART_APP_ID="soundcharts"
          SOUNDCHART_API_KEY="soundcharts"

          # Blockchain node access
          MUMBAI_RPC_URL="https://polygon-mumbai.g.alchemy.com/v2/ExampleKey"
          # OR
          SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/ExampleKey"

          # Wallet keys
          PRIVATE_KEY  # This should be the allowlisted / whitelisted address so that you can use Chainlink Functions while it is in closed beta
          SECOND_PRIVATE_KEY # this is the address we will use to receive the recording artist's payments into!

          # For Off Chain Encrypted Secrets
          GITHUB_API_TOKEN # get from Github

If you want to verify smart contracts using the `--verify` flag, the _ETHERSCAN_API_KEY_ or _POLYGONSCAN_API_KEY_ must be set in your .env file so their values can be read in `Functions-request-config.js`.<br><br>

7. Login to Github and head to your [settings](https://github.com/settings/tokens?type=beta) to generate a "Fine Grained Personal Access Token". Name the token, set its expiration period and then go down to **Permissions** >> "Account permissions" >> "Gists" and from the "Access" dropdown, select "Read and write".

Scroll to the bottom of the page and click "Generate token" and copy the resulting personal access token.

> ⚠️ ⚠️ ⚠️ You cannot view this token in Github after this – so make sure you paste the value <u>temporarily</u> somewhere in case you need to close this window or want to navigate away from this page

<img width="637" alt="Screenshot 2023-05-01 at 10 59 30 am" src="https://user-images.githubusercontent.com/8016129/235385875-5ff0c21c-813d-4554-8934-0f9065cc0a2e.png">

8. Next we encrypt our environment variables and store them in encrypted form. But to do that we need to supply a password to encrypt the secrets and keys with

```bash
npx env-enc set-pw
```

This command npx env-enc set-pw must be run EVERY time you open or restart a terminal session, so that the encrypted secrets in your .env.enc file can be read by the package. After you set the password the first time, you must enter the identical password for the secrets to be successfully decrypted.

9. Set the encrypted values to your secrets <u>one by one</u> using the following command:

```bash
npx env-enc set
```

Doing npx env-enc set will initiate a UI in your terminal for you to put your env var NAME and then its corresponding value as shown here:
<img width="765" alt="Screenshot 2023-05-01 at 11 09 16 am" src="https://user-images.githubusercontent.com/8016129/235386817-dc290db7-56b9-4c5f-8f86-9d881a712f35.png">

10. When you set one or more encrypted environment variables using `env-enc`, the tool creates a `env.enc` file in your project root. It looks like this:
    <img width="659" alt="Screenshot 2023-05-01 at 11 10 58 am" src="https://user-images.githubusercontent.com/8016129/235386889-63a4d536-b0b3-4841-aa2a-411ab81be80f.png">

Remember, this `.env.enc` file can be copied and pasted into other Chainlink Functons projects but you'll need to use the `env-enc` package and you'll need to use the same password with which you encrypted these secrets.

11. When you make an on-chain request these encrypted secrets get uploaded to a private gist on your Github account, and once the Functions request is fulfilled, the gist is automatically deleted by the tool.

## Instructions to run this sample

8. Study the file `./Twilio-Spotify-Functions-Source-Example.js`. Note how it accesses and uses arguments that you pass in, including the `VERIFIED_SENDER` constant. Then study the `RecordLabel` contract in `../../contracts/sample-apps/RecordLabel.sol` which makes the request and receives the results sent by the Functions source code example. The request is initiated via `executeRequest()` and the DON will return the output of your custom code in the `fulfillRequest()` callback. <br><br>

9. Update the `../../hardhat.config.js` in the project's root file to include your private keys for a second wallet account We will pretend this is the artist's wallet address.

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

10. You can test an end-to-end request and fulfillment locally by simulating it using:<br>`npx hardhat functions-simulate-twilio --gaslimit 300000`. This will spin up a local hardhat network and then deploy contracts and mock contracts to it, and run and e2e series of commands. Each of these commands is broken down below<br><br>

**Note:** Steps specific to this use case are contained in `./tasks/Functions-client-twilio-spotify/<STEP #>_<<TASK NAME>>.js`. The rest are contained in other domain-specific folders in `./tasks`.<br><br>

11. Step 1: run the task to deploy the STC contract for payouts. `npx hardhat functions-deploy-stablecoin --network sepolia --verify true` <br><br>

12. Step 2: Deploy the RecordLabel smart contract.
    `npx hardhat functions-deploy-recordlabel --network sepolia --stc-contract <<0x-contract-address>>  --verify true` <br><br>

13. Step 3: Approve the RecordLabel contract to spend the StableCoin deployer's token balance to pay artists
    `npx hardhat functions-approve-spender --network sepolia --client-contract <<0x-contract-address>>   --stc-contract <<0x-contract-address>>` <br><br>

14. Step 4: initialize artist data so the artist has a wallet address we can send payouts to.
    `npx hardhat functions-initialize-artist --network sepolia --client-contract <<0x-contract-address>>`<br><br>

15. Step 5: Create a Subscription and fund it with 3 to 5 LINK (network spikes can cause LINK-ETH exchange rates to fluctuate, so more tokens protects against that weird errors!). Add the RecordLabel client as an authorised consumer
    `npx hardhat functions-sub-create --network sepolia --amount 1.5 --contract <<0x-client-contract-address>>`<br><br>

16. Step 6: Setup your Twilio and Soundchart API keys using Chainlink Off-Chain Secrets by following <a href="https://github.com/smartcontractkit/functions-hardhat-starter-kit#off-chain-secrets" target="_blank">this guidance in the CLI Tool's README.</a> Using off-chain secrets, your secrets are encrypted and then loadable from a URL rather than being passed onto the blockchain. Make sure you've added your secrets to your `.env` file and in your`Functions-request-config.js` file. Then to generate the encrypted secrets JSON file, run the command `npx hardhat functions-build-offchain-secrets --network sepolia` <br><br>

17. Step 7: send the code in `./Twilio-Spotify-Functions-Source-Example.js` to the RecordLabel Contract to initiate Chainlink Functions execution!
    `npx hardhat functions-request --network sepolia --contract <<0x-client-contract-address>> --subid <__<__Subscription Id from previous step__>> --gaslimit 300000`. <br><br>
    The tool will log helpful information on each step. Note that unless you pass the flag `--simulate false` this command automatically invokes the local simulation once before commencing on-chain transactions. This means the email API will be hit once, as part of the simulation!<br><br>

    At the end of it, you can your second wallet address that corresponds to your `process.env.SECOND_PRIVATE_KEY` and open it in the network's block explorer. You should see STC tokens showing up, proving that your second address was paid out (because we pretended your second wallet address is the artist's, remember?). Or you can import the STC token into Metamask, using the STC contract address we just deployed, and the payment amount will show up there!

<img width="540" alt="Messenger" src="https://user-images.githubusercontent.com/8016129/224178593-e0dcf724-0d38-402c-8d28-84ab9f85dca1.png"> <span /><span />

**Note**: Ensure your wallet has a sufficient LINK balance before running this command.

17. Check out the [CLI Tool's](#functions-cli-tool) README for a full list of commands. For example, ,you can read/retrieve of the last result computed and stored on-chain in the RecordLabel smart contract by running :<br>`npx hardhat functions-read --contract 0xDeployed_client_contract_address_here`<br>

## Functions CLI Tool

This sample uses the Chainlink Functions tooling forked from [this repo](https://github.com/smartcontractkit/functions-hardhat-starter-kit).

To get a full list of powerful and flexible commands available using the Chainlink Functions CLI tool, please visit the [ repo's command glossary](https://github.com/smartcontractkit/functions-hardhat-starter-kit#command-glossary).
