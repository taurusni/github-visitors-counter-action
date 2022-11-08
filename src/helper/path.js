import * as core from '@actions/core'
import * as fs from 'fs-extra'
import * as vars from './vars'

export async function createDirectories(repositoryIdentifier) {
  const repoPath = await getRepoPath(repositoryIdentifier)
  const cacheFolderPath = await getCacheFolderPath(repositoryIdentifier)
  const svgFolderPath = await getSVGFolderPath(repositoryIdentifier)
  const chartFolderPath = await getChartFolderPath(repositoryIdentifier)
  await createFolder(repoPath)
  await createFolder(cacheFolderPath)
  await createFolder(svgFolderPath)
  await createFolder(chartFolderPath)
}

export async function getCacheFilePath(repositoryIdentifier, fileName) {
  const cachePath = await getCacheFolderPath(repositoryIdentifier)
  return `${cachePath}/${fileName}`
}

export async function getChartFilePath(repositoryIdentifier, fileName) {
  const chartPath = await getChartFolderPath(repositoryIdentifier)
  return `${chartPath}/${fileName}`
}

async function getChartFolderPath(repositoryIdentifier) {
  const repoPath = await getRepoPath(repositoryIdentifier)
  return `${repoPath}/${vars.CHART_PARENT}`
}

export async function getSVGFilePath(repositoryIdentifier, fileName) {
  const svgPath = await getSVGFolderPath(repositoryIdentifier)
  return `${svgPath}/${fileName}`
}

async function getRepoPath(repositoryIdentifier) {
  return `${vars.REPO_PARENT}/${repositoryIdentifier}`
}

export async function getCacheFolderPath(repositoryIdentifier) {
  const repoPath = await getRepoPath(repositoryIdentifier)
  return `${repoPath}/${vars.CACHE_PARENT}`
}

async function getSVGFolderPath(repositoryIdentifier) {
  const repoPath = await getRepoPath(repositoryIdentifier)
  return `${repoPath}/${vars.SVG_PARENT}`
}

async function createFolder(folderPath) {
  try {
    const options = {
      mode: 0o2775
    }
    const exists = await fs.pathExists(folderPath)
    if (!exists) {
      await fs.ensureDir(folderPath, options)
      core.info(`${folderPath} is created`)
    }
  } catch (error) {
    core.setFailed(error)
  }
}
