const slackUrl = "YOUR_WEBHOOK_URL" //edit here
const TARGET_FOLDER_ID = "YOUR_TARGET_FOLDER" //edit here
const TARGET_FILES = ["YOUR", "TARGET", "FILE", "NAMES"] //edit here

class SlackPayload {
  channel: string
  username: string
  text: string
}

function createPayload(text: string) {
  const payload: SlackPayload = {
    "channel": "YOUR_CHANNEL", //edit here
    "username": "YOUR_NAME", //edit here
    "text": text
  }
  return payload
}

function postSlack(payload: SlackPayload) {
  const payloadStr = JSON.stringify(payload)
  const escapedStr = payloadStr.replace(/":"/g, "\"\:\"")
  const options = {
    'method': 'post',
    'contentType': 'Content-type: application/json charset=utf-8',
    'payload': escapedStr
  }

  const response = UrlFetchApp.fetch(slackUrl, options) || false
  const ret = (response && response.getResponseCode() == 200)
  return { status: ret, code: response.getResponseCode(), response: response }
}

function main() {
  updateCheck(DriveApp.getFolderById(TARGET_FOLDER_ID))
}

function updateCheck(target: GoogleAppsScript.Drive.Folder) {
  const files = target.getFiles()
  while (files.hasNext()) {
    const file = files.next()
    const lastUpdate = file.getLastUpdated()
    for (var i = 0, length = TARGET_FILES.length; i < length; i++) {
      const fileName = TARGET_FILES[i]
      if (fileName != file.getName()) {
        continue
      }
      const cachedLastUpdate = CacheService.getScriptCache().get(fileName)
      if (cachedLastUpdate == null) {
        CacheService.getScriptCache().put(fileName, lastUpdate.toString())
        continue
      } else if (new Date(cachedLastUpdate) < new Date(lastUpdate)) {
        CacheService.getScriptCache().put(fileName, lastUpdate.toString())
      } else {
        continue
      }
      const updateText = fileName + "was updated."
      //変更者の名前が欲しい場合、gsファイルでここを有効にしてください
      // var updateText = Drive.Files.get(file.getId())
      //   .lastModifyingUser.displayName + "が" + fileName + "を更新しました"
      postSlack(createPayload(updateText))
    }
  }
  var folders = target.getFolders()
  while (folders.hasNext()) {
    updateCheck(folders.next())
  }
}
