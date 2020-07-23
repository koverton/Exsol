/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

import { connectSolace, disconnectSolace, subscribeSolace, getText } from "./solhelpers";
import { getTypes, getKey, getSchema, assembleRow } from "./schemas";
import * as solace from './solclient';
import { deserialize } from "./serializer";
import { getRow, setRowKey } from "./rowkeymap";

 /**
  **
  ** global document, CustomFunctions, Office, 
  **/

Office.initialize = () => {

  // Connect handlers
  document.getElementById("sideload-msg").style.display = "none";
  document.getElementById("app-body").style.display = "flex";
  // Solace handlers
  document.getElementById("btnConnectSolace").onclick = btnConnectSolace;
  document.getElementById("btnDisconnectSolace").onclick = btnDisconnectSolace;
  document.getElementById("btnSubscribeSolace").onclick = btnSubscribeSolace;
  // init
  populateSchemas();
};

function LOG(msg: string): void {
  (document.getElementById("LOG") as HTMLTextAreaElement).value += msg + "\n";
}

function populateSchemas() {
  var selectBox = document.getElementById("mnuSchemas") as HTMLSelectElement;
  for(let schema of getTypes()) {
    let newOption = new Option(schema, schema);
    selectBox.add(newOption, undefined);
    }
}
function getSelectedSchema(): string {
  var selectBox = document.getElementById("mnuSchemas") as HTMLSelectElement;
  return selectBox.selectedOptions.item(0).value;
}

async function initTable() {
  await Excel.run(async ctx => {
    var wkst = ctx.workbook.worksheets.getActiveWorksheet();
    var tbl  = wkst.tables.add("A1:G1", true /*hasHeaders*/);
    tbl.name = "MsgTbl";
    const schema = getSchema( getSelectedSchema() );
    tbl.getHeaderRowRange().values = [schema];

      await ctx.sync();
  })
  .catch(function(error) {
    console.log('Error: ' + error);
    if (error instanceof OfficeExtension.Error) {
        console.log('Debug info: ' + JSON.stringify(error.debugInfo));
    }
  });
}

async function updateTable(tick, tktype) {
  const key = tick[getKey(tktype)];
  const row = getRow(key);

  Excel.run(async ctx => {
    var wkst = ctx.workbook.worksheets.getActiveWorksheet();
    var tbl = wkst.tables.getItem("MsgTbl");
    if (row == null) {
      // Insert a new row
      tbl.rows.add( null, [assembleRow(tktype, tick)] );
      // load-sync dance required to make tbl.rows.count proxy load latest
      tbl.rows.load();
      await ctx.sync();
      setRowKey(key, tbl.rows.count);
    }
    else {
      // update existing row
      tbl.getRange().getRow(row).values = [assembleRow(tktype, tick)];
    }
    await ctx.sync();
  })
  .catch(function (error) {
    LOG('ERROR: ' + JSON.stringify(error));
    console.log('Error: ' + error);
    if (error instanceof OfficeExtension.Error) {
      console.log('Debug info: ' + JSON.stringify(error.debugInfo));
    }
  });
}

/**
 ** SOLACE CONNECTIVITY WIREUP
 ** The actual Solace connection code is in separate solace-helpers.ts
 **
 */
function btnConnectSolace() {
  try {
    const host = (document.getElementById("txtSolhost") as HTMLInputElement).value;
    const vpn  = (document.getElementById("txtSolvpn")  as HTMLInputElement).value;
    const user = (document.getElementById("txtSoluser") as HTMLInputElement).value;
    const pass = (document.getElementById("txtSolpass") as HTMLInputElement).value;
    connectSolace(
      { "host": host, "vpn": vpn, "user": user, "pass":pass }, 
      onMessage, onSessionEvt );
  }
  catch(error) {
    console.log('Error: ' + error);
    if (error instanceof OfficeExtension.Error) {
        console.log('Debug info: ' + JSON.stringify(error.debugInfo));
    }
  }
  initTable();
}

function btnDisconnectSolace() {
  disconnectSolace();
  showDisconnected();
}

function btnSubscribeSolace() {
  const topic = (document.getElementById("txtSoltopic") as HTMLInputElement).value;
  var selectBox = document.getElementById("mnuSubscriptions") as HTMLSelectElement;
  let newOption = new Option(topic, topic);
  selectBox.add(newOption, undefined);
  subscribeSolace( topic );
}

// INTERNAL SOLACE MESSAGE EVENT CALLBACK


var count = 1;
async function onMessage(session, msg) {
  const json = getText(msg);
  const tick = deserialize(json);
  const tktype = getSelectedSchema();
  // Update table
  updateTable( tick, tktype );
}

// STATIC SESSION EVENT CALLBACK
function onSessionEvt(session, evt) {
  if ( evt.sessionEventCode == solace.SessionEventCode.UP_NOTICE ) {
    showConnected();
  }
  else if ( evt.sessionEventCode == solace.SessionEventCode.DOWN_NOTICE ) {
    showDisconnected();
  }
}

function showConnected() {
  (document.getElementById('connstate') as HTMLImageElement).src = '../../assets/connected.png';
  (document.getElementById('connstate') as HTMLImageElement).title = 'Connected';
}

function showDisconnected() {
  (document.getElementById('connstate') as HTMLImageElement).src = '../../assets/disconnected.png';
  (document.getElementById('connstate') as HTMLImageElement).title = 'Disconnected';
}
