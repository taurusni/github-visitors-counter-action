import * as core from '@actions/core'
import RepositoryModel from '../model/github/RespositoryModel'
import ViewModel from '../model/cache/ViewModel'

export async function prepareRepositories(response, excludedRepos) {
  let repos = []
  repos = response.filter(repo => {
    return !excludedRepos.includes(repo.name)
  })
  return repos.map(repo => {
    const { id, name, html_url } = repo
    return new RepositoryModel(id, name, html_url)
  })
}

export async function transferViewModel(views) {
  return views.map(view => {
    const { count, uniques, timestamp } = view
    return new ViewModel(count, uniques, timestamp)
  })
}

export async function accumulateCount(viewModels) {
  return viewModels.reduce((acc, model) => {
    return acc + model.getCount()
  }, 0)
}

export async function accumulateUniques(viewModels) {
  return viewModels.reduce((acc, model) => {
    return acc + model.getUniques()
  }, 0)
}

export async function printRepos(repos) {
  const repoNames = repos.map(repo => { return repo.getName() })
  if (repoNames.length === 0) {
    core.info('No repository will be considered!!!')
  } else if (repoNames.length === 1) {
    core.info('1 repository will be considered:')
    core.info(repoNames)
  } else {
    core.info(`${repoNames.length} repositories will be considered:`)
    core.info(repoNames)
  }
}
