import { info, setFailed } from '@actions/core'
import { getOctokit, context } from '@actions/github'
import { exec } from '@actions/exec'
import { COMMITUSER, COMMITEMAIL } from './vars'
import ResponseModel from '../model/github/ResponseModel'

async function request(token, url, urlParams) {
  const octokit = getOctokit(token)

  return await octokit.request(url, urlParams)
    .then(response => {
      return new ResponseModel(true, response.data)
    })
    .catch(error => {
      if (error.status === 401) {
        return new ResponseModel(false, `Error ${error.status}. Token is invalid`)
      } else {
        return new ResponseModel(false, `Error ${error.status}. ${error.name}`)
      }
    })
}

export async function requestReposities(token) {
  const url = 'GET /users/{owner}/repos'
  return await request(token, url, { owner: context.repo.owner })
}

export async function requestViews(token, repo) {
  const url = 'GET /repos/{owner}/{repo}/traffic/views'
  return await request(token, url, { owner: context.repo.owner, repo: repo })
}

export async function gitOperations() {
  let output = ''
  const options = {
    silent: true
  }
  const outputOptions = {
    listeners: {
      stdout: (data) => {
        output = data.toString().replace(/[\r\n]/g, '')
      }
    },
    silent: true,
    ignoreReturnCode: true
  }
  try {
    const mainBranch = await getBranch()
    await exec('git', ['remote'], outputOptions)
    const remote = output
    output = ''
    await exec('git', ['add', '.'], options)
    await exec('git', ['diff', mainBranch, '--name-status'], outputOptions)
    const diff = output
    output = ''
    info(`diff: ${diff}`)
    if (diff.length === 0) {
      info('The content of files is not changed. No new commit will be created.')
    } else {
      await exec('git', ['config', 'user.name', `${COMMITUSER}`], options)
      await exec('git', ['config', 'user.email', `${COMMITEMAIL}`], options)
      await exec('git', ['commit', '-m', `Update views at ${new Date().toLocaleString()}`], options)
      await exec('git', ['push', remote, mainBranch], options)
      info(`New commit is created for branch [${mainBranch}]`)
    }
  } catch (error) {
    setFailed(error)
  }
}

export async function getBranch() {
  try {
    let output = ''
    const outputOptions = {
      listeners: {
        stdout: (data) => {
          output = data.toString().replace(/[\r\n]/g, '')
        }
      },
      silent: true,
      ignoreReturnCode: true
    }
    await exec('git', ['branch', '--show-current'], outputOptions)
    return output
  } catch (error) {
    setFailed(error)
  }
}
