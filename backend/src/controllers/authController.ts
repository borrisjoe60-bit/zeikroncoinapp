import { Request, Response } from "express";
import prisma from "../prisma/client";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }

    const user = await prisma.user.create({
      data: {
        email,
        password,
        firstName,
        lastName
      }
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};