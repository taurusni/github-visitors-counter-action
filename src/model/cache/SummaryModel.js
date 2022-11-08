export default class SummaryModel {
  #count
  #uniques
  #timestamp
  constructor(count, uniques, timestamp = new Date().toLocaleString()) {
    this.#count = count
    this.#uniques = uniques
    this.#timestamp = timestamp
  }

  getCount() {
    return this.#count
  }

  getUniques() {
    return this.#uniques
  }

  getTimestamp() {
    return this.#timestamp
  }

  getModel() {
    return { count: this.#count, uniques: this.#uniques }
  }

  getModelWithTimestamp() {
    return { count: this.#count, uniques: this.#uniques, timestamp: this.#timestamp }
  }
}
