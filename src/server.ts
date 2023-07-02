import "dotenv/config"
import http from "http"
import UserStorage from "./userStorage"
import { User } from "./user"
import ServerAnswer from "./serverAnswer"

function getBody(req: http.IncomingMessage) {
    const promise: Promise<string> = new Promise<string>((resolve, reject) => {
        const body: any = []
        req.on("error", err => {
            reject(err)
        }).on("data", chunk => {
            body.push(chunk)
        }).on("end", () => { 
            resolve(Buffer.concat(body).toString())
        })
    })
    return promise
}

function isUser(user: User) {return user.username && user.age}
function isUUID(uuid: string) {return /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(uuid)}

const storage = new UserStorage()
storage.push({ age: 10, username: "valrar", hobbies: ["programming", "more programming"] })
storage.push({ age: 20, username: "gigshow" })
storage.push({ age: 30, username: "donat" })
storage.push({ age: 40, username: "dan245gg" })
storage.push({ age: 50, username: "brawler" })

const httpServer = http.createServer(async (req, res) => {
    const answerManager = new ServerAnswer(res)
    if (!req.url) return
    if (/^\/api\/users(\/.)?/.test(req.url)) { // /api/users GET call handler
        const arg = req.url.split("/")[3]
        if (!arg && req.method === "GET") {
            const users = storage.getAllUsers()
            answerManager.OK(JSON.stringify(users))
            return
        } 
        else if (req.method === "GET") { // /api/users/{userID} GET call handler
            if (!isUUID(arg)) {
                answerManager.BadRequest("Invalid UUID")
                return
            }
            const user = storage.getUser(arg)
            if (user) {
                answerManager.OK(JSON.stringify(user))
            } else {
                answerManager.NotFound("User not found!")
            }
            return
        } else if (!arg && req.method === "POST") { // /api/users/ POST call handler
            const user = JSON.parse(await getBody(req))
            if (isUser(user)) {
                storage.push(user as User)
                answerManager.Created(JSON.stringify(storage.getAllUsers()))
                return
            } else {
                answerManager.BadRequest("Invalid user object provided")
                return
            }
        } else if (req.method === "PUT") { // /api/users/{userID} PUT call handler
            const newUser = JSON.parse(await getBody(req))
            if (!isUUID(arg)) answerManager.BadRequest("Invalid UUID provided")
            if (isUser(newUser)) {
                if (storage.editUser(arg, newUser as User)) {
                    answerManager.OK(JSON.stringify(storage.getAllUsers()))
                } else {
                    answerManager.NotFound("User with this id not found")
                }
            } else {
                answerManager.BadRequest("Invalid user object provided")
            }
            return
        } else if (req.method === "DELETE") { // /api/users/{userID} DELETE call handler
            if (!isUUID(arg)) {
                answerManager.BadRequest("Invailid UUID provided")
            } else {
                if (storage.rmUser(arg)) {
                    answerManager.NoContent()
                } else {
                    answerManager.NotFound("User with this UUID not found")
                }
            }
            return
        }
    }
    answerManager.NotImplemented()
    
}).listen(process.env.PORT, () => {
    console.log(`server is live on adress: http://localhost:${process.env.PORT}/`)
})