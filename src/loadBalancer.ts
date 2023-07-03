import http from "http"
import ServerAnswer from "./serverAnswer"
import { availableParallelism } from "os"

let count = 0

const numberOfClusters = availableParallelism()

export default function BalanceLoad(req: http.IncomingMessage, res: http.ServerResponse) {
    count++
    const port = process.env.PORT ? +process.env.PORT + count : 3000 + count
    const redirectUrl = `http://localhost:${port}${req.url}`
    new ServerAnswer(res).Redirect(redirectUrl)
    if (count >= numberOfClusters) count = 0
}