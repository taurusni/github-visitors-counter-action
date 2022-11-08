import SummaryModel from '../cache/SummaryModel'

export default class RepositoryModel {
  #repositoryName
  #repositoryId
  #repositoryUrl
  #summaryModel
  constructor(id, name, repositoryUrl, summaryModel = new SummaryModel(0, 0)) {
    this.#repositoryId = id
    this.#repositoryName = name
    this.#repositoryUrl = repositoryUrl
    this.#summaryModel = summaryModel
  }

  getIdentifier() {
    return `${this.#repositoryName}_${this.#repositoryId}`
  }

  getId() {
    return this.#repositoryId
  }

  getName() {
    return this.#repositoryName
  }

  getUrl() {
    return this.#repositoryUrl
  }

  getSummaryModel() {
    return this.#summaryModel
  }

  getModel() {
    return {
      repositoryName: this.#repositoryName,
      repositoryId: this.#repositoryId,
      repositoryUrl: this.#repositoryUrl,
      summaryModel: this.#summaryModel.getModel()
    }
  }
}
