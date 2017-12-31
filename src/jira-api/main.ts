//document: https://docs.atlassian.com/software/jira/docs/api/REST/1000.1609.0/#api/2/

const JIRA_BASE_URL = "YOUR_PROJECT_URL/rest/api/2/"
const SEARCH_URL = JIRA_BASE_URL + "search"
const ISSUE_URL = JIRA_BASE_URL + "issue"
const PROJECT_URL = JIRA_BASE_URL + "project"

const USER_NAME = "USER_NAME"
const PASSWORD = "PASSWORD"
const ENCODED_AUTH_PASS = Utilities.base64Encode(USER_NAME + ":" + PASSWORD)
const PARAMS = {
  contentType: "application/json",
  headers: { "Authorization": "Basic " + ENCODED_AUTH_PASS },
  muteHttpExceptions: true
}

function loadEpic(projectId: string) {
  const jql = "?jql=project = " + projectId + " AND issuetype = Epic&fields=customfield_10005"
  const requestURL = SEARCH_URL + jql
  let response = UrlFetchApp.fetch(requestURL, PARAMS);
  let data = JSON.parse(response.getContentText());
  var epics = []
  for (let issue of data["issues"]) {
    var key = issue.key
    var epicName = issue.fields.customfield_10005
    var epic = key + "," + epicName
    epics.push(epic)
  }
  var epicsStr = ""
  for (let epic of epics) {
    epicsStr = epicsStr + epic + "\n"
  }
  Logger.log(epicsStr)
}

function loadSingleIssue(key: string) {
  var epics = []
  let requestURL = ISSUE_URL + key // "projectName-issueNum" e.g. ANDROID-1
  let issueRes = UrlFetchApp.fetch(requestURL, PARAMS);
  Logger.log(issueRes.getContentText())
}

function searchIssueByVersion(projectId: string, version: string) {
  let requestURL = SEARCH_URL + "?jql=project = " + projectId + " AND fixVersion = " + version
    + "&fields=fixVersions,summary,description,customfield_10003,assignee,status";
  let response = UrlFetchApp.fetch(requestURL, PARAMS);
  var data = JSON.parse(response.getContentText());
  var contents = []
  for (var issue of data["issues"]) {
    let issueKey = issue.key
    let summary = issue.fields.summary;
    var assignee = "no assign"
    if (issue.fields.assignee) {
      assignee = issue.fields.assignee.name
    }
    var epicKey = "no epic"
    if (issue.fields.customfield_10003) {
      epicKey = issue.fields.customfield_10003
    }
    let issues = "【" + issueKey + "】" + summary
    let content = [version, issues, assignee, epicKey]
    contents.push(content)
    Logger.log(content)
  }
}

function loadReleaseVersions(projectId: string) {
  let requestURL = PROJECT_URL + "/" + projectId + "/version?orderBy=-sequence";
  let response = UrlFetchApp.fetch(requestURL, PARAMS);
  var data = JSON.parse(response.getContentText());
  for (let version of data["values"]) {
    var versionName = version.name
    Logger.log(versionName)
  }
}
