import { User } from "@prisma/client"
import jwt from "jsonwebtoken"

import * as userRepository from "@repositories/userRepository"
import { encrypt } from "@utils/encryptFunctions"

export type CreateUserData = Omit<User, "id" | "createdAt">

export async function registerUser({ email, password }: CreateUserData) {
  const userExists = await userRepository.findByEmail(email)
  if (userExists)
    throw { status: 409, message: "This e-mail is already registered!" }

  const hashPassword = encrypt.bcrypt.encryptPassword(password)
  await userRepository.register({
    email,
    password: hashPassword,
  })
}

export async function loginUser({ email, password }: CreateUserData) {
  const foundUser = await userRepository.findByEmail(email)
  const JWT_TOKEN = process.env.JWT_TOKEN

  const passwordMatch = encrypt.bcrypt.decryptPasswordAndCompare(
    password,
    foundUser?.password,
  )

  if (!foundUser || !passwordMatch)
    throw { status: 401, message: "Wrong e-mail or password" }

  const token = jwt.sign({ email: foundUser.email }, JWT_TOKEN)

  return token
}

export async function findByEmail(email: string) {
  const foundUser = await userRepository.findByEmail(email)

  if (!foundUser) throw { status: 404, message: "User not found" }

  return foundUser
}
