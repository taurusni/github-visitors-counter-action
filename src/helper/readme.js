import { info, debug } from '@actions/core'
import { context } from '@actions/github'
import * as vars from './vars'
import { getCacheFilePath } from './path'
import { readCachedSummaryJson, saveOther } from './cache'
import { getBranch } from './github'
import RepositoryModel from '../model/github/RespositoryModel'

export async function updateReadMe(repos) {
  debug(`Length of the initial repos: ${repos.length}`)
  if (repos.length === 0) {
    info('No repository needs to be added in the Readme for the time being')
    return
  }

  let repoSummaries = await Promise.all(repos.map(async(repo) => {
    return await prepareRepoSummary(repo)
  }))
  debug(`Length of the repo summaries: ${repoSummaries.length}`)
  debug(`Repo summaries: ${JSON.stringify(repoSummaries.map(summary => summary.getModel()))}`)
  repoSummaries = repoSummaries
    .filter(repo => repo.getSummaryModel().getUniques() > 0)
    .sort((left, right) => right.getSummaryModel().getUniques() - left.getSummaryModel().getUniques())
  if (repoSummaries.length === 0) {
    info('No repository needs to be added in the Readme for the time being')
    return
  }
  const firstRepoSummary = repoSummaries[0]
  const branch = await getBranch()
  let markdown = `## Summary of public repositories :bowtie:\n`
  const badgeExampleLink = `https://github.com/${context.repo.owner}/${context.repo.repo}/blob/${branch}/${vars.REPO_PARENT}/${firstRepoSummary.getIdentifier()}/${vars.SVG_PARENT}/${vars.UNIQUE_SVG_FILENAME}`
  const badgeExample = `[![Image of ${firstRepoSummary.getUrl()}](${badgeExampleLink})](${firstRepoSummary.getUrl()})`
  markdown = markdown + `Example badge for ${firstRepoSummary.getName()} repository\n\n`
  markdown = markdown + `${badgeExample} :clap:\n\n`
  markdown = markdown + `\`\`\`\n`
  markdown = markdown + `${badgeExample}\n`
  markdown = markdown + `\`\`\`\n`
  const table = await createTable(repoSummaries)
  markdown = markdown + table

  await saveOther(vars.README, markdown)
}

async function createTable(repos) {
  let table = `<table>\n`
  table = table + `\t<tr>\n`
  table = table + `\t\t<th>\n`
  table = table + `\t\t\tRepository\n`
  table = table + `\t\t</th>\n`
  table = table + `\t\t<th>\n`
  table = table + `\t\t\tLast Updated\n`
  table = table + `\t\t</th>\n`
  table = table + `\t\t<th>\n`
  table = table + `\t\t\tUnique\n`
  table = table + `\t\t</th>\n`
  table = table + `\t\t<th>\n`
  table = table + `\t\t\tCount\n`
  table = table + `\t\t</th>\n`
  table = table + `\t</tr>\n`
  for (const repo of repos) {
    table = table + `\t<tr>\n`
    table = table + `\t\t<td>\n`
    table = table + `\t\t\t<a href="${repo.getUrl()}">\n`
    table = table + `\t\t\t\t${repo.getName()}\n`
    table = table + `\t\t\t</a>\n`
    table = table + `\t\t</td>\n`
    table = table + `\t\t<td>\n`
    table = table + `\t\t\t${repo.getSummaryModel().getTimestamp()}\n`
    table = table + `\t\t</td>\n`
    table = table + `\t\t<td>\n`
    table = table + `\t\t\t${repo.getSummaryModel().getUniques()}\n`
    table = table + `\t\t</td>\n`
    table = table + `\t\t<td>\n`
    table = table + `\t\t\t${repo.getSummaryModel().getCount()}\n`
    table = table + `\t\t</td>\n`
    table = table + `\t</tr>\n`
  }
  table = table + `</table>\n\n`

  return table
}

async function prepareRepoSummary(repo) {
  const repoUrl = repo.getUrl()
  const repoName = repo.getName()
  const repoId = repo.getId()
  const summaryFilePath = await getCacheFilePath(repo.getIdentifier(), vars.SUMMARY_FILENAME)
  const summaryModel = await readCachedSummaryJson(summaryFilePath)
  debug(`summaryModel: ${JSON.stringify(summaryModel.getModel())}`)
  return new RepositoryModel(repoId, repoName, repoUrl, summaryModel)
}
