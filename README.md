# Solace Excel Add-In Example

**DEVELOPMENT ONLY** this is an experimental project that is not complete. It began as a clone of the [Shared Runtime example from the Office team's github](https://github.com/OfficeDev/PnP-OfficeAddins/tree/master/Samples/excel-shared-runtime-global-state).

It provides the basic capability to:

- Connect to Solace;
- Subscribe to topics;
- Consume messages from those topics with the following assumptions:
  - Messages are in JSON format;
  - All subscribed messages are in the same format
  - Supported schemas are in the src/schemas.ts file
- Display those messages in the worksheet as a Data Table where messages with the same key update the same row.

## Side-loading the project

As a developer, you can test the project via 'side-loading'. On a mac, these are the steps I do:

``` shell
cd Exsol
npm install
npm run dev-server # in a separate shell
npm start # to start excel with the plugin
```

From this point, you can typically modify the code, re-run `npm start`, test your Excel behavior in the spawned worksheet, then close the document.

Once excel is running, you should see the 'Connect to Solace' button on the HOME tab.

Clicking 'Connect to Solace' brings up the Solace taskpane.

- Click 'Connect' to establish a connection; upon a connection UP notification, the link icon should change to a green 'Connected' icon.
- After connection is established, type the desired topic, select the expected message type and click 'Subscribe'.
- Messages are loaded into the data table with one new row per new rowkey.
- The keys are established by the schema type expected.

## Sending Sample Messages

There's also a simple ticking price generator available in `tickgen/tickgen.js`. It requires the `solclientjs` npm module so follow the installation instructions:

```shell
cd tickgen
npm install
# edit tickgen.js variables to reflect local environment
node tickgen.js # send a randomized tick per second on a limited set of symbols.
```

## Message Content

The challenge with integrating messaging with UIs always revolves around data format. Excel needs to know the data structure upfront. It has to be a structure that fits tabular displays nicely. We need a way to serialize and deserialize. And we need to know how to `Key` the objects so that we can tell whether a newly received message is a new item, or replaces an old item.

### Serialization

The initial implementation can only handle messages sent as JSON strings. The serialization is in `src/taskpane/serializer.ts`. This can either be replace with custom serialization code or modified to support multiple serialization formats. There are two obvious functions:

- `deserialize(payload: string): object` takes a string in JSON format and deserializes it into an ECMAScript object. For excel, these objects are expected to be flat key-value pairs.
- `serialize(obj: object): string` not currently used as we have no publishing capability. Reverses the direction of serialization by taking an ECMAScript object and serializes it into a JSON string. 

### Schemas and Message Keys

For now, all this is handled in the `src/taskpane/schemas.ts` file.

- `getTypes()` returns an array of supported message type names (e.g. `[price, order, trade]`).
- `getSchema()` return an array of fieldnames for a given message type.
- `getKey()` returns the key fieldname for a given message type.

## Debugging

Managing the cached state can be a challenge with these projects. I find adding a new code file, or running several edit-test cycles in a row requires clearing out state. To do that I would:
- Quit the `npm run dev-server` process.
- Quit Excel.
- Run the `scripts/CLEARDEVSTATE.sh` script.
- Refresh npm environment by running `npm install`.

Then go back to starting a `dev-server` and running edit-test cycles.

I don't know any way to access the console.log or any local logfiles, but you can enable a Safari Inspector on the Taskpane window by running the contents of `scripts/enable_debugging.sh` and right-clicking in the taskpane.

## Next Steps: packaging and deployment

Need to figure out a proper way to package up and deploy the plugin without side-loading, and without having to deploy via a distribution server
