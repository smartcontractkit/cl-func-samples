const hre = require("hardhat");

async function main(){
    const network = "sepolia"
    const verify = true

    console.log("1. deploying stablecoin to", network)
    await hre.run("functions-deploy-stablecoin", {
        network: "sepolia",
        verify
    })
}

main()