import { UUID } from "crypto";

export type User = {
    id?: Id
    username: string
    age: number
    hobbies?: string[]
}

export type Id = string | UUID;