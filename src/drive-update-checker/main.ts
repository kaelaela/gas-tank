const slackUrl = "YOUR_WEBHOOK_URL" //edit here
const TARGET_FOLDER_ID = "YOUR_TARGET_FOLDER" //edit here
const TARGET_FILE_NAME = "YOUR_FILE_NAME" //edit here

class SlackPayload {
  channel: string
  username: string
  text: string
}

function createPayload(text: string) {
  let payload: SlackPayload = {
    "channel": "YOUR_CHANNEL", //edit here
    "username": "YOUR_NAME", //edit here
    "text": text,
  };
  return payload;
}

function postSlack(payload: SlackPayload) {
  var payloadStr = JSON.stringify(payload);
  var escapedStr = payloadStr.replace(/":"/g, "\"\:\"");
  var options = {
    'method': 'post',
    'contentType': 'Content-type: application/json; charset=utf-8',
    'payload': escapedStr,
    'icon_emoji': ':monkey_face:'
  }

  var response = UrlFetchApp.fetch(slackUrl, options) || false;
  var ret = true;
  if (!response || response.getResponseCode() != 200) {
    ret = false;
  }
  return {status: ret, code: response.getResponseCode(), response: response};
}

function updateCheck() {
  var file = DriveApp.getFilesByName(TARGET_FILE_NAME).next()
  var lastUpdate: Date = file.getLastUpdated()
  Logger.log("lastUpdate:"+ lastUpdate)
  var cachedLastUpdate = CacheService.getScriptCache().get(TARGET_FILE_NAME)
  Logger.log("cachedLastUpdate:"+ cachedLastUpdate)
  if (cachedLastUpdate == null) {
    CacheService.getScriptCache().put(TARGET_FILE_NAME, lastUpdate.toString())
    Logger.log("saved")
    return
  } else if (new Date(cachedLastUpdate) < new Date(lastUpdate)) {
    CacheService.getScriptCache().put(TARGET_FILE_NAME,lastUpdate.toString())
    Logger.log("saved:"+ lastUpdate)
  } else {
    return
  }

  var updateText = "ファイルが更新されました" //edit here
  postSlack(createPayload(updateText))
}
