import { UUID } from "crypto";
import { Id, User } from "./user";
import crypto from "crypto"

export default class UserStorage {
    private users: User[] = []
    
    /**
     * getAllUsers
     */
    public getAllUsers(): User[] {
        return this.users;
    }

    /**
     * push
     */
    public push(user: User): void {
        if (!user.id) user.id = crypto.randomUUID()
        this.users.push(user)
    }

    /**
     * getUser
     */
    public getUser(id: Id) {
        return this.users.find( user => user.id === id )
    }

    /**
     * editUser
id:      */
    public editUser(id: Id, user: User) {
        const index = this.findUserIndex(id)
        if (index === undefined) return false
        if (!user.id) user.id = crypto.randomUUID()
        this.users[index] = user
        return true
    }

    /**
     * rmUser
     */
    public rmUser(id: Id) {
        const isUserExists = this.findUserIndex(id) !== undefined
        if (isUserExists)
            this.users = this.users.filter(user => user.id !== id)
        return isUserExists
    }

    public clearAll() {
        this.users = []
    }

    private findUserIndex(id: Id) {
        const index = this.users.findIndex( user => user.id === id )
        return index != -1 ? index : undefined
    }

    constructor(users: User[]) {
        this.users = users
    }
}
export type ClusterMsg = {
    storage: User[]
}
