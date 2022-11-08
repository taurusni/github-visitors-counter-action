import * as core from '@actions/core'
import * as fs from 'fs-extra'
import * as vars from './vars'
import * as path from './path'
import * as utils from './utils'
import * as svg from './svg'
import SummaryModel from '../model/cache/SummaryModel'

export async function syncJsonFiles(response, repositoryIdentifier) {
  const views = response.views
  const currentYearFilePath = await path.getCacheFilePath(repositoryIdentifier, `${vars.CURRENT_YEAR}.json`)
  const lastYearFilePath = await path.getCacheFilePath(repositoryIdentifier, `${vars.LAST_YEAR}.json`)
  const summaryFilePath = await path.getCacheFilePath(repositoryIdentifier, vars.SUMMARY_FILENAME)
  const viewsInLastYear = await utils.transferViewModel(views.filter(view => new Date(view.timestamp).getFullYear() < vars.CURRENT_YEAR))
  const viewsInCurrentYear = await utils.transferViewModel(views.slice(viewsInLastYear.length))

  let accSummaryModel = await syncCachaedRecordJson(currentYearFilePath, viewsInCurrentYear)
  if (viewsInLastYear.length !== 0) {
    // Note: only last 14 days data can be fetched - https://docs.github.com/en/rest/metrics/traffic#about-the-repository-traffic-api
    const lastYearSummaryModel = await syncCachaedRecordJson(lastYearFilePath, viewsInLastYear)
    accSummaryModel = await addSummaryModel(accSummaryModel, lastYearSummaryModel)
  }
  const isUpdated = await syncCachedSummaryJson(summaryFilePath, accSummaryModel)
  if (isUpdated) {
    await svg.updateSVGBadge(repositoryIdentifier)
  }
}

async function saveJson(filePath, jsonObject) {
  try {
    await fs.outputJson(filePath, jsonObject)
  } catch (error) {
    core.setFailed(error)
  }
}

export async function saveOther(fileName, object) {
  try {
    await fs.outputFile(fileName, object)
    core.info(`${fileName} has been updated.`)
  } catch (error) {
    core.setFailed(error)
  }
}

// #region record operations
export async function readCachaedRecordJson(recordFilePath) {
  try {
    const exists = await fs.pathExists(recordFilePath)
    if (exists) {
      const records = await fs.readJson(recordFilePath)
      return await utils.transferViewModel(records)
    }
    return []
  } catch (error) {
    core.setFailed(error)
  }
}

async function syncCachaedRecordJson(filePath, newData) {
  const newTotalCount = await utils.accumulateCount(newData)
  const newTotalUniques = await utils.accumulateUniques(newData)

  if (newTotalUniques === 0) {
    core.info(`Traffic data is not available with totalCount: ${newTotalCount} and totalUniques: ${newTotalUniques}`)
    return new SummaryModel(newTotalCount, newTotalUniques)
  }

  let records = await readCachaedRecordJson(filePath)
  core.debug(`Initial records: ${JSON.stringify(records.map(record => { return record.getModel() }))}`)
  if (records.length === 0) {
    await saveJson(filePath, newData.map(data => { return data.getModel() }))
    core.info(`${filePath} is created`)
    return new SummaryModel(newTotalCount, newTotalUniques)
  } else {
    const minDate = newData[0].getTimestamp()
    core.debug(`minDate: ${minDate}`)
    const matchedRecords = records.filter(record => record.getTimestamp() >= minDate)
    core.debug(`matched: ${JSON.stringify(matchedRecords.map(record => { return record.getModel() }))}`)
    records.length = records.length - matchedRecords.length
    const updatedRecords = await getUpdatedRecords(matchedRecords, newData)
    core.debug(`updated: ${JSON.stringify(updatedRecords.map(record => { return record.getModel() }))}`)
    records = records.concat(updatedRecords)
    core.debug(`records: ${JSON.stringify(records.map(record => { return record.getModel() }))}`)
    const matchedTotalCount = await utils.accumulateCount(matchedRecords)
    const matchedTotalUniques = await utils.accumulateUniques(matchedRecords)
    const updatedTotalCount = await utils.accumulateCount(updatedRecords)
    const updatedTotalUniques = await utils.accumulateUniques(updatedRecords)
    const diffCount = updatedTotalCount - matchedTotalCount
    const diffUniques = updatedTotalUniques - matchedTotalUniques
    if (diffCount === 0 && diffUniques === 0) {
      core.info(`${filePath} doesn't need to be updated`)
      return new SummaryModel(diffCount, diffUniques)
    }
    await saveJson(filePath, records.map(record => { return record.getModel() }))
    core.info(`${filePath} is updated`)
    return new SummaryModel(diffCount, diffUniques)
  }
}

async function getUpdatedRecords(oldRecords, newRecords) {
  return newRecords.map(newRecord => {
    core.debug(`newRecord: ${JSON.stringify(newRecord.getModel())}`)
    const target = oldRecords.find(oldRecord => oldRecord.getTimestamp() - newRecord.getTimestamp() === 0) || newRecord
    core.debug(`target: ${JSON.stringify(target.getModel())}`)
    if (newRecord.getUniques() > target.getUniques() || (newRecord.getUniques() > target.getUniques() && newRecord.getCount() > target.getCount())) {
      core.debug(`new record is used`)
      return newRecord
    }
    return target
  })
}
// #endregion

// #region summary operations
async function addSummaryModel(oldModel, diffModel) {
  return new SummaryModel(oldModel.getCount() + diffModel.getCount(), oldModel.getUniques() + diffModel.getUniques())
}

export async function readCachedSummaryJson(summaryFilePath) {
  try {
    const exists = await fs.pathExists(summaryFilePath)
    if (exists) {
      const file = await fs.readJson(summaryFilePath)
      return new SummaryModel(file.count, file.uniques, file.timestamp)
    }
    return new SummaryModel(0, 0)
  } catch (error) {
    core.setFailed(error)
  }
}

async function syncCachedSummaryJson(summaryFilePath, diffSummaryModel) {
  if (diffSummaryModel.getUniques() === 0 && diffSummaryModel.getCount() === 0) {
    core.info(`${summaryFilePath} doesn't need to be updated`)
    return false
  }
  const summaryModel = await readCachedSummaryJson(summaryFilePath)
  const newSummaryModel = await addSummaryModel(summaryModel, diffSummaryModel)
  await saveJson(summaryFilePath, newSummaryModel.getModelWithTimestamp())
  core.info(`${summaryFilePath} is increased with Count: ${newSummaryModel.getCount()} and Uniques: ${newSummaryModel.getUniques()}`)
  return true
}
// #endregion
