export default class ViewModel {
  #timestamp
  #count
  #uniques
  constructor(count, uniques, timestamp) {
    this.#count = count
    this.#uniques = uniques
    this.#timestamp = new Date(timestamp)
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
    return { count: this.#count, uniques: this.#uniques, timestamp: this.#timestamp }
  }
}
