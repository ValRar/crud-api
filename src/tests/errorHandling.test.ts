import { expect } from "chai"
import chaiHttp from "chai-http"
import { server } from "../server"
import { User } from "../user"
import crypto from "crypto"
import chai from "chai"

chai.use(chaiHttp)

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