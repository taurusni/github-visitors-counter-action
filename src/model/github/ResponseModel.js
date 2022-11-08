export default class ResponseModel {
  #status
  #response
  constructor(status, response) {
    this.#status = status
    this.#response = response
  }

  getStatus() {
    return this.#status
  }

  getResponse() {
    return this.#response
  }

  getModel() {
    return { status: this.#status, response: this.#response }
  }
}
