// This example shows how to make a fetch Artist monthly listener counts and trigger an email if
// the artist is due a payment for every additional 1000 streams.

// Arguments can be provided when a request is initated on-chain and used in the request source code as shown below
const artistId = args[0]
const artistName = args[1]
const lastListenerCount = parseInt(args[2])
const artistEmail = args[3]
const VERIFIED_SENDER = args[4]

// Ref: https://doc.api.soundcharts.com/api/v2/doc/reference/path/artist/get-latest-spotify-monthly-listeners
const URL = `https://sandbox.api.soundcharts.com/api/v2/artist/${artistId}/streaming/spotify/listeners`

// Get Listener Count Data.
if (!artistId) {
  throw new Error("No artistId provided.")
}
if (isNaN(lastListenerCount)) {
  throw new Error(`Listener Count is NaN: ${lastListenerCount}`)
}

const latestListenerCount = await getLatestMonthlyListenerCount()
const diffListenerCount = latestListenerCount - lastListenerCount

if (latestListenerCount > lastListenerCount) {
  const amountDue = diffListenerCount / 10_000 // Artist gets 1 STC per 10_000 additional streams.
  console.log(
    `\nArist is due payments of ${amountDue} STC for an additional ${diffListenerCount.toLocaleString()} listeners...`
  )

  // await sendEmail(latestListenerCount, amountDue) TODO: un-comment when twilio functionality is ready.
} else {
  console.log("\nArtist is not due additional payments...")
}

// The source code MUST return a Buffer or the request will return an error message
// Use one of the following functions to convert to a Buffer representing the response bytes that are returned to the client smart contract:
// - Functions.encodeUint256
// - Functions.encodeInt256
// - Functions.encodeString
// Or return a custom Buffer for a custom byte encoding

return Buffer.concat([Functions.encodeInt256(latestListenerCount), Functions.encodeInt256(diffListenerCount)])

// ====================
// Helper Functions
// ====================

async function getLatestMonthlyListenerCount() {
  console.log("\nFetching artist data from API...")
  /* To make an HTTP request, use the Functions.makeHttpRequest function
      Functions.makeHttpRequest function parameters:
      - url
      - method (optional, defaults to 'GET')
      - headers: headers supplied as an object (optional)
      - params: URL query parameters supplied as an object (optional)
      - data: request body supplied as an object (optional)
      - timeout: maximum request duration in ms (optional, defaults to 10000ms)
      - responseType: expected response type (optional, defaults to 'json') 
      */
  const soundchartsResponse = await Functions.makeHttpRequest({
    url: URL,
    // Get a free sandbox API key from https://doc.api.soundcharts.com/api/v2/doc
    headers: { "x-app-id": secrets.soundchartAppId, "x-api-key": secrets.soundchartApiKey },
  })

  // Handle API error.
  if (soundchartsResponse.error) {
    const returnedErr = soundchartsResponse.response.data
    let apiErr = new Error(`API returned one or more errors: ${JSON.stringify(returnedErr)}`)
    apiErr.returnedErr = returnedErr
    throw apiErr
  }

  newListenerCount = soundchartsResponse.data.items[0].value
  console.log(
    `\nNew Listener Count: ${newListenerCount.toLocaleString()}. Last Listener Count: ${lastListenerCount.toLocaleString()}. Diff: ${(
      newListenerCount - lastListenerCount
    ).toLocaleString()}.`
  )

  return newListenerCount
}

// Use Twilio Sendgrid API to send emails.
// Docs : https://sendgrid.com/solutions/email-api
//  API Reference: https://docs.sendgrid.com/api-reference/mail-send/mail-send
async function sendEmail(latestListenerCount, amountDue) {
  if (!secrets.twilioApiKey) {
    return
  }

  const sendgridURL = "https://api.sendgrid.com/v3/mail/send"
  // Use the verified sender email address

  // TODO implement email send functionality.

  console.log("\nSent email...")
}