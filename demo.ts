import { SubscriptionManager } from "./SubscriptionManager"
import { ethers, Wallet } from "ethers"

const RPC_URL = process.env.MUMBAI_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const ORACLE_ADDRESS = "0xeA6721aC65BCeD841B8ec3fc5fEdeA6141a0aDE4"
const BILLING_REGISTRY_ADDRESS = "0xEe9Bf52E5Ea228404bB54BCFbbDa8c21131b9039"
const LINK_TOKEN_ADDRESS = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB"

if (!RPC_URL || !PRIVATE_KEY) {
  throw Error("Missing RPC_URL or PRIVATE_KEY")
}

const provider = new ethers.providers.JsonRpcProvider(RPC_URL)
const wallet = new Wallet(PRIVATE_KEY!, provider)

const demo = async (consumerAddress: string) => {
  // Step 1: Create a subscription Manager //TODO
  const subMgr = new SubscriptionManager(wallet, ORACLE_ADDRESS, BILLING_REGISTRY_ADDRESS, LINK_TOKEN_ADDRESS)

  // Step 2: Create a Subscription
  const subId = await subMgr.createSubscription()
  console.log(`Created subscription with ID ${subId}`)

  // Step 3: Fund the subscription
  await subMgr.fundSubscription({
    linkAmount: 1.5,
    subId,
  })

  let [balanceBigInt, owner, consumers] = await subMgr.getSubscription(subId)
  console.log(`Subscription ${subId} has a balance of  ${ethers.utils.formatEther(balanceBigInt.toString())} LINK`)

  // Step 4: Add a consumer contract
  await subMgr.addConsumer({
    subId,
    consumerAddress,
  })

  console.log(`Consumer contract at ${consumerAddress} added to subscription ${subId}`)
}

demo("0xF7cD2361A6637815Bc0FC107796a4cF975887282").catch((err: Error) => {
  throw Error(` Something went wrong:\n${err}`)
})
