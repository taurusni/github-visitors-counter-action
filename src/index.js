import * as core from '@actions/core'
import * as github from './helper/github'
import * as utils from './helper/utils'
import * as cache from './helper/cache'
import * as path from './helper/path'
import * as readme from './helper/readme'

async function run() {
  try {
    const token = core.getInput('repo-token')
    const excludedRepos = core.getMultilineInput('excluded-list')

    const repoResponse = await github.requestReposities(token)
    const { status, response } = repoResponse.getModel()
    if (status) {
      core.info('The metadata of all public repositories is fetched.')
    } else {
      core.setFailed(response)
    }

    const repos = await utils.prepareRepositories(response, excludedRepos)
    await utils.printRepos(repos)
    for (const repo of repos) {
      const repositoryName = repo.getName()
      const repositoryIdentifier = repo.getIdentifier()
      const responseViews = await github.requestViews(token, repositoryName)
      const { status, response } = responseViews.getModel()
      if (status) {
        core.info(`Traffic data of ${repositoryName} is fetched`)
        await path.createDirectories(repositoryIdentifier)
        await cache.syncJsonFiles(response, repositoryIdentifier)
      } else {
        core.info(`Failed to fetch traffic data of ${repositoryName}`)
      }
    }
    await readme.updateReadMe(repos)
    await github.gitOperations()
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
