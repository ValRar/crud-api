import http from "http"

export default class ServerAnswer {

    private res: http.ServerResponse

     OK(responseText: string) {
        this.res.setHeader("content-type", "text/json")
        this.res.statusCode = 200
        this.res.end(responseText)
    }

     BadRequest(responseText: string) {
        this.res.setHeader("content-type", "text/plain")
        this.res.statusCode = 400
        this.res.end(responseText)
    }
    
     NotFound(responseText: string) {
        this.res.setHeader("content-type", "text/plain")
        this.res.statusCode = 404
        this.res.end(responseText)
    }
    Created(responseText: string) {
        this.res.setHeader("content-type", "text/plain")
        this.res.statusCode = 201
        this.res.end(responseText)
    }
    NoContent() {
        this.res.setHeader("content-type", "text/plain")
        this.res.statusCode = 204
        this.res.end()
    }
    NotImplemented() {
        this.res.setHeader("content-type", "text/plain")
        this.res.statusCode = 404
        this.res.end("This api route is not implemented")
    }

    constructor(res: http.ServerResponse) {
        this.res = res
    }
}