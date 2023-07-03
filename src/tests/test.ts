import chaiHttp from "chai-http"
import { expect } from "chai"
import chai from "chai"
import { processStorage, server } from "../server"
import { User } from "../user"
import crypto from "crypto"

chai.use(chaiHttp)

describe("Basic API tests:", () => {
    it("GET /api/users/", (done) => {
        chai.request(server)
        .get("/api/users/").end((err, res) => {
            expect(err).to.be.null
            expect(res.statusCode).to.equal(200)
            expect(JSON.parse(res.text)).to.be.an("array")
            done()
        })
    })
    describe("POST /api/users/", () => {
        const uuid = crypto.randomUUID()
        const user : User = {age: 24, username: "Chai average enjoyer", id: uuid, hobbies: ["programming on pascalABC", "Play Brawl Stars"]}
        it("POST /api/users/", (done) => {
            chai.request(server)
            .post("/api/users/")
            .send(JSON.stringify(user))
            .end((err, res) => {
                expect(err).to.be.null
                expect(res.statusCode).to.equal(201)
                done()
            })
        })
        it("GET /api/users/{userID}", (done) => {
            chai.request(server)
                .get(`/api/users/${uuid}`)
                .end((err, res) => {
                    expect(err).to.be.null
                    expect(res.statusCode).to.equal(200)
                    expect(JSON.parse(res.text)).to.deep.include(user)
                    done()
                })
        })
    })
    describe("PUT /api/users/{userID}", () => {
        const uuid = crypto.randomUUID()
        const user : User = {age: 25, username:"Mocha average enjoyer", hobbies: ["play basketball", "create music", "bother everyone"], id: uuid}
        const newUser : User = {age: 25, username:"Mocha average enjoyer", hobbies: ["play basketball", "create music", "make everyone happy"], id: uuid}
        it("POST /api/users && PUT /api/users/{uuid}", (done) => {
            chai.request(server)
                .post("/api/users/")
                .send(JSON.stringify(user))
                .end(() => {})
            chai.request(server)
                .put(`/api/users/${uuid}`)
                .send(JSON.stringify(newUser))
                .end((err, res) => {
                    expect(err).to.be.null
                    expect(res.statusCode).to.equal(200)
                    done()
                })
        })
        it("GET /api/users/{uuid}", (done) => {
            chai.request(server)
                .get(`/api/users/${uuid}`)
                .end((err, res) => {
                    expect(err).to.be.null
                    expect(res.statusCode).to.equal(200)
                    expect(JSON.parse(res.text)).to.deep.include(newUser)
                    done()
                })
        })
    })
    describe("DELETE /api/users/{userID}", () => {
        const uuid = crypto.randomUUID()
        const user: User = {age: 30, username: "Alexey", hobbies: ["Cooking", "Watch TV programs about nature"], id: uuid}
        it("POST /api/users && DELETE /api/users/{uuid}", (done) => {
            chai.request(server)
                .post("/api/users")
                .send(JSON.stringify(user))
                .end(() => {})
            chai.request(server)
                .delete(`/api/users/${uuid}`)
                .end((err, res) => {
                    expect(err).to.be.null
                    expect(res.statusCode).to.equal(204)
                    done()
                })
        })
        it("Check DELETE effect", (done) => {
            chai.request(server)
                .get(`/api/users/${uuid}`)
                .end((err, res) => {
                    expect(err).to.be.null
                    expect(res.statusCode).to.equal(404)
                    done()
                })
        })
    })
})
describe("Error handling test:", () => {
    const correctUUID = crypto.randomUUID()
        const correctUser: User = {username: "Gleb", age: 25, id: correctUUID} 
        chai.request(server)
            .post("/api/users/")
            .send(JSON.stringify(correctUser))
            .end(() => {})
    describe("GET /api/users/{userID}", () => {
        it("Invaild uuid", (done) => {
            const uuid = "123"
            chai.request(server)
                .get(`/api/users/${uuid}`)
                .end((err, res) => {
                    expect(err).to.be.null
                    expect(res.statusCode).to.equal(400)
                    done()
                })
        })
        it("Non-existent uuid", (done) => {
            const uuid = crypto.randomUUID()
            chai.request(server)
                .get(`/api/users/${uuid}`)
                .end((err, res) => {
                    expect(err).to.be.null
                    expect(res.statusCode).to.equal(404)
                    done()
                })
        })
    })
    describe("POST /api/users/", () => {
        it("Invaild user provided", (done) => {
            const user = {name: 123, id: "hello world", hobbies: ["make errors"]}
            chai.request(server)
                .post("/api/users/")
                .send(user)
                .end((err, res) => {
                    expect(err).to.be.null
                    expect(res.statusCode).to.equal(400)
                    done()
                })
        })
    })
    describe("PUT /api/users/{userID}", () => {
        it("Invalid uuid provided", (done) => {
            const invalidUUID = "1234"
            chai.request(server)
                .put(`/api/users/${invalidUUID}`)
                .send(JSON.stringify(correctUser))
                .end((err, res) => {
                    expect(err).to.be.null
                    expect(res.statusCode).to.equal(400)
                    done()
                })
        })
        it("Invalid user provided", (done) => {
            const invalidUser = {name: "user", hobbies: ["make mistakes"], age: 14}
            chai.request(server)
                .put(`/api/users/${correctUUID}`)
                .send(JSON.stringify(invalidUser))
                .end((err, res) => {
                    expect(err).to.be.null
                    expect(res.statusCode).to.equal(400)
                    done()
                })
        })
        it("Non-existent UUID provided", (done) => {
            const randomUUID = crypto.randomUUID()
            chai.request(server)
                .put(`/api/users/${randomUUID}`)
                .send(JSON.stringify(correctUser))
                .end((err, res) => {
                    expect(err).to.be.null
                    expect(res.statusCode).to.equal(404)
                    done()
                })
        })
    })
    describe("DELETE /api/users/{userID}", () => {
        it("Invaild UUID provided", (done) => {
            const invalidUUID = "12356"
            chai.request(server)
                .delete(`/api/users/${invalidUUID}`)
                .end((err, res) => {
                    expect(err).to.be.null
                    expect(res.statusCode).to.equal(400)
                    done()
                })
        })
        it("Non-existent UUID provided", (done) => {
            const randomUUID = crypto.randomUUID()
            chai.request(server)
                .delete(`/api/users/${randomUUID}`)
                .end((err, res) => {
                    expect(err).to.be.null
                    expect(res.statusCode).to.equal(404)
                    done()
                })
        })
    })
})